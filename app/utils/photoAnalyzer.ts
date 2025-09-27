// Real-time photo analysis system for breed characteristics
import { getBreedImages } from './dogApi';

export interface ColorAnalysis {
  rgb: [number, number, number];
  hsl: [number, number, number];
  frequency: number;
  colorName: string;
  percentage: number;
}

export interface BreedPhotoAnalysis {
  breedName: string;
  sampleSize: number;
  dominantColors: ColorAnalysis[];
  averageColors: {
    hair: ColorAnalysis;
    overall: ColorAnalysis;
  };
  colorVariety: number;
  confidence: number;
  photos: string[];
}

class BreedPhotoAnalyzer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor() {
    // Only create canvas in browser environment
    if (typeof window !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
    }
  }

  private ensureCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    if (!this.canvas || !this.ctx) {
      throw new Error('Canvas not available - make sure this runs in the browser');
    }
    return { canvas: this.canvas, ctx: this.ctx };
  }

  async analyzeBreed(breedName: string, sampleSize: number = 8): Promise<BreedPhotoAnalysis> {
    console.log(`🔍 Analyzing ${breedName} with ${sampleSize} photos...`);

    try {
      // Get photos for this breed
      const photos = await getBreedImages(breedName, sampleSize);
      console.log(`📸 Got ${photos.length} photos for ${breedName}`);

      if (photos.length === 0) {
        throw new Error(`No photos found for ${breedName}`);
      }

      // Analyze each photo
      const colorResults: ColorAnalysis[][] = [];
      for (let i = 0; i < photos.length; i++) {
        try {
          console.log(`   Analyzing photo ${i + 1}/${photos.length}...`);
          const colors = await this.analyzePhotoColors(photos[i]);
          colorResults.push(colors);
        } catch (error) {
          console.warn(`Failed to analyze photo ${i + 1}:`, error);
        }
      }

      if (colorResults.length === 0) {
        throw new Error(`Failed to analyze any photos for ${breedName}`);
      }

      // Aggregate results
      const analysis = this.aggregateColorResults(colorResults);

      return {
        breedName,
        sampleSize: photos.length,
        dominantColors: analysis.dominantColors,
        averageColors: analysis.averageColors,
        colorVariety: analysis.colorVariety,
        confidence: this.calculateConfidence(colorResults),
        photos: photos.slice(0, 3) // Return first 3 for display
      };

    } catch (error) {
      console.error(`Error analyzing ${breedName}:`, error);
      throw error;
    }
  }

  private async analyzePhotoColors(imageUrl: string): Promise<ColorAnalysis[]> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const { canvas, ctx } = this.ensureCanvas();

          // Set canvas size to reasonable dimensions
          const maxSize = 300;
          const ratio = Math.min(maxSize / img.width, maxSize / img.height);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;

          // Draw and analyze
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const colors = this.extractColors(imageData);
          resolve(colors);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
      img.src = imageUrl;
    });
  }

  private extractColors(imageData: ImageData): ColorAnalysis[] {
    const pixels = imageData.data;
    const colorMap = new Map<string, { count: number; r: number; g: number; b: number }>();
    const totalPixels = pixels.length / 4;

    // Sample every 4th pixel for performance
    for (let i = 0; i < pixels.length; i += 16) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const alpha = pixels[i + 3];

      // Skip transparent pixels
      if (alpha < 128) continue;

      // Quantize colors to reduce noise (group similar colors)
      const quantizedR = Math.floor(r / 16) * 16;
      const quantizedG = Math.floor(g / 16) * 16;
      const quantizedB = Math.floor(b / 16) * 16;

      const key = `${quantizedR},${quantizedG},${quantizedB}`;

      if (colorMap.has(key)) {
        const entry = colorMap.get(key)!;
        entry.count++;
        // Running average for more accurate color
        entry.r = (entry.r * (entry.count - 1) + r) / entry.count;
        entry.g = (entry.g * (entry.count - 1) + g) / entry.count;
        entry.b = (entry.b * (entry.count - 1) + b) / entry.count;
      } else {
        colorMap.set(key, { count: 1, r, g, b });
      }
    }

    // Convert to sorted array
    return Array.from(colorMap.values())
      .map(({ count, r, g, b }) => {
        const rgb: [number, number, number] = [Math.round(r), Math.round(g), Math.round(b)];
        const hsl = this.rgbToHsl(rgb[0], rgb[1], rgb[2]);
        return {
          rgb,
          hsl,
          frequency: count,
          percentage: (count / totalPixels) * 100,
          colorName: this.getColorName(rgb[0], rgb[1], rgb[2])
        };
      })
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10); // Top 10 colors
  }

  private rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h: number, s: number;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
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

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  private getColorName(r: number, g: number, b: number): string {
    const [h, s, l] = this.rgbToHsl(r, g, b);

    // Handle grayscale
    if (s < 15) {
      if (l < 20) return 'Black';
      if (l < 40) return 'Dark Gray';
      if (l < 60) return 'Gray';
      if (l < 80) return 'Light Gray';
      return 'White';
    }

    // Handle very dark or very light
    if (l < 15) return 'Very Dark';
    if (l > 85) return 'Very Light';

    // Color based on hue
    if (h >= 345 || h < 15) return 'Red';
    if (h >= 15 && h < 45) return 'Auburn';
    if (h >= 45 && h < 75) return 'Brown';
    if (h >= 75 && h < 105) return 'Golden';
    if (h >= 105 && h < 135) return 'Yellow-Green';
    if (h >= 135 && h < 165) return 'Green';
    if (h >= 165 && h < 195) return 'Blue-Green';
    if (h >= 195 && h < 225) return 'Blue';
    if (h >= 225 && h < 255) return 'Purple';
    if (h >= 255 && h < 285) return 'Violet';
    if (h >= 285 && h < 315) return 'Pink';
    if (h >= 315 && h < 345) return 'Red-Pink';

    return 'Brown'; // Default
  }

  private aggregateColorResults(colorResults: ColorAnalysis[][]): {
    dominantColors: ColorAnalysis[];
    averageColors: {
      hair: ColorAnalysis;
      overall: ColorAnalysis;
    };
    colorVariety: number;
  } {
    // Flatten all colors
    const allColors = colorResults.flat();

    // Group by color name
    const colorGroups = new Map<string, ColorAnalysis[]>();
    allColors.forEach(color => {
      const key = color.colorName;
      if (!colorGroups.has(key)) {
        colorGroups.set(key, []);
      }
      colorGroups.get(key)!.push(color);
    });

    // Calculate dominant colors across all photos
    const dominantColors: ColorAnalysis[] = [];
    for (const [colorName, colors] of colorGroups.entries()) {
      const totalFrequency = colors.reduce((sum, c) => sum + c.frequency, 0);
      const avgR = Math.round(colors.reduce((sum, c) => sum + c.rgb[0], 0) / colors.length);
      const avgG = Math.round(colors.reduce((sum, c) => sum + c.rgb[1], 0) / colors.length);
      const avgB = Math.round(colors.reduce((sum, c) => sum + c.rgb[2], 0) / colors.length);

      dominantColors.push({
        rgb: [avgR, avgG, avgB],
        hsl: this.rgbToHsl(avgR, avgG, avgB),
        frequency: totalFrequency,
        percentage: (totalFrequency / allColors.length) * 100,
        colorName
      });
    }

    dominantColors.sort((a, b) => b.frequency - a.frequency);

    // Calculate overall average
    const totalPixels = allColors.reduce((sum, c) => sum + c.frequency, 0);
    const avgR = Math.round(allColors.reduce((sum, c) => sum + c.rgb[0] * c.frequency, 0) / totalPixels);
    const avgG = Math.round(allColors.reduce((sum, c) => sum + c.rgb[1] * c.frequency, 0) / totalPixels);
    const avgB = Math.round(allColors.reduce((sum, c) => sum + c.rgb[2] * c.frequency, 0) / totalPixels);

    const overallAverage: ColorAnalysis = {
      rgb: [avgR, avgG, avgB],
      hsl: this.rgbToHsl(avgR, avgG, avgB),
      frequency: totalPixels,
      percentage: 100,
      colorName: this.getColorName(avgR, avgG, avgB)
    };

    return {
      dominantColors: dominantColors.slice(0, 5),
      averageColors: {
        hair: overallAverage, // Simplified - would need face detection for true hair color
        overall: overallAverage
      },
      colorVariety: colorGroups.size
    };
  }

  private calculateConfidence(colorResults: ColorAnalysis[][]): number {
    if (colorResults.length === 0) return 0;

    // Higher confidence with more consistent results across photos
    const consistency = this.measureColorConsistency(colorResults);
    const sampleScore = Math.min(colorResults.length / 8, 1); // Prefer 8+ photos

    return Math.round((consistency * 0.7 + sampleScore * 0.3) * 100);
  }

  private measureColorConsistency(colorResults: ColorAnalysis[][]): number {
    if (colorResults.length < 2) return 1;

    // Compare top colors across photos
    const topColorsByPhoto = colorResults.map(colors =>
      colors.slice(0, 3).map(c => c.colorName)
    );

    let totalSimilarity = 0;
    let comparisons = 0;

    for (let i = 0; i < topColorsByPhoto.length; i++) {
      for (let j = i + 1; j < topColorsByPhoto.length; j++) {
        const similarity = this.calculateColorSetSimilarity(topColorsByPhoto[i], topColorsByPhoto[j]);
        totalSimilarity += similarity;
        comparisons++;
      }
    }

    return comparisons > 0 ? totalSimilarity / comparisons : 0;
  }

  private calculateColorSetSimilarity(colors1: string[], colors2: string[]): number {
    const commonColors = colors1.filter(color => colors2.includes(color));
    return commonColors.length / Math.max(colors1.length, colors2.length);
  }
}

export { BreedPhotoAnalyzer };