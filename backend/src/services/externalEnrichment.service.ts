import axios from 'axios';
import { ComprehensiveCropData, LifecycleStage, PestOrDisease, NutrientSchedule } from '../data/cropEncyclopediaData.js';

interface WikiSummary {
  title: string;
  extract: string;
  description?: string;
  thumbnailUrl?: string;
  wikiUrl?: string;
}

export interface GovAdvisoryLink {
  title: string;
  organization: string;
  url: string;
  badge: string;
  category: string;
}

// Multilingual common agricultural crop name dictionary for Indian subcontinent (Kannada & Hindi)
const REGIONAL_NAME_DICTIONARY: Record<string, { kannada: string; hindi: string; category?: string }> = {
  banana: { kannada: 'ಬಾಳೆಹಣ್ಣು (Baalehannu)', hindi: 'केला (Kela)', category: 'Fruits' },
  groundnut: { kannada: 'ಕಡಲೆಕಾಯಿ (Kadalekaayi) / ಶೇಂಗಾ', hindi: 'मूंगफली (Moongphali)', category: 'Oilseeds' },
  peanut: { kannada: 'ಕಡಲೆಕಾಯಿ (Kadalekaayi)', hindi: 'मूंगफली (Moongphali)', category: 'Oilseeds' },
  chickpea: { kannada: 'ಕಡಲೆ (Kadale)', hindi: 'चना (Chana)', category: 'Pulses' },
  'bengal gram': { kannada: 'ಕಡಲೆ (Kadale)', hindi: 'चना (Chana)', category: 'Pulses' },
  'green gram': { kannada: 'ಹೆಸರು ಕಾಳು (Hesaru Kaalu)', hindi: 'मूंग (Moong)', category: 'Pulses' },
  moong: { kannada: 'ಹೆಸರು ಕಾಳು (Hesaru Kaalu)', hindi: 'मूング (Moong)', category: 'Pulses' },
  'black gram': { kannada: 'ಉದ್ದಿನ ಕಾಳು (Uddina Kaalu)', hindi: 'उड़द (Urad)', category: 'Pulses' },
  urad: { kannada: 'ಉದ್ದಿನ ಕಾಳು (Uddina Kaalu)', hindi: 'उड़द (Urad)', category: 'Pulses' },
  soybean: { kannada: 'ಸೋಯಾಬೀನ್ (Soyabean)', hindi: 'सोयाबीन (Soyabean)', category: 'Oilseeds' },
  mustard: { kannada: 'ಸಾಸಿವೆ (Saasive)', hindi: 'सरसों (Sarson)', category: 'Oilseeds' },
  sunflower: { kannada: 'ಸೂರ್ಯಕಾಂತಿ (Sooryakaanthi)', hindi: 'सूरजमुखी (Surajmukhi)', category: 'Oilseeds' },
  coconut: { kannada: 'ತೆಂಗಿನಕಾಯಿ (Tengina Kaayi)', hindi: 'नारियल (Nariyal)', category: 'Plantation' },
  arecanut: { kannada: 'ಅಡಿಕೆ (Adike)', hindi: 'सुपारी (Supari)', category: 'Plantation' },
  ginger: { kannada: 'ಶುಂಠಿ (Shunti)', hindi: 'अदरक (Adrak)', category: 'Spices' },
  garlic: { kannada: 'ಬೆಳ್ಳುಳ್ಳಿ (Bellulli)', hindi: 'लहसुन (Lahsun)', category: 'Spices' },
  'black pepper': { kannada: 'ಕಾಳು ಮೆಣಸು (Kaalu Menasu)', hindi: 'काली मिर्च (Kali Mirch)', category: 'Spices' },
  pepper: { kannada: 'ಕಾಳು ಮೆಣಸು (Kaalu Menasu)', hindi: 'काली मिर्च (Kali Mirch)', category: 'Spices' },
  cardamom: { kannada: 'ಏಲಕ್ಕಿ (Elakki)', hindi: 'इलायची (Elaichi)', category: 'Spices' },
  pomegranate: { kannada: 'ದಾಳಿಂಬೆ (Daalimbe)', hindi: 'अनार (Anaar)', category: 'Fruits' },
  papaya: { kannada: 'ಪರಂಗಿ ಹಣ್ಣು (Parangi Hannu) / ಪಪ್ಪಾಯಿ', hindi: 'पपीता (Papita)', category: 'Fruits' },
  guava: { kannada: 'ಸೀಬೆಹಣ್ಣು (Seebehannu) / ಪೇರಲ', hindi: 'अमरूद (Amrood)', category: 'Fruits' },
  grapes: { kannada: 'ದ್ರಾಕ್ಷಿ (Draakshi)', hindi: 'अंगूर (Angoor)', category: 'Fruits' },
  watermelon: { kannada: 'ಕಲ್ಲಂಗಡಿ (Kallangadi)', hindi: 'तरबूज (Tarbooj)', category: 'Fruits' },
  brinjal: { kannada: 'ಬದನೆಕಾಯಿ (Badanekaayi)', hindi: 'बैंगन (Baingan)', category: 'Vegetables' },
  eggplant: { kannada: 'ಬದನೆಕಾಯಿ (Badanekaayi)', hindi: 'बैंगन (Baingan)', category: 'Vegetables' },
  cabbage: { kannada: 'ಎಲೆಕೋಸು (Elekosu)', hindi: 'पत्ता गोभी (Patta Gobhi)', category: 'Vegetables' },
  cauliflower: { kannada: 'ಹೂಕೋಸು (Hookosu)', hindi: 'फूलगोभी (Phool Gobhi)', category: 'Vegetables' },
  carrot: { kannada: 'ಕ್ಯಾರೆಟ್ (Carrot)', hindi: 'गाजर (Gajar)', category: 'Vegetables' },
  okra: { kannada: 'ಬೆಂಡೆಕಾಯಿ (Bendekaayi)', hindi: 'भिंडी (Bhindi)', category: 'Vegetables' },
  'lady finger': { kannada: 'ಬೆಂಡೆಕಾಯಿ (Bendekaayi)', hindi: 'भिंडी (Bhindi)', category: 'Vegetables' },
  cucumber: { kannada: 'ಸೌತೆಕಾಯಿ (Sautekaayi)', hindi: 'खीरा (Kheera)', category: 'Vegetables' },
  tea: { kannada: 'ಚಹಾ (Chaha)', hindi: 'चाय (Chai)', category: 'Plantation' },
  rubber: { kannada: 'ರಬ್ಬರ್ (Rubber)', hindi: 'प्राकृतिक रबर (Rubber)', category: 'Commercial' },
  tobacco: { kannada: 'ತಂಬಾಕು (Tambaaku)', hindi: 'तंबाकू (Tambaku)', category: 'Commercial' },
  cashew: { kannada: 'ಗೋಡಂಬಿ (Godambi)', hindi: 'काजू (Kaju)', category: 'Plantation' },
  sorghum: { kannada: 'ಜೋಳ (Jola)', hindi: 'ज्वार (Jowar)', category: 'Cereals' },
  jowar: { kannada: 'ಜೋಳ (Jola)', hindi: 'ज्वार (Jowar)', category: 'Cereals' },
  barley: { kannada: 'ಬಾರ್ಲಿ (Barley)', hindi: 'जौ (Jau)', category: 'Cereals' },
  moringa: { kannada: 'ನುಗ್ಗೆಕಾಯಿ (Nuggekaayi)', hindi: 'सहजन (Sahjan)', category: 'Vegetables' },
  drumstick: { kannada: 'ನುಗ್ಗೆಕಾಯಿ (Nuggekaayi)', hindi: 'सहजन (Sahjan)', category: 'Vegetables' },
  sesame: { kannada: 'ಎಳ್ಳು (Ellu)', hindi: 'तिल (Til)', category: 'Oilseeds' },
  vanilla: { kannada: 'ವೆನಿಲ್ಲಾ (Vanilla)', hindi: 'वैनिला (Vanilla)', category: 'Spices' },
  avocado: { kannada: 'ಬೆಣ್ಣೆ ಹಣ್ಣು (Benne Hannu)', hindi: 'एवोकैडो (Avocado)', category: 'Fruits' },
  coriander: { kannada: 'ಕೊತ್ತಂಬರಿ (Kothambari)', hindi: 'धनिया (Dhania)', category: 'Spices' },
  fenugreek: { kannada: 'ಮೆಂತ್ಯ (Menthya)', hindi: 'मेथी (Methi)', category: 'Spices' },
  jackfruit: { kannada: 'ಹಲಸಿನ ಹಣ್ಣು (Halasina Hannu)', hindi: 'कटहल (Kathal)', category: 'Fruits' },
  spinach: { kannada: 'ಪಾಲಕ್ ಸೊಪ್ಪು (Palak Soppu)', hindi: 'पालक (Palak)', category: 'Vegetables' },
  beetroot: { kannada: 'ಬೀಟ್ರೂಟ್ (Beetroot)', hindi: 'चुकंदर (Chukandar)', category: 'Vegetables' },
  'dragon fruit': { kannada: 'ಡ್ರ್ಯಾಗನ್ ಹಣ್ಣು (Dragon Hannu)', hindi: 'ड्रैगन फ्रूट (Dragon Fruit)', category: 'Fruits' },
};

class ExternalEnrichmentService {
  private wikiCache = new Map<string, { data: WikiSummary; timestamp: number }>();
  private readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
  private synthesizedCropCache = new Map<string, ComprehensiveCropData>();

  /**
   * Safe Wikipedia Botanical Summary fetcher with 2.5s timeout and memory cache
   */
  async getWikiSummary(scientificOrCommonName: string): Promise<WikiSummary | null> {
    if (!scientificOrCommonName) return null;
    const cleanQuery = scientificOrCommonName.trim().replace(/\s+/g, '_');
    const cacheKey = cleanQuery.toLowerCase();

    const cached = this.wikiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    // Try primary clean query first, with botanical fallbacks if needed
    const candidateQueries = [cleanQuery, `${cleanQuery}_(plant)`, `${cleanQuery}_(fruit)`, `${cleanQuery}_(crop)`];

    for (const query of candidateQueries) {
      try {
        const resp = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`, {
          timeout: 2500,
          headers: {
            'User-Agent': 'AgriMarket-Agronomy/2.0 (education-agriculture@agrimarket.com)',
          },
        });

        if (resp.data && resp.data.extract && !resp.data.extract.includes('may refer to:')) {
          const summary: WikiSummary = {
            title: resp.data.title,
            extract: resp.data.extract,
            description: resp.data.description,
            thumbnailUrl: resp.data.thumbnail?.source || resp.data.originalimage?.source,
            wikiUrl: resp.data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
          };
          this.wikiCache.set(cacheKey, { data: summary, timestamp: Date.now() });
          return summary;
        }
      } catch {
        // Fallback to next candidate query
      }
    }

    return null;
  }

  /**
   * Generate verified Government & Research Institution links for a given crop
   */
  getGovAdvisories(cropName: string, category: string): GovAdvisoryLink[] {
    const lowerName = cropName.toLowerCase();
    const encodedCrop = encodeURIComponent(cropName.split('(')[0].trim());

    const links: GovAdvisoryLink[] = [
      {
        title: 'Vikaspedia Package of Practices (PoP)',
        organization: 'Ministry of Electronics & IT + Ministry of Agriculture (GoI)',
        url: `https://vikaspedia.in/agriculture/crop-production/package-of-practices`,
        badge: 'Official GoI Guide',
        category: 'Cultivation Practice',
      },
      {
        title: 'Kisan Suvidha Farmer Advisory Portal',
        organization: 'Department of Agriculture & Farmers Welfare',
        url: `https://kisansuvidha.gov.in/`,
        badge: 'Govt. of India',
        category: 'Advisory & Weather',
      },
      {
        title: 'UAS Bengaluru & Dharwad Agricultural Extension',
        organization: 'University of Agricultural Sciences, Karnataka',
        url: `https://uasbangalore.edu.in/`,
        badge: 'State University Research',
        category: 'Extension Education',
      },
      {
        title: 'ICAR National Agricultural Research Portal',
        organization: 'Indian Council of Agricultural Research, New Delhi',
        url: `https://icar.org.in/`,
        badge: 'Apex Research Directorate',
        category: 'Scientific Standards',
      },
    ];

    // Specialized Apex Research Institutes
    if (lowerName.includes('rice') || lowerName.includes('paddy')) {
      links.unshift({
        title: 'ICAR - National Rice Research Institute (NRRI) & IIRR',
        organization: 'ICAR, Ministry of Agriculture',
        url: 'https://www.icar-iirr.org/',
        badge: 'Apex Rice Institute',
        category: 'Varietal & Pest Research',
      });
    } else if (
      lowerName.includes('tomato') ||
      lowerName.includes('chilli') ||
      lowerName.includes('mango') ||
      lowerName.includes('onion') ||
      lowerName.includes('brinjal') ||
      lowerName.includes('pomegranate') ||
      lowerName.includes('papaya') ||
      lowerName.includes('guava') ||
      lowerName.includes('banana')
    ) {
      links.unshift({
        title: 'ICAR - Indian Institute of Horticultural Research (IIHR, Bengaluru)',
        organization: 'ICAR, Hessarghatta, Bengaluru',
        url: 'https://www.iihr.res.in/',
        badge: 'Karnataka Apex Horticulture',
        category: 'Breeding & IPM',
      });
    } else if (lowerName.includes('ragi') || lowerName.includes('millet') || lowerName.includes('jowar') || lowerName.includes('sorghum')) {
      links.unshift({
        title: 'ICAR - Indian Institute of Millets Research (IIMR)',
        organization: 'ICAR, Hyderabad (International Year of Millets Hub)',
        url: 'https://millets.res.in/',
        badge: 'Nutri-Cereal Apex',
        category: 'Millet Agronomy',
      });
    } else if (lowerName.includes('cotton')) {
      links.unshift({
        title: 'ICAR - Central Institute for Cotton Research (CICR)',
        organization: 'ICAR, Nagpur & Regional Stations',
        url: 'https://cicr.icar.gov.in/',
        badge: 'Fiber Research Apex',
        category: 'Bollworm & Variety Management',
      });
    } else if (lowerName.includes('gram') || lowerName.includes('pigeon') || lowerName.includes('pulse') || lowerName.includes('moong') || lowerName.includes('urad') || lowerName.includes('chickpea')) {
      links.unshift({
        title: 'ICAR - Indian Institute of Pulses Research (IIPR)',
        organization: 'ICAR, Kanpur',
        url: 'https://iipr.icar.gov.in/',
        badge: 'Pulses Apex',
        category: 'Wilt & Pulse Production',
      });
    } else if (lowerName.includes('groundnut') || lowerName.includes('peanut')) {
      links.unshift({
        title: 'ICAR - Directorate of Groundnut Research (DGR)',
        organization: 'ICAR, Junagadh',
        url: 'https://dgr.icar.gov.in/',
        badge: 'Groundnut Apex',
        category: 'Oilseed Agronomy',
      });
    } else if (lowerName.includes('soybean')) {
      links.unshift({
        title: 'ICAR - Indian Institute of Soybean Research (IISR)',
        organization: 'ICAR, Indore',
        url: 'https://iisrindore.icar.gov.in/',
        badge: 'Soybean Apex',
        category: 'Soybean IPM & Breeding',
      });
    } else if (lowerName.includes('mustard') || lowerName.includes('rapeseed')) {
      links.unshift({
        title: 'ICAR - Directorate of Rapeseed-Mustard Research (DRMR)',
        organization: 'ICAR, Bharatpur',
        url: 'https://www.drmr.res.in/',
        badge: 'Mustard Apex',
        category: 'Rabi Oilseed Research',
      });
    } else if (lowerName.includes('potato')) {
      links.unshift({
        title: 'ICAR - Central Potato Research Institute (CPRI)',
        organization: 'ICAR, Shimla & Bengaluru Regional Station',
        url: 'https://cpri.icar.gov.in/',
        badge: 'Tuber Research Apex',
        category: 'Late Blight Management',
      });
    } else if (lowerName.includes('coffee')) {
      links.unshift({
        title: 'Central Coffee Research Institute (CCRI, Balehonnur)',
        organization: 'Coffee Board of India, Ministry of Commerce',
        url: 'https://www.indiacoffee.org/',
        badge: 'Coffee Board of India',
        category: 'Plantation Management',
      });
    } else if (lowerName.includes('tea')) {
      links.unshift({
        title: 'Tea Board of India & UPASI Tea Research Institute',
        organization: 'Ministry of Commerce and Industry',
        url: 'https://www.teaboard.gov.in/',
        badge: 'Tea Board of India',
        category: 'Plantation Standards',
      });
    } else if (lowerName.includes('rubber')) {
      links.unshift({
        title: 'Rubber Research Institute of India (RRII)',
        organization: 'Rubber Board, Ministry of Commerce',
        url: 'https://www.rubberboard.org.in/',
        badge: 'Rubber Board of India',
        category: 'Latex & Tapping Agronomy',
      });
    } else if (lowerName.includes('coconut') || lowerName.includes('arecanut')) {
      links.unshift({
        title: 'ICAR - Central Plantation Crops Research Institute (CPCRI, Kasaragod & Vittal)',
        organization: 'ICAR, Kasaragod & Karnataka regional stations',
        url: 'https://cpcri.icar.gov.in/',
        badge: 'Plantation Apex',
        category: 'Palm Health & Koleroga IPM',
      });
    } else if (lowerName.includes('turmeric') || lowerName.includes('ginger') || lowerName.includes('pepper') || lowerName.includes('cardamom') || lowerName.includes('spice') || lowerName.includes('garlic')) {
      links.unshift({
        title: 'ICAR - Indian Institute of Spices Research (IISR) & Spices Board India',
        organization: 'ICAR, Kozhikode & Appangala Karnataka Center',
        url: 'https://spices.res.in/',
        badge: 'Spices Apex',
        category: 'Rhizome Quality & Diseases',
      });
    } else if (lowerName.includes('sugarcane')) {
      links.unshift({
        title: 'ICAR - Sugarcane Breeding Institute (SBI) & IISR Lucknow',
        organization: 'ICAR, Coimbatore',
        url: 'https://sugarcane.icar.gov.in/',
        badge: 'Sugar Crops Apex',
        category: 'Ratoon & Cane Management',
      });
    }

    return links;
  }

  /**
   * Dynamic on-demand botanical synthesis engine:
   * When a farmer searches for ANY crop not yet in the curated catalog,
   * queries Wikipedia REST API, infers taxonomy, and synthesizes a full agronomic profile.
   */
  async discoverAndSynthesizeCrop(rawQuery: string): Promise<ComprehensiveCropData | null> {
    if (!rawQuery || rawQuery.trim().length < 2) return null;
    const clean = rawQuery.trim().toLowerCase();
    const slug = clean.replace(/[^a-z0-9]/g, '-');

    if (this.synthesizedCropCache.has(slug)) {
      return this.synthesizedCropCache.get(slug)!;
    }

    // Step 1: Query botanical knowledge from Wikipedia
    const wiki = await this.getWikiSummary(rawQuery);
    if (!wiki || !wiki.extract) {
      return null;
    }

    // Step 2: Infer Category & Family
    const text = `${wiki.title} ${wiki.description || ''} ${wiki.extract}`.toLowerCase();
    let category = 'Agricultural Produce';
    let family = 'Plantae';

    if (text.includes('fruit') || text.includes('berry') || text.includes('citrus') || text.includes('orchard')) {
      category = 'Fruits';
    } else if (text.includes('vegetable') || text.includes('tuber') || text.includes('root') || text.includes('leafy') || text.includes('allium')) {
      category = 'Vegetables';
    } else if (text.includes('pulse') || text.includes('legume') || text.includes('fabaceae') || text.includes('bean') || text.includes('pea') || text.includes('lentil') || text.includes('gram')) {
      category = 'Pulses';
    } else if (text.includes('cereal') || text.includes('poaceae') || text.includes('grain') || text.includes('grass') || text.includes('millet') || text.includes('wheat') || text.includes('maize')) {
      category = 'Cereals';
    } else if (text.includes('spice') || text.includes('herb') || text.includes('aromatic') || text.includes('condiment') || text.includes('zingiberaceae')) {
      category = 'Spices';
    } else if (text.includes('oilseed') || text.includes('sunflower') || text.includes('mustard') || text.includes('sesame') || text.includes('peanut')) {
      category = 'Oilseeds';
    } else if (text.includes('plantation') || text.includes('palm') || text.includes('beverage') || text.includes('tree') || text.includes('timber') || text.includes('rubber')) {
      category = 'Plantation';
    }

    // Attempt to extract family name ending in -aceae or -ae
    const familyMatch = wiki.extract.match(/\b([A-Z][a-z]+aceae)\b/);
    if (familyMatch) {
      family = familyMatch[1];
    } else if (category === 'Cereals') {
      family = 'Poaceae';
    } else if (category === 'Pulses') {
      family = 'Fabaceae';
    } else if (category === 'Vegetables') {
      family = 'Solanaceae / Brassicaceae';
    }

    // Infer scientific binomial nomenclature (e.g., Musa acuminata)
    let scientificName = '';
    const latinMatch = wiki.extract.match(/\(([A-Z][a-z]+ [a-z]+)\)/) || wiki.extract.match(/scientifically (?:known as )?([A-Z][a-z]+ [a-z]+)/i);
    if (latinMatch) {
      scientificName = latinMatch[1];
    } else if (wiki.description && /^[A-Z][a-z]+ [a-z]+/.test(wiki.description)) {
      scientificName = wiki.description.split(',')[0].trim();
    } else {
      scientificName = `${wiki.title} sp.`;
    }

    // Step 3: Lookup regional Kannada and Hindi names
    const dictMatch = REGIONAL_NAME_DICTIONARY[clean] || Object.entries(REGIONAL_NAME_DICTIONARY).find(([k]) => clean.includes(k) || k.includes(clean))?.[1];

    const localNames = {
      kannada: dictMatch?.kannada || `${wiki.title} (ಕೃಷಿ ತಳಿ)`,
      hindi: dictMatch?.hindi || `${wiki.title} (कृषि फसल)`,
      english: wiki.title,
    };

    if (dictMatch?.category) {
      category = dictMatch.category;
    }

    // Step 4: Synthesize standard phenological lifecycles & Agronomic parameters
    const lifecycleStages: LifecycleStage[] = [
      {
        stageName: '1. Seed Sowing & Establishment',
        durationDays: 'Days 1 - 25',
        description: `Soil bed preparation with deep tilth, seed dressing with bio-agents (Trichoderma / Pseudomonas), and initial germination under moist soil conditions.`,
        waterNeed: 'Moist seedbed; avoid water stagnation.',
        careTips: 'Conduct germination viability test; maintain optimal seedling spacing.',
      },
      {
        stageName: '2. Active Vegetative Growth',
        durationDays: 'Days 25 - 65',
        description: `Rapid canopy expansion, active root proliferation, and photosynthetic biomass accumulation.`,
        waterNeed: 'Regular irrigation at 7–10 day intervals matching evaporative demand.',
        careTips: 'Perform mechanical intercultural weeding; apply balanced basal and vegetative nitrogen top-dressing.',
      },
      {
        stageName: '3. Flowering & Fruit / Grain Formation',
        durationDays: 'Days 65 - 100',
        description: `Critical reproductive transition stage where moisture or thermal stress causes severe flower drop or poor seed fill.`,
        waterNeed: 'Critical peak water demand; never allow moisture deficit.',
        careTips: 'Foliar micronutrient spray (Zinc + Boron); install yellow sticky traps for insect monitoring.',
      },
      {
        stageName: '4. Maturation, Ripening & Harvest',
        durationDays: 'Days 100 - 135',
        description: `Translocation of photoassimilates to economic yield organs (fruits, seeds, rhizomes, or tubers) and progressive foliage drying.`,
        waterNeed: 'Withhold irrigation 10–14 days prior to harvest to enhance storage quality.',
        careTips: 'Harvest during dry clear morning weather at optimal moisture threshold.',
      },
    ];

    // Step 5: Synthesize tailored Plant Pathology & Integrated Pest Management (IPM) based on botanical family & crop type
    const pestAndDiseases = this.synthesizeTailoredPests(wiki.title, family, category, text);


    // Step 6: Tailored Fertilizer NPK formulation
    let nutrientSchedule: NutrientSchedule;
    if (category === 'Pulses') {
      nutrientSchedule = {
        npkRatio: '25:50:25 kg/ha N:P2O5:K2O (Rhizobium bio-inoculated)',
        basalDose: 'Apply full dose of Phosphorus (Single Super Phosphate) and Potassium with 5 tonnes FYM at land prep.',
        vegetativeStage: 'Light starter nitrogen application (12.5 kg N/ha) at 20 DAS.',
        floweringStage: 'Foliar spray of 2% DAP or 1% 19:19:19 water-soluble fertilizer at pre-flowering.',
        micronutrients: 'Soil application of Zinc Sulphate @ 15 kg/ha once in two seasons.',
      };
    } else if (category === 'Fruits' || category === 'Plantation') {
      nutrientSchedule = {
        npkRatio: '500:250:500 g N:P2O5:K2O per tree/palm per year',
        basalDose: 'Apply 25 kg well-rotted FYM/compost + 100% P + 50% K in circular trench around drip canopy.',
        vegetativeStage: 'Apply 50% Nitrogen during post-monsoon vegetative flush.',
        floweringStage: 'Apply remaining 50% K + 50% N during fruit set and aril swelling.',
        micronutrients: 'Foliar spray of 0.2% Borax + 0.5% Zinc Sulphate prior to blossom opening.',
      };
    } else if (category === 'Vegetables') {
      nutrientSchedule = {
        npkRatio: '120:60:60 kg/ha N:P2O5:K2O',
        basalDose: 'Apply 50% N + 100% P + 50% K mixed with 10 tonnes well-decomposed FYM at final bed shaping.',
        vegetativeStage: 'Top dress 25% Nitrogen at 30 days after transplanting followed by earthing up.',
        floweringStage: 'Top dress remaining 25% Nitrogen + 50% Potassium during fruit set.',
        micronutrients: 'Foliar spray of multi-micronutrient mixture (Grade IV) @ 2.5 ml/L.',
      };
    } else {
      nutrientSchedule = {
        npkRatio: '100:50:50 kg/ha N:P2O5:K2O',
        basalDose: 'Apply 50% N + 100% P + 50% K with farmyard manure prior to sowing.',
        vegetativeStage: 'Top dress 25% Nitrogen at active tillering / branching stage.',
        floweringStage: 'Top dress remaining 25% Nitrogen at panicle/inflorescence emergence.',
        micronutrients: 'Zinc Sulphate @ 20 kg/ha applied to soil before sowing.',
      };
    }

    // Step 7: Construct complete ComprehensiveCropData
    const synthesized: ComprehensiveCropData = {
      id: `crop-discovered-${slug}`,
      cropName: `${wiki.title}`,
      scientificName,
      family,
      category,
      description: wiki.extract.length > 300 ? wiki.extract.slice(0, 300) + '...' : wiki.extract,
      imageUrl: wiki.thumbnailUrl || 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=800&q=80',
      localNames,
      botanicalInfo: {
        family,
        genus: scientificName.split(' ')[0] || wiki.title,
        origin: 'Subtropical and Tropical Agro-climatic regions',
        plantType: `${category} Crop (${family})`,
      },
      optimalTemperatureMin: 18,
      optimalTemperatureMax: 35,
      rainfallMin: 600,
      rainfallMax: 1400,
      soilType: 'Well-drained fertile loam / alluvial soil with high organic matter',
      soilPh: '6.0 - 7.5',
      waterRequirement: 'Moderate (Avoid waterlogging; maintain field capacity)',
      growthDurationDays: 120,
      lifeCycle: 'ANNUAL',
      sowingSeason: 'Kharif (June–July) / Rabi (Oct–Nov)',
      harvestSeason: 'Post-monsoon / Spring',
      mandiCommodity: wiki.title,
      growthStages: 'Germination → Vegetative Canopy → Flowering/Fruiting → Maturity',
      lifecycleStages,
      pestAndDiseases,
      nutrientSchedule,
      climateAndSoil: {
        idealPh: '6.0 - 7.5',
        soilTypes: ['Well-drained Fertile Loam', 'Sandy Clay Loam', 'River Alluvium'],
        optimalTemp: '20°C - 32°C (Sensitive to extreme frost and water-stress)',
        annualRainfall: '600 - 1500 mm',
        sunRequirement: 'Full Sun (6–8 hours daily photosynthetically active radiation)',
      },
      harvestingAndPostHarvest: {
        maturityIndicators: 'Foliage turns pale yellow/golden; fruits or pods reach varietal size and physiological dry-down.',
        harvestingMethod: 'Manual hand picking or sickle cutting during clear morning dry hours.',
        postHarvestManagement: 'Shade curing, grading into uniform sizes, and moisture reduction below 12% for safe storage.',
        yieldPerAcre: '15 - 30 Quintals / acre (Varies by cultivation practices and hybrid variety).',
        storageConditions: 'Cool, well-aerated, moisture-proof and rodent-free storage.',
      },
      uses: [
        'High-value agricultural food commodity and dietary consumption',
        'Direct trading in APMC Mandis and spot marketplaces',
        'Processing into value-added agricultural products and culinary derivatives',
      ],
      commonDiseases: pestAndDiseases.map((d) => d.name),
    };

    this.synthesizedCropCache.set(slug, synthesized);
    return synthesized;
  }

  /**
   * Botanical Plant Pathology & Integrated Pest Management (IPM) Synthesis Engine:
   * Generates tailored diseases, symptoms, organic remedies, and chemical dosages based on
   * botanical family, crop name, and taxonomic classification.
   */
  private synthesizeTailoredPests(cropName: string, family: string, category: string, extractText: string): PestOrDisease[] {
    const lowerName = cropName.toLowerCase();
    const lowerFam = family.toLowerCase();
    const text = extractText.toLowerCase();

    // 1. Cactaceae / Exotic Cacti (Dragon Fruit / Pitaya)
    if (lowerFam.includes('cact') || lowerName.includes('dragon fruit') || lowerName.includes('pitaya') || text.includes('hylocereus')) {
      return [
        {
          name: 'Stem Canker (Neoscytalidium dimidiatum)',
          type: 'FUNGAL',
          symptoms: 'Small chlorotic circular spots on cladodes that turn into brown-orange sunken lesions and eruptive crusts.',
          prevention: 'Prune infected cladodes during dry sunny periods; disinfect pruning shears with 70% alcohol.',
          organicControl: 'Foliar spray of Copper Hydroxide (2 g/L) or Bacillus subtilis bio-fungicide @ 5 g/L.',
          chemicalControl: 'Spray Azoxystrobin + Difenoconazole (Amistar Top) @ 1 ml/L or Mancozeb 75% WP @ 2.5 g/L.',
          severity: 'HIGH',
        },
        {
          name: 'Anthracnose (Colletotrichum gloeosporioides)',
          type: 'FUNGAL',
          symptoms: 'Concentric reddish-brown lesions with yellow margins along cladode ribs and fruit skin, causing blossom-end rot.',
          prevention: 'Ensure trellis allows adequate aeration and sunlight; avoid dense tangled canopy.',
          organicControl: 'Spray cold-pressed Neem oil (10,000 ppm @ 3 ml/L) mixed with Trichoderma viride.',
          chemicalControl: 'Foliar spray of Carbendazim 50% WP @ 1.5 g/L or Tebuconazole @ 1 ml/L at floral bud set.',
          severity: 'HIGH',
        },
        {
          name: 'Cactus Mealybug & Soft Scale (Ferrisia virgata)',
          type: 'PEST',
          symptoms: 'Cottony white waxy clusters in spine areoles and floral bracts, sucking sap and causing sooty mold blackening.',
          prevention: 'Maintain clean orchard floor; eradicate ant colonies which protect mealybugs.',
          organicControl: 'Foliar application of entomopathogenic fungus Beauveria bassiana @ 5 g/L or fish oil rosin soap (25 ml/L).',
          chemicalControl: 'Spray Spirotetramat 15.31% OD @ 1 ml/L or Imidacloprid 17.8% SL @ 0.5 ml/L.',
          severity: 'MEDIUM',
        },
        {
          name: 'Soft Bacterial Stem Rot (Enterobacter cloacae)',
          type: 'BACTERIAL',
          symptoms: 'Yellowing and water-soaking of cladodes; inner parenchymatous pulp decays into a foul-smelling liquid slime.',
          prevention: 'Avoid mechanical wounding during weeding; ensure rapid drainage after heavy monsoon rain.',
          organicControl: 'Chisel out decaying pulp and paint wound with 10% Bordeaux paste.',
          chemicalControl: 'Drench and spray with Copper Oxychloride (3 g/L) + Streptocycline (200 ppm).',
          severity: 'HIGH',
        },
      ];
    }

    // 2. Lauraceae (Avocado)
    if (lowerFam.includes('laur') || lowerName.includes('avocado')) {
      return [
        {
          name: 'Phytophthora Root Rot (Phytophthora cinnamomi)',
          type: 'FUNGAL',
          symptoms: 'Foliage turns pale green/yellow, wilts, and drops; branch dieback starting from tips; feeder roots turn black and rotten.',
          prevention: 'Plant certified clonally propagated rootstocks (Duke 7, Dusa); plant on mounds in well-drained soils.',
          organicControl: 'Mulch heavily with coarse wood chips; soil drench with Trichoderma harzianum @ 50 g/tree.',
          chemicalControl: 'Trunk injection or foliar spray of Potassium Phosphite (3 g/L) or Metalaxyl soil drenching.',
          severity: 'HIGH',
        },
        {
          name: 'Avocado Anthracnose & Black Spot (Colletotrichum)',
          type: 'FUNGAL',
          symptoms: 'Circular black spots on ripening fruits that penetrate deeply into avocado flesh, causing bitter rot.',
          prevention: 'Prune lower branches at least 50 cm above ground level; ensure good canopy airflow.',
          organicControl: 'Prophylactic spray of Copper Oxychloride (2.5 g/L) during fruit set.',
          chemicalControl: 'Spray Azoxystrobin @ 1 ml/L or Pyraclostrobin during flowering and early fruit development.',
          severity: 'MEDIUM',
        },
        {
          name: 'Avocado Thrips (Scirtothrips perseae)',
          type: 'PEST',
          symptoms: 'Brown leathery alligator-skin scarring on fruit skin, severely downgrading commercial market grade.',
          prevention: 'Monitor young flush using yellow sticky cards; preserve natural predatory thrips.',
          organicControl: 'Foliar spray of Spinosad 45% SC @ 0.3 ml/L or cold-pressed neem oil.',
          chemicalControl: 'Spray Abamectin 1.9% EC @ 0.5 ml/L during bloom to fruit set transition.',
          severity: 'MEDIUM',
        },
      ];
    }

    // 3. Cucurbitaceae (Cucumber, Watermelon, Melons, Gourds, Pumpkin)
    if (lowerFam.includes('cucurbit') || lowerName.includes('melon') || lowerName.includes('cucumber') || lowerName.includes('gourd') || lowerName.includes('pumpkin')) {
      return [
        {
          name: 'Downy Mildew (Pseudoperonospora cubensis)',
          type: 'FUNGAL',
          symptoms: 'Angular bright yellow chlorotic spots restricted by leaf veins; purplish-grey fungal down on lower leaf surface.',
          prevention: 'Trellis vines to elevate foliage; avoid late evening overhead sprinkler irrigation.',
          organicControl: 'Foliar spray of bio-agent Trichoderma viride + cow urine (10%) or copper hydroxide.',
          chemicalControl: 'Spray Cymoxanil 8% + Mancozeb 64% WP @ 2 g/L or Metalaxyl-Mancozeb @ 2.5 g/L.',
          severity: 'HIGH',
        },
        {
          name: 'Cucurbit Fruit Fly (Bactrocera cucurbitae)',
          type: 'PEST',
          symptoms: 'Punctured oviposition marks oozing brown resin; maggots feed inside fruit flesh causing curved decaying fruit.',
          prevention: 'Install cue-lure pheromone traps (15 traps/acre); destroy punctured fallen fruits.',
          organicControl: 'Bait spray with 100g jaggery + 10g Malathion or Spinosad in 10L water applied as coarse droplets.',
          chemicalControl: 'Foliar spray of Malathion 50% EC @ 2 ml/L or Lambda Cyhalothrin @ 1 ml/L.',
          severity: 'HIGH',
        },
        {
          name: 'Powdery Mildew (Podosphaera xanthii)',
          type: 'FUNGAL',
          symptoms: 'Talcum-powder-like white superficial fungal coating on leaves and petioles, causing premature leaf drying.',
          prevention: 'Maintain wide vine spacing; grow resistant hybrid varieties.',
          organicControl: 'Spray Wettable Sulphur 80% WDG @ 2.5 g/L or baking soda (0.5%) soap solution.',
          chemicalControl: 'Spray Hexaconazole 5% EC @ 1 ml/L or Difenoconazole 25% EC @ 0.5 ml/L.',
          severity: 'MEDIUM',
        },
        {
          name: 'Red Pumpkin Beetle (Aulacophora foveicollis)',
          type: 'PEST',
          symptoms: 'Bright orange-red beetles gnaw circular holes in cotyledons and leaves; grubs bore into roots.',
          prevention: 'Hand-pick beetles during early morning chill; dust wood ash on tender seedlings.',
          organicControl: 'Dust seedling rows with fine wood ash mixed with Neem cake powder.',
          chemicalControl: 'Foliar spray of Chlorpyrifos 20% EC @ 2 ml/L or Cypermethrin @ 1 ml/L.',
          severity: 'MEDIUM',
        },
      ];
    }

    // 4. Solanaceae (Tomato, Potato, Brinjal, Chilli, Bell Pepper, Tobacco)
    if (lowerFam.includes('solan') || lowerName.includes('pepper') || lowerName.includes('chilli') || lowerName.includes('tomato') || lowerName.includes('potato') || lowerName.includes('brinjal')) {
      return [
        {
          name: 'Early & Late Blight (Phytophthora infestans / Alternaria)',
          type: 'FUNGAL',
          symptoms: 'Concentric target-board rings on leaves (Early Blight) and water-soaked dark necrotic blotches with white margin fuzz (Late Blight).',
          prevention: 'Crop rotation with non-solanaceous crops; maintain wide ridge spacing for leaf drying.',
          organicControl: 'Seed treatment with Trichoderma viride @ 5 g/kg seed and foliar spray of Pseudomonas fluorescens.',
          chemicalControl: 'Prophylactic spray of Mancozeb 75% WP @ 2.5 g/L; curative spray of Dimethomorph 50% WP @ 1 g/L.',
          severity: 'HIGH',
        },
        {
          name: 'Fruit and Shoot Borer / Pinworm (Tuta absoluta / Helicoverpa)',
          type: 'PEST',
          symptoms: 'Wilting of apical tender shoots; transparent blister leaf mines; circular boreholes in green and ripe fruit.',
          prevention: 'Install delta pheromone traps (15 traps/acre); clip drooping twigs weekly.',
          organicControl: 'Foliar application of Bacillus thuringiensis (Bt) @ 2 g/L or Neem oil 10,000 ppm @ 3 ml/L.',
          chemicalControl: 'Spray Chlorantraniliprole 18.5% SC @ 0.3 ml/L or Flubendiamide 39.35% SC @ 0.3 ml/L.',
          severity: 'HIGH',
        },
        {
          name: 'Bacterial Wilt (Ralstonia solanacearum)',
          type: 'BACTERIAL',
          symptoms: 'Sudden daytime wilting of entire foliage without initial yellowing; cut stem shows milky white bacterial streaming in clean water.',
          prevention: 'Solarize raised nursery beds with polythene; grow certified resistant rootstocks.',
          organicControl: 'Soil drenching with Pseudomonas fluorescens (10 g/L) + neem cake enrichment.',
          chemicalControl: 'Root drenching with Streptocycline (100 ppm) + Copper Oxychloride (2.5 g/L).',
          severity: 'HIGH',
        },
      ];
    }

    // 5. Fabaceae / Leguminosae (Pulses, Beans, Peas, Lentils, Soybean)
    if (lowerFam.includes('fab') || lowerFam.includes('legum') || category === 'Pulses' || lowerName.includes('bean') || lowerName.includes('pea') || lowerName.includes('gram') || lowerName.includes('pulse')) {
      return [
        {
          name: 'Gram / Legume Pod Borer (Helicoverpa armigera)',
          type: 'PEST',
          symptoms: 'Voracious caterpillars feed with heads inserted into green pods while body remains outside; circular holes on pods.',
          prevention: 'Border intercropping with coriander (4:1) or marigold; install bird perches (20 per acre).',
          organicControl: 'Install pheromone traps (5/acre); foliar spray of HaNPV @ 250 LE/ha or Bt kurstaki @ 2 g/L.',
          chemicalControl: 'Spray Chlorantraniliprole 18.5% SC @ 0.3 ml/L or Emamectin Benzoate 5% SG @ 0.4 g/L.',
          severity: 'HIGH',
        },
        {
          name: 'Yellow Mosaic Virus (MYMV)',
          type: 'VIRAL',
          symptoms: 'Bright yellow mosaic chlorotic patches alternating with green on leaf blade; stunted pods with wrinkled grains.',
          prevention: 'Plant MYMV-resistant cultivars; eradicate alternate weed hosts around field borders.',
          organicControl: 'Spray 5% Neem Seed Kernel Extract (NSKE) to deter whitefly insect vectors (Bemisia tabaci).',
          chemicalControl: 'Foliar spray of Thiamethoxam 25% WG @ 0.3 g/L or Acetamiprid 20% SP @ 0.3 g/L.',
          severity: 'HIGH',
        },
        {
          name: 'Fusarium Wilt & Collar Rot',
          type: 'FUNGAL',
          symptoms: 'Leaves turn dull green, droop and turn dry; vascular xylem bundle inside taproot displays dark brown discoloration.',
          prevention: 'Deep summer ploughing; 3-year rotation with non-legume cereals like sorghum or maize.',
          organicControl: 'Seed dressing with Trichoderma viride @ 8 g/kg seed + soil application of enriched FYM.',
          chemicalControl: 'Seed treatment with Carbendazim + Mancozeb (2 g/kg seed).',
          severity: 'HIGH',
        },
      ];
    }

    // 6. Poaceae / Gramineae (Cereals, Corn, Rice, Wheat, Millets, Sugarcane, Sorghum)
    if (lowerFam.includes('poac') || lowerFam.includes('gramin') || category === 'Cereals' || lowerName.includes('corn') || lowerName.includes('maize') || lowerName.includes('wheat') || lowerName.includes('rice') || lowerName.includes('sorghum') || lowerName.includes('millet')) {
      return [
        {
          name: 'Stem Borer & Fall Armyworm (Spodoptera frugiperda / Chilo partellus)',
          type: 'PEST',
          symptoms: 'Pinholes and ragged windowpane holes on leaves; sawdust-like frass inside whorl; central shoot dies ("dead heart").',
          prevention: 'Intercrop with cowpea or desmodium (push-pull strategy); early synchronized planting.',
          organicControl: 'Apply fine sand + neem cake (9:1) into central whorls; release Trichogramma egg parasitoids.',
          chemicalControl: 'Whorl application of Chlorantraniliprole 18.5% SC @ 0.4 ml/L or Spinetoram 11.7% SC @ 0.5 ml/L.',
          severity: 'HIGH',
        },
        {
          name: 'Foliar Blight & Rust (Puccinia / Bipolaris / Pyricularia)',
          type: 'FUNGAL',
          symptoms: 'Spindle-shaped eye spots with grey centers or reddish-orange powdery pustules along leaf veins.',
          prevention: 'Balanced nitrogen application (avoid excessive urea); maintain optimal plant population.',
          organicControl: 'Foliar spray of Pseudomonas fluorescens @ 5 g/L or Bordeaux mixture (1%).',
          chemicalControl: 'Spray Propiconazole 25% EC @ 1 ml/L or Tricyclazole 75% WP @ 0.6 g/L at first appearance.',
          severity: 'HIGH',
        },
        {
          name: 'Grain Smut & Blast Disease',
          type: 'FUNGAL',
          symptoms: 'Individual grains or entire panicles replaced by sooty black spore masses or neck nodes turn black and snap.',
          prevention: 'Seed treatment with hot water (52°C for 10 min) or certified fungicides.',
          organicControl: 'Seed dressing with Trichoderma viride @ 5 g/kg seed.',
          chemicalControl: 'Foliar spray of Isoprothiolane 40% EC @ 1.5 ml/L or Tebuconazole @ 1 ml/L.',
          severity: 'HIGH',
        },
      ];
    }

    // 7. Brassicaceae / Cruciferae (Cabbage, Cauliflower, Mustard, Radish, Broccoli)
    if (lowerFam.includes('brassic') || lowerFam.includes('crucif') || lowerName.includes('cabbage') || lowerName.includes('cauliflower') || lowerName.includes('mustard') || lowerName.includes('radish') || lowerName.includes('broccoli')) {
      return [
        {
          name: 'Diamondback Moth (DBM - Plutella xylostella)',
          type: 'PEST',
          symptoms: 'Small green caterpillars feed on undersides of leaves, chewing whitish windowpanes and skeletonizing foliage.',
          prevention: 'Plant mustard as trap crop (2 rows mustard per 25 rows cabbage); install pheromone traps.',
          organicControl: 'Foliar spray of Bacillus thuringiensis var. kurstaki (Bt) @ 2 g/L or NSKE 5%.',
          chemicalControl: 'Spray Spinosad 45% SC @ 0.4 ml/L or Chlorantraniliprole 18.5% SC @ 0.3 ml/L.',
          severity: 'HIGH',
        },
        {
          name: 'Black Rot (Xanthomonas campestris pv. campestris)',
          type: 'BACTERIAL',
          symptoms: 'V-shaped chlorotic yellow-to-brown lesions on leaf margins with blackened vein network; head decay.',
          prevention: 'Hot water seed treatment at 50°C for 30 minutes; 2-year crop rotation without crucifers.',
          organicControl: 'Seed treatment with Pseudomonas fluorescens @ 10 g/kg seed.',
          chemicalControl: 'Spray Copper Oxychloride 50% WP (2.5 g/L) + Streptocycline (200 ppm).',
          severity: 'HIGH',
        },
        {
          name: 'Alternaria Leaf Spot & White Rust',
          type: 'FUNGAL',
          symptoms: 'Concentric dark brown circular spots on leaves; white blister pustules on underside of mustard leaves.',
          prevention: 'Avoid dense planting; remove lower infected diseased leaves.',
          organicControl: 'Foliar spray of cow urine (10%) + Wettable Sulphur (2 g/L).',
          chemicalControl: 'Spray Mancozeb 75% WP @ 2.5 g/L or Metalaxyl-Mancozeb @ 2 g/L.',
          severity: 'MEDIUM',
        },
      ];
    }

    // 8. Rutaceae / Citrus (Orange, Lemon, Lime, Mandarin, Mosambi)
    if (lowerFam.includes('rutac') || lowerName.includes('citrus') || lowerName.includes('orange') || lowerName.includes('lemon') || lowerName.includes('lime')) {
      return [
        {
          name: 'Citrus Canker (Xanthomonas citri)',
          type: 'BACTERIAL',
          symptoms: 'Raised rough corky crater-like eruptive lesions surrounded by yellow oily halos on leaves, twigs, and fruit skin.',
          prevention: 'Prune canker-affected twigs before monsoon; establish windbreak hedges around orchard.',
          organicControl: 'Spray 1% Bordeaux mixture or Copper Hydroxide (2 g/L) after each vegetative flush.',
          chemicalControl: 'Foliar spray of Streptocycline (200 ppm) + Copper Oxychloride (2.5 g/L).',
          severity: 'HIGH',
        },
        {
          name: 'Citrus Leaf Miner (Phyllocnistis citrella)',
          type: 'PEST',
          symptoms: 'Silvery serpentine zigzag tunnels in tender young leaves causing curling, distortion, and predisposing to canker.',
          prevention: 'Avoid excessive nitrogen fertilization that stimulates continuous unseasonal flushes.',
          organicControl: 'Foliar spray of cold-pressed Neem oil (5 ml/L) at initiation of fresh leaf flush.',
          chemicalControl: 'Spray Imidacloprid 17.8% SL @ 0.5 ml/L or Thiamethoxam 25% WG @ 0.3 g/L.',
          severity: 'HIGH',
        },
        {
          name: 'Gummosis & Foot Rot (Phytophthora nicotianae)',
          type: 'FUNGAL',
          symptoms: 'Bark of trunk near ground cracks profusely, oozing golden-brown amber gum; yellowing and dieback of canopy.',
          prevention: 'High budding (graft union at least 30 cm above ground); prevent irrigation water touching trunk.',
          organicControl: 'Scrape diseased bark and paint with Bordeaux paste (10%) or Trichoderma viride paste.',
          chemicalControl: 'Soil drench and trunk swab with Metalaxyl-Mancozeb (2.5 g/L) or Fosetyl-Al (2 g/L).',
          severity: 'HIGH',
        },
      ];
    }

    // 9. Rosaceae / Pome & Stone Fruits (Apple, Pear, Peach, Strawberry)
    if (lowerFam.includes('rosac') || lowerName.includes('apple') || lowerName.includes('pear') || lowerName.includes('peach') || lowerName.includes('strawberry')) {
      return [
        {
          name: 'Apple & Pome Scab (Venturia inaequalis)',
          type: 'FUNGAL',
          symptoms: 'Velvety olive-green to black circular lesions on leaves and scabby, deformed, cracked fruit skin.',
          prevention: 'Rake and burn fallen autumn foliage; spray urea (5%) on leaf litter to accelerate decomposition.',
          organicControl: 'Foliar spray of wettable sulfur (3 g/L) or potassium bicarbonate.',
          chemicalControl: 'Spray Mancozeb 75% WP (2.5 g/L) at green tip; Difenoconazole 25% EC (0.5 ml/L) at petal fall.',
          severity: 'HIGH',
        },
        {
          name: 'Fire Blight (Erwinia amylovora)',
          type: 'BACTERIAL',
          symptoms: 'Blossoms and shoot tips suddenly turn blackened and scorched as if burnt by fire; shepherd’s crook bend.',
          prevention: 'Prune infected twigs 30 cm below visible blight margins; sterilize tools between cuts.',
          organicControl: 'Foliar spray of Bordeaux mixture (0.5%) during bloom.',
          chemicalControl: 'Spray Streptomycin sulphate (100 ppm) during 20% and 50% bloom.',
          severity: 'HIGH',
        },
        {
          name: 'Codling Moth & Fruit Borer (Cydia pomonella)',
          type: 'PEST',
          symptoms: 'Pinkish caterpillar bores directly into fruit core, feeding on pips and pushing reddish-brown frass outside.',
          prevention: 'Install codlemone pheromone mating disruption dispensers; band trunks with corrugated cardboard.',
          organicControl: 'Foliar spray of Cydia pomonella granulovirus (CpGV) or Spinosad (0.4 ml/L).',
          chemicalControl: 'Spray Chlorantraniliprole 18.5% SC @ 0.3 ml/L or Emamectin Benzoate @ 0.4 g/L.',
          severity: 'HIGH',
        },
      ];
    }

    // 10. Default High-Precision Agronomic Pathology by Category
    if (category === 'Fruits') {
      return [
        {
          name: 'Anthracnose & Fruit Rot (Colletotrichum spp.)',
          type: 'FUNGAL',
          symptoms: 'Circular sunken dark brown to black lesions with salmon-pink spore masses in moist weather.',
          prevention: 'Prune dead diseased branches; ensure open canopy for sunlight penetration.',
          organicControl: 'Foliar spray of cold-pressed Neem oil (3 ml/L) + Trichoderma viride.',
          chemicalControl: 'Spray Carbendazim 50% WP @ 1 g/L or Azoxystrobin 23% SC @ 1 ml/L.',
          severity: 'HIGH',
        },
        {
          name: 'Fruit Fly (Bactrocera spp.)',
          type: 'PEST',
          symptoms: 'Punctured oviposition holes on fruit skin; maggots liquefy and ferment pulp, causing premature drop.',
          prevention: 'Install methyl eugenol / cue-lure pheromone traps (10 traps/acre); harvest at mature green stage.',
          organicControl: 'Protein bait spray with jaggery + Spinosad on lower canopy foliage.',
          chemicalControl: 'Foliar spray of Malathion 50% EC @ 2 ml/L or Lambda Cyhalothrin @ 1 ml/L.',
          severity: 'HIGH',
        },
        {
          name: 'Powdery Mildew & Rust',
          type: 'FUNGAL',
          symptoms: 'White powdery superficial fungal coating on floral buds and tender young leaves, causing blossom drop.',
          prevention: 'Maintain wide orchard tree spacing; avoid humid stagnant microclimates.',
          organicControl: 'Spray Wettable Sulphur 80% WDG @ 2.5 g/L or baking soda (0.5%) soap solution.',
          chemicalControl: 'Spray Hexaconazole 5% EC @ 1 ml/L or Difenoconazole 25% EC @ 0.5 ml/L.',
          severity: 'MEDIUM',
        },
      ];
    }

    if (category === 'Vegetables') {
      return [
        {
          name: 'Damping-Off & Collar Rot (Pythium / Rhizoctonia)',
          type: 'FUNGAL',
          symptoms: 'Water-soaked collar constriction at soil surface, causing seedlings to topple and collapse in patches.',
          prevention: 'Prepare raised nursery beds (15 cm high); avoid waterlogging and heavy dense seeding.',
          organicControl: 'Soil incorporation of Trichoderma harzianum enriched FYM @ 50 kg/acre.',
          chemicalControl: 'Soil drenching with Metalaxyl 35% WS or Copper Oxychloride 50% WP @ 2.5 g/L.',
          severity: 'HIGH',
        },
        {
          name: 'Sucking Pests (Aphids, Thrips & Whiteflies)',
          type: 'PEST',
          symptoms: 'Curling of tender leaves, stunted shoot elongation, sticky honeydew exudation, and sooty mold.',
          prevention: 'Install yellow and blue sticky traps (15/acre); plant barrier rows of maize or bajra.',
          organicControl: 'Foliar spray of cold-pressed Neem Oil (10,000 ppm @ 3 ml/L) or Lecanicillium lecanii.',
          chemicalControl: 'Spray Imidacloprid 17.8% SL @ 0.5 ml/L or Thiamethoxam 25% WG @ 0.3 g/L.',
          severity: 'MEDIUM',
        },
        {
          name: 'Foliar Leaf Spot & Blight (Alternaria / Cercospora)',
          type: 'FUNGAL',
          symptoms: 'Concentric necrotic circular brown spots surrounded by chlorotic yellow halos on foliage.',
          prevention: 'Crop rotation; avoid overhead sprinkler watering during late afternoon.',
          organicControl: 'Foliar spray of Pseudomonas fluorescens (5 g/L) or copper soap.',
          chemicalControl: 'Spray Mancozeb 75% WP @ 2.5 g/L or Azoxystrobin @ 1 ml/L at first disease detection.',
          severity: 'HIGH',
        },
      ];
    }

    // Baseline fall-back for all remaining crops
    return [
      {
        name: `${cropName} Foliar Blight & Leaf Spot`,
        type: 'FUNGAL',
        symptoms: `Concentric necrotic spots on foliage of ${cropName}, reducing active photosynthetic green leaf area.`,
        prevention: 'Crop rotation; maintain adequate plant spacing and field sanitation.',
        organicControl: 'Seed treatment with Trichoderma viride @ 5 g/kg seed and foliar spray of Pseudomonas fluorescens.',
        chemicalControl: 'Foliar spray of Mancozeb 75% WP @ 2.5 g/L or Azoxystrobin @ 1 ml/L at symptom onset.',
        severity: 'HIGH',
      },
      {
        name: `${cropName} Sucking Pests & Aphids`,
        type: 'PEST',
        symptoms: 'Clusters of sucking nymphs and adults feeding on tender shoots, causing foliar crinkling and leaf curling.',
        prevention: 'Install yellow sticky traps (15 traps/acre); intercrop with marigold or cowpea.',
        organicControl: 'Foliar spray of cold-pressed Neem Oil 10,000 ppm @ 3 ml/L water.',
        chemicalControl: 'Foliar spray of Imidacloprid 17.8% SL @ 0.5 ml/L or Thiamethoxam @ 0.3 g/L.',
        severity: 'MEDIUM',
      },
      {
        name: `${cropName} Root Rot & Wilt Complex`,
        type: 'FUNGAL',
        symptoms: `Underground root decay and vascular discoloration in ${cropName}, causing sudden daytime foliage wilting.`,
        prevention: 'Ensure raised planting beds and well-drained fertile loam; avoid water stagnation.',
        organicControl: 'Soil drenching with Trichoderma harzianum enriched FYM @ 50 kg/acre.',
        chemicalControl: 'Soil drench with Carbendazim 50% WP @ 2 g/L or Metalaxyl 35% WS.',
        severity: 'HIGH',
      },
    ];
  }
}

export const externalEnrichmentService = new ExternalEnrichmentService();


