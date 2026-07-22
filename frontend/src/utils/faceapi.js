import * as faceapi from 'face-api.js'

// Model files live in /public/models (served at the site root by Vite),
// loaded once and cached — every page that needs face detection just
// awaits this same promise instead of re-downloading the models.
let loadPromise = null

export function loadFaceModels() {
  if (!loadPromise) {
    loadPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    ])
  }
  return loadPromise
}

// Runs detection + descriptor extraction on a <video> or <img> element.
// Returns a 128-number Float32Array descriptor, or null if no face was found.
export async function getFaceDescriptor(mediaElement) {
  const detection = await faceapi
    .detectSingleFace(mediaElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor()

  return detection ? Array.from(detection.descriptor) : null
}

// Standard face-api.js matching threshold: distances below ~0.6 are
// considered "same person" for the 128-d descriptors this model produces.
const MATCH_THRESHOLD = 0.6

export function isFaceMatch(descriptorA, descriptorB) {
  if (!descriptorA || !descriptorB || descriptorA.length !== descriptorB.length) return false
  const distance = faceapi.euclideanDistance(descriptorA, descriptorB)
  return distance < MATCH_THRESHOLD
}
