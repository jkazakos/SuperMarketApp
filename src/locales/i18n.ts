import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import en from './en.json';
import el from './el.json';

const resources = {
  en: { translation: en },
  el: { translation: el },
};

const deviceLocales = getLocales();
const deviceLanguage = deviceLocales?.[0]?.languageCode === 'el' ? 'el' : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
