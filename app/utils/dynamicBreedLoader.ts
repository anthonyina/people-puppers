import { getAllBreeds } from './dogApi';

// Photo-analyzed breed characteristics - Generated from 207 breed analyses
// Generated on 2025-09-27T01:46:43.344Z
function getPhotoAnalyzedBreedColors(fullName: string): string[] {
  const photoAnalyzedBreeds: Record<string, string[]> = {
    'affenpinscher': ['White', 'Black', 'Dark Gray', 'Very Dark'],
    'wild african': ['Auburn', 'Brown', 'Light Gray', 'Very Light'],
    'african': ['Light Gray', 'Auburn', 'Very Dark', 'White'],
    'airedale': ['Black', 'Brown', 'White', 'Dark Gray'],
    'akita': ['White', 'Blue', 'Very Light', 'Golden'],
    'appenzeller': ['Black', 'Very Dark', 'Brown', 'Golden'],
    'kelpie australian': ['Black', 'Light Gray', 'Very Dark', 'Auburn'],
    'shepherd australian': ['Black', 'Auburn', 'Very Light', 'Brown'],
    'australian': ['Very Dark', 'Blue-Green', 'Auburn', 'Blue'],
    'indian bakharwal': ['Black', 'Very Dark', 'Blue', 'White'],
    'bakharwal': ['Black', 'Dark Gray', 'Very Dark', 'Auburn'],
    'basenji': ['Black', 'Dark Gray', 'Gray', 'Very Dark'],
    'beagle': ['Auburn', 'Very Dark', 'White', 'Very Light'],
    'bluetick': ['Brown', 'Golden', 'Auburn', 'Gray'],
    'borzoi': ['Dark Gray', 'Gray', 'Black', 'Auburn'],
    'bouvier': ['Red-Pink', 'Dark Gray', 'Very Light', 'Black'],
    'boxer': ['Dark Gray', 'Gray', 'Black', 'Blue'],
    'brabancon': ['Auburn', 'Very Light', 'Black', 'Very Dark'],
    'briard': ['Brown', 'Very Dark', 'Auburn', 'Green'],
    'norwegian buhund': ['Auburn', 'Black', 'Very Dark', 'Dark Gray'],
    'buhund': ['Dark Gray', 'Golden', 'Black', 'Auburn'],
    'boston bulldog': ['Gray', 'Auburn', 'Dark Gray', 'Light Gray'],
    'english bulldog': ['Light Gray', 'White', 'Auburn', 'Gray'],
    'french bulldog': ['Gray', 'Light Gray', 'Dark Gray', 'Black'],
    'bulldog': ['Black', 'Gray', 'Dark Gray', 'Auburn'],
    'staffordshire bullterrier': ['Light Gray', 'Very Dark', 'Black', 'Golden'],
    'bullterrier': ['White', 'Red', 'Black', 'Brown'],
    'australian cattledog': ['Golden', 'Very Dark', 'Auburn', 'Blue'],
    'cattledog': ['Auburn', 'Golden', 'Gray', 'Dark Gray'],
    'cavapoo': ['Auburn', 'Gray', 'Very Dark', 'Black'],
    'chihuahua': ['Auburn', 'Light Gray', 'Gray', 'Red'],
    'indian chippiparai': ['Gray', 'Auburn', 'Very Dark', 'Brown'],
    'chippiparai': ['Very Dark', 'Brown', 'Auburn'],
    'chow': ['Very Dark', 'Auburn', 'Black', 'Blue'],
    'clumber': ['Black', 'Auburn', 'Red', 'White'],
    'cockapoo': ['Very Dark', 'Auburn', 'Black', 'Very Light'],
    'border collie': ['Black', 'Dark Gray', 'Golden', 'Very Dark'],
    'collie': ['Dark Gray', 'Black', 'Gray', 'White'],
    'coonhound': ['Gray', 'Auburn', 'Black', 'Red'],
    'cardigan corgi': ['Auburn', 'Blue', 'Black', 'Dark Gray'],
    'corgi': ['Light Gray', 'Gray', 'Black', 'Dark Gray'],
    'cotondetulear': ['Gray', 'Dark Gray', 'Auburn', 'Light Gray'],
    'dachshund': ['Dark Gray', 'Brown', 'Auburn', 'Red'],
    'dalmatian': ['Black', 'Gray', 'Dark Gray', 'Light Gray'],
    'great dane': ['Black', 'Dark Gray', 'Gray', 'Very Light'],
    'dane': ['Light Gray', 'Gray', 'Auburn', 'Dark Gray'],
    'swedish danish': ['Very Dark', 'Golden', 'Black', 'Red'],
    'danish': ['Gray', 'Auburn', 'Black', 'Very Light'],
    'scottish deerhound': ['Light Gray', 'White', 'Very Light', 'Black'],
    'deerhound': ['White', 'Very Light', 'Black', 'Dark Gray'],
    'dhole': ['Gray', 'Auburn', 'Dark Gray', 'Brown'],
    'dingo': ['Green', 'Gray', 'Light Gray', 'Dark Gray'],
    'doberman': ['Auburn', 'Dark Gray', 'Black', 'Very Light'],
    'norwegian elkhound': ['Brown', 'Auburn', 'Dark Gray', 'Very Light'],
    'elkhound': ['Golden', 'Auburn', 'Gray', 'White'],
    'entlebucher': ['Very Light', 'Black', 'Violet', 'Very Dark'],
    'eskimo': ['Auburn', 'Black', 'Blue', 'Dark Gray'],
    'lapphund finnish': ['Golden', 'Light Gray', 'Red', 'Auburn'],
    'finnish': ['Blue', 'Auburn', 'Black', 'Very Light'],
    'bichon frise': ['White', 'Very Dark', 'Black', 'Dark Gray'],
    'frise': ['Black', 'Auburn', 'Light Gray', 'Very Light'],
    'indian gaddi': ['Brown', 'Auburn', 'Light Gray', 'Very Light'],
    'gaddi': ['Black', 'Very Dark', 'Auburn', 'Brown'],
    'shepherd german': ['Auburn', 'Very Dark', 'Golden', 'Black'],
    'german': ['Light Gray', 'Black', 'Gray', 'Dark Gray'],
    'indian greyhound': ['Auburn'],
    'italian greyhound': ['Auburn', 'Light Gray', 'Gray', 'Very Dark'],
    'greyhound': ['Auburn'],
    'groenendael': ['Very Dark', 'Golden', 'Dark Gray', 'Very Light'],
    'havanese': ['Gray', 'Dark Gray', 'Black', 'Light Gray'],
    'afghan hound': ['Very Light', 'Black', 'Very Dark', 'Auburn'],
    'basset hound': ['Auburn', 'Black', 'Very Dark', 'Gray'],
    'blood hound': ['Auburn', 'Very Dark', 'Very Light', 'Golden'],
    'english hound': ['Light Gray', 'White', 'Black', 'Very Dark'],
    'ibizan hound': ['Black', 'Gray', 'Very Dark', 'Dark Gray'],
    'plott hound': ['Light Gray', 'Dark Gray', 'Gray', 'Black'],
    'walker hound': ['Dark Gray', 'Blue', 'Light Gray', 'Black'],
    'hound': ['Light Gray', 'Golden', 'Brown', 'Gray'],
    'husky': ['Black', 'Auburn', 'Very Dark', 'Gray'],
    'keeshond': ['Black', 'Gray', 'Very Light', 'Auburn'],
    'kelpie': ['Black', 'Auburn', 'Dark Gray', 'Gray'],
    'kombai': ['Auburn', 'Very Dark'],
    'komondor': ['Golden', 'Black', 'Gray', 'Very Dark'],
    'kuvasz': ['Dark Gray', 'Auburn', 'Gray', 'Light Gray'],
    'labradoodle': ['Gray', 'Light Gray', 'Dark Gray', 'Very Dark'],
    'labrador': ['Black', 'Very Light', 'White', 'Auburn'],
    'leonberg': ['Black', 'White', 'Blue', 'Auburn'],
    'lhasa': ['Very Dark', 'Red', 'Auburn', 'Gray'],
    'malamute': ['Gray', 'Black', 'Dark Gray', 'Blue'],
    'malinois': ['Gray', 'Auburn', 'Golden', 'Brown'],
    'maltese': ['Gray', 'Light Gray', 'Black', 'Auburn'],
    'bull mastiff': ['Brown', 'Very Light', 'Auburn', 'Very Dark'],
    'english mastiff': ['Auburn', 'Very Dark', 'Light Gray', 'Red'],
    'indian mastiff': ['Light Gray', 'Very Dark', 'Auburn', 'Blue'],
    'tibetan mastiff': ['Very Light', 'Dark Gray', 'Black', 'Golden'],
    'mastiff': ['Auburn', 'Very Dark', 'Light Gray', 'Red'],
    'mexicanhairless': ['Dark Gray', 'Very Dark', 'Light Gray', 'Brown'],
    'mix': ['Gray', 'Light Gray', 'Black', 'Dark Gray'],
    'bernese mountain': ['Black', 'Gray', 'Light Gray', 'Auburn'],
    'swiss mountain': ['Dark Gray', 'Black', 'Auburn', 'Very Light'],
    'mountain': ['Black', 'White', 'Auburn', 'Dark Gray'],
    'indian mudhol': ['Dark Gray', 'Black', 'Gray', 'Brown'],
    'mudhol': ['Auburn', 'Gray', 'Very Dark'],
    'newfoundland': ['Dark Gray', 'Very Dark', 'Black', 'White'],
    'otterhound': ['Auburn', 'White', 'Very Light', 'Gray'],
    'caucasian ovcharka': ['Gray', 'Light Gray', 'Golden', 'Brown'],
    'ovcharka': ['Gray', 'Dark Gray', 'Black', 'Golden'],
    'papillon': ['Dark Gray', 'Golden', 'Brown', 'Black'],
    'indian pariah': ['Very Dark', 'Black', 'Gray', 'Very Light'],
    'pariah': ['Auburn'],
    'pekinese': ['Light Gray', 'Auburn', 'Black', 'Gray'],
    'pembroke': ['Dark Gray', 'Light Gray', 'Purple', 'Auburn'],
    'miniature pinscher': ['Golden', 'Black', 'Gray', 'Dark Gray'],
    'pinscher': ['Light Gray', 'Black', 'Brown', 'Gray'],
    'pitbull': ['Gray', 'White', 'Blue', 'Dark Gray'],
    'german pointer': ['Blue', 'Auburn', 'Light Gray', 'Very Dark'],
    'germanlonghair pointer': ['Gray', 'Auburn', 'Dark Gray', 'Very Dark'],
    'pointer': ['Very Light', 'Golden', 'Black', 'Dark Gray'],
    'pomeranian': ['Auburn', 'Red', 'Very Dark', 'Gray'],
    'medium poodle': ['Light Gray', 'Black', 'Auburn', 'Very Dark'],
    'miniature poodle': ['Very Dark', 'Auburn', 'Dark Gray', 'Black'],
    'standard poodle': ['Dark Gray', 'Very Dark', 'Gray', 'White'],
    'toy poodle': ['Golden', 'Brown', 'Red', 'Very Light'],
    'poodle': ['Auburn', 'Brown', 'Gray', 'Light Gray'],
    'pug': ['Black', 'Auburn', 'Gray', 'Dark Gray'],
    'puggle': ['Auburn', 'Very Dark', 'Red', 'Black'],
    'pyrenees': ['Black', 'Dark Gray', 'Gray', 'Very Dark'],
    'indian rajapalayam': ['Very Light', 'Black', 'Auburn', 'Dark Gray'],
    'rajapalayam': ['Light Gray', 'White', 'Auburn', 'Green'],
    'redbone': ['Very Dark', 'Auburn', 'White', 'Dark Gray'],
    'chesapeake retriever': ['Dark Gray', 'Gray', 'Black', 'Brown'],
    'curly retriever': ['Gray', 'Blue', 'Light Gray', 'Auburn'],
    'flatcoated retriever': ['Auburn', 'Black', 'Light Gray', 'Very Dark'],
    'golden retriever': ['Auburn', 'Blue', 'Gray', 'Very Light'],
    'retriever': ['Brown', 'Dark Gray', 'Golden', 'Black'],
    'rhodesian ridgeback': ['Blue', 'Auburn', 'Light Gray', 'Black'],
    'ridgeback': ['Very Dark', 'Blue', 'Auburn', 'Black'],
    'rottweiler': ['Very Dark', 'Auburn', 'Black', 'Very Light'],
    'collie rough': ['Dark Gray', 'Very Light', 'Black', 'Auburn'],
    'rough': ['White', 'Auburn', 'Very Light', 'Light Gray'],
    'saluki': ['Auburn', 'White', 'Brown', 'Very Dark'],
    'samoyed': ['Gray', 'Dark Gray', 'Golden', 'Blue'],
    'schipperke': ['Dark Gray', 'Auburn', 'Black', 'Gray'],
    'giant schnauzer': ['Gray', 'Golden', 'Very Dark', 'Auburn'],
    'miniature schnauzer': ['Brown', 'Blue', 'Purple', 'Auburn'],
    'schnauzer': ['Black', 'Yellow-Green', 'Golden', 'Dark Gray'],
    'italian segugio': ['Auburn', 'Black', 'Very Dark', 'Very Light'],
    'segugio': ['Auburn', 'Gray', 'Black', 'Light Gray'],
    'english setter': ['Auburn', 'Dark Gray', 'Gray', 'Very Dark'],
    'gordon setter': ['Dark Gray', 'White', 'Very Dark', 'Black'],
    'irish setter': ['Very Dark', 'Auburn', 'Gray', 'Red'],
    'setter': ['Auburn', 'Gray', 'Light Gray', 'Blue'],
    'sharpei': ['Light Gray', 'Gray', 'Dark Gray', 'White'],
    'english sheepdog': ['Auburn', 'Black', 'Golden', 'Dark Gray'],
    'indian sheepdog': ['Golden', 'Dark Gray', 'Very Dark', 'Auburn'],
    'shetland sheepdog': ['Golden', 'Light Gray', 'Very Dark', 'Auburn'],
    'sheepdog': ['Light Gray', 'Black', 'Dark Gray', 'Yellow-Green'],
    'shiba': ['White', 'Very Light', 'Black', 'Auburn'],
    'shihtzu': ['Light Gray', 'Gray', 'Auburn', 'Very Dark'],
    'blenheim spaniel': ['Auburn', 'Black', 'Very Dark', 'Very Light'],
    'brittany spaniel': ['Golden', 'Gray', 'Brown', 'Auburn'],
    'cocker spaniel': ['Very Light', 'Brown', 'Very Dark', 'Black'],
    'irish spaniel': ['White', 'Very Light', 'Auburn', 'Gray'],
    'japanese spaniel': ['Very Dark', 'Brown', 'Auburn', 'Black'],
    'sussex spaniel': ['Very Dark', 'Black', 'Dark Gray', 'Brown'],
    'welsh spaniel': ['Auburn', 'Black', 'Very Dark', 'Light Gray'],
    'spaniel': ['Very Dark', 'Black', 'Dark Gray', 'Auburn'],
    'indian spitz': ['Very Dark', 'Black', 'Auburn', 'Dark Gray'],
    'japanese spitz': ['Gray', 'Light Gray', 'Auburn', 'Black'],
    'spitz': ['Auburn', 'Light Gray', 'Dark Gray', 'Black'],
    'english springer': ['Very Dark', 'Auburn', 'Gray', 'Black'],
    'springer': ['Auburn', 'Very Dark', 'Black', 'Gray'],
    'stbernard': ['Dark Gray', 'Light Gray', 'Auburn', 'Very Light'],
    'american terrier': ['Dark Gray', 'Black', 'Golden', 'Gray'],
    'andalusian terrier': ['Green', 'Very Light', 'Auburn', 'Dark Gray'],
    'australian terrier': ['Auburn', 'Dark Gray', 'Very Light', 'Gray'],
    'bedlington terrier': ['Gray', 'Brown', 'Light Gray', 'Very Dark'],
    'border terrier': ['Auburn', 'Black', 'Very Dark', 'Dark Gray'],
    'boston terrier': ['Auburn', 'Brown', 'Very Dark', 'Golden'],
    'cairn terrier': ['Black', 'Dark Gray', 'Gray', 'Auburn'],
    'dandie terrier': ['Blue', 'Black', 'Very Dark', 'Very Light'],
    'fox terrier': ['Auburn', 'Light Gray', 'Golden', 'White'],
    'irish terrier': ['Brown', 'Black', 'White', 'Auburn'],
    'kerryblue terrier': ['Auburn', 'Gray', 'Dark Gray', 'Brown'],
    'lakeland terrier': ['Gray', 'Brown', 'Golden', 'Purple'],
    'norfolk terrier': ['Light Gray', 'Black', 'Brown', 'Auburn'],
    'norwich terrier': ['Dark Gray', 'Auburn', 'Black', 'Golden'],
    'patterdale terrier': ['Brown', 'Very Dark', 'Black', 'Light Gray'],
    'russell terrier': ['Auburn', 'Very Dark', 'Dark Gray', 'Black'],
    'scottish terrier': ['Black', 'Blue', 'Very Dark', 'Golden'],
    'sealyham terrier': ['White', 'Dark Gray', 'Auburn', 'Yellow-Green'],
    'silky terrier': ['Very Dark', 'Purple', 'Yellow-Green', 'Golden'],
    'tibetan terrier': ['Very Dark', 'Gray', 'Very Light', 'Black'],
    'toy terrier': ['Light Gray', 'Auburn', 'Very Light', 'Golden'],
    'welsh terrier': ['Gray', 'Golden', 'Light Gray', 'Dark Gray'],
    'westhighland terrier': ['Black', 'Gray', 'Dark Gray', 'Pink'],
    'wheaten terrier': ['Gray', 'Golden', 'Auburn', 'Black'],
    'yorkshire terrier': ['Blue', 'Auburn', 'Very Light', 'Brown'],
    'terrier': ['Auburn', 'Gray', 'Dark Gray', 'Black'],
    'tervuren': ['Light Gray', 'Gray', 'Black', 'Very Dark'],
    'vizsla': ['Very Dark', 'Dark Gray', 'Light Gray', 'Golden'],
    'spanish waterdog': ['Light Gray', 'Very Light', 'Auburn', 'Gray'],
    'waterdog': ['Auburn', 'Very Dark', 'Very Light', 'Gray'],
    'weimaraner': ['Gray', 'Light Gray', 'Auburn', 'Very Dark'],
    'whippet': ['Gray', 'Auburn', 'Light Gray', 'Dark Gray'],
    'irish wolfhound': ['Blue', 'Gray', 'Dark Gray', 'Auburn'],
    'wolfhound': ['Auburn', 'Golden', 'Brown', 'Gray'],
  };

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
}

// Get breed-specific hair colors using photo analysis first, then fallbacks
function getBreedSpecificHairColors(fullName: string): string[] {
  // Use photo-analyzed data first - this is now data-driven!
  return getPhotoAnalyzedBreedColors(fullName);
}

// Get breed-specific eye colors
function getBreedSpecificEyeColors(fullName: string): string[] {
  // Breeds known for blue eyes
  if (fullName.includes('husky') || fullName.includes('australian') ||
      fullName.includes('collie') || fullName.includes('merle')) {
    return ['Blue', 'Brown', 'Hazel'];
  }

  // Breeds with varied eye colors
  if (fullName.includes('spaniel') || fullName.includes('setter')) {
    return ['Brown', 'Hazel', 'Dark Brown'];
  }

  // Working breeds - typically dark eyes
  if (fullName.includes('shepherd') || fullName.includes('rottweiler') ||
      fullName.includes('doberman')) {
    return ['Dark Brown', 'Brown'];
  }

  // Exotic/wild breeds - reduce their matching potential
  if (fullName.includes('african') || fullName.includes('wild') ||
      fullName.includes('dingo') || fullName.includes('basenji')) {
    return ['Dark Brown']; // Very specific, less likely to match
  }

  // Default - moderate variety
  return ['Brown', 'Dark Brown', 'Hazel'];
}

// Get breed popularity weight (higher = more likely to be selected)
function getBreedPopularityWeight(fullName: string): number {
  // Very popular family breeds - boost their chances
  const popularBreeds = [
    'golden retriever', 'labrador', 'german shepherd', 'french bulldog',
    'bulldog', 'poodle', 'beagle', 'rottweiler', 'yorkshire', 'dachshund'
  ];

  // Moderately popular breeds
  const moderateBreeds = [
    'boxer', 'husky', 'border collie', 'pointer', 'spaniel', 'setter',
    'schnauzer', 'maltese', 'chihuahua', 'pomeranian'
  ];

  // Exotic/wild breeds - reduce their selection chance
  const exoticBreeds = [
    'african', 'wild', 'dingo', 'basenji', 'xolo', 'telomian',
    'lundehund', 'azawakh', 'mudi', 'lagotto'
  ];

  if (popularBreeds.some(breed => fullName.includes(breed))) return 1.5;
  if (moderateBreeds.some(breed => fullName.includes(breed))) return 1.0;
  if (exoticBreeds.some(breed => fullName.includes(breed))) return 0.3;

  return 0.8; // Default weight for other breeds
}

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
  popularityWeight: number;
}

// Enhanced breed classification based on breed names and known characteristics
function classifyBreedCharacteristics(breedName: string, parentBreed?: string): Omit<DynamicBreedCharacteristics, 'name' | 'fullName' | 'isSubBreed' | 'parentBreed' | 'popularityWeight'> {
  const name = breedName.toLowerCase();
  const fullName = parentBreed ? `${parentBreed} ${breedName}`.toLowerCase() : name;

  // Size classification
  let size: 'small' | 'medium' | 'large' = 'medium';

  const smallBreeds = ['chihuahua', 'pug', 'pomeranian', 'maltese', 'yorkie', 'yorkshire', 'terrier', 'toy', 'miniature', 'shihtzu', 'papillon', 'pekinese'];
  const largeBreeds = ['shepherd', 'retriever', 'mastiff', 'dane', 'husky', 'malamute', 'rottweiler', 'doberman', 'newfoundland', 'pyrenees', 'wolfhound', 'ridgeback', 'mountain'];

  if (smallBreeds.some(s => fullName.includes(s))) size = 'small';
  else if (largeBreeds.some(s => fullName.includes(s))) size = 'large';

  // Hair/coat color classification with more variety
  let hairColors: string[] = getBreedSpecificHairColors(fullName);
  let coatPattern: string[] = ['solid'];

  // Color name overrides
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

  // Eye color classification - more variety
  let eyeColors: string[] = getBreedSpecificEyeColors(fullName);

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
        const popularityWeight = getBreedPopularityWeight(formattedName.toLowerCase());

        allBreeds.push({
          name: formattedName,
          fullName: formattedName,
          isSubBreed: false,
          popularityWeight,
          ...characteristics
        });
      } else {
        // Breed with sub-breeds
        for (const subBreed of subBreeds) {
          const characteristics = classifyBreedCharacteristics(subBreed, breed);
          const formattedName = formatBreedName(breed, subBreed);
          const popularityWeight = getBreedPopularityWeight(formattedName.toLowerCase());

          allBreeds.push({
            name: formattedName,
            fullName: formattedName,
            isSubBreed: true,
            parentBreed: breed,
            popularityWeight,
            ...characteristics
          });
        }

        // Also add the main breed
        const characteristics = classifyBreedCharacteristics(breed);
        const formattedName = formatBreedName(breed);
        const popularityWeight = getBreedPopularityWeight(formattedName.toLowerCase());

        allBreeds.push({
          name: formattedName,
          fullName: formattedName,
          isSubBreed: false,
          popularityWeight,
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