(function () {
  const body = document.body;
  const brandLink = document.querySelector(".brand");
  const localizedViews = Array.from(document.querySelectorAll("[data-lang-view]"));
  const switchButtons = Array.from(document.querySelectorAll(".js-lang-switch"));
  const inquiryForms = Array.from(document.querySelectorAll(".js-inquiry-form"));
  const descriptionMeta = document.querySelector('meta[name="description"]');
  const titles = {
    zh: "和兑 · 易经决策咨询",
    en: "Hedui · I Ching Decision Consulting",
  };
  const descriptions = {
    zh: "和兑 · 易经决策咨询。用《周易》的结构分析方法，为健康、教育、关系与法律问题提供判断路径与决策参考。",
    en: "Hedui · I Ching Decision Consulting. Structured analysis and decision guidance through the I Ching for health, education, relationships, and law.",
  };
  const topicLabels = {
    zh: {
      consulting: "综合咨询",
      health: "健康",
      education: "教育",
      relationship: "关系",
      law: "法律",
    },
    en: {
      consulting: "General Consulting",
      health: "Health",
      education: "Education",
      relationship: "Relationships",
      law: "Law",
    },
  };
  const formMessages = {
    invalid: {
      zh: "请至少填写姓名、邮箱和留言内容。",
      en: "Please provide your name, email address, and message.",
    },
    preparing: {
      zh: "正在准备邮件草稿...",
      en: "Preparing your email draft...",
    },
    ready: {
      zh: "已为你生成邮件草稿。请在邮件客户端中附加 PDF、DOC、DOCX 或其他材料后发送至 ",
      en: "A draft email has been prepared. You can attach PDF, DOC, DOCX, or other materials in your mail client before sending to ",
    },
    fallback: {
      zh: "如果未自动打开邮件客户端，请直接写信至 ",
      en: "If your email client did not open automatically, send your message directly to ",
    },
  };
  let currentLang = "en";

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
    currentLang = nextLang;
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
      const currentHash = window.location.hash;
      const targetLang = button.dataset.targetLang === "zh" ? "zh" : "en";

      applyLanguage(targetLang);

      if (currentHash === "#contact-en" || currentHash === "#contact-zh") {
        const nextHash = targetLang === "zh" ? "#contact-zh" : "#contact-en";
        const historyState =
          window.history.state && typeof window.history.state === "object"
            ? window.history.state
            : {};

        window.history.replaceState(
          { ...historyState, lang: targetLang },
          "",
          `${window.location.pathname}${window.location.search}${nextHash}`
        );

        const nextSection = document.querySelector(nextHash);

        if (nextSection) {
          nextSection.scrollIntoView();
        }
      }
    });
  });

  applyLanguage(getInitialLanguage());

  function buildMailDraft(payload, activeLang, recipient) {
    const topicLabel =
      topicLabels[activeLang][payload.topic] ||
      (activeLang === "zh" ? "综合咨询" : "General Consulting");
    const subject =
      activeLang === "zh"
        ? `和兑咨询｜${topicLabel}｜${payload.name}`
        : `Hedui Consultation | ${topicLabel} | ${payload.name}`;
    const lines =
      activeLang === "zh"
        ? [
            "您好，",
            "",
            "以下是通过和兑网站整理的咨询信息：",
            "",
            `姓名：${payload.name}`,
            `邮箱：${payload.email}`,
            `机构 / 公司：${payload.organization || "-"}`,
            `咨询方向：${topicLabel}`,
            `来源页面：${payload.page || window.location.pathname}`,
            "",
            "留言内容：",
            payload.message,
            "",
            "如有方案、简报、合同、日程或其他材料，我会在此邮件中附加 PDF、DOC、DOCX 等文件。",
          ]
        : [
            "Hello,",
            "",
            "The following consultation request was prepared from the Hedui site:",
            "",
            `Name: ${payload.name}`,
            `Email: ${payload.email}`,
            `Institution / Organization: ${payload.organization || "-"}`,
            `Consulting Area: ${topicLabel}`,
            `Source Page: ${payload.page || window.location.pathname}`,
            "",
            "Message:",
            payload.message,
            "",
            "I may attach project briefs, schedules, agreements, or other supporting documents in PDF, DOC, or DOCX format to this email.",
          ];

    return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
  }

  inquiryForms.forEach((form) => {
    const statusEl = form.querySelector(".form-status");
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      const activeLang = body.dataset.lang || currentLang;
      payload.lang = activeLang;
      payload.page = form.dataset.page || window.location.pathname;
      const recipient = form.dataset.recipient || "consult@ichingciv.com";

      if (!payload.name || !payload.email || !payload.message) {
        if (statusEl) {
          statusEl.textContent = formMessages.invalid[activeLang];
        }
        return;
      }

      if (statusEl) {
        statusEl.textContent = formMessages.preparing[activeLang];
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute("aria-busy", "true");
      }

      const mailtoUrl = buildMailDraft(payload, activeLang, recipient);
      window.location.href = mailtoUrl;

      if (statusEl) {
        statusEl.textContent =
          formMessages.ready[activeLang] +
          recipient +
          " " +
          formMessages.fallback[activeLang] +
          recipient +
          (activeLang === "zh" ? "。" : ".");
      }

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
      }
    });
  });
})();
