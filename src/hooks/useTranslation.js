import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../data/translations';

export function useTranslation() {
  const { language } = useLanguage();
  
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };
  
  return { t, language };
}