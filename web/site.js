const savedLanguage = localStorage.getItem("lecturehelper.siteLanguage") || "en";
document.body.dataset.lang = savedLanguage === "fr" ? "fr" : "en";
document.documentElement.lang = document.body.dataset.lang;

for (const button of document.querySelectorAll("[data-set-lang]")) {
  button.addEventListener("click", () => {
    const language = button.dataset.setLang === "fr" ? "fr" : "en";
    document.body.dataset.lang = language;
    document.documentElement.lang = language;
    localStorage.setItem("lecturehelper.siteLanguage", language);
  });
}
