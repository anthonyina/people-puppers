'use client';

import { useState } from 'react';
import CameraCapture from './components/CameraCapture';
import BreedResults from './components/BreedResults';
import { BreedMatch } from './utils/breedMatcher';

export default function Home() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [breedMatch, setBreedMatch] = useState<BreedMatch | null>(null);

  const handleImageCapture = async (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setIsAnalyzing(true);

    try {
      // Import analysis functions dynamically
      const { analyzeFacialFeatures } = await import('./utils/imageAnalysis');
      const { findBreedMatchFromAllBreeds } = await import('./utils/breedMatcher');

      // Analyze the facial features from the image
      const facialFeatures = await analyzeFacialFeatures(imageDataUrl);

      // Find the best breed match based on the features using all available breeds
      const breedMatch = await findBreedMatchFromAllBreeds(facialFeatures);

      setBreedMatch(breedMatch);
    } catch (error) {
      console.error('Error analyzing image:', error);
      // Fallback to a default result if analysis fails
      setBreedMatch({
        breed: 'Golden Retriever',
        confidence: 0.75,
        reasoning: 'Unable to complete full analysis, but based on general features, you match well with this friendly breed!',
        dogImage: 'https://images.dog.ceo/breeds/retriever-golden/n02099601_1.jpg'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setBreedMatch(null);
    setIsAnalyzing(false);
    // Scroll to top of page after DOM updates
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-6xl">🐶</span>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              People Puppers
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Take a selfie to discover your dog breed twin! Good lighting and open eyes give the best matches.
          </p>
        </div>

        {/* Main Content */}
        {!capturedImage && !isAnalyzing && !breedMatch && (
          <CameraCapture onImageCapture={handleImageCapture} />
        )}

        {isAnalyzing && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-700">Analyzing your features...</h3>
            <p className="text-gray-500 mt-2">Finding your perfect dog breed match</p>
          </div>
        )}

        {breedMatch && capturedImage && (
          <BreedResults
            userImage={capturedImage}
            breedMatch={breedMatch}
            onReset={handleReset}
          />
        )}

        {/* Donation Block */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto text-center border border-gray-100">
          {/* Avatar */}
          <div className="mb-6">
            <img
              src="/charlotte_and_willie.png"
              alt="Charlotte and Willie"
              className="w-[70px] h-[70px] rounded-full mx-auto shadow-lg object-cover"
            />
          </div>

          {/* Message */}
          <p className="text-gray-700 text-lg mb-6 leading-relaxed">
            Hi, I&apos;m Charlotte! 🐶✨ I&apos;m 12 years old and love dogs. 🐾 If the app was fun for you, a small donation would mean a lot 🙏 and help me keep learning! 📚
          </p>

          {/* Donation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://venmo.com/anthonyina"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <span className="text-lg">💙</span>
              Venmo
            </a>
            <a
              href="https://paypal.me/peoplepuppers"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <span className="text-lg">💛</span>
              PayPal
            </a>
          </div>

          {/* Small thank you */}
          <p className="text-gray-500 text-sm mt-4">
            Thank you for supporting indie developers! 🐶✨
          </p>
        </div>
      </div>
    </main>
  );
}
