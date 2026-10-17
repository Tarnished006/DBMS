import axios from 'axios';

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

class ExternalEnrichmentService {
  private wikiCache = new Map<string, { data: WikiSummary; timestamp: number }>();
  private readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

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

    try {
      const resp = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanQuery)}`, {
        timeout: 2500,
        headers: {
          'User-Agent': 'AgriMarket-Agronomy/2.0 (education-agriculture@agrimarket.com)',
        },
      });

      if (resp.data && resp.data.extract) {
        const summary: WikiSummary = {
          title: resp.data.title,
          extract: resp.data.extract,
          description: resp.data.description,
          thumbnailUrl: resp.data.thumbnail?.source || resp.data.originalimage?.source,
          wikiUrl: resp.data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanQuery)}`,
        };
        this.wikiCache.set(cacheKey, { data: summary, timestamp: Date.now() });
        return summary;
      }
    } catch {
      // Graceful fallback on network timeout or 404 - never break crop page load
    }
    return null;
  }

  /**
   * Generate verified Government & Research Institution links for a given crop
   */
  getGovAdvisories(cropName: string, category: string): GovAdvisoryLink[] {
    const lowerName = cropName.toLowerCase();
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
    ];

    // Crop-specific research institutes
    if (lowerName.includes('rice') || lowerName.includes('paddy')) {
      links.unshift({
        title: 'ICAR - Indian Institute of Rice Research (IIRR)',
        organization: 'ICAR, Ministry of Agriculture',
        url: 'https://www.icar-iirr.org/',
        badge: 'Apex Research Institute',
        category: 'Varietal & Pest Research',
      });
    } else if (lowerName.includes('tomato') || lowerName.includes('chilli') || lowerName.includes('mango') || lowerName.includes('onion')) {
      links.unshift({
        title: 'ICAR - Indian Institute of Horticultural Research (IIHR, Bengaluru)',
        organization: 'ICAR, Hessarghatta, Bengaluru',
        url: 'https://www.iihr.res.in/',
        badge: 'Karnataka Apex Horticulture',
        category: 'Breeding & IPM',
      });
    } else if (lowerName.includes('ragi') || lowerName.includes('millet')) {
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
    } else if (lowerName.includes('gram') || lowerName.includes('pigeon') || lowerName.includes('pulse')) {
      links.unshift({
        title: 'ICAR - Indian Institute of Pulses Research (IIPR)',
        organization: 'ICAR, Kanpur',
        url: 'https://iipr.icar.gov.in/',
        badge: 'Pulses Apex',
        category: 'Wilt & Pulse Production',
      });
    } else if (lowerName.includes('potato')) {
      links.unshift({
        title: 'ICAR - Central Potato Research Institute (CPRI)',
        organization: 'ICAR, Shimla',
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
    } else if (lowerName.includes('turmeric') || lowerName.includes('spice')) {
      links.unshift({
        title: 'ICAR - Indian Institute of Spices Research (IISR)',
        organization: 'ICAR, Kozhikode & Karnataka Centers',
        url: 'https://spices.res.in/',
        badge: 'Spices Apex',
        category: 'Rhizome Quality & Diseases',
      });
    }

    return links;
  }
}

export const externalEnrichmentService = new ExternalEnrichmentService();
