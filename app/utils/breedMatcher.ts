import { ColorAnalysis, FacialFeatures } from './imageAnalysis';
import { getRandomDogImage, getBreedInfo, normalizeBreedName, getBreedDescriptionFromWikipedia } from './dogApi';
import { loadAllBreeds, getRandomBreedSelection, filterBreedsByCharacteristics, DynamicBreedCharacteristics } from './dynamicBreedLoader';

export interface BreedMatch {
  breed: string;
  confidence: number;
  reasoning: string;
  dogImage: string;
  breedInfo?: {
    temperament: string;
    origin: string;
    size: string;
    lifeSpan: string;
    description: string;
  };
}

interface BreedCharacteristics {
  name: string;
  hairColors: string[];
  coatPattern: string[];
  size: 'small' | 'medium' | 'large';
  eyeColors: string[];
  temperamentMatch: string[];
  physicalTraits: string[];
}

// Dog breed database with characteristics that can be matched to human features
const DOG_BREEDS: BreedCharacteristics[] = [
  {
    name: 'Golden Retriever',
    hairColors: ['Blonde', 'Light Brown', 'Auburn'],
    coatPattern: ['solid', 'flowing'],
    size: 'large',
    eyeColors: ['Brown', 'Hazel'],
    temperamentMatch: ['friendly', 'warm', 'loyal'],
    physicalTraits: ['wavy hair', 'warm tones']
  },
  {
    name: 'Border Collie',
    hairColors: ['Black', 'Brown', 'White'],
    coatPattern: ['mixed', 'black and white'],
    size: 'medium',
    eyeColors: ['Blue', 'Brown', 'Hazel'],
    temperamentMatch: ['intelligent', 'energetic', 'focused'],
    physicalTraits: ['sharp features', 'expressive eyes']
  },
  {
    name: 'Husky',
    hairColors: ['Black', 'Gray', 'White'],
    coatPattern: ['mixed', 'black and white', 'gray and white'],
    size: 'large',
    eyeColors: ['Blue', 'Brown', 'Hazel'],
    temperamentMatch: ['adventurous', 'strong', 'independent'],
    physicalTraits: ['striking eyes', 'strong features']
  },
  {
    name: 'Labrador Retriever',
    hairColors: ['Blonde', 'Brown', 'Black'],
    coatPattern: ['solid'],
    size: 'large',
    eyeColors: ['Brown', 'Hazel'],
    temperamentMatch: ['friendly', 'loyal', 'energetic'],
    physicalTraits: ['soft features', 'kind eyes']
  },
  {
    name: 'German Shepherd',
    hairColors: ['Brown', 'Black', 'Dark Brown'],
    coatPattern: ['mixed', 'tan and black'],
    size: 'large',
    eyeColors: ['Brown', 'Dark Brown'],
    temperamentMatch: ['loyal', 'protective', 'intelligent'],
    physicalTraits: ['strong jawline', 'alert expression']
  },
  {
    name: 'Poodle',
    hairColors: ['Black', 'White', 'Brown', 'Gray'],
    coatPattern: ['curly', 'solid'],
    size: 'medium',
    eyeColors: ['Brown', 'Dark Brown'],
    temperamentMatch: ['elegant', 'intelligent', 'refined'],
    physicalTraits: ['curly hair', 'refined features']
  },
  {
    name: 'Beagle',
    hairColors: ['Brown', 'Black', 'White'],
    coatPattern: ['tricolor', 'mixed'],
    size: 'medium',
    eyeColors: ['Brown', 'Hazel'],
    temperamentMatch: ['friendly', 'curious', 'gentle'],
    physicalTraits: ['soft features', 'gentle expression']
  },
  {
    name: 'Cocker Spaniel',
    hairColors: ['Blonde', 'Brown', 'Black'],
    coatPattern: ['solid', 'flowing'],
    size: 'medium',
    eyeColors: ['Brown', 'Hazel'],
    temperamentMatch: ['gentle', 'affectionate', 'elegant'],
    physicalTraits: ['soft wavy hair', 'gentle eyes']
  },
  {
    name: 'Bulldog',
    hairColors: ['Brown', 'White', 'Tan'],
    coatPattern: ['solid', 'mixed'],
    size: 'medium',
    eyeColors: ['Brown', 'Dark Brown'],
    temperamentMatch: ['determined', 'strong', 'loyal'],
    physicalTraits: ['strong jaw', 'determined expression']
  },
  {
    name: 'Shih Tzu',
    hairColors: ['Brown', 'Black', 'White', 'Gray'],
    coatPattern: ['mixed', 'long'],
    size: 'small',
    eyeColors: ['Brown', 'Dark Brown'],
    temperamentMatch: ['friendly', 'outgoing', 'affectionate'],
    physicalTraits: ['long hair', 'small features']
  },
  {
    name: 'Yorkshire Terrier',
    hairColors: ['Brown', 'Black', 'Tan'],
    coatPattern: ['silky', 'long'],
    size: 'small',
    eyeColors: ['Brown', 'Dark Brown'],
    temperamentMatch: ['feisty', 'confident', 'brave'],
    physicalTraits: ['silky hair', 'alert expression']
  },
  {
    name: 'Dalmatian',
    hairColors: ['White', 'Black'],
    coatPattern: ['spotted', 'white with black spots'],
    size: 'large',
    eyeColors: ['Brown', 'Blue'],
    temperamentMatch: ['energetic', 'playful', 'unique'],
    physicalTraits: ['distinctive markings', 'athletic build']
  }
];

// Calculate color similarity using RGB distance
function colorSimilarity(color1: string, color2: string): number {
  // Simple color name matching - in a real app you'd use color space distance
  const colorGroups: Record<string, string[]> = {
    'light': ['Blonde', 'White', 'Very Light', 'Light'],
    'medium': ['Light Brown', 'Brown', 'Medium', 'Medium-Light'],
    'dark': ['Dark Brown', 'Black', 'Deep', 'Dark', 'Medium-Dark'],
    'red': ['Red', 'Auburn', 'Reddish Brown'],
    'gray': ['Gray', 'Silver']
  };

  for (const [, colors] of Object.entries(colorGroups)) {
    if (colors.includes(color1) && colors.includes(color2)) {
      return 1.0; // Perfect match within group
    }
  }

  // Check for partial matches
  if (color1.toLowerCase().includes(color2.toLowerCase()) ||
      color2.toLowerCase().includes(color1.toLowerCase())) {
    return 0.7;
  }

  return 0.0;
}

// Calculate breed match score for dynamic breeds
function calculateDynamicBreedScore(features: ColorAnalysis, breed: DynamicBreedCharacteristics): number {
  let score = 0;
  let factors = 0;

  // Hair color matching (40% weight)
  const hairMatch = Math.max(
    ...breed.hairColors.map(breedHair => colorSimilarity(features.hairColor.dominant, breedHair))
  );
  score += hairMatch * 0.4;
  factors += 0.4;

  // Eye color matching (30% weight)
  const eyeMatch = Math.max(
    ...breed.eyeColors.map(breedEye => colorSimilarity(features.eyeColor.dominant, breedEye))
  );
  score += eyeMatch * 0.3;
  factors += 0.3;

  // Skin tone consideration (20% weight)
  let skinMatch = 0.5; // Base score
  if (features.skinTone.warmth === 'warm') {
    const warmBreeds = ['retriever', 'spaniel', 'labrador'];
    if (warmBreeds.some(w => breed.name.toLowerCase().includes(w))) skinMatch = 0.8;
  } else if (features.skinTone.warmth === 'cool') {
    const coolBreeds = ['husky', 'collie', 'shepherd'];
    if (coolBreeds.some(c => breed.name.toLowerCase().includes(c))) skinMatch = 0.8;
  }
  score += skinMatch * 0.2;
  factors += 0.2;

  // Feature intensity matching (10% weight)
  let intensityMatch = 0.5;
  if (features.eyeColor.intensity === 'dark') {
    const darkEyedBreeds = ['shepherd', 'poodle', 'bulldog'];
    if (darkEyedBreeds.some(d => breed.name.toLowerCase().includes(d))) intensityMatch = 0.8;
  } else if (features.eyeColor.intensity === 'light') {
    const lightEyedBreeds = ['husky', 'collie', 'australian'];
    if (lightEyedBreeds.some(l => breed.name.toLowerCase().includes(l))) intensityMatch = 0.8;
  }
  score += intensityMatch * 0.1;
  factors += 0.1;

  const baseScore = factors > 0 ? score / factors : 0;

  // Apply popularity weighting - popular breeds get a boost, exotic breeds get reduced
  return baseScore * breed.popularityWeight;
}

// Calculate breed match score based on facial features (legacy static version)
function calculateBreedScore(features: ColorAnalysis, breed: BreedCharacteristics): number {
  let score = 0;
  let factors = 0;

  // Hair color matching (40% weight)
  const hairMatch = Math.max(
    ...breed.hairColors.map(breedHair => colorSimilarity(features.hairColor.dominant, breedHair))
  );
  score += hairMatch * 0.4;
  factors += 0.4;

  // Eye color matching (30% weight)
  const eyeMatch = Math.max(
    ...breed.eyeColors.map(breedEye => colorSimilarity(features.eyeColor.dominant, breedEye))
  );
  score += eyeMatch * 0.3;
  factors += 0.3;

  // Skin tone consideration (20% weight)
  // Warmer skin tones might match better with certain breeds
  let skinMatch = 0.5; // Base score
  if (features.skinTone.warmth === 'warm') {
    const warmBreeds = ['Golden Retriever', 'Cocker Spaniel', 'Labrador Retriever'];
    if (warmBreeds.includes(breed.name)) skinMatch = 0.8;
  } else if (features.skinTone.warmth === 'cool') {
    const coolBreeds = ['Husky', 'Border Collie', 'German Shepherd'];
    if (coolBreeds.includes(breed.name)) skinMatch = 0.8;
  }
  score += skinMatch * 0.2;
  factors += 0.2;

  // Feature intensity matching (10% weight)
  let intensityMatch = 0.5;
  if (features.eyeColor.intensity === 'dark') {
    const darkEyedBreeds = ['German Shepherd', 'Poodle', 'Bulldog'];
    if (darkEyedBreeds.includes(breed.name)) intensityMatch = 0.8;
  } else if (features.eyeColor.intensity === 'light') {
    const lightEyedBreeds = ['Husky', 'Border Collie', 'Dalmatian'];
    if (lightEyedBreeds.includes(breed.name)) intensityMatch = 0.8;
  }
  score += intensityMatch * 0.1;
  factors += 0.1;

  return factors > 0 ? score / factors : 0;
}

// Generate reasoning for dynamic breed match
function generateDynamicReasoning(features: ColorAnalysis, breed: DynamicBreedCharacteristics, score: number): string {
  const reasons: string[] = [];

  // Hair color reasoning
  const matchingHairColors = breed.hairColors.filter(breedHair =>
    colorSimilarity(features.hairColor.dominant, breedHair) > 0.6
  );
  if (matchingHairColors.length > 0) {
    reasons.push(`your ${features.hairColor.dominant.toLowerCase()} hair matches the ${matchingHairColors[0].toLowerCase()} coat`);
  }

  // Eye color reasoning
  const matchingEyeColors = breed.eyeColors.filter(breedEye =>
    colorSimilarity(features.eyeColor.dominant, breedEye) > 0.6
  );
  if (matchingEyeColors.length > 0) {
    reasons.push(`your ${features.eyeColor.dominant.toLowerCase()} eyes are similar to this breed's typical eye color`);
  }

  // Skin tone reasoning
  if (features.skinTone.warmth === 'warm' && ['retriever', 'spaniel', 'labrador'].some(w => breed.name.toLowerCase().includes(w))) {
    reasons.push('your warm undertones complement this breed\'s golden coloring');
  }

  // Physical traits
  if (breed.physicalTraits.length > 0) {
    reasons.push(`your features align with this breed's ${breed.physicalTraits[0].toLowerCase()}`);
  }

  if (reasons.length === 0) {
    reasons.push('your overall coloring and features create a harmonious match with this breed');
  }

  return `Based on our analysis, ${reasons.join(', and ')}.`;
}

// Generate reasoning for the breed match (legacy static version)
function generateReasoning(features: ColorAnalysis, breed: BreedCharacteristics, score: number): string {
  const reasons: string[] = [];

  // Hair color reasoning
  const matchingHairColors = breed.hairColors.filter(breedHair =>
    colorSimilarity(features.hairColor.dominant, breedHair) > 0.6
  );
  if (matchingHairColors.length > 0) {
    reasons.push(`your ${features.hairColor.dominant.toLowerCase()} hair matches the ${matchingHairColors[0].toLowerCase()} coat`);
  }

  // Eye color reasoning
  const matchingEyeColors = breed.eyeColors.filter(breedEye =>
    colorSimilarity(features.eyeColor.dominant, breedEye) > 0.6
  );
  if (matchingEyeColors.length > 0) {
    reasons.push(`your ${features.eyeColor.dominant.toLowerCase()} eyes are similar to this breed's typical eye color`);
  }

  // Skin tone reasoning
  if (features.skinTone.warmth === 'warm') {
    const warmBreeds = ['Golden Retriever', 'Cocker Spaniel', 'Labrador Retriever'];
    if (warmBreeds.includes(breed.name)) {
      reasons.push('your warm undertones complement this breed\'s golden coloring');
    }
  }

  // Feature intensity
  if (features.eyeColor.intensity === 'dark' && breed.eyeColors.includes('Brown')) {
    reasons.push('your expressive dark eyes mirror this breed\'s soulful gaze');
  }

  if (reasons.length === 0) {
    reasons.push('your overall coloring and features create a harmonious match with this breed');
  }

  return `Based on our analysis, ${reasons.join(', and ')}.`;
}

// Main function to find the best dog breed match
export async function findBreedMatch(facialFeatures: FacialFeatures): Promise<BreedMatch> {
  const { colors } = facialFeatures;

  // Calculate scores for all breeds
  const breedScores = DOG_BREEDS.map(breed => ({
    breed,
    score: calculateBreedScore(colors, breed)
  }));

  // Sort by score and get the best match
  breedScores.sort((a, b) => b.score - a.score);
  const bestMatch = breedScores[0];

  // Add some randomness for variety (but keep it reasonable)
  const topMatches = breedScores.filter(b => b.score >= bestMatch.score - 0.1).slice(0, 3);
  const selectedMatch = topMatches[Math.floor(Math.random() * topMatches.length)];

  const breedName = selectedMatch.breed.name;
  const confidence = Math.min(selectedMatch.score + 0.1 + Math.random() * 0.1, 0.95); // Add some variance

  // Get dog image and breed information
  const dogImage = await getRandomDogImage(normalizeBreedName(breedName));
  const breedInfo = await getBreedInfo(breedName);

  const reasoning = generateReasoning(colors, selectedMatch.breed, selectedMatch.score);

  const result: BreedMatch = {
    breed: breedName,
    confidence,
    reasoning,
    dogImage
  };

  // Add breed information if available
  if (breedInfo) {
    result.breedInfo = {
      temperament: breedInfo.temperament || 'Friendly and loyal',
      origin: breedInfo.origin || 'Unknown',
      size: `${breedInfo.height?.imperial || 'Medium height'}, ${breedInfo.weight?.imperial || 'Medium weight'}`,
      lifeSpan: breedInfo.life_span || '10-15 years',
      description: breedInfo.description || await getBreedDescriptionFromWikipedia(breedName) || 'Description unavailable for this breed'
    };
  }

  return result;
}

// Helper function to get multiple breed suggestions
export async function getBreedSuggestions(facialFeatures: FacialFeatures, count: number = 3): Promise<BreedMatch[]> {
  const { colors } = facialFeatures;

  // Calculate scores for all breeds
  const breedScores = DOG_BREEDS.map(breed => ({
    breed,
    score: calculateBreedScore(colors, breed)
  }));

  // Sort by score and get top matches
  breedScores.sort((a, b) => b.score - a.score);
  const topMatches = breedScores.slice(0, count);

  const results: BreedMatch[] = [];

  for (const match of topMatches) {
    const breedName = match.breed.name;
    const confidence = Math.min(match.score + Math.random() * 0.1, 0.95);

    const dogImage = await getRandomDogImage(normalizeBreedName(breedName));
    const breedInfo = await getBreedInfo(breedName);

    const reasoning = generateReasoning(colors, match.breed, match.score);

    const result: BreedMatch = {
      breed: breedName,
      confidence,
      reasoning,
      dogImage
    };

    if (breedInfo) {
      result.breedInfo = {
        temperament: breedInfo.temperament || 'Friendly and loyal',
        origin: breedInfo.origin || 'Unknown',
        size: `${breedInfo.height?.imperial || 'Medium height'}, ${breedInfo.weight?.imperial || 'Medium weight'}`,
        lifeSpan: breedInfo.life_span || '10-15 years',
        description: breedInfo.description || `${breedName}s are wonderful companions.`
      };
    }

    results.push(result);
  }

  return results;
}

// Enhanced function to find breed match using all available breeds
export async function findBreedMatchFromAllBreeds(facialFeatures: FacialFeatures): Promise<BreedMatch> {
  const { colors } = facialFeatures;

  try {
    console.log('Loading all available dog breeds...');

    // Load all breeds from the API
    const allBreeds = await loadAllBreeds();

    if (allBreeds.length === 0) {
      console.log('Failed to load dynamic breeds, falling back to static breeds');
      return findBreedMatch(facialFeatures);
    }

    console.log(`Loaded ${allBreeds.length} dog breeds for matching`);

    // Pre-filter breeds based on basic characteristics for better matches
    const candidateBreeds = filterBreedsByCharacteristics(allBreeds, {
      hairColors: [colors.hairColor.dominant],
      eyeColors: [colors.eyeColor.dominant]
    });

    // Use a subset of breeds for performance (top 50 candidates + random selection)
    const breedsToTest = candidateBreeds.length > 0
      ? [...candidateBreeds.slice(0, 30), ...getRandomBreedSelection(allBreeds, 20)]
      : getRandomBreedSelection(allBreeds, 50);

    console.log(`Testing ${breedsToTest.length} breeds for matching`);

    // Calculate scores for all candidate breeds
    const breedScores = breedsToTest.map(breed => ({
      breed,
      score: calculateDynamicBreedScore(colors, breed)
    }));

    // Sort by score and get the best match
    breedScores.sort((a, b) => b.score - a.score);
    const bestMatch = breedScores[0];

    // Add some randomness for variety from top matches
    const topMatches = breedScores.filter(b => b.score >= bestMatch.score - 0.1).slice(0, 3);
    const selectedMatch = topMatches[Math.floor(Math.random() * topMatches.length)];

    const breedName = selectedMatch.breed.name;
    const confidence = Math.min(selectedMatch.score + 0.1 + Math.random() * 0.1, 0.95);

    console.log(`Best match: ${breedName} with ${Math.round(confidence * 100)}% confidence`);

    // Get dog image and breed information
    const dogImage = await getRandomDogImage(normalizeBreedName(breedName));
    const breedInfo = await getBreedInfo(breedName);

    const reasoning = generateDynamicReasoning(colors, selectedMatch.breed, selectedMatch.score);

    const result: BreedMatch = {
      breed: breedName,
      confidence,
      reasoning,
      dogImage
    };

    // Add breed information if available
    if (breedInfo) {
      result.breedInfo = {
        temperament: breedInfo.temperament || selectedMatch.breed.temperamentMatch.join(', '),
        origin: breedInfo.origin || 'Various regions',
        size: `${breedInfo.height?.imperial || 'Medium height'}, ${breedInfo.weight?.imperial || 'Medium weight'}`,
        lifeSpan: breedInfo.life_span || '10-15 years',
        description: breedInfo.description || await getBreedDescriptionFromWikipedia(breedName) || 'Description unavailable for this breed'
      };
    } else {
      // Use dynamic breed characteristics as fallback
      result.breedInfo = {
        temperament: selectedMatch.breed.temperamentMatch.join(', '),
        origin: 'Various regions',
        size: `${selectedMatch.breed.size} size`,
        lifeSpan: '10-15 years',
        description: await getBreedDescriptionFromWikipedia(breedName) || 'Description unavailable for this breed'
      };
    }

    return result;
  } catch (error) {
    console.error('Error in dynamic breed matching:', error);
    console.log('Falling back to static breed matching');
    return findBreedMatch(facialFeatures);
  }
}