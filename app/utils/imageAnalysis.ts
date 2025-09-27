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

export interface FacialFeatures {
  colors: ColorAnalysis;
  faceDetected: boolean;
  confidence: number;
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

// Analyze dominant colors in different regions of the face
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

// Main function to analyze facial features from image
export async function analyzeFacialFeatures(imageDataUrl: string): Promise<FacialFeatures> {
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
          confidence: 0.3
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
        confidence: 0.75
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
        confidence: 0.3
      });
    };

    img.src = imageDataUrl;
  });
}