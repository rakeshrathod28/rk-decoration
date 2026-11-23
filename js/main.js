// Home page: services, gallery, reviews, FAQ and booking form
(function () {
  const cfg = window.RK_CONFIG;
  const data = window.RK_DATA;
  const RK = window.RK;
  const esc = RK.escapeHtml;

  RK.applyConfig();
  document.getElementById("mapFrame").src = "https://www.google.com/maps?q=" + encodeURIComponent(cfg.mapQuery) + "&output=embed";
  document.getElementById("reviewLink").href = RK.waLink("Hi " + cfg.businessName + ", here is my review: ");

  // ----- Services -----
  const minPrice = (s) => Math.min(...s.packages.map((p) => p.price));
  document.getElementById("servicesGrid").innerHTML = data.services.map((s) => `
    <article class="card service">
      <div class="service-icon">${s.icon}</div>
      <h3>${esc(s.name)}</h3>
      <p class="muted">${esc(s.desc)}</p>
      <p class="price">Starting ${RK.inr(minPrice(s))}</p>
      <details>
        <summary>View packages</summary>
        ${s.packages.map((p) => `
          <div class="pkg">
            <div class="pkg-head"><strong>${esc(p.name)}</strong><span>${RK.inr(p.price)}</span></div>
            <ul>${p.includes.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
            <button type="button" class="btn btn-sm" data-book="${esc(s.id)}" data-pkg="${esc(p.name)}">Book ${esc(p.name)}</button>
          </div>`).join("")}
      </details>
      <button type="button" class="btn btn-outline btn-sm" data-book="${esc(s.id)}">Book this</button>
    </article>`).join("");

  // ----- Gallery -----
  const cats = ["all", ...new Set(data.gallery.map((g) => g.category))];
  const catName = (c) => (c === "all" ? "All" : (data.services.find((s) => s.id === c) || { name: c }).name);
  const filters = document.getElementById("galleryFilters");
  filters.innerHTML = cats.map((c, i) => `<button type="button" class="chip${i === 0 ? " active" : ""}" data-cat="${esc(c)}">${esc(catName(c))}</button>`).join("");
  function renderGallery(cat) {
    document.getElementById("galleryGrid").innerHTML = data.gallery
      .filter((g) => cat === "all" || g.category === cat)
      .map((g) => `<figure class="gallery-item">
        ${g.src ? `<img src="${esc(g.src)}" alt="${esc(g.title)}" loading="lazy">` : `<div class="placeholder">${g.icon || "🎉"}</div>`}
        <figcaption>${esc(g.title)}</figcaption></figure>`).join("");
  }
  filters.addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    filters.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === b));
    renderGallery(b.dataset.cat);
  });
  renderGallery("all");

  // ----- Reviews & FAQ -----
  document.getElementById("reviewsGrid").innerHTML = data.reviews.map((r) => `
    <blockquote class="card review"><div class="stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
    <p>“${esc(r.text)}”</p><cite>– ${esc(r.name)}</cite></blockquote>`).join("");
  document.getElementById("faqList").innerHTML = data.faqs.map((f) => `
    <details class="faq"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");

  // ----- Booking form -----
  const form = document.getElementById("bookingForm");
  const dateMsg = document.getElementById("dateMsg");
  const formError = document.getElementById("formError");
  let unavailable = [];

  form.service.innerHTML = '<option value="">Select event type</option>' + data.services.map((s) => `<option value="${esc(s.id)}">${s.icon} ${esc(s.name)}</option>`).join("");
  form.event_time.innerHTML = data.timeSlots.map((t) => `<option>${esc(t)}</option>`).join("");
  document.getElementById("addonsList").innerHTML = data.addons.map((a) => `
    <label class="check"><input type="checkbox" name="addon" value="${esc(a.id)}"> ${esc(a.name)} <span class="muted">+${RK.inr(a.price)}</span></label>`).join("");
  const minDate = RK.addDaysISO(cfg.minNoticeDays);
  form.event_date.min = minDate;

  function fillPackages(selected) {
    const s = data.services.find((x) => x.id === form.service.value);
    form.package.innerHTML = s
      ? s.packages.map((p) => `<option value="${esc(p.name)}"${p.name === selected ? " selected" : ""}>${esc(p.name)} – ${RK.inr(p.price)}</option>`).join("")
      : '<option value="">Select event type first</option>';
  }

  function calc() {
    const s = data.services.find((x) => x.id === form.service.value);
    const p = s && s.packages.find((x) => x.name === form.package.value);
    const addons = [...form.querySelectorAll('input[name="addon"]:checked')].map((i) => data.addons.find((a) => a.id === i.value));
    const total = (p ? p.price : 0) + addons.reduce((sum, a) => sum + a.price, 0);
    return { s, p, addons, total, advance: Math.round((total * cfg.advancePercent) / 100) };
  }

  function renderSummary() {
    const { s, p, addons, total, advance } = calc();
    document.getElementById("summaryBody").innerHTML = !p
      ? '<p class="muted">Select an event type and package to see the price.</p>'
      : `<p><strong>${esc(s.name)}</strong><br>${esc(p.name)} package – ${RK.inr(p.price)}</p>
         <ul class="muted">${p.includes.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
         ${addons.length ? `<p><strong>Add-ons</strong></p><ul>${addons.map((a) => `<li>${esc(a.name)} – ${RK.inr(a.price)}</li>`).join("")}</ul>` : ""}
         ${form.event_date.value ? `<p>📅 ${RK.formatDate(form.event_date.value)}<br>🕘 ${esc(form.event_time.value)}</p>` : ""}
         <div class="total"><span>Estimated total</span><strong>${RK.inr(total)}</strong></div>
         <div class="total adv"><span>Advance (${cfg.advancePercent}%)</span><strong>${RK.inr(advance)}</strong></div>
         <p class="muted small">Final price may vary for venue size & travel outside ${esc(cfg.city)}.</p>`;
  }

  function checkDate() {
    const d = form.event_date.value;
    dateMsg.className = "field-msg";
    if (!d) { dateMsg.textContent = ""; return true; }
    if (d < minDate) {
      dateMsg.textContent = "Please choose a date from " + RK.formatDate(minDate) + " onwards.";
      dateMsg.classList.add("err");
      return false;
    }
    if (unavailable.includes(d)) {
      dateMsg.textContent = "Sorry, " + RK.formatDate(d) + " is fully booked. Please choose another date or WhatsApp us.";
      dateMsg.classList.add("err");
      return false;
    }
    dateMsg.textContent = "✅ " + RK.formatDate(d) + " is available.";
    dateMsg.classList.add("ok-text");
    return true;
  }

  async function loadUnavailable() {
    try { unavailable = await window.RKDB.getUnavailableDates(); } catch (e) { console.warn(e); }
  }

  form.service.addEventListener("change", () => { fillPackages(); renderSummary(); });
  form.addEventListener("change", (e) => { if (e.target.name === "event_date") checkDate(); renderSummary(); });

  document.getElementById("servicesGrid").addEventListener("click", (e) => {
    const b = e.target.closest("[data-book]");
    if (!b) return;
    form.service.value = b.dataset.book;
    fillPackages(b.dataset.pkg);
    renderSummary();
    document.getElementById("book").scrollIntoView({ behavior: "smooth" });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    formError.textContent = "";
    const { s, p, addons, total, advance } = calc();
    const f = form;
    const errors = [];
    if (!f.name.value.trim()) errors.push("Enter your name.");
    if (!RK.isValidPhone(f.phone.value)) errors.push("Enter a valid 10-digit mobile number.");
    if (f.email.value && !f.email.checkValidity()) errors.push("Enter a valid email.");
    if (!p) errors.push("Choose event type and package.");
    if (!f.event_date.value) errors.push("Choose event date.");
    else if (!checkDate()) errors.push("Choose another date.");
    if (!f.venue.value.trim()) errors.push("Enter venue address.");
    if (!f.agree.checked) errors.push("Please accept the booking policy.");
    if (errors.length) { formError.textContent = errors.join(" "); return; }

    const booking = {
      name: f.name.value.trim(),
      phone: RK.normalizePhone(f.phone.value),
      email: f.email.value.trim() || null,
      event_type: s.name,
      package: p.name,
      addons: addons.map((a) => a.name),
      event_date: f.event_date.value,
      event_time: f.event_time.value,
      venue: f.venue.value.trim(),
      guests: f.guests.value ? parseInt(f.guests.value, 10) : null,
      notes: f.notes.value.trim() || null,
      total_amount: total,
      advance_amount: advance
    };

    const btn = document.getElementById("submitBtn");
    btn.disabled = true;
    btn.textContent = "Booking...";
    try {
      const { booking_code } = await window.RKDB.createBooking(booking);
      showSuccess({ ...booking, booking_code });
    } catch (err) {
      console.error(err);
      if (err.message === "DATE_UNAVAILABLE") {
        await loadUnavailable();
        checkDate();
        formError.textContent = "That date just got fully booked. Please pick another date.";
      } else {
        formError.textContent = "Something went wrong. Please try again or WhatsApp us.";
      }
    } finally {
      btn.disabled = false;
      btn.textContent = "Confirm Booking Request";
    }
  });

  function showSuccess(b) {
    const msg = `Hi ${cfg.businessName}, I have booked a decoration.
Booking ID: ${b.booking_code}
Name: ${b.name}
Phone: ${b.phone}
Event: ${b.event_type} (${b.package})
Add-ons: ${b.addons.join(", ") || "None"}
Date: ${RK.formatDate(b.event_date)}, ${b.event_time}
Venue: ${b.venue}
Total: ${RK.inr(b.total_amount)} | Advance: ${RK.inr(b.advance_amount)}
Notes: ${b.notes || "-"}`;
    const box = document.getElementById("bookingSuccess");
    const waOnly = window.RKDB.whatsappOnly;
    box.innerHTML = `
      <h2>${waOnly ? "📲 One last step – send your booking on WhatsApp" : "🎉 Booking request received!"}</h2>
      ${waOnly ? `<p class="err"><strong>Your booking is NOT complete until you tap the green button below and press Send in WhatsApp.</strong></p>` : ""}
      <p>Your Booking ID: <strong class="code">${esc(b.booking_code)}</strong></p>
      ${waOnly ? "" : `<p class="muted">Save this ID. Use it with your mobile number on the <a href="track.html">Track Booking</a> page.</p>`}
      <div class="success-grid">
        <div>
          <p><strong>${esc(b.event_type)}</strong> – ${esc(b.package)}<br>📅 ${RK.formatDate(b.event_date)}, ${esc(b.event_time)}<br>📍 ${esc(b.venue)}</p>
          <p>Total: <strong>${RK.inr(b.total_amount)}</strong> · Advance: <strong>${RK.inr(b.advance_amount)}</strong></p>
          <a class="btn btn-wa" target="_blank" rel="noopener" href="${RK.waLink(msg)}">📲 Send booking details on WhatsApp</a>
          <p class="muted small">Your date is confirmed after we verify the advance and call you.</p>
          <button type="button" class="btn btn-outline btn-sm" id="newBooking">Make another booking</button>
        </div>
        ${RK.paymentBox(b)}
      </div>`;
    RK.bindUtrForms(box, b.phone);
    document.getElementById("newBooking").addEventListener("click", () => {
      box.classList.add("hidden");
      document.querySelector(".book-layout").classList.remove("hidden");
      loadUnavailable();
    });
    form.reset();
    fillPackages();
    renderSummary();
    dateMsg.textContent = "";
    document.querySelector(".book-layout").classList.add("hidden");
    box.classList.remove("hidden");
    box.scrollIntoView({ behavior: "smooth" });
    loadUnavailable();
  }

  fillPackages();
  renderSummary();
  loadUnavailable();
})();
