(function () {
  const header = document.getElementById("header");
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  const topBar = document.getElementById("topBar");
  const topBarClose = document.getElementById("topBarClose");
  const leadForm = document.getElementById("leadForm");
  const formStatus = document.getElementById("formStatus");
  const submitBtn = document.getElementById("submitBtn");
  const yearEl = document.getElementById("year");

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  topBarClose?.addEventListener("click", () => {
    topBar?.classList.add("hidden");
    document.body.classList.add("no-bar");
  });

  window.addEventListener(
    "scroll",
    () => header?.classList.toggle("is-scrolled", window.scrollY > 16),
    { passive: true }
  );

  burger?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
  });

  document.querySelectorAll(".nav a, .footer a").forEach((a) => {
    a.addEventListener("click", () => nav?.classList.remove("open"));
  });

  function setMsg(text, type) {
    if (!formStatus) return;
    formStatus.textContent = text;
    formStatus.className = "form-msg" + (type ? " " + type : "");
  }

  function setLoading(on) {
    if (!submitBtn) return;
    submitBtn.disabled = on;
    const txt = submitBtn.querySelector(".btn__txt");
    const load = submitBtn.querySelector(".btn__load");
    if (txt) txt.hidden = on;
    if (load) load.hidden = !on;
  }

  leadForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMsg("");

    const url = window.NXT_STOCK_CONFIG?.GOOGLE_SHEET_WEB_APP_URL?.trim();
    if (!url) {
      setMsg("Add Google Sheet URL in config.js", "err");
      return;
    }

    const fd = new FormData(leadForm);
    const payload = {
      timestamp: new Date().toISOString(),
      name: fd.get("name"),
      phone: fd.get("phone"),
      email: fd.get("email"),
      city: fd.get("city"),
      coachingType: fd.get("coachingType"),
      niche: fd.get("niche") || "",
      message: "",
      source: "Nxt Stock Website",
    };

    setLoading(true);
    try {
      await fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setMsg("Thanks! We'll contact you within 24 hours.", "ok");
      leadForm.reset();
    } catch {
      setMsg("Error — please call or WhatsApp us.", "err");
    } finally {
      setLoading(false);
    }
  });
})();
