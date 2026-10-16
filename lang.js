() => {
  const DEFAULT_LANGUAGE = "en";
  const SUPPORTED_LANGUAGES = ["en", "es", "pt", "it", "fr", "ru", "zh", "ja", "ko"];
  let currentLanguage = DEFAULT_LANGUAGE;
  let currentMessages = {};

  function getMessage(messages, key) {
    return key.split(".").reduce((value, part) => {
      return value && Object.prototype.hasOwnProperty.call(value, part)
        ? value[part]
        : undefined;
    }, messages);
  }

  function applyTranslations(messages) {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      const value = getMessage(messages, key);
      if (typeof value === "string") element.textContent = value;
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
      const key = element.getAttribute("data-i18n-aria-label");
      const value = getMessage(messages, key);
      if (typeof value === "string") element.setAttribute("aria-label", value);
    });

    document.documentElement.lang = currentLanguage;
  }

  async function loadLanguage(language) {
    const code = SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
    try {
      const response = await fetch(`lang/${encodeURIComponent(code)}.json`, {
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error(`Could not load lang/${code}.json (${response.status})`);
      const messages = await response.json();
      currentLanguage = code;
      currentMessages = messages;
      applyTranslations(currentMessages);
      localStorage.setItem("nobs-cert-prep-language", code);
      return true;
    } catch (error) {
      console.error("Language load failed:", error);
      if (code !== DEFAULT_LANGUAGE) return loadLanguage(DEFAULT_LANGUAGE);
      return false;
    }
  }

  function initializeLanguageSelector() {
    const selector = document.getElementById("language-select");
    if (!selector) return;
    const saved = localStorage.getItem("nobs-cert-prep-language");
    const browserLanguage = (navigator.language || "en").split("-")[0].toLowerCase();
    const initial = saved || (SUPPORTED_LANGUAGES.includes(browserLanguage) ? browserLanguage : DEFAULT_LANGUAGE);
    selector.value = SUPPORTED_LANGUAGES.includes(initial) ? initial : DEFAULT_LANGUAGE;
    selector.addEventListener("change", () => loadLanguage(selector.value));
    loadLanguage(selector.value);
  }

  // Expose a small API for dynamically added content or manual language changes.
  window.NoBSI18n = {
    loadLanguage,
    translate: (key) => {
      const value = getMessage(currentMessages, key);
      return typeof value === "string" ? value : key;
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeLanguageSelector, { once: true });
  } else {
    initializeLanguageSelector();
  }
})();
