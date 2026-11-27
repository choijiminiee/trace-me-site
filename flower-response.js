/* Shared by LIVE TRACE and PHOTO BOOTH. No viewport or camera display dimensions. */
(() => {
  const CONFIG = Object.freeze({
    neutralMax: .08, reopenMin: .11, holdBand: .035,
    sampleWindowMs: 120, maxSampleWindowMs: 2000, confirmMs: 70,
    followMs: 220, fastFollowMs: 120, travelMs: 2800, fastTravelMs: 1800,
    returnMs: 2000, reducedTravelMs: 8500,
    slowChangePerSecond: .25, fastChangePerSecond: 1.5
  });
  // Reserve the full-bloom and falling petals for clearly larger expressions.
  // Source sequence: bud 1, sprout 25, bloom 60, full bloom 115, fall 195, fade 300.
  const stops = [[0,0],[.08,0],[.28,.12],[.52,.30],[.76,.55],[1,1]];
  function progressFor(score) {
    const value = Math.max(0, Math.min(1, score));
    for (let i=1;i<stops.length;i++) {
      const [end, to]=stops[i], [start, from]=stops[i-1];
      if(value<=end)return from+(to-from)*(value-start)/(end-start);
    }
    return 1;
  }
  class Response {
    constructor(){ this.reset(); }
    reset(){
      this.current=0; this.target=0; this.accepted=0;
      this.samples=[]; this.direction=0; this.since=null; this.lastTime=null;
      this.filtered=null; this.pendingTempo=0; this.tempo=0;
    }
    input(result, now){
      if(result.status!=='● TRACE READY'){
        if(result.status==='SEARCHING FOR FACE...'){
          this.target=this.current; this.samples=[]; this.direction=0; this.since=null;
          this.filtered=null; this.pendingTempo=0;
        } else this.reset();
        return;
      }
      const value=result.rawExpressionChange ?? result.displayExpressionChange;
      if(!Number.isFinite(value))return;
      const previous=this.samples[this.samples.length-1];
      const interval=previous?Math.max(0,now-previous.time):0;
      // Slow CPU inference can deliver frames more than 160 ms apart. Keep
      // enough recent samples to confirm an expression instead of rejecting all.
      if(interval>CONFIG.maxSampleWindowMs){
        this.samples=[]; this.direction=0; this.since=null;
        this.filtered=null; this.pendingTempo=0;
      }
      const windowMs=Math.max(CONFIG.sampleWindowMs,Math.min(CONFIG.maxSampleWindowMs,interval*2.5));
      this.samples.push({time:now,value:Math.max(0,Math.min(1,value/100))});
      this.samples=this.samples.filter(sample=>now-sample.time<=windowMs);
      if(this.samples.length<2 || now-this.samples[0].time<80)return;
      const sorted=this.samples.map(sample=>sample.value).sort((a,b)=>a-b);
      let next=sorted[Math.floor((sorted.length-1)/2)];
      if(next<=CONFIG.neutralMax || (this.accepted===0 && next<CONFIG.reopenMin))next=0;
      // Measure tempo only after noise filtering. It changes travel time, never
      // the destination: a quick small expression still makes only a small bloom.
      const elapsed=Math.max(80,now-(this.filtered?.time??this.samples[0].time));
      const rate=Math.abs(next-(this.filtered?.value??this.accepted))*1000/elapsed;
      const tempo=Math.max(0,Math.min(1,(rate-CONFIG.slowChangePerSecond)/
        (CONFIG.fastChangePerSecond-CONFIG.slowChangePerSecond)));
      this.filtered={time:now,value:next};
      const difference=next-this.accepted;
      const endpoint=next===0 || next===1;
      if(Math.abs(difference)<CONFIG.holdBand && !(endpoint && next!==this.accepted)){
        // Resume the confirmed pose after a brief face-tracking interruption.
        this.target=progressFor(this.accepted);
        this.direction=0; this.since=null; this.pendingTempo=0; return;
      }
      const direction=Math.sign(difference);
      if(direction!==this.direction){
        this.direction=direction; this.since=now; this.pendingTempo=tempo; return;
      }
      this.pendingTempo=Math.max(this.pendingTempo,tempo);
      if(now-this.since<CONFIG.confirmMs)return;
      this.accepted=next; this.target=progressFor(next);
      this.tempo=this.pendingTempo;
      this.direction=0; this.since=null; this.pendingTempo=0;
    }
    advance(now, reduced=false){
      // Elapsed-time motion matches 30/60/120 Hz. A stalled frame never jumps ahead.
      const dt=this.lastTime===null?0:Math.min(64,Math.max(0,now-this.lastTime));
      this.lastTime=now;
      const difference=this.target-this.current;
      // Keep relaxation and reduced motion gentle, regardless of gesture speed.
      const tempo=reduced||this.target===0?0:this.tempo;
      const travel=reduced?CONFIG.reducedTravelMs:this.target===0?CONFIG.returnMs:
        CONFIG.travelMs+(CONFIG.fastTravelMs-CONFIG.travelMs)*tempo;
      const follow=CONFIG.followMs+(CONFIG.fastFollowMs-CONFIG.followMs)*tempo;
      const step=difference*(1-Math.exp(-dt/follow));
      const limit=dt/travel;
      this.current+=Math.max(-limit,Math.min(limit,step));
      if(Math.abs(this.target-this.current)<.0005)this.current=this.target;
      return this.current;
    }
  }
  globalThis.TraceFlowerResponse={CONFIG,progressFor,Response};
})();
