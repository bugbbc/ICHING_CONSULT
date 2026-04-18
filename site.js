(function () {
  const body = document.body;
  const brandLink = document.querySelector(".brand");
  const localizedViews = Array.from(document.querySelectorAll("[data-lang-view]"));
  const switchButtons = Array.from(document.querySelectorAll(".js-lang-switch"));
  const descriptionMeta = document.querySelector('meta[name="description"]');
  const titles = {
    zh: "和兑 · 易经决策咨询",
    en: "Hedui · I Ching Decision Consulting",
  };
  const descriptions = {
    zh: "和兑 · 易经决策咨询。用《周易》的结构分析方法，为健康、教育、关系与法律问题提供判断路径与决策参考。",
    en: "Hedui · I Ching Decision Consulting. Structured analysis and decision guidance through the I Ching for health, education, relationships, and law.",
  };

  function readOneTimeLanguage() {
    try {
      const stored = window.sessionStorage.getItem("ichingcivLangOnce");

      if (stored === "zh" || stored === "en") {
        window.sessionStorage.removeItem("ichingcivLangOnce");
        return stored;
      }
    } catch (error) {
      return null;
    }

    return null;
  }

  function getInitialLanguage() {
    const historyState = window.history.state;

    if (historyState && (historyState.lang === "zh" || historyState.lang === "en")) {
      return historyState.lang;
    }

    return readOneTimeLanguage() || "en";
  }

  function getCleanUrl() {
    const currentUrl = new URL(window.location.href);

    if (currentUrl.pathname === "/index.html") {
      currentUrl.pathname = "/";
    }

    return `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
  }

  function applyLanguage(nextLang) {
    body.dataset.lang = nextLang;
    document.documentElement.lang = nextLang === "zh" ? "zh-CN" : "en";
    document.title = titles[nextLang];

    if (brandLink) {
      brandLink.setAttribute("aria-label", nextLang === "zh" ? "和兑首页" : "Hedui Home");
    }

    if (descriptionMeta) {
      descriptionMeta.setAttribute("content", descriptions[nextLang]);
    }

    localizedViews.forEach((element) => {
      element.hidden = element.dataset.langView !== nextLang;
    });

    switchButtons.forEach((button) => {
      const targetLang = nextLang === "zh" ? "en" : "zh";
      const zhLabel = button.querySelector('[data-switch-target="zh"]');
      const enLabel = button.querySelector('[data-switch-target="en"]');

      button.dataset.targetLang = targetLang;
      button.setAttribute(
        "aria-label",
        targetLang === "zh" ? "切换到中文界面" : "Switch to English interface"
      );

      if (zhLabel) {
        zhLabel.hidden = targetLang !== "zh";
      }

      if (enLabel) {
        enLabel.hidden = targetLang !== "en";
      }
    });

    const historyState =
      window.history.state && typeof window.history.state === "object"
        ? window.history.state
        : {};

    window.history.replaceState({ ...historyState, lang: nextLang }, "", getCleanUrl());
  }

  switchButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetLang = button.dataset.targetLang === "zh" ? "zh" : "en";
      applyLanguage(targetLang);
    });
  });

  applyLanguage(getInitialLanguage());
})();
