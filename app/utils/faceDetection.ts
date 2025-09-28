declare global {
  interface Window {
    FaceDetection: new (config: { locateFile: (file: string) => string }) => FaceDetectionInstance;
  }
}

interface FaceDetection {
  new (config: { locateFile: (file: string) => string }): FaceDetectionInstance;
}

interface FaceDetectionInstance {
  setOptions(options: { model: string; minDetectionConfidence: number }): void;
  onResults(callback: (results: MediaPipeResults) => void): void;
  initialize(): Promise<void>;
  send(inputs: { image: HTMLImageElement }): void;
}

interface MediaPipeResults {
  detections?: Array<{
    score: number;
    boundingBox: {
      xCenter: number;
      yCenter: number;
      width: number;
      height: number;
    };
    landmarks: Array<{ x: number; y: number }>;
  }>;
}

export interface FaceDetectionResult {
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  landmarks: {
    rightEye: { x: number; y: number };
    leftEye: { x: number; y: number };
    noseTip: { x: number; y: number };
    mouthCenter: { x: number; y: number };
    rightEarTragion: { x: number; y: number };
    leftEarTragion: { x: number; y: number };
  };
  confidence: number;
}

let faceDetection: FaceDetectionInstance | null = null;

// Initialize MediaPipe Face Detection
export async function initializeFaceDetection(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Face detection only works in browser environment'));
      return;
    }

    if (!window.FaceDetection) {
      reject(new Error('MediaPipe Face Detection not loaded. Make sure CDN scripts are included.'));
      return;
    }

    try {
      faceDetection = new window.FaceDetection({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
        }
      });

      faceDetection.setOptions({
        model: 'short',
        minDetectionConfidence: 0.5,
      });

      faceDetection.onResults((results: MediaPipeResults) => {
        // Results will be handled by the caller
      });

      faceDetection.initialize().then(() => {
        console.log('MediaPipe Face Detection initialized successfully');
        resolve();
      }).catch((error: unknown) => {
        console.error('Failed to initialize MediaPipe Face Detection:', error);
        reject(error);
      });
    } catch (error: unknown) {
      console.error('Error setting up MediaPipe Face Detection:', error);
      reject(error);
    }
  });
}

// Detect faces in an image
export async function detectFaces(imageElement: HTMLImageElement): Promise<FaceDetectionResult[]> {
  return new Promise((resolve, reject) => {
    if (!faceDetection) {
      reject(new Error('Face detection not initialized. Call initializeFaceDetection() first.'));
      return;
    }

    let resultsReceived = false;

    faceDetection.onResults((results: MediaPipeResults) => {
      if (resultsReceived) return;
      resultsReceived = true;

      const faces: FaceDetectionResult[] = [];

      if (results.detections && results.detections.length > 0) {
        for (const detection of results.detections) {
          if (detection.score < 0.5) continue; // Skip low confidence detections

          const boundingBox = detection.boundingBox;
          const landmarks = detection.landmarks;

          // Convert normalized coordinates to pixel coordinates
          const imageWidth = imageElement.width;
          const imageHeight = imageElement.height;

          const face: FaceDetectionResult = {
            boundingBox: {
              x: boundingBox.xCenter * imageWidth - (boundingBox.width * imageWidth) / 2,
              y: boundingBox.yCenter * imageHeight - (boundingBox.height * imageHeight) / 2,
              width: boundingBox.width * imageWidth,
              height: boundingBox.height * imageHeight,
            },
            landmarks: {
              rightEye: {
                x: landmarks[0].x * imageWidth,
                y: landmarks[0].y * imageHeight,
              },
              leftEye: {
                x: landmarks[1].x * imageWidth,
                y: landmarks[1].y * imageHeight,
              },
              noseTip: {
                x: landmarks[2].x * imageWidth,
                y: landmarks[2].y * imageHeight,
              },
              mouthCenter: {
                x: landmarks[3].x * imageWidth,
                y: landmarks[3].y * imageHeight,
              },
              rightEarTragion: {
                x: landmarks[4].x * imageWidth,
                y: landmarks[4].y * imageHeight,
              },
              leftEarTragion: {
                x: landmarks[5].x * imageWidth,
                y: landmarks[5].y * imageHeight,
              },
            },
            confidence: detection.score,
          };

          faces.push(face);
        }
      }

      resolve(faces);
    });

    try {
      faceDetection.send({ image: imageElement });
    } catch (error: unknown) {
      reject(error);
    }

    // Timeout after 5 seconds
    setTimeout(() => {
      if (!resultsReceived) {
        resultsReceived = true;
        resolve([]);
      }
    }, 5000);
  });
}

// Calculate face regions for color analysis
export function getFaceRegions(face: FaceDetectionResult, imageWidth: number, imageHeight: number) {
  const { boundingBox, landmarks } = face;

  // Hair region: above the eyes, within face bounds
  const hairRegion = {
    x: Math.max(0, boundingBox.x),
    y: Math.max(0, boundingBox.y),
    width: Math.min(boundingBox.width, imageWidth - boundingBox.x),
    height: Math.max(10, (landmarks.rightEye.y + landmarks.leftEye.y) / 2 - boundingBox.y),
  };

  // Skin region: between eyes and mouth, excluding eye and mouth areas
  const eyeY = (landmarks.rightEye.y + landmarks.leftEye.y) / 2;
  const skinRegion = {
    x: Math.max(boundingBox.x + boundingBox.width * 0.2, 0),
    y: Math.max(eyeY + 10, 0),
    width: Math.min(boundingBox.width * 0.6, imageWidth - (boundingBox.x + boundingBox.width * 0.2)),
    height: Math.max(10, landmarks.mouthCenter.y - eyeY - 20),
  };

  // Eye region: around the detected eye landmarks
  const eyeSize = Math.max(20, boundingBox.width * 0.15);
  const rightEyeRegion = {
    x: Math.max(landmarks.rightEye.x - eyeSize / 2, 0),
    y: Math.max(landmarks.rightEye.y - eyeSize / 2, 0),
    width: Math.min(eyeSize, imageWidth - (landmarks.rightEye.x - eyeSize / 2)),
    height: Math.min(eyeSize, imageHeight - (landmarks.rightEye.y - eyeSize / 2)),
  };

  const leftEyeRegion = {
    x: Math.max(landmarks.leftEye.x - eyeSize / 2, 0),
    y: Math.max(landmarks.leftEye.y - eyeSize / 2, 0),
    width: Math.min(eyeSize, imageWidth - (landmarks.leftEye.x - eyeSize / 2)),
    height: Math.min(eyeSize, imageHeight - (landmarks.leftEye.y - eyeSize / 2)),
  };

  return {
    hair: hairRegion,
    skin: skinRegion,
    rightEye: rightEyeRegion,
    leftEye: leftEyeRegion,
  };
}