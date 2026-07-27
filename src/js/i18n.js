const TRANSLATION_PATH = "i18n/translations.json";
const STORAGE_KEY = "bk_lang";

const getStoredLanguage = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const setStoredLanguage = (lang) => {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore storage errors
  }
};

const detectBrowserLang = (available) => {
  const browserLang = (navigator.language || "").toLowerCase();
  return browserLang.startsWith("en") && available.includes("en") ? "en" : available[0];
};

const escapeHtml = (str) =>
  String(str).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );

// Very small markdown-lite renderer: supports **bold**, [text](url) links,
// bare http(s) links, and blank-line separated paragraphs.
const formatText = (str) => {
  if (!str) return "";
  let out = escapeHtml(str);
  out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  out = out.replace(
    /\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );
  out = out.replace(
    /(^|[\s(])(https?:\/\/[^\s<]+)/g,
    (match, pre, url) => `${pre}<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`,
  );
  return out
    .split(/\n\n+/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");
};

const setToggleLabel = (lang) => {
  const toggleFi = document.querySelector("#langToggleFi");
  const toggleEn = document.querySelector("#langToggleEn");
  if (!toggleFi || !toggleEn) {
    return;
  }
  toggleFi.classList.toggle("active", lang === "fi");
  toggleEn.classList.toggle("active", lang === "en");
  toggleFi.setAttribute("aria-pressed", String(lang === "fi"));
  toggleEn.setAttribute("aria-pressed", String(lang === "en"));
};

const applyTranslations = (dictionary, lang) => {
  const translations = dictionary[lang] || {};

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    const text = key && translations[key];
    if (typeof text === "string") {
      node.textContent = text;
    }
  });

  document.querySelectorAll("[data-i18n-html]").forEach((node) => {
    const key = node.getAttribute("data-i18n-html");
    const text = key && translations[key];
    if (typeof text === "string") {
      node.innerHTML = formatText(text);
    }
  });

  document.querySelectorAll("[data-i18n-list]").forEach((node) => {
    const key = node.getAttribute("data-i18n-list");
    const items = key && translations[key];
    if (Array.isArray(items)) {
      node.innerHTML = items.map((item) => `<li>${formatText(item)}</li>`).join("");
    }
  });

  document.querySelectorAll("[data-i18n-attr]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    const attr = node.getAttribute("data-i18n-attr");
    const text = key && attr && translations[key];
    if (typeof text === "string") {
      node.setAttribute(attr, text);
    }
  });

  document.documentElement.lang = lang;
  if (typeof translations["landing.title"] === "string") {
    document.title = translations["landing.title"];
  }
  setToggleLabel(lang);
};

const initTranslations = async () => {
  let dictionary = {};
  try {
    const response = await fetch(TRANSLATION_PATH, { cache: "no-store" });
    if (response.ok) {
      dictionary = await response.json();
    }
  } catch {
    dictionary = {};
  }

  const available = Object.keys(dictionary);
  if (!available.length) {
    return;
  }

  const stored = getStoredLanguage();
  let currentLang = stored && available.includes(stored) ? stored : detectBrowserLang(available);

  applyTranslations(dictionary, currentLang);

  const toggleFi = document.querySelector("#langToggleFi");
  const toggleEn = document.querySelector("#langToggleEn");
  if (toggleFi && toggleEn) {
    const switchLang = (lang) => {
      if (!dictionary[lang] || lang === currentLang) {
        return;
      }
      currentLang = lang;
      setStoredLanguage(currentLang);
      applyTranslations(dictionary, currentLang);
    };
    toggleFi.addEventListener("click", () => switchLang("fi"));
    toggleEn.addEventListener("click", () => switchLang("en"));
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTranslations);
} else {
  initTranslations();
}


document.addEventListener("DOMContentLoaded", initTranslations);
