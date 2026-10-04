import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          'navbar_home': 'Home',
          'navbar_search': 'Search',
          'navbar_hub': 'Passenger Hub',
        },
      },
      ta: {
        translation: {
          'navbar_home': 'முகப்பு',
          'navbar_search': 'தேடல்',
          'navbar_hub': 'பயணிகள் மையம்',
        },
      },
      hi: {
        translation: {
          'navbar_home': 'होम',
          'navbar_search': 'खोज',
          'navbar_hub': 'यात्री हब',
        },
      },
    },
  });

export default i18n;
