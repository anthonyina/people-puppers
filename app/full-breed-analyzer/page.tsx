'use client';

import { useState } from 'react';
import { BreedPhotoAnalyzer } from '../utils/photoAnalyzer';
import { getAllBreeds } from '../utils/dogApi';

interface BreedAnalysisResult {
  breedName: string;
  success: boolean;
  colors: string[];
  confidence: number;
  error?: string;
}

export default function FullBreedAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, currentBreed: '' });
  const [results, setResults] = useState<BreedAnalysisResult[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string>('');

  const analyzeAllBreeds = async () => {
    setIsAnalyzing(true);
    setResults([]);
    setGeneratedCode('');

    try {
      console.log('🔍 Loading all available breeds...');
      const allBreeds = await getAllBreeds();

      // Get all unique breed names (including sub-breeds)
      const breedNames: string[] = [];
      allBreeds.forEach(breed => {
        if (breed.subBreeds.length === 0) {
          breedNames.push(breed.name);
        } else {
          breed.subBreeds.forEach(subBreed => {
            breedNames.push(`${subBreed} ${breed.name}`);
          });
          breedNames.push(breed.name); // Also add main breed
        }
      });

      console.log(`📊 Found ${breedNames.length} breeds to analyze`);
      setProgress({ current: 0, total: breedNames.length, currentBreed: '' });

      const analyzer = new BreedPhotoAnalyzer();
      const analysisResults: BreedAnalysisResult[] = [];

      // Analyze breeds in batches to avoid overwhelming the API
      const batchSize = 5;
      for (let i = 0; i < breedNames.length; i += batchSize) {
        const batch = breedNames.slice(i, i + batchSize);

        console.log(`\n🔬 Analyzing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(breedNames.length/batchSize)}`);

        const batchPromises = batch.map(async (breedName, batchIndex) => {
          const globalIndex = i + batchIndex;
          setProgress(prev => ({ ...prev, current: globalIndex, currentBreed: breedName }));

          try {
            console.log(`  ${globalIndex + 1}/${breedNames.length}: ${breedName}`);

            const analysis = await analyzer.analyzeBreed(breedName, 4); // 4 photos per breed for speed

            const colors = analysis.dominantColors
              .filter(color => color.percentage > 5) // Only significant colors
              .slice(0, 4) // Top 4 colors
              .map(color => color.colorName);

            return {
              breedName,
              success: true,
              colors,
              confidence: analysis.confidence
            };
          } catch (error) {
            console.warn(`    ❌ Failed to analyze ${breedName}:`, error);
            return {
              breedName,
              success: false,
              colors: [],
              confidence: 0,
              error: String(error)
            };
          }
        });

        // Wait for batch to complete
        const batchResults = await Promise.all(batchPromises);
        analysisResults.push(...batchResults);
        setResults([...analysisResults]);

        // Small delay between batches to be nice to the API
        if (i + batchSize < breedNames.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log('✅ Analysis complete! Generating code...');
      const code = generateBreedCharacteristicsCode(analysisResults);
      setGeneratedCode(code);

    } catch (error) {
      console.error('❌ Full analysis failed:', error);
      alert(`Analysis failed: ${error}`);
    } finally {
      setIsAnalyzing(false);
      setProgress({ current: 0, total: 0, currentBreed: '' });
    }
  };

  const generateBreedCharacteristicsCode = (results: BreedAnalysisResult[]): string => {
    const successfulResults = results.filter(r => r.success && r.colors.length > 0);

    console.log(`📝 Generating code from ${successfulResults.length} successful analyses`);

    const breedMap: Record<string, string[]> = {};

    successfulResults.forEach(result => {
      const normalizedName = result.breedName.toLowerCase();
      breedMap[normalizedName] = result.colors;
    });

    // Generate the new function code
    let code = `// Photo-analyzed breed characteristics - Generated from ${successfulResults.length} breed analyses
// Generated on ${new Date().toISOString()}

function getPhotoAnalyzedBreedColors(fullName: string): string[] {
  const photoAnalyzedBreeds: Record<string, string[]> = {\n`;

    Object.entries(breedMap).forEach(([breedName, colors]) => {
      const colorsStr = colors.map(c => `'${c}'`).join(', ');
      code += `    '${breedName}': [${colorsStr}],\n`;
    });

    code += `  };

  const normalized = fullName.toLowerCase();

  // Direct match first
  if (photoAnalyzedBreeds[normalized]) {
    return photoAnalyzedBreeds[normalized];
  }

  // Try partial matches
  for (const [breed, colors] of Object.entries(photoAnalyzedBreeds)) {
    if (normalized.includes(breed) || breed.includes(normalized)) {
      return colors;
    }
  }

  // Fallback to intelligent defaults based on breed type
  return getIntelligentDefaultColors(fullName);
}

function getIntelligentDefaultColors(fullName: string): string[] {
  // Existing intelligent defaults for breeds without photo data
  if (fullName.includes('terrier')) return ['Brown', 'Tan', 'Black'];
  if (fullName.includes('hound')) return ['Brown', 'Black', 'Tan'];
  if (fullName.includes('shepherd')) return ['Brown', 'Black', 'Tan'];
  if (fullName.includes('retriever')) return ['Light Brown', 'Golden', 'Auburn'];
  if (fullName.includes('spaniel')) return ['Brown', 'Black', 'White'];

  return ['Brown', 'Light Brown', 'Dark Brown'];
}`;

    return code;
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    alert('Code copied to clipboard!');
  };

  const downloadResults = () => {
    const data = {
      timestamp: new Date().toISOString(),
      totalBreeds: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results: results
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'breed-analysis-results.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const successRate = results.length > 0 ? (results.filter(r => r.success).length / results.length * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🚀 Full Breed Analysis System
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Analyze ALL dog breeds using real photos to generate data-driven characteristics.
          </p>

          <button
            onClick={analyzeAllBreeds}
            disabled={isAnalyzing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
          >
            {isAnalyzing ? 'Analyzing All Breeds...' : 'Start Full Analysis (200+ Breeds)'}
          </button>
        </div>

        {isAnalyzing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-blue-800 font-semibold">
                Analyzing breed {progress.current + 1} of {progress.total}
              </span>
            </div>
            <div className="text-blue-700 mb-2">Current: {progress.currentBreed}</div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="text-blue-600 text-sm mt-2">
              {progress.total > 0 ? `${Math.round((progress.current / progress.total) * 100)}%` : '0%'} complete
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Results Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis Summary</h2>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">
                    {results.filter(r => r.success).length}
                  </div>
                  <div className="text-green-600">Successful</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-700">
                    {results.filter(r => !r.success).length}
                  </div>
                  <div className="text-red-600">Failed</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">{successRate}%</div>
                  <div className="text-blue-600">Success Rate</div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={downloadResults}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  📥 Download Full Results (JSON)
                </button>
              </div>

              {/* Sample Results */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-800 mb-2">Sample Results:</h3>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {results.slice(0, 20).map((result, index) => (
                    <div key={index} className={`p-2 rounded text-sm ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                      <div className="font-medium">{result.breedName}</div>
                      {result.success ? (
                        <div className="text-green-700">
                          Colors: {result.colors.join(', ')} ({result.confidence}% confidence)
                        </div>
                      ) : (
                        <div className="text-red-700">Failed: {result.error}</div>
                      )}
                    </div>
                  ))}
                  {results.length > 20 && (
                    <div className="text-gray-500 text-center py-2">
                      ... and {results.length - 20} more results
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Generated Code */}
            {generatedCode && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Generated Code</h2>

                <div className="mb-4">
                  <button
                    onClick={copyCodeToClipboard}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    📋 Copy Code to Clipboard
                  </button>
                </div>

                <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono">
                  <pre>{generatedCode}</pre>
                </div>

                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Next Steps:</h4>
                  <ol className="text-yellow-700 text-sm space-y-1">
                    <li>1. Copy the generated code above</li>
                    <li>2. Replace the getBreedSpecificHairColors function in dynamicBreedLoader.ts</li>
                    <li>3. Test the improved breed matching</li>
                    <li>4. All breeds now use real photo-analyzed characteristics!</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}

        {!isAnalyzing && results.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔬</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Ready to Analyze All Breeds
            </h3>
            <p className="text-gray-500">
              This will analyze 200+ dog breeds using real photos to create data-driven characteristics.
              The process may take 10-15 minutes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}