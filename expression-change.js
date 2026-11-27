/* Shape change only: no emotion inference or persistent face data. */
(() => {
  const CONFIG = Object.freeze({
    weights: { mouth: 0.70, eyes: 0.10, eyebrows: 0.20 },
    debug: false, debugIntervalMs: 1000,
    response: { regionGain: { mouth: 1.10, eyes: 0.65, eyebrows: 0.65 },
      gamma: 1.25, fullScale: 1.0, emphasisStart: 0.15, emphasisEnd: 0.60 },
    // Additional lip aperture, normalized by inter-eye distance and baseline noise.
    mouthOpening: { start: 0.10, full: 0.32, gamma: 1.40 },
    // Feature units, before division by response ranges. Never adapt the base after calibration.
    deadZone: { mouth: [0.025, 0.020, 0.025, 0.025, 0.025, 0.018, 0.018],
      eyes: [0.045, 0.045], eyebrows: [0.030, 0.030, 0.030, 0.030] },
    noiseMultiplier: 3, calibrationTrim: 0.10,
    calibrationMs: 1500, minimumSamples: 20, resetAfterMs: 2000,
    riseSmoothingMs: 120, fallSmoothingMs: 110,
    ranges: { mouth: [0.24, 0.30, 0.16, 0.16, 0.22, 0.14, 0.14],
      eyes: [0.16, 0.16], eyebrows: [0.14, 0.14, 0.14, 0.14] }
  });
  const sub = (a, b) => a.map((v, i) => v - b[i]);
  const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
  const length = a => Math.hypot(...a);
  const unit = a => a.map(v => v / length(a));
  const mean = (a, b) => a.map((v, i) => (v + b[i]) / 2);
  const clamp = v => Math.max(0, Math.min(100, v));
  function mapChange(regions) {
    // Retain the weighted mean for tiny residuals; emphasize a strong individual region progressively.
    let average = 0, energy = 0, peak = 0;
    for (const region of Object.keys(CONFIG.weights)) {
      // Wide eyes often lift the brows too. Bound both so this single gesture
      // cannot drive the whole flower lifecycle, even with an extreme eye ratio.
      const measured = Math.max(0, regions[region]);
      const value = (region === 'mouth' ? measured : Math.min(1, measured)) * CONFIG.response.regionGain[region];
      average += CONFIG.weights[region] * value;
      energy += CONFIG.weights[region] * value * value;
      peak = Math.max(peak, value);
    }
    const t = Math.max(0, Math.min(1, (peak-CONFIG.response.emphasisStart) /
      (CONFIG.response.emphasisEnd-CONFIG.response.emphasisStart)));
    const blend = t*t*(3-2*t);
    const combined = average + (Math.sqrt(energy)-average)*blend;
    return clamp(100 * Math.pow(Math.min(1, combined/CONFIG.response.fullScale), CONFIG.response.gamma));
  }
  function features(points, aspect) {
    if (points.length < 468 || !Number.isFinite(aspect) || aspect <= 0) return null;
    // MediaPipe z uses image-width units; y must first use the same units.
    const p = points.map(p => [p.x, p.y * aspect, p.z]);
    if (p.some(p => !p.every(Number.isFinite))) return null;
    const left = mean(p[33], p[133]), right = mean(p[362], p[263]);
    const center = mean(left, right), scale = length(sub(right, left));
    if (scale < 0.015) return null;
    const x = unit(sub(right, left));
    const down = sub(p[168], p[10]); // Stable upper-face axis, independent of jaw opening.
    const vertical = sub(down, x.map(v => v * dot(down, x)));
    if (length(vertical) < 0.005) return null;
    const y = unit(vertical);
    const local = p.map(v => {
      const d = sub(v, center);
      return [dot(d, x) / scale, dot(d, y) / scale];
    });
    // Compare distances in the face plane: inferred depth jitter must not inflate tiny lip/eyelid gaps.
    const gap = (a, b) => length(sub(local[a], local[b]));
    const yAt = id => local[id][1];
    const lipCenter = (yAt(13) + yAt(14)) / 2;
    const eye = (a,b,c,d,e,f) => (gap(a,b)+gap(c,d)) / (2*gap(e,f));
    return {
      mouth: [gap(61,291), gap(13,14), yAt(61)-lipCenter, yAt(291)-lipCenter,
        gap(0,17), gap(0,13), gap(14,17)],
      eyes: [eye(159,145,158,153,33,133), eye(386,374,385,380,362,263)],
      eyebrows: [yAt(105)-(yAt(33)+yAt(133))/2, yAt(107)-yAt(133),
        yAt(334)-(yAt(362)+yAt(263))/2, yAt(336)-yAt(362)]
    };
  }
  class Tracker {
    constructor() { this.reset(); }
    reset() {
      this.lastDebug = -Infinity; this.regionChanges = {};
      this.baselineNoise = null; this.thresholds = null;
      this.base = null; this.samples = []; this.started = null; this.lastSeen = null;
      this.lastUpdate = null; this.rawExpressionChange = 0; this.displayExpressionChange = 0;
    }
    update(points, aspect, now, stable) {
      const f = features(points, aspect);
      if (this.lastSeen !== null && now - this.lastSeen >= CONFIG.resetAfterMs) this.reset();
      if (!f) {
        this.samples = []; this.started = null;
        return this.result('SEARCHING FOR FACE...');
      }
      this.lastSeen = now;
      if (!stable) return this.result('SEARCHING FOR FACE...');
      if (!this.base) {
        if (this.started === null) this.started = now;
        this.samples.push(f);
        if (now-this.started < CONFIG.calibrationMs || this.samples.length < CONFIG.minimumSamples)
          return this.result('CALIBRATING...');
        this.base = {}; this.baselineNoise = {}; this.thresholds = {};
        for (const region of Object.keys(f)) {
          this.base[region] = []; this.baselineNoise[region] = []; this.thresholds[region] = [];
          f[region].forEach((_, i) => {
            const values = this.samples.map(sample => sample[region][i]).sort((a,b) => a-b);
            // A brief blink/outlier during calibration must not shift the reference expression.
            const trim = Math.floor(values.length * CONFIG.calibrationTrim);
            const central = values.slice(trim, values.length-trim);
            const average = central.reduce((sum,v) => sum+v,0)/central.length;
            const sigma = Math.sqrt(central.reduce((sum,v) => sum+(v-average)**2,0)/central.length);
            this.base[region][i] = average;
            this.baselineNoise[region][i] = sigma;
            this.thresholds[region][i] = Math.max(CONFIG.deadZone[region][i], CONFIG.noiseMultiplier*sigma);
          });
        }
        if (CONFIG.debug) console.debug('[Expression baseline]', JSON.stringify({
          mean: this.base, noise: this.baselineNoise, deadZones: this.thresholds }));
        this.samples = []; this.lastUpdate = now;
        return this.result('● TRACE READY');
      }
      let change = 0;
      for (const region of Object.keys(CONFIG.weights)) {
        const deltas = f[region].map((v, i) =>
          Math.max(0, Math.abs(v-this.base[region][i])-this.thresholds[region][i])/CONFIG.ranges[region][i]);
        const rms = Math.sqrt(deltas.reduce((sum,v) => sum+v*v,0)/deltas.length);
        this.regionChanges[region] = rms;
        change += CONFIG.weights[region] * rms;
      }
      // A wide jaw can leave lip width/thickness, eyes and brows unchanged.
      // Do not dilute that opening across all seven mouth measurements. Keep
      // smaller gestures on the existing curve and use the same motion easing.
      const aperture = Math.max(0, f.mouth[1]-this.base.mouth[1]-this.thresholds.mouth[1]);
      const opening = Math.max(0, Math.min(1, (aperture-CONFIG.mouthOpening.start) /
        (CONFIG.mouthOpening.full-CONFIG.mouthOpening.start)));
      const openingChange = 100 * Math.pow(opening, CONFIG.mouthOpening.gamma);
      this.rawExpressionChange = Math.max(mapChange(this.regionChanges), openingChange);
      const dt = Math.min(250, Math.max(0, now-this.lastUpdate));
      this.lastUpdate = now;
      const smoothingMs = this.rawExpressionChange < this.displayExpressionChange
        ? CONFIG.fallSmoothingMs : CONFIG.riseSmoothingMs;
      this.displayExpressionChange += (this.rawExpressionChange-this.displayExpressionChange) * (1-Math.exp(-dt/smoothingMs));
      if (this.rawExpressionChange === 0 && this.displayExpressionChange < 0.05) this.displayExpressionChange = 0;
      if (CONFIG.debug && now-this.lastDebug >= CONFIG.debugIntervalMs) {
        console.debug('[Expression Change]', JSON.stringify({
          mouthChange: this.regionChanges.mouth, eyeChange: this.regionChanges.eyes,
          eyebrowChange: this.regionChanges.eyebrows, combinedRawChange: change,
          rawExpressionChange: this.rawExpressionChange, finalExpressionChange: this.displayExpressionChange }));
        this.lastDebug = now;
      }
      return this.result('● TRACE READY');
    }
    result(status) {
      return { status, rawExpressionChange: this.rawExpressionChange,
        displayExpressionChange: this.displayExpressionChange };
    }
  }
  globalThis.TraceExpression = { CONFIG, features, mapChange, Tracker };
})();
