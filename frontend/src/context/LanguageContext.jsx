import React, { createContext, useContext, useState, useEffect } from 'react';

export const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
];

const translations = {
  en: {
    // Navigation
    marketplace: 'Marketplace',
    mandiPrices: 'Mandi Prices',
    demandBoard: 'Demand Board',
    producePools: 'Produce Pools',
    contracts: 'Contracts',
    cropGuide: 'Crop Guide',
    weather: 'Weather',
    about: 'About',
    support: 'Support',
    more: 'More',
    // Auth & Account
    signIn: 'Sign In',
    register: 'Register',
    signOut: 'Sign Out',
    dashboard: 'Dashboard',
    myOrders: 'My Orders',
    bargains: 'Bargain & Offers',
    myListings: 'My Listed Products',
    profile: 'Profile & Settings',
    adminPanel: 'Admin Panel',
    // Modes
    farmerMode: 'Farmer Mode',
    buyerMode: 'Buyer Mode',
    farmer: 'Farmer',
    buyer: 'Buyer',
    sellCrop: '+ Sell Crop',
    switchToFarmer: 'Switch to Farmer 🚜',
    switchToBuyer: 'Switch to Buyer 🛒',
    // Search
    search: 'Search',
    searchPlaceholder: 'Search products, crops, mandi rates...',
    searchPlaceholderFarmer: 'Search mandi rates, advisory...',
    searchPlaceholderBuyer: 'Search produce, crops, bulk orders...',
    // Common Actions & Badges
    makeOffer: 'Make an Offer',
    buyNow: 'Buy Now',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    directFarmerRate: 'Direct Farmer Rate',
    farmOrigin: 'Farm Origin',
    gradeA: 'Grade A (Premium Assayed)',
    gradeB: 'Grade B (Standard Mandi)',
    gradeC: 'Grade C (Processing/Fair)',
    postRequirement: 'Post Demand',
    createPool: 'Create Pool',
    filterByState: 'Filter by State',
    allIndia: 'All India',
    verifiedFarmer: 'Verified Farmer',
    // Weather & Mandi
    todayWeather: "Today's Weather",
    temperature: 'Temperature',
    humidity: 'Humidity',
    windSpeed: 'Wind Speed',
    rainfall: 'Rainfall',
    advisory: 'Advisory',
    risk: 'Risk Level',
    modalPrice: 'Modal Price',
    minPrice: 'Min Price',
    maxPrice: 'Max Price',
    marketArrivals: 'Arrivals',
  },
  kn: {
    // Navigation
    marketplace: 'ಮಾರುಕಟ್ಟೆ',
    mandiPrices: 'ಮಂಡಿ ಬೆಲೆಗಳು',
    demandBoard: 'ಖರೀದಿದಾರರ ಬೇಡಿಕೆ',
    producePools: 'ಸಂಘಟಿತ ಸಾಗಾಟ',
    contracts: 'ಒಪ್ಪಂದ ಕೃಷಿ',
    cropGuide: 'ಬೆಳೆ ಮಾರ್ಗದರ್ಶಿ',
    weather: 'ಹವಾಮಾನ',
    about: 'ನಮ್ಮ ಬಗ್ಗೆ',
    support: 'ಸಹಾಯ ಕೇಂದ್ರ',
    more: 'ಇನ್ನಷ್ಟು',
    // Auth & Account
    signIn: 'ಲಾಗಿನ್',
    register: 'ಖಾತೆ ತೆರೆಯಿರಿ',
    signOut: 'ಲಾಗ್‌ಔಟ್',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    myOrders: 'ನನ್ನ ಆರ್ಡರ್‌ಗಳು',
    bargains: 'ಬೆಲೆ ಚೌಕಾಶಿ & ಆಫರ್‌ಗಳು',
    myListings: 'ನನ್ನ ಬೆಳೆ ಪಟ್ಟಿ',
    profile: 'ಪ್ರೊಫೈಲ್ ಮತ್ತು ಸೆಟ್ಟಿಂಗ್ಸ್',
    adminPanel: 'ನಿರ್ವಾಹಕ ಫಲಕ',
    // Modes
    farmerMode: 'ರೈತ ಮೋಡ್',
    buyerMode: 'ಖರೀದಿದಾರ ಮೋಡ್',
    farmer: 'ರೈತ',
    buyer: 'ಖರೀದಿದಾರ',
    sellCrop: '+ ಬೆಳೆ ಮಾರಾಟ',
    switchToFarmer: 'ರೈತ ಮೋಡ್‌ಗೆ ಬದಲಿಸಿ 🚜',
    switchToBuyer: 'ಖರೀದಿದಾರ ಮೋಡ್‌ಗೆ ಬದಲಿಸಿ 🛒',
    // Search
    search: 'ಹುಡುಕಿ',
    searchPlaceholder: 'ಬೆಳೆಗಳು, ಉತ್ಪನ್ನಗಳು, ಮಂಡಿ ದರಗಳನ್ನು ಹುಡುಕಿ...',
    searchPlaceholderFarmer: 'ಮಂಡಿ ದರಗಳು, ಕೃಷಿ ಸಲಹೆಗಳನ್ನು ಹುಡುಕಿ...',
    searchPlaceholderBuyer: 'ಬೆಳೆಗಳು, ಸಗಟು ಖರೀದಿಗಳನ್ನು ಹುಡುಕಿ...',
    // Common Actions & Badges
    makeOffer: 'ಆಫರ್ / ಚೌಕಾಶಿ ಮಾಡಿ',
    buyNow: 'ಈಗಲೇ ಖರೀದಿಸಿ',
    inStock: 'ದಾಸ್ತಾನು ಲಭ್ಯವಿದೆ',
    outOfStock: 'ದಾಸ್ತಾನು ಮುಗಿದಿದೆ',
    directFarmerRate: 'ರೈತರ ನೇರ ದರ',
    farmOrigin: 'ತೋಟ/ಹೊಲದ ಸ್ಥಳ',
    gradeA: 'ದರ್ಜೆ A (ಉತ್ತಮ ರಫ್ತು ಗುಣಮಟ್ಟ)',
    gradeB: 'ದರ್ಜೆ B (ಸಾಮಾನ್ಯ ಎಪಿಎಂಸಿ)',
    gradeC: 'ದರ್ಜೆ C (ಸಂಸ್ಕರಣಾ ದರ್ಜೆ)',
    postRequirement: 'ಹೊಸ ಬೇಡಿಕೆ ಪ್ರಕಟಿಸಿ',
    createPool: 'ಸಾಗಾಟ ಗುಂಪು ರಚಿಸಿ',
    filterByState: 'ರಾಜ್ಯದ ಪ್ರಕಾರ ಹುಡುಕಿ',
    allIndia: 'ಸಮಗ್ರ ಭಾರತ',
    verifiedFarmer: 'ಪರಿಶೀಲಿಸಿದ ರೈತರು',
    // Weather & Mandi
    todayWeather: 'ಇಂದಿನ ಹವಾಮಾನ',
    temperature: 'ತಾಪಮಾನ',
    humidity: 'ತೇವಾಂಶ',
    windSpeed: 'ಗಾಳಿಯ ವೇಗ',
    rainfall: 'ಮಳೆ ಪ್ರಮಾಣ',
    advisory: 'ಕೃಷಿ ಸಲಹೆ',
    risk: 'ಅಪಾಯ ಮಟ್ಟ',
    modalPrice: 'ಮಾದರಿ ದರ',
    minPrice: 'ಕನಿಷ್ಠ ದರ',
    maxPrice: 'ಗರಿಷ್ಠ ದರ',
    marketArrivals: 'ಮಾರುಕಟ್ಟೆ ಆವಕ',
  },
  hi: {
    // Navigation
    marketplace: 'बाज़ार',
    mandiPrices: 'मंडी भाव',
    demandBoard: 'खरीदार मांग',
    producePools: 'सामूहिक परिवहन',
    contracts: 'अनुबंध खेती',
    cropGuide: 'फसल मार्गदर्शिका',
    weather: 'मौसम',
    about: 'हमारे बारे में',
    support: 'सहायता केंद्र',
    more: 'अधिक',
    // Auth & Account
    signIn: 'साइन इन',
    register: 'पंजीकरण करें',
    signOut: 'साइन आउट',
    dashboard: 'डैशबोर्ड',
    myOrders: 'मेरे ऑर्डर',
    bargains: 'सौदा और बोलियां',
    myListings: 'मेरी सूचीबद्ध फसलें',
    profile: 'प्रोफ़ाइल और सेटिंग्स',
    adminPanel: 'एडमिन पैनल',
    // Modes
    farmerMode: 'किसान मोड',
    buyerMode: 'खरीदार मोड',
    farmer: 'किसान',
    buyer: 'खरीदार',
    sellCrop: '+ फसल बेचें',
    switchToFarmer: 'किसान मोड में बदलें 🚜',
    switchToBuyer: 'खरीदार मोड में बदलें 🛒',
    // Search
    search: 'खोजें',
    searchPlaceholder: 'उत्पाद, फसलें, मंडी भाव खोजें...',
    searchPlaceholderFarmer: 'मंडी भाव, फसल सलाह खोजें...',
    searchPlaceholderBuyer: 'उपज, फसलें, थोक ऑर्डर खोजें...',
    // Common Actions & Badges
    makeOffer: 'प्रस्ताव दें / मोलभाव करें',
    buyNow: 'अभी खरीदें',
    inStock: 'उपलब्ध है',
    outOfStock: 'स्टॉक समाप्त',
    directFarmerRate: 'सीधे किसान की दर',
    farmOrigin: 'खेत का स्थान',
    gradeA: 'ग्रेड A (प्रीमियम गुणवत्ता)',
    gradeB: 'ग्रेड B (मानक मंडी)',
    gradeC: 'ग्रेड C (प्रसंस्करण हेतु)',
    postRequirement: 'मांग पोस्ट करें',
    createPool: 'पूल बनाएं',
    filterByState: 'राज्य अनुसार फ़िल्टर करें',
    allIndia: 'पूरा भारत',
    verifiedFarmer: 'सत्यापित किसान',
    // Weather & Mandi
    todayWeather: 'आज का मौसम',
    temperature: 'तापमान',
    humidity: 'नमी',
    windSpeed: 'हवा की गति',
    rainfall: 'वर्षा',
    advisory: 'कृषि सलाह',
    risk: 'जोखिम स्तर',
    modalPrice: 'मॉडल भाव',
    minPrice: 'न्यूनतम भाव',
    maxPrice: 'अधिकतम भाव',
    marketArrivals: 'मंडी आवक',
  },
};

// Helper to set or delete Google Translate cookies across root and subdomains
function setGoogleTransCookie(lang) {
  try {
    const host = window.location.hostname;
    const cookieVal = lang === 'en' ? '' : `/en/${lang}`;

    if (lang === 'en') {
      // Clear cookies
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${host};`;
      const parts = host.split('.');
      if (parts.length > 1) {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${parts.slice(-2).join('.')};`;
      }
    } else {
      // Set cookies
      document.cookie = `googtrans=${cookieVal}; path=/;`;
      document.cookie = `googtrans=${cookieVal}; path=/; domain=${host};`;
      const parts = host.split('.');
      if (parts.length > 1) {
        document.cookie = `googtrans=${cookieVal}; path=/; domain=.${parts.slice(-2).join('.')};`;
      }
    }
  } catch (err) {
    console.error('Failed to update translation cookies:', err);
  }
}

// Helper to trigger Google Translate's hidden select combo box
function triggerGoogleTranslate(lang) {
  setGoogleTransCookie(lang);

  let attempts = 0;
  const maxAttempts = 15;
  const timer = setInterval(() => {
    attempts++;
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      clearInterval(timer);
      if (lang === 'en') {
        const enOption = Array.from(select.options).find((opt) => opt.value === 'en' || opt.value === '');
        if (enOption) {
          select.value = enOption.value;
          select.dispatchEvent(new Event('change'));
        }
      } else {
        select.value = lang;
        select.dispatchEvent(new Event('change'));
      }
    } else if (attempts >= maxAttempts) {
      clearInterval(timer);
    }
  }, 250);
}

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key, fallback) => fallback || key,
  languages: AVAILABLE_LANGUAGES,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('agrimarket_lang');
    if (saved && (saved === 'kn' || saved === 'hi' || saved === 'en')) {
      return saved;
    }
    return 'en';
  });

  // Apply on initial mount if non-English was previously saved
  useEffect(() => {
    document.documentElement.lang = language;
    if (language !== 'en') {
      triggerGoogleTranslate(language);
    }
  }, []);

  const setLanguage = (newLang) => {
    if (newLang === language) return;
    const prevLang = language;
    setLanguageState(newLang);
    localStorage.setItem('agrimarket_lang', newLang);
    document.documentElement.lang = newLang;

    if (newLang === 'en' && prevLang !== 'en') {
      // When reverting to English, clear cookies and reload to ensure pristine original DOM
      setGoogleTransCookie('en');
      window.location.reload();
    } else {
      triggerGoogleTranslate(newLang);
    }
  };

  const toggleLanguage = () => {
    // Cycles en -> kn -> hi -> en
    if (language === 'en') {
      setLanguage('kn');
    } else if (language === 'kn') {
      setLanguage('hi');
    } else {
      setLanguage('en');
    }
  };

  const t = (key, fallback) => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        languages: AVAILABLE_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
