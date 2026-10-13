import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    marketplace: 'Marketplace',
    mandiPrices: 'Mandi Prices',
    demandBoard: 'Demand Board',
    producePools: 'Produce Pooling',
    cropGuide: 'Crop Guide',
    weather: 'Weather',
    about: 'About',
    signIn: 'Sign In',
    register: 'Register',
    dashboard: 'Dashboard',
    myOrders: 'My Orders',
    bargains: 'Bargain & Offers',
    myListings: 'My Listed Products',
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
  },
  kn: {
    marketplace: 'ಮಾರುಕಟ್ಟೆ',
    mandiPrices: 'ಮಂಡಿ ಬೆಲೆಗಳು',
    demandBoard: 'ಖರೀದಿದಾರರ ಬೇಡಿಕೆ',
    producePools: 'ರೈತ ಸಂಘಟಿತ ಸಾಗಾಟ',
    cropGuide: 'ಬೆಳೆ ಮಾರ್ಗದರ್ಶಿ',
    weather: 'ಹವಾಮಾನ',
    about: 'ನಮ್ಮ ಬಗ್ಗೆ',
    signIn: 'ಲಾಗಿನ್',
    register: 'ಖಾತೆ ತೆರೆಯಿರಿ',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    myOrders: 'ನನ್ನ ಆರ್ಡರ್‌ಗಳು',
    bargains: 'ಬೆಲೆ ಚೌಕಾಶಿ & ಆಫರ್‌ಗಳು',
    myListings: 'ನನ್ನ ಬೆಳೆ ಪಟ್ಟಿ',
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
  },
};

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key, fallback) => fallback || key,
});

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('agrimarket_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('agrimarket_lang', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'kn' : 'en'));
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
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
