'use client';

import { useState } from 'react';

interface BreedMatch {
  breed: string;
  confidence: number;
  reasoning: string;
  dogImage: string;
  faceShape?: 'oval' | 'round' | 'square' | 'heart' | 'diamond';
  numberOfFaces?: number;
  breedInfo?: {
    temperament: string;
    origin: string;
    size: string;
    lifeSpan: string;
    description: string;
  };
}

interface BreedResultsProps {
  userImage: string;
  breedMatch: BreedMatch;
  onReset: () => void;
}

export default function BreedResults({ userImage, breedMatch, onReset }: BreedResultsProps) {
  const confidencePercentage = Math.round(breedMatch.confidence * 100);
  const [currentDogImage, setCurrentDogImage] = useState(breedMatch.dogImage);
  const [isLoadingNewImage, setIsLoadingNewImage] = useState(false);

  const refreshDogImage = async () => {
    setIsLoadingNewImage(true);
    try {
      // Import the dog API function
      const { getRandomDogImage, normalizeBreedName } = await import('../utils/dogApi');
      const newImage = await getRandomDogImage(normalizeBreedName(breedMatch.breed));
      setCurrentDogImage(newImage);
    } catch (error) {
      console.error('Failed to load new dog image:', error);
    } finally {
      setIsLoadingNewImage(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Dog Breed Twin!</h2>
        <div className="flex items-center justify-center gap-2 text-lg">
          <span className="text-2xl">🎉</span>
          <span className="font-semibold text-blue-600">{breedMatch.breed}</span>
        </div>
      </div>

      {/* Image Comparison */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* User Photo */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Your Selfie</h3>
          <div className="relative rounded-xl overflow-hidden shadow-lg bg-gray-100">
            <img
              src={userImage}
              alt="Your selfie"
              className="w-full h-80 object-cover"
            />
          </div>
        </div>

        {/* Dog Photo */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Your Dog Twin</h3>
          <div className="relative rounded-xl overflow-hidden shadow-lg bg-gray-100 group">
            <img
              src={currentDogImage}
              alt={`${breedMatch.breed} dog`}
              className="w-full h-80 object-cover transition-opacity duration-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.dog.ceo/breeds/retriever-golden/n02099601_1.jpg';
              }}
            />
            {/* Refresh Button Overlay */}
            <button
              onClick={refreshDogImage}
              disabled={isLoadingNewImage}
              className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50"
              title="Get another photo of this breed"
            >
              {isLoadingNewImage ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Match Explanation */}
      <div className="bg-blue-50 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <span className="text-xl">🔍</span>
          Why This Match?
        </h3>
        <p className="text-blue-700 leading-relaxed">{breedMatch.reasoning}</p>
      </div>

      {/* Breed Information */}
      {breedMatch.breedInfo && (
        <div className="bg-purple-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
            <span className="text-xl">📋</span>
            About {breedMatch.breed}s
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-purple-700 mb-1">Temperament</h4>
              <p className="text-purple-600 text-sm mb-3">{breedMatch.breedInfo.temperament}</p>

              <h4 className="font-medium text-purple-700 mb-1">Origin</h4>
              <p className="text-purple-600 text-sm mb-3">{breedMatch.breedInfo.origin}</p>
            </div>
            <div>
              <h4 className="font-medium text-purple-700 mb-1">Size</h4>
              <p className="text-purple-600 text-sm mb-3">{breedMatch.breedInfo.size}</p>

              <h4 className="font-medium text-purple-700 mb-1">Life Span</h4>
              <p className="text-purple-600 text-sm mb-3">{breedMatch.breedInfo.lifeSpan}</p>
            </div>
          </div>
          {breedMatch.breedInfo.description && (
            <div className="mt-4">
              <h4 className="font-medium text-purple-700 mb-1">Description</h4>
              <p className="text-purple-600 text-sm leading-relaxed">{breedMatch.breedInfo.description}</p>
            </div>
          )}
        </div>
      )}

      {/* Confidence Bar */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Match Confidence</h3>
        <div className="relative w-full bg-gray-200 rounded-full h-4">
          <div
            className="absolute top-0 left-0 h-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${confidencePercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>0%</span>
          <span className="font-medium">{confidencePercentage}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onReset}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-xl">📸</span>
          Try Another Photo
        </button>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'People Puppers - My Dog Breed Twin!',
                text: `I'm a ${breedMatch.breed} according to People Puppers! 🐶`,
                url: window.location.href,
              });
            } else {
              navigator.clipboard.writeText(`I'm a ${breedMatch.breed} according to People Puppers! 🐶 Check it out at ${window.location.href}`);
            }
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-xl">📤</span>
          Share Result
        </button>
      </div>
    </div>
  );
}