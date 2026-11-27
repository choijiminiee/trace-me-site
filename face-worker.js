self.exports = {};
importScripts('public/mediapipe/vision_bundle.js');
const { FilesetResolver, FaceLandmarker } = self.exports;
let landmarker;
self.onmessage = async ({ data }) => {
  try {
    if (data.type === 'init') {
      const files = await FilesetResolver.forVisionTasks('public/mediapipe/wasm');
      landmarker = await FaceLandmarker.createFromOptions(files, {
        baseOptions: { modelAssetPath: 'public/mediapipe/face_landmarker.task', delegate: 'CPU' },
        runningMode: 'VIDEO', numFaces: 1,
        outputFaceBlendshapes: false, outputFacialTransformationMatrixes: false,
        minFaceDetectionConfidence: .5, minFacePresenceConfidence: .5, minTrackingConfidence: .5
      });
      postMessage({ type: 'ready' });
    } else if (data.type === 'frame') {
      try {
        const result = landmarker.detectForVideo(data.bitmap, data.timestamp);
        postMessage({ type: 'result', points: result.faceLandmarks[0] || [], timestamp: data.timestamp });
      } finally { data.bitmap.close(); }
    } else if (data.type === 'close') {
      landmarker?.close();
      self.close();
    }
  } catch (error) { postMessage({ type: 'error', message: error.message }); }
};
