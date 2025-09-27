'use client';

import { useState } from 'react';
import { BreedPhotoAnalyzer, BreedPhotoAnalysis } from '../utils/photoAnalyzer';

export default function BreedAnalyzerPage() {
  const [results, setResults] = useState<Record<string, BreedPhotoAnalysis>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentBreed, setCurrentBreed] = useState<string>('');

  const problematicBreeds = [
    'Airedale Terrier',
    'African Wild Dog',
    'Golden Retriever',
    'Border Collie',
    'German Shepherd'
  ];

  const analyzeBreed = async (breedName: string) => {
    setIsAnalyzing(true);
    setCurrentBreed(breedName);

    try {
      const analyzer = new BreedPhotoAnalyzer();
      console.log(`Starting analysis of ${breedName}...`);

      const result = await analyzer.analyzeBreed(breedName, 6);
      console.log(`Analysis complete for ${breedName}:`, result);

      setResults(prev => ({
        ...prev,
        [breedName]: result
      }));
    } catch (error) {
      console.error(`Failed to analyze ${breedName}:`, error);
      alert(`Failed to analyze ${breedName}: ${error}`);
    } finally {
      setIsAnalyzing(false);
      setCurrentBreed('');
    }
  };

  const analyzeAllBreeds = async () => {
    for (const breed of problematicBreeds) {
      if (!results[breed]) {
        await analyzeBreed(breed);
        // Small delay between breeds to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const colorToHex = (rgb: [number, number, number]) => {
    return `#${rgb.map(c => c.toString(16).padStart(2, '0')).join('')}`;
  };

  const generateCharacteristics = (analysis: BreedPhotoAnalysis) => {
    const hairColors = analysis.dominantColors
      .filter(color => color.percentage > 5) // Only significant colors
      .slice(0, 4) // Top 4 colors
      .map(color => color.colorName);

    const currentChars = getCurrentCharacteristics(analysis.breedName);

    return {
      current: currentChars,
      photoBased: hairColors,
      confidence: analysis.confidence
    };
  };

  const getCurrentCharacteristics = (breedName: string) => {
    // These are our current assumptions
    const current: Record<string, string[]> = {
      'Airedale Terrier': ['Brown', 'Black', 'Tan'],
      'African Wild Dog': ['Tan', 'Auburn', 'Dark Brown'],
      'Golden Retriever': ['Blonde', 'Light Brown', 'Auburn'],
      'Border Collie': ['Brown', 'Black', 'White'],
      'German Shepherd': ['Brown', 'Black', 'Tan']
    };

    return current[breedName] || ['Unknown'];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🔬 Breed Photo Analysis Lab
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Analyze actual dog photos to improve breed characteristics and matching accuracy.
          </p>

          <div className="flex gap-4 mb-8">
            <button
              onClick={analyzeAllBreeds}
              disabled={isAnalyzing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isAnalyzing ? `Analyzing ${currentBreed}...` : 'Analyze All Breeds'}
            </button>

            <select
              onChange={(e) => e.target.value && analyzeBreed(e.target.value)}
              disabled={isAnalyzing}
              className="border border-gray-300 rounded-lg px-4 py-3"
              value=""
            >
              <option value="">Analyze Individual Breed</option>
              {problematicBreeds.map(breed => (
                <option key={breed} value={breed}>{breed}</option>
              ))}
            </select>
          </div>
        </div>

        {isAnalyzing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-blue-800 font-semibold">
                Analyzing {currentBreed}... This may take a moment.
              </span>
            </div>
          </div>
        )}

        <div className="grid gap-8">
          {Object.entries(results).map(([breedName, analysis]) => {
            const characteristics = generateCharacteristics(analysis);

            return (
              <div key={breedName} className="bg-white rounded-xl shadow-lg p-6 border">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{breedName}</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Sample Photos */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Sample Photos ({analysis.sampleSize} analyzed)
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {analysis.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`${breedName} ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Confidence: {analysis.confidence}% • Variety: {analysis.colorVariety} unique colors
                    </p>
                  </div>

                  {/* Color Analysis */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Dominant Colors</h3>
                    <div className="space-y-2">
                      {analysis.dominantColors.slice(0, 5).map((color, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div
                            className="w-6 h-6 rounded border border-gray-300"
                            style={{ backgroundColor: colorToHex(color.rgb) }}
                          ></div>
                          <span className="font-medium">{color.colorName}</span>
                          <span className="text-gray-500 text-sm">
                            {color.percentage.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Characteristics Comparison */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Breed Characteristics Comparison
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Current (Assumed)</h4>
                      <div className="flex flex-wrap gap-2">
                        {characteristics.current.map((color, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">
                        Photo-Based (Analyzed) • {characteristics.confidence}% confidence
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {characteristics.photoBased.map((color, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Show differences */}
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <h5 className="font-medium text-yellow-800 mb-1">Key Differences:</h5>
                    <p className="text-yellow-700 text-sm">
                      {(() => {
                        const missing = characteristics.current.filter(c => !characteristics.photoBased.includes(c));
                        const new_colors = characteristics.photoBased.filter(c => !characteristics.current.includes(c));

                        const differences = [];
                        if (missing.length > 0) differences.push(`Missing: ${missing.join(', ')}`);
                        if (new_colors.length > 0) differences.push(`Found: ${new_colors.join(', ')}`);

                        return differences.length > 0 ? differences.join(' • ') : 'Characteristics match well!';
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {Object.keys(results).length === 0 && !isAnalyzing && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔬</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Ready to Analyze Breed Photos
            </h3>
            <p className="text-gray-500">
              Click &quot;Analyze All Breeds&quot; to start analyzing photos and improving breed characteristics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}