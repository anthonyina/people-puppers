const DOG_API_KEY = 'live_XcdMQZ9hDZwYS7OLxj30CnrYAh8v0lnVCtNv0EB0sjuRPBo2BhISizF1YPdE8T3w';

export interface DogBreedInfo {
  id: string;
  name: string;
  temperament: string;
  origin: string;
  country_code: string;
  description: string;
  life_span: string;
  weight: {
    imperial: string;
    metric: string;
  };
  height: {
    imperial: string;
    metric: string;
  };
}

export interface DogCeoBreed {
  name: string;
  subBreeds: string[];
}

// Get random dog image from dog.ceo API
export async function getRandomDogImage(breed?: string): Promise<string> {
  try {
    let url = 'https://dog.ceo/api/breeds/image/random';

    if (breed) {
      // Use the correct breed mapping format
      const breedPath = getBreedApiPath(breed);
      if (breedPath) {
        url = `https://dog.ceo/api/breed/${breedPath}/images/random`;
      }
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'success') {
      return data.message;
    } else {
      console.warn(`Failed to fetch image for breed: ${breed}, falling back to random image`);
      // Fallback to random image if specific breed fails
      const fallbackResponse = await fetch('https://dog.ceo/api/breeds/image/random');
      const fallbackData = await fallbackResponse.json();
      return fallbackData.message;
    }
  } catch (error) {
    console.error('Error fetching dog image:', error);
    // Return a default image if API fails
    return 'https://images.dog.ceo/breeds/retriever/golden/n02099601_1.jpg';
  }
}

// Get all available breeds from dog.ceo API
export async function getAllBreeds(): Promise<DogCeoBreed[]> {
  try {
    const response = await fetch('https://dog.ceo/api/breeds/list/all');
    const data = await response.json();

    if (data.status === 'success') {
      return Object.entries(data.message).map(([breed, subBreeds]) => ({
        name: breed,
        subBreeds: subBreeds as string[]
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching breeds:', error);
    return [];
  }
}

// Get breed information from The Dog API
export async function getBreedInfo(breedName: string): Promise<DogBreedInfo | null> {
  try {
    const response = await fetch(`https://api.thedogapi.com/v1/breeds/search?q=${encodeURIComponent(breedName)}`, {
      headers: {
        'x-api-key': DOG_API_KEY
      }
    });

    const data = await response.json();

    if (data && data.length > 0) {
      return data[0];
    }

    return null;
  } catch (error) {
    console.error('Error fetching breed info:', error);
    return null;
  }
}

// Get multiple images for a specific breed
export async function getBreedImages(breedName: string, count: number = 1): Promise<string[]> {
  try {
    const breedPath = getBreedApiPath(breedName);
    if (!breedPath) {
      throw new Error(`No breed path found for ${breedName}`);
    }

    const response = await fetch(`https://dog.ceo/api/breed/${breedPath}/images/random/${count}`);
    const data = await response.json();

    if (data.status === 'success') {
      return Array.isArray(data.message) ? data.message : [data.message];
    }

    console.warn(`Failed to fetch images for breed: ${breedName}, falling back to random images`);
    // Fallback to random images
    const fallbackImages = [];
    for (let i = 0; i < count; i++) {
      const randomImage = await getRandomDogImage();
      fallbackImages.push(randomImage);
    }
    return fallbackImages;
  } catch (error) {
    console.error('Error fetching breed images:', error);
    return [];
  }
}

// Get the correct API path for a breed name
export function getBreedApiPath(breedName: string): string | null {
  const breedMap: Record<string, string> = {
    'golden retriever': 'retriever/golden',
    'labrador retriever': 'labrador',
    'german shepherd': 'german/shepherd',
    'border collie': 'collie/border',
    'french bulldog': 'bulldog/french',
    'english bulldog': 'bulldog/english',
    'jack russell terrier': 'terrier/russell',
    'yorkshire terrier': 'terrier/yorkshire',
    'boston terrier': 'terrier/boston',
    'siberian husky': 'husky',
    'alaskan malamute': 'malamute',
    'great dane': 'dane/great',
    'saint bernard': 'stbernard',
    'cocker spaniel': 'spaniel/cocker',
    'english springer spaniel': 'springer/english',
    'american bulldog': 'bulldog/american',
    'wild african': 'african/wild',
    'african wild': 'african/wild',
    'norwegian elkhound': 'elkhound/norwegian',
    'chesapeake bay retriever': 'retriever/chesapeake',
    'curly coated retriever': 'retriever/curly',
    'flat coated retriever': 'retriever/flatcoated',
    'irish setter': 'setter/irish',
    'english setter': 'setter/english',
    'gordon setter': 'setter/gordon',
    'spanish water dog': 'waterdog/spanish',
    'rhodesian ridgeback': 'ridgeback/rhodesian',
    'scottish deerhound': 'deerhound/scottish',
    'irish wolfhound': 'wolfhound/irish',
    'bernese mountain dog': 'mountain/bernese',
    'swiss mountain dog': 'mountain/swiss',
    'english mastiff': 'mastiff/english',
    'bull mastiff': 'mastiff/bull',
    'tibetan mastiff': 'mastiff/tibetan'
  };

  const normalized = breedName.toLowerCase();

  // Direct mapping first
  if (breedMap[normalized]) {
    return breedMap[normalized];
  }

  // Try to match partial names
  for (const [key, value] of Object.entries(breedMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  // Default format: replace spaces with dashes (for simple breeds like "beagle")
  const simple = normalized.replace(/\s+/g, '');
  return simple;
}

// Legacy function for backward compatibility
export function normalizeBreedName(breedName: string): string {
  return getBreedApiPath(breedName) || breedName.toLowerCase().replace(/\s+/g, '-');
}