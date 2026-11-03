const LANGUAGE_STORAGE_KEY = "lecturehelper.siteLanguage";
const pageLanguages = (document.body.dataset.langs || "en fr").split(/\s+/);

function readSavedLanguage() {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function getPreferredLanguage() {
  const saved = readSavedLanguage();
  if (saved) return saved;
  const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language || "en"];
  return browserLanguages.map((language) => language.toLowerCase().split("-")[0]).find((language) => pageLanguages.includes(language)) || "en";
}

function applyLanguage(language) {
  const pageLanguage = pageLanguages.includes(language) ? language : "en";
  document.body.dataset.lang = pageLanguage;
  document.documentElement.lang = pageLanguage;
  for (const button of document.querySelectorAll("[data-set-lang]")) {
    button.setAttribute("aria-pressed", String(button.dataset.setLang === pageLanguage));
  }
}

applyLanguage(getPreferredLanguage());

for (const button of document.querySelectorAll("[data-set-lang]")) {
  button.addEventListener("click", () => {
    const language = button.dataset.setLang;
    applyLanguage(language);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Language choice is a convenience; the page still works without storage.
    }
  });
}
