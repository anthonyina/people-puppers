export interface ColorAnalysis {
  hairColor: {
    dominant: string;
    hex: string;
    confidence: number;
  };
  skinTone: {
    dominant: string;
    hex: string;
    warmth: 'warm' | 'cool' | 'neutral';
  };
  eyeColor: {
    dominant: string;
    hex: string;
    intensity: 'light' | 'medium' | 'dark';
  };
}

import { initializeFaceDetection, detectFaces, getFaceRegions, FaceDetectionResult } from './faceDetection';

export interface VisualFeatures {
  hasBeard: boolean;
  hasMustache: boolean;
  hasGlasses: boolean;
  isWhiteHaired: boolean;
  isGrayHaired: boolean;
  hasFacialHair: boolean;
  hasLongHair: boolean;
  hairLength: 'short' | 'medium' | 'long';
}

export interface FacialFeatures {
  colors: ColorAnalysis;
  faceDetected: boolean;
  confidence: number;
  faceShape?: 'oval' | 'round' | 'square' | 'heart' | 'diamond';
  numberOfFaces: number;
  visualFeatures?: VisualFeatures;
}

// Convert RGB to HSL for better color analysis
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number, s: number;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

// Convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Determine color name from RGB values
function getColorName(r: number, g: number, b: number): string {
  const [h, s, l] = rgbToHsl(r, g, b);

  // Hair colors
  if (l < 15) return 'Black';
  if (l < 25 && s < 20) return 'Dark Brown';
  if (l < 35 && s < 30) return 'Brown';
  if (l < 45 && s > 30 && h > 15 && h < 45) return 'Auburn';
  if (l < 50 && s > 40 && h > 45 && h < 75) return 'Light Brown';
  if (l > 50 && s > 50 && h > 45 && h < 75) return 'Blonde';
  if (l > 70 && s < 20) return 'Gray';
  if (l > 85) return 'White';
  if (h > 0 && h < 30 && s > 60) return 'Red';
  if (h > 300 || h < 30) return 'Reddish Brown';

  return 'Brown';
}

// Determine skin tone
function getSkinTone(r: number, g: number, b: number): { tone: string; warmth: 'warm' | 'cool' | 'neutral' } {
  const [h, , l] = rgbToHsl(r, g, b);

  let tone: string;
  let warmth: 'warm' | 'cool' | 'neutral';

  // Determine warmth based on undertones
  if (h > 15 && h < 45) warmth = 'warm';
  else if (h > 200 && h < 300) warmth = 'cool';
  else warmth = 'neutral';

  // Determine tone based on lightness
  if (l < 25) tone = 'Deep';
  else if (l < 35) tone = 'Dark';
  else if (l < 45) tone = 'Medium-Dark';
  else if (l < 55) tone = 'Medium';
  else if (l < 65) tone = 'Medium-Light';
  else if (l < 75) tone = 'Light';
  else tone = 'Very Light';

  return { tone, warmth };
}

// Determine eye color
function getEyeColor(r: number, g: number, b: number): { color: string; intensity: 'light' | 'medium' | 'dark' } {
  const [h, s, l] = rgbToHsl(r, g, b);

  let color: string;
  let intensity: 'light' | 'medium' | 'dark';

  // Determine intensity
  if (l < 30) intensity = 'dark';
  else if (l < 60) intensity = 'medium';
  else intensity = 'light';

  // Determine color
  if (l < 20) color = 'Dark Brown';
  else if (h > 15 && h < 45 && s > 30) color = 'Brown';
  else if (h > 45 && h < 75 && s > 30) color = 'Hazel';
  else if (h > 75 && h < 150 && s > 30) color = 'Green';
  else if (h > 150 && h < 250 && s > 30) color = 'Blue';
  else if (h > 250 && h < 300 && s > 30) color = 'Violet';
  else if (s < 20 && l > 60) color = 'Gray';
  else color = 'Brown';

  return { color, intensity };
}

// Analyze colors from specific rectangular regions
function analyzeRegionColorsFromRect(imageData: ImageData, region: { x: number; y: number; width: number; height: number }): { r: number; g: number; b: number } {
  let totalR = 0, totalG = 0, totalB = 0;
  let count = 0;

  const { data, width } = imageData;

  for (let y = Math.floor(region.y); y < Math.floor(region.y + region.height); y++) {
    for (let x = Math.floor(region.x); x < Math.floor(region.x + region.width); x++) {
      if (x >= 0 && x < width && y >= 0 && y < imageData.height) {
        const index = (y * width + x) * 4;
        const a = data[index + 3];

        if (a > 128) { // Only consider non-transparent pixels
          totalR += data[index];
          totalG += data[index + 1];
          totalB += data[index + 2];
          count++;
        }
      }
    }
  }

  if (count === 0) return { r: 100, g: 100, b: 100 };

  return {
    r: Math.round(totalR / count),
    g: Math.round(totalG / count),
    b: Math.round(totalB / count)
  };
}

// Detect visual features from face analysis
function detectVisualFeatures(face: FaceDetectionResult, imageData: ImageData, colors: ColorAnalysis): VisualFeatures {
  const regions = getFaceRegions(face, imageData.width, imageData.height);

  // Check for white/gray hair
  const isWhiteHaired = colors.hairColor.dominant.toLowerCase().includes('white') ||
                       colors.hairColor.dominant.toLowerCase().includes('platinum');
  const isGrayHaired = colors.hairColor.dominant.toLowerCase().includes('gray') ||
                      colors.hairColor.dominant.toLowerCase().includes('grey') ||
                      colors.hairColor.dominant.toLowerCase().includes('silver');

  // Detect facial hair by analyzing regions below the nose
  const { landmarks, boundingBox } = face;

  // Beard region: below mouth to jaw
  const beardRegion = {
    x: Math.max(boundingBox.x + boundingBox.width * 0.3, 0),
    y: Math.max(landmarks.mouthCenter.y + 10, 0),
    width: Math.min(boundingBox.width * 0.4, imageData.width - (boundingBox.x + boundingBox.width * 0.3)),
    height: Math.max(10, boundingBox.y + boundingBox.height - landmarks.mouthCenter.y - 10)
  };

  // Mustache region: between nose and mouth
  const mustacheRegion = {
    x: Math.max(landmarks.mouthCenter.x - 30, 0),
    y: Math.max(landmarks.noseTip.y + 5, 0),
    width: Math.min(60, imageData.width - (landmarks.mouthCenter.x - 30)),
    height: Math.max(5, landmarks.mouthCenter.y - landmarks.noseTip.y - 5)
  };

  // Analyze these regions for dark colors (indicating hair)
  const beardColor = analyzeRegionColorsFromRect(imageData, beardRegion);
  const mustacheColor = analyzeRegionColorsFromRect(imageData, mustacheRegion);
  const skinColor = analyzeRegionColorsFromRect(imageData, regions.skin);

  // Calculate if beard/mustache regions are significantly darker than skin
  const beardDarkness = (beardColor.r + beardColor.g + beardColor.b) / 3;
  const mustacheDarkness = (mustacheColor.r + mustacheColor.g + mustacheColor.b) / 3;
  const skinBrightness = (skinColor.r + skinColor.g + skinColor.b) / 3;

  const hasBeard = (skinBrightness - beardDarkness) > 30 && beardDarkness < 120;
  const hasMustache = (skinBrightness - mustacheDarkness) > 25 && mustacheDarkness < 100;
  const hasFacialHair = hasBeard || hasMustache;

  // Detect hair length based on hair region size relative to face
  const hairRegionArea = regions.hair.width * regions.hair.height;
  const faceArea = boundingBox.width * boundingBox.height;
  const hairToFaceRatio = hairRegionArea / faceArea;

  let hairLength: 'short' | 'medium' | 'long' = 'medium';
  if (hairToFaceRatio < 0.15) {
    hairLength = 'short';
  } else if (hairToFaceRatio > 0.4) {
    hairLength = 'long';
  }

  const hasLongHair = hairLength === 'long';

  // Simple glasses detection (looking for symmetrical dark regions around eyes)
  const rightEyeColor = analyzeRegionColorsFromRect(imageData, regions.rightEye);
  const leftEyeColor = analyzeRegionColorsFromRect(imageData, regions.leftEye);
  const avgEyeBrightness = ((rightEyeColor.r + rightEyeColor.g + rightEyeColor.b) +
                           (leftEyeColor.r + leftEyeColor.g + leftEyeColor.b)) / 6;

  // Glasses detection is basic - very dark eye regions might indicate glasses
  const hasGlasses = avgEyeBrightness < 60;

  return {
    hasBeard,
    hasMustache,
    hasGlasses,
    isWhiteHaired,
    isGrayHaired,
    hasFacialHair,
    hasLongHair,
    hairLength
  };
}

// Determine face shape from landmarks
function determineFaceShape(face: FaceDetectionResult): 'oval' | 'round' | 'square' | 'heart' | 'diamond' {
  const { boundingBox, landmarks } = face;

  // Calculate face width to height ratio
  const faceRatio = boundingBox.width / boundingBox.height;

  // Calculate jaw width (distance between ear tragions)
  const jawWidth = Math.abs(landmarks.leftEarTragion.x - landmarks.rightEarTragion.x);

  // Calculate forehead width (approximate from eye distance)
  const eyeDistance = Math.abs(landmarks.leftEye.x - landmarks.rightEye.x);
  const foreheadWidth = eyeDistance * 1.3; // Approximate

  // Calculate cheek width (widest part of face)
  const cheekWidth = boundingBox.width;

  // Determine face shape based on ratios and proportions
  if (faceRatio > 0.9) {
    // Wide face - could be round or square
    if (jawWidth / cheekWidth > 0.85) {
      return 'square';
    } else {
      return 'round';
    }
  } else if (faceRatio < 0.75) {
    // Narrow face - could be oval, heart, or diamond
    if (foreheadWidth > jawWidth * 1.2) {
      return 'heart';
    } else if (jawWidth < cheekWidth * 0.8) {
      return 'diamond';
    } else {
      return 'oval';
    }
  } else {
    // Medium proportions - likely oval
    return 'oval';
  }
}

// Analyze dominant colors in different regions of the face (legacy function)
function analyzeRegionColors(imageData: ImageData, regions: { hair: number[]; skin: number[]; eyes: number[] }): ColorAnalysis {
  const getRegionColor = (pixels: number[]) => {
    let totalR = 0, totalG = 0, totalB = 0;
    let count = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];

      if (a > 128) { // Only consider non-transparent pixels
        totalR += r;
        totalG += g;
        totalB += b;
        count++;
      }
    }

    if (count === 0) return { r: 100, g: 100, b: 100 };

    return {
      r: Math.round(totalR / count),
      g: Math.round(totalG / count),
      b: Math.round(totalB / count)
    };
  };

  // Analyze hair region
  const hairColor = getRegionColor(regions.hair);
  const hairName = getColorName(hairColor.r, hairColor.g, hairColor.b);

  // Analyze skin region
  const skinColor = getRegionColor(regions.skin);
  const skinAnalysis = getSkinTone(skinColor.r, skinColor.g, skinColor.b);

  // Analyze eye region
  const eyeColor = getRegionColor(regions.eyes);
  const eyeAnalysis = getEyeColor(eyeColor.r, eyeColor.g, eyeColor.b);

  return {
    hairColor: {
      dominant: hairName,
      hex: rgbToHex(hairColor.r, hairColor.g, hairColor.b),
      confidence: 0.8
    },
    skinTone: {
      dominant: skinAnalysis.tone,
      hex: rgbToHex(skinColor.r, skinColor.g, skinColor.b),
      warmth: skinAnalysis.warmth
    },
    eyeColor: {
      dominant: eyeAnalysis.color,
      hex: rgbToHex(eyeColor.r, eyeColor.g, eyeColor.b),
      intensity: eyeAnalysis.intensity
    }
  };
}

// New main function using MediaPipe face detection
export async function analyzeFacialFeatures(imageDataUrl: string): Promise<FacialFeatures> {
  try {
    // Initialize face detection if not already done
    await initializeFaceDetection();

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);

        if (!imageData) {
          resolve(getFallbackResult());
          return;
        }

        try {
          // Detect faces using MediaPipe
          const faces = await detectFaces(img);

          if (faces.length === 0) {
            // No faces detected - fall back to old method
            console.log('No faces detected, falling back to geometric analysis');
            const legacyResult = await analyzeFacialFeaturesLegacy(imageDataUrl);
            resolve({
              ...legacyResult,
              numberOfFaces: 0,
              faceDetected: false
            });
            return;
          }

          // Use the first detected face (highest confidence)
          const primaryFace = faces[0];
          console.log('Face detected with confidence:', primaryFace.confidence);

          // Get face regions based on detected landmarks
          const regions = getFaceRegions(primaryFace, canvas.width, canvas.height);

          // Analyze colors from detected regions
          const hairColor = analyzeRegionColorsFromRect(imageData, regions.hair);
          const skinColor = analyzeRegionColorsFromRect(imageData, regions.skin);
          const rightEyeColor = analyzeRegionColorsFromRect(imageData, regions.rightEye);
          const leftEyeColor = analyzeRegionColorsFromRect(imageData, regions.leftEye);

          // Average the eye colors
          const eyeColor = {
            r: Math.round((rightEyeColor.r + leftEyeColor.r) / 2),
            g: Math.round((rightEyeColor.g + leftEyeColor.g) / 2),
            b: Math.round((rightEyeColor.b + leftEyeColor.b) / 2)
          };

          // Determine face shape
          const faceShape = determineFaceShape(primaryFace);

          // Generate color analysis
          const hairName = getColorName(hairColor.r, hairColor.g, hairColor.b);
          const skinAnalysis = getSkinTone(skinColor.r, skinColor.g, skinColor.b);
          const eyeAnalysis = getEyeColor(eyeColor.r, eyeColor.g, eyeColor.b);

          const colors: ColorAnalysis = {
            hairColor: {
              dominant: hairName,
              hex: rgbToHex(hairColor.r, hairColor.g, hairColor.b),
              confidence: 0.9
            },
            skinTone: {
              dominant: skinAnalysis.tone,
              hex: rgbToHex(skinColor.r, skinColor.g, skinColor.b),
              warmth: skinAnalysis.warmth
            },
            eyeColor: {
              dominant: eyeAnalysis.color,
              hex: rgbToHex(eyeColor.r, eyeColor.g, eyeColor.b),
              intensity: eyeAnalysis.intensity
            }
          };

          // Detect visual features
          const visualFeatures = detectVisualFeatures(primaryFace, imageData, colors);

          resolve({
            colors,
            faceDetected: true,
            confidence: primaryFace.confidence,
            faceShape,
            numberOfFaces: faces.length,
            visualFeatures
          });

        } catch (detectionError) {
          console.error('Face detection failed, falling back to legacy method:', detectionError);
          const legacyResult = await analyzeFacialFeaturesLegacy(imageDataUrl);
          resolve({
            ...legacyResult,
            numberOfFaces: 0
          });
        }
      };

      img.onerror = () => {
        resolve({
          ...getFallbackResult(),
          numberOfFaces: 0
        });
      };

      img.src = imageDataUrl;
    });

  } catch (initError) {
    console.error('Failed to initialize face detection, using legacy method:', initError);
    const legacyResult = await analyzeFacialFeaturesLegacy(imageDataUrl);
    return {
      ...legacyResult,
      numberOfFaces: 0
    };
  }
}

// Fallback result when everything fails
function getFallbackResult(): FacialFeatures {
  return {
    colors: {
      hairColor: { dominant: 'Brown', hex: '#8B4513', confidence: 0.5 },
      skinTone: { dominant: 'Medium', hex: '#DDBEA9', warmth: 'neutral' },
      eyeColor: { dominant: 'Brown', hex: '#654321', intensity: 'medium' }
    },
    faceDetected: false,
    confidence: 0.3,
    numberOfFaces: 0
  };
}

// Legacy function for fallback (renamed the original function)
async function analyzeFacialFeaturesLegacy(imageDataUrl: string): Promise<FacialFeatures> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);

      if (!imageData) {
        resolve({
          colors: {
            hairColor: { dominant: 'Brown', hex: '#8B4513', confidence: 0.5 },
            skinTone: { dominant: 'Medium', hex: '#DDBEA9', warmth: 'neutral' },
            eyeColor: { dominant: 'Brown', hex: '#654321', intensity: 'medium' }
          },
          faceDetected: false,
          confidence: 0.3,
          numberOfFaces: 0
        });
        return;
      }

      // Simplified region detection (in a real app, you'd use face detection APIs)
      const width = canvas.width;
      const height = canvas.height;

      // Approximate regions based on typical face proportions
      const faceTop = Math.floor(height * 0.2);
      const faceBottom = Math.floor(height * 0.8);
      const faceLeft = Math.floor(width * 0.25);
      const faceRight = Math.floor(width * 0.75);

      // Hair region (top 30% of face area)
      const hairRegion: number[] = [];
      for (let y = faceTop; y < faceTop + (faceBottom - faceTop) * 0.3; y++) {
        for (let x = faceLeft; x < faceRight; x++) {
          const index = (y * width + x) * 4;
          if (index < imageData.data.length - 3) {
            hairRegion.push(
              imageData.data[index],
              imageData.data[index + 1],
              imageData.data[index + 2],
              imageData.data[index + 3]
            );
          }
        }
      }

      // Skin region (middle area of face)
      const skinRegion: number[] = [];
      const skinTop = faceTop + (faceBottom - faceTop) * 0.3;
      const skinBottom = faceTop + (faceBottom - faceTop) * 0.7;
      for (let y = skinTop; y < skinBottom; y++) {
        for (let x = faceLeft + (faceRight - faceLeft) * 0.2; x < faceRight - (faceRight - faceLeft) * 0.2; x++) {
          const index = (y * width + x) * 4;
          if (index < imageData.data.length - 3) {
            skinRegion.push(
              imageData.data[index],
              imageData.data[index + 1],
              imageData.data[index + 2],
              imageData.data[index + 3]
            );
          }
        }
      }

      // Eye region (approximate eye area)
      const eyeRegion: number[] = [];
      const eyeY = faceTop + (faceBottom - faceTop) * 0.4;
      const eyeHeight = (faceBottom - faceTop) * 0.1;
      for (let y = eyeY; y < eyeY + eyeHeight; y++) {
        for (let x = faceLeft + (faceRight - faceLeft) * 0.2; x < faceRight - (faceRight - faceLeft) * 0.2; x++) {
          const index = (y * width + x) * 4;
          if (index < imageData.data.length - 3) {
            eyeRegion.push(
              imageData.data[index],
              imageData.data[index + 1],
              imageData.data[index + 2],
              imageData.data[index + 3]
            );
          }
        }
      }

      const colors = analyzeRegionColors(imageData, {
        hair: hairRegion,
        skin: skinRegion,
        eyes: eyeRegion
      });

      resolve({
        colors,
        faceDetected: true,
        confidence: 0.75,
        numberOfFaces: 1
      });
    };

    img.onerror = () => {
      resolve({
        colors: {
          hairColor: { dominant: 'Brown', hex: '#8B4513', confidence: 0.5 },
          skinTone: { dominant: 'Medium', hex: '#DDBEA9', warmth: 'neutral' },
          eyeColor: { dominant: 'Brown', hex: '#654321', intensity: 'medium' }
        },
        faceDetected: false,
        confidence: 0.3,
        numberOfFaces: 0
      });
    };

    img.src = imageDataUrl;
  });
}