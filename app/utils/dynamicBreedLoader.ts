import { getAllBreeds, getBreedInfo, getRandomDogImage, normalizeBreedName } from './dogApi';

export interface DynamicBreedCharacteristics {
  name: string;
  fullName: string;
  hairColors: string[];
  coatPattern: string[];
  size: 'small' | 'medium' | 'large';
  eyeColors: string[];
  temperamentMatch: string[];
  physicalTraits: string[];
  isSubBreed: boolean;
  parentBreed?: string;
}

// Enhanced breed classification based on breed names and known characteristics
function classifyBreedCharacteristics(breedName: string, parentBreed?: string): Omit<DynamicBreedCharacteristics, 'name' | 'fullName' | 'isSubBreed' | 'parentBreed'> {
  const name = breedName.toLowerCase();
  const fullName = parentBreed ? `${parentBreed} ${breedName}`.toLowerCase() : name;

  // Size classification
  let size: 'small' | 'medium' | 'large' = 'medium';

  const smallBreeds = ['chihuahua', 'pug', 'pomeranian', 'maltese', 'yorkie', 'yorkshire', 'terrier', 'toy', 'miniature', 'shihtzu', 'papillon', 'pekinese'];
  const largeBreeds = ['shepherd', 'retriever', 'mastiff', 'dane', 'husky', 'malamute', 'rottweiler', 'doberman', 'newfoundland', 'pyrenees', 'wolfhound', 'ridgeback', 'mountain'];

  if (smallBreeds.some(s => fullName.includes(s))) size = 'small';
  else if (largeBreeds.some(s => fullName.includes(s))) size = 'large';

  // Hair/coat color classification
  let hairColors: string[] = ['Brown', 'Black', 'White']; // Default
  let coatPattern: string[] = ['solid'];

  if (fullName.includes('golden')) hairColors = ['Blonde', 'Light Brown', 'Auburn'];
  if (fullName.includes('black')) hairColors = ['Black', 'Dark Brown'];
  if (fullName.includes('white')) hairColors = ['White', 'Very Light'];
  if (fullName.includes('red')) hairColors = ['Red', 'Auburn', 'Brown'];
  if (fullName.includes('grey') || fullName.includes('gray')) hairColors = ['Gray', 'White'];
  if (fullName.includes('blue')) hairColors = ['Gray', 'Black'];

  // Special breed patterns
  if (fullName.includes('husky')) {
    hairColors = ['Black', 'Gray', 'White'];
    coatPattern = ['mixed', 'black and white', 'gray and white'];
  }
  if (fullName.includes('dalmatian')) {
    hairColors = ['White', 'Black'];
    coatPattern = ['spotted', 'white with black spots'];
  }
  if (fullName.includes('collie')) {
    hairColors = ['Brown', 'Black', 'White'];
    coatPattern = ['mixed', 'tricolor'];
  }
  if (fullName.includes('spaniel')) {
    hairColors = ['Brown', 'Black', 'Blonde'];
    coatPattern = ['solid', 'flowing'];
  }
  if (fullName.includes('poodle')) {
    hairColors = ['Black', 'White', 'Brown', 'Gray'];
    coatPattern = ['curly', 'solid'];
  }

  // Eye color classification
  let eyeColors: string[] = ['Brown', 'Dark Brown']; // Default

  if (fullName.includes('husky') || fullName.includes('australian')) eyeColors = ['Blue', 'Brown', 'Hazel'];
  if (fullName.includes('collie')) eyeColors = ['Blue', 'Brown', 'Hazel'];
  if (size === 'small') eyeColors = ['Brown', 'Dark Brown'];

  // Temperament classification
  let temperamentMatch: string[] = ['friendly', 'loyal'];

  if (fullName.includes('retriever')) temperamentMatch = ['friendly', 'loyal', 'energetic'];
  if (fullName.includes('shepherd')) temperamentMatch = ['loyal', 'protective', 'intelligent'];
  if (fullName.includes('terrier')) temperamentMatch = ['feisty', 'confident', 'brave'];
  if (fullName.includes('bulldog')) temperamentMatch = ['determined', 'strong', 'loyal'];
  if (fullName.includes('poodle')) temperamentMatch = ['elegant', 'intelligent', 'refined'];
  if (fullName.includes('spaniel')) temperamentMatch = ['gentle', 'affectionate', 'elegant'];
  if (fullName.includes('husky')) temperamentMatch = ['adventurous', 'strong', 'independent'];
  if (fullName.includes('beagle')) temperamentMatch = ['friendly', 'curious', 'gentle'];

  // Physical traits
  let physicalTraits: string[] = ['distinctive features'];

  if (fullName.includes('retriever')) physicalTraits = ['soft features', 'kind eyes'];
  if (fullName.includes('shepherd')) physicalTraits = ['strong jawline', 'alert expression'];
  if (fullName.includes('poodle')) physicalTraits = ['curly hair', 'refined features'];
  if (fullName.includes('spaniel')) physicalTraits = ['soft wavy hair', 'gentle eyes'];
  if (fullName.includes('husky')) physicalTraits = ['striking eyes', 'strong features'];
  if (fullName.includes('collie')) physicalTraits = ['sharp features', 'expressive eyes'];
  if (size === 'small') physicalTraits = ['small features', 'alert expression'];

  return {
    hairColors,
    coatPattern,
    size,
    eyeColors,
    temperamentMatch,
    physicalTraits
  };
}

// Format breed name for display
function formatBreedName(breed: string, subBreed?: string): string {
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  if (subBreed) {
    return `${capitalize(subBreed)} ${capitalize(breed)}`;
  }

  // Handle special cases
  const specialCases: Record<string, string> = {
    'stbernard': 'Saint Bernard',
    'shihtzu': 'Shih Tzu',
    'germanlonghair': 'German Longhair',
    'cotondetulear': 'Coton de Tulear',
    'mexicanhairless': 'Mexican Hairless',
    'bichonfrise': 'Bichon Frise'
  };

  return specialCases[breed] || capitalize(breed);
}

// Load all breeds dynamically from the API
export async function loadAllBreeds(): Promise<DynamicBreedCharacteristics[]> {
  try {
    const breedsData = await getAllBreeds();
    const allBreeds: DynamicBreedCharacteristics[] = [];

    for (const breedData of breedsData) {
      const { name: breed, subBreeds } = breedData;

      if (subBreeds.length === 0) {
        // Main breed only
        const characteristics = classifyBreedCharacteristics(breed);
        const formattedName = formatBreedName(breed);

        allBreeds.push({
          name: formattedName,
          fullName: formattedName,
          isSubBreed: false,
          ...characteristics
        });
      } else {
        // Breed with sub-breeds
        for (const subBreed of subBreeds) {
          const characteristics = classifyBreedCharacteristics(subBreed, breed);
          const formattedName = formatBreedName(breed, subBreed);

          allBreeds.push({
            name: formattedName,
            fullName: formattedName,
            isSubBreed: true,
            parentBreed: breed,
            ...characteristics
          });
        }

        // Also add the main breed
        const characteristics = classifyBreedCharacteristics(breed);
        const formattedName = formatBreedName(breed);

        allBreeds.push({
          name: formattedName,
          fullName: formattedName,
          isSubBreed: false,
          ...characteristics
        });
      }
    }

    return allBreeds;
  } catch (error) {
    console.error('Error loading breeds:', error);
    // Return empty array on error - fallback to static breeds
    return [];
  }
}

// Get random selection of breeds for variety
export function getRandomBreedSelection(breeds: DynamicBreedCharacteristics[], count: number = 50): DynamicBreedCharacteristics[] {
  const shuffled = [...breeds].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Filter breeds by characteristics for better matching
export function filterBreedsByCharacteristics(
  breeds: DynamicBreedCharacteristics[],
  characteristics: {
    size?: 'small' | 'medium' | 'large';
    hairColors?: string[];
    eyeColors?: string[];
  }
): DynamicBreedCharacteristics[] {
  return breeds.filter(breed => {
    if (characteristics.size && breed.size !== characteristics.size) {
      return false;
    }

    if (characteristics.hairColors && characteristics.hairColors.length > 0) {
      const hasMatchingHair = characteristics.hairColors.some(color =>
        breed.hairColors.some(breedColor =>
          breedColor.toLowerCase().includes(color.toLowerCase()) ||
          color.toLowerCase().includes(breedColor.toLowerCase())
        )
      );
      if (!hasMatchingHair) return false;
    }

    if (characteristics.eyeColors && characteristics.eyeColors.length > 0) {
      const hasMatchingEyes = characteristics.eyeColors.some(color =>
        breed.eyeColors.some(breedColor =>
          breedColor.toLowerCase().includes(color.toLowerCase()) ||
          color.toLowerCase().includes(breedColor.toLowerCase())
        )
      );
      if (!hasMatchingEyes) return false;
    }

    return true;
  });
}