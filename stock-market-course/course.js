(function () {
  const header = document.getElementById("header");
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  const topBar = document.getElementById("topBar");
  const topBarClose = document.getElementById("topBarClose");
  const courseLeadForm = document.getElementById("courseLeadForm");
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

  courseLeadForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMsg("");

    const url = window.NXT_STOCK_CONFIG?.GOOGLE_SHEET_WEB_APP_URL?.trim();
    if (!url) {
      setMsg("Setup is incomplete. Apps Script URL is missing in config.js.", "err");
      return;
    }

    // Form validation
    const fd = new FormData(courseLeadForm);
    const name = fd.get("name")?.trim();
    const city = fd.get("city")?.trim();
    const experience = fd.get("experience");
    const phone = fd.get("phone")?.trim();
    const email = fd.get("email")?.trim();

    if (!name || !city || !experience || !phone || !email) {
      setMsg("Please fill out all required fields.", "err");
      return;
    }

    const payload = {
      timestamp: new Date().toISOString(),
      name: name,
      phone: phone,
      email: email,
      city: city,
      coachingType: experience, // map experience level to this field
      niche: "Stock Market Course",
      message: `Trading Experience Level: ${experience}`,
      source: "Stock Market Course Page",
    };

    setLoading(true);
    try {
      await fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setMsg("Application submitted! We'll contact you within 2 hours with access details.", "ok");
      courseLeadForm.reset();
    } catch (err) {
      setMsg("Error submitting form. Please WhatsApp us directly.", "err");
      console.error(err);
    } finally {
      setLoading(false);
    }
  });
})();
