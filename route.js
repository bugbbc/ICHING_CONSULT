(function () {
  const currentUrl = new URL(window.location.href);
  const lang = /^\/zh(?:\/|$)/.test(currentUrl.pathname) ? "zh" : "en";

  try {
    window.sessionStorage.setItem("ichingcivLangOnce", lang);
  } catch (error) {
    // Ignore storage failures and continue with a clean redirect.
  }

  currentUrl.pathname = "/";
  window.location.replace(currentUrl.href);
})();
