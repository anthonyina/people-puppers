'use client';

import { useState } from 'react';

export default function TestAnalyzer() {
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testAPI = async () => {
    setIsLoading(true);
    setResult('');

    try {
      // First, test if we can get breed images
      const { getBreedImages } = await import('../utils/dogApi');

      console.log('Testing Golden Retriever images...');
      const images = await getBreedImages('Golden Retriever', 2);

      setResult(`✅ Success! Got ${images.length} images:\n${images.join('\n')}`);

    } catch (error) {
      console.error('Test failed:', error);
      setResult(`❌ Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testPhotoAnalysis = async () => {
    setIsLoading(true);
    setResult('');

    try {
      // Test photo analysis with a single image
      const { BreedPhotoAnalyzer } = await import('../utils/photoAnalyzer');
      const analyzer = new BreedPhotoAnalyzer();

      console.log('Testing photo analysis...');
      const analysis = await analyzer.analyzeBreed('Golden Retriever', 2);

      setResult(`✅ Photo Analysis Success!
Breed: ${analysis.breedName}
Photos analyzed: ${analysis.sampleSize}
Dominant colors: ${analysis.dominantColors.slice(0, 3).map(c => c.colorName).join(', ')}
Confidence: ${analysis.confidence}%`);

    } catch (error) {
      console.error('Photo analysis failed:', error);
      setResult(`❌ Photo Analysis Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🧪 Photo Analysis Test</h1>

        <div className="space-y-4 mb-8">
          <button
            onClick={testAPI}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold"
          >
            {isLoading ? 'Testing...' : 'Test API Connection'}
          </button>

          <button
            onClick={testPhotoAnalysis}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold ml-4"
          >
            {isLoading ? 'Analyzing...' : 'Test Photo Analysis'}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-lg p-6 border">
            <h3 className="font-semibold mb-3">Test Result:</h3>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}