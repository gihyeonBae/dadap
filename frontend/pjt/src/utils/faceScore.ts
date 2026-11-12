import * as faceapi from 'face-api.js';

const averagePoint = (points: faceapi.Point[]): faceapi.Point => {
  if (points.length === 0) {
    return { x: 0, y: 0 };
  }
  const total = points.reduce(
    (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
    { x: 0, y: 0 }
  );
  return { x: total.x / points.length, y: total.y / points.length };
};

export const calculateEyeContactScore = (landmarks: faceapi.FaceLandmarks68, box: faceapi.Box) => {
  const leftEyeCenter = averagePoint(landmarks.getLeftEye());
  const rightEyeCenter = averagePoint(landmarks.getRightEye());
  const eyeMidX = (leftEyeCenter.x + rightEyeCenter.x) / 2;
  const faceCenterX = box.x + box.width / 2;
  const deviationRatio = box.width ? Math.abs(eyeMidX - faceCenterX) / box.width : 0;
  const penalty = Math.min(1, deviationRatio * 4);
  return Math.round(Math.max(0, (1 - penalty) * 100));
};

export const calculatePoseStabilityScore = (
  landmarks: faceapi.FaceLandmarks68,
  box: faceapi.Box
) => {
  const leftEyeCenter = averagePoint(landmarks.getLeftEye());
  const rightEyeCenter = averagePoint(landmarks.getRightEye());
  const noseCenter = averagePoint(landmarks.getNose());
  const faceCenterX = box.x + box.width / 2;
  const yawRatio = box.width ? Math.abs(noseCenter.x - faceCenterX) / box.width : 0;
  const rollRatio = box.width
    ? Math.abs(leftEyeCenter.y - rightEyeCenter.y) / box.width
    : 0;
  const penalty = Math.min(1, yawRatio * 3 + rollRatio * 4);
  return Math.round(Math.max(0, 100 - penalty * 100));
};

const MOVEMENT_JITTER_RATIO = 0.003;
const MOVEMENT_MULTIPLIER = 35;

export const calculateMovementScore = (
  landmarks: faceapi.FaceLandmarks68,
  box: faceapi.Box,
  prevNose: faceapi.Point | null
) => {
  const noseCenter = averagePoint(landmarks.getNose());
  const boxWidth = Math.max(box.width, 1);
  let penalty = 0;
  if (prevNose) {
    const dx = noseCenter.x - prevNose.x;
    const dy = noseCenter.y - prevNose.y;
    const movement = Math.sqrt(dx * dx + dy * dy);
    const normalizedMovement = movement / boxWidth;
    const effectiveMovement = Math.max(0, normalizedMovement - MOVEMENT_JITTER_RATIO);
    penalty = Math.min(1, effectiveMovement * MOVEMENT_MULTIPLIER);
  }
  const score = Math.round(Math.max(0, 100 - penalty * 100));
  return { score, noseCenter };
};
