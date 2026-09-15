import as from "@/locales/as.json";
import bn from "@/locales/bn.json";
import brx from "@/locales/brx.json";
import doi from "@/locales/doi.json";
import en from "@/locales/en.json";
import gu from "@/locales/gu.json";
import hi from "@/locales/hi.json";
import kn from "@/locales/kn.json";
import kok from "@/locales/kok.json";
import ks from "@/locales/ks.json";
import mai from "@/locales/mai.json";
import ml from "@/locales/ml.json";
import mni from "@/locales/mni.json";
import mr from "@/locales/mr.json";
import ne from "@/locales/ne.json";
import or from "@/locales/or.json";
import pa from "@/locales/pa.json";
import sa from "@/locales/sa.json";
import sat from "@/locales/sat.json";
import sd from "@/locales/sd.json";
import ta from "@/locales/ta.json";
import te from "@/locales/te.json";
import ur from "@/locales/ur.json";

export const languages = [
  ["en", "English", "English"],
  ["as", "Assamese", "অসমীয়া"],
  ["bn", "Bengali", "বাংলা"],
  ["brx", "Bodo", "बड़ो"],
  ["doi", "Dogri", "डोगरी"],
  ["gu", "Gujarati", "ગુજરાતી"],
  ["hi", "Hindi", "हिन्दी"],
  ["kn", "Kannada", "ಕನ್ನಡ"],
  ["ks", "Kashmiri", "کٲشُر / कश्मीरी"],
  ["kok", "Konkani", "कोंकणी"],
  ["mai", "Maithili", "मैथिली"],
  ["ml", "Malayalam", "മലയാളം"],
  ["mni", "Manipuri/Meitei", "মৈতৈলোন্ / ꯃꯤꯇꯩ ꯂꯣꯟ"],
  ["mr", "Marathi", "मराठी"],
  ["ne", "Nepali", "नेपाली"],
  ["or", "Odia", "ଓଡ଼ିଆ"],
  ["pa", "Punjabi", "ਪੰਜਾਬੀ"],
  ["sa", "Sanskrit", "संस्कृतम्"],
  ["sat", "Santali", "ᱥᱟᱱᱛᱟᱲᱤ"],
  ["sd", "Sindhi", "सिन्धी / سنڌي"],
  ["ta", "Tamil", "தமிழ்"],
  ["te", "Telugu", "తెలుగు"],
  ["ur", "Urdu", "اردو"],
] as const;

export type Locale = (typeof languages)[number][0];
type TranslationMap = Record<string, string>;

const supplementalEnglish: TranslationMap = {
  findingEarlyExitTitle: "Leaving early could cost you",
  findingEarlyExitExplanation: "This passage describes a potential cost for leaving early. Check the trigger, amount and exceptions. Enforceability needs professional review.",
  findingEarlyExitQuestion: "When does the early-exit charge apply, and are there exceptions?",
  findingDiscretionTitle: "One party controls the decision",
  findingDiscretionExplanation: "This wording gives one party discretion. Ask for objective criteria and supporting records before agreeing.",
  findingDiscretionQuestion: "Can deductions require itemised receipts and an agreed process?",
  findingNoticePeriodsTitle: "Check the notice periods",
  findingNoticePeriodsExplanation: "Check how much notice each party must give and how it must be delivered. Different periods are not automatically unlawful.",
  findingNoticePeriodsQuestion: "What notice must each party give, and how should it be delivered?",
  findingUndefinedResponsibilityTitle: "A responsibility needs clearer wording",
  findingUndefinedResponsibilityExplanation: "Broad or undefined terms can make responsibilities hard to understand. Ask for examples and limits.",
  findingUndefinedResponsibilityQuestion: "Can this responsibility be defined with examples and a cost limit?",
  findingRecurringCostTitle: "Check the full recurring cost",
  findingRecurringCostExplanation: "Review recurring payments, extra charges and due dates together. This topic flag does not establish that the terms are safe.",
  findingRecurringCostQuestion: "What additional charges can be added, and when are payments due?",
  evidenceAgreement: "Original agreement and all attachments",
  evidenceReceipts: "Payment receipts and transaction references",
  evidenceMessages: "Relevant emails and messages",
  evidencePhotos: "Dated photographs and handover records",
  evidenceTimeline: "A timeline of events in your own words",
  questionNotice: "What does the notice clause say?",
  questionDeposit: "What are the deposit conditions?",
  questionEarlyExit: "What happens if I leave early?",
};

export const translations: Record<Locale, TranslationMap> = {
  en: { ...en, ...supplementalEnglish }, as, bn, brx, doi, gu, hi, kn, ks, kok, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur,
};

export const rtlLocales: Locale[] = ["ks", "sd", "ur"];

export function isLocale(value: string | null): value is Locale {
  return languages.some(([code]) => code === value);
}

export function getDirection(locale: Locale) {
  return rtlLocales.includes(locale) ? "rtl" : "ltr";
}

export function translate(locale: Locale, key: string, fallback?: string) {
  return translations[locale][key] ?? translations.en[key] ?? fallback ?? key;
}

export function languageLabel(locale: Locale) {
  const match = languages.find(([code]) => code === locale) ?? languages[0];
  return { english: match[1], native: match[2] };
}
