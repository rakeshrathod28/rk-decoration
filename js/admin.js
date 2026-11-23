// Admin panel: login, bookings management, blocked dates, CSV export
(function () {
  const RK = window.RK, DB = window.RKDB, cfg = window.RK_CONFIG;
  const esc = RK.escapeHtml;
  const $ = (id) => document.getElementById(id);
  let bookings = [];

  RK.applyConfig();
  if (DB.whatsappOnly) {
    $("loginView").classList.remove("hidden");
    $("loginForm").innerHTML = "<h2>Admin panel not connected</h2><p>The site is in WhatsApp-only mode. Bookings arrive on your WhatsApp. " +
      "Add Supabase keys in js/config.js (see README) to enable this admin panel.</p>";
    return;
  }
  if (DB.isDemo) $("demoHint").classList.remove("hidden");

  async function init() {
    const session = await DB.getSession();
    $("loginView").classList.toggle("hidden", !!session);
    $("dashView").classList.toggle("hidden", !session);
    $("logoutBtn").classList.toggle("hidden", !session);
    if (session) await Promise.all([loadBookings(), loadBlocked()]);
  }

  $("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    $("loginError").textContent = "";
    try {
      await DB.signIn(e.target.email.value.trim(), e.target.password.value);
      e.target.reset();
      init();
    } catch (err) {
      $("loginError").textContent = err.message || "Login failed";
    }
  });
  $("logoutBtn").addEventListener("click", async () => { await DB.signOut(); init(); });

  // ----- Bookings -----
  async function loadBookings() {
    try {
      bookings = await DB.listBookings();
      renderStats();
      renderRows();
    } catch (err) {
      console.error(err);
      RK.toast("Could not load bookings: " + err.message, "err");
    }
  }

  function renderStats() {
    const today = RK.todayISO();
    const active = bookings.filter((b) => b.status !== "cancelled");
    const collected = bookings.reduce((s, b) =>
      s + (b.payment_status === "paid" ? b.total_amount : b.payment_status === "advance_paid" ? b.advance_amount : 0), 0);
    const stats = [
      ["Today's events", active.filter((b) => b.event_date === today).length],
      ["Upcoming", active.filter((b) => b.event_date > today).length],
      ["Pending confirmation", bookings.filter((b) => b.status === "pending").length],
      ["Payments to verify", bookings.filter((b) => b.payment_ref && b.payment_status === "unpaid").length],
      ["Total bookings", bookings.length],
      ["Collected (est.)", RK.inr(collected)]
    ];
    $("stats").innerHTML = stats.map(([k, v]) => `<div class="stat card"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join("");
  }

  function filtered() {
    const q = $("search").value.trim().toLowerCase();
    const st = $("statusFilter").value;
    const when = $("whenFilter").value;
    const today = RK.todayISO();
    return bookings.filter((b) => {
      if (st && b.status !== st) return false;
      if (when === "upcoming" && b.event_date < today) return false;
      if (when === "today" && b.event_date !== today) return false;
      if (when === "past" && b.event_date >= today) return false;
      if (q && ![b.name, b.phone, b.booking_code, b.event_type, b.venue].join(" ").toLowerCase().includes(q)) return false;
      return true;
    });
  }

  const opts = (list, val) => list.map((o) => `<option value="${o}"${o === val ? " selected" : ""}>${o.replace("_", " ")}</option>`).join("");

  function renderRows() {
    const rows = filtered();
    $("bookingRows").innerHTML = rows.length ? rows.map((b) => {
      const waMsg = `Hello ${b.name}, this is ${cfg.businessName}. Your booking ${b.booking_code} for ${b.event_type} on ${RK.formatDate(b.event_date)} is ${b.status}.`;
      return `<tr data-id="${esc(b.id)}">
        <td><strong>${RK.formatDate(b.event_date)}</strong><br><span class="muted small">${esc(b.event_time)}</span><br><code>${esc(b.booking_code)}</code></td>
        <td>${esc(b.name)}<br><a href="tel:${esc(b.phone)}">${esc(b.phone)}</a>${b.email ? `<br><span class="small">${esc(b.email)}</span>` : ""}</td>
        <td><strong>${esc(b.event_type)}</strong> – ${esc(b.package)}
          ${b.addons && b.addons.length ? `<br><span class="small">+ ${esc(b.addons.join(", "))}</span>` : ""}
          <br><span class="small">📍 ${esc(b.venue)}</span>
          ${b.guests ? `<br><span class="small">👥 ${esc(b.guests)} guests</span>` : ""}
          ${b.notes ? `<br><span class="small">📝 ${esc(b.notes)}</span>` : ""}</td>
        <td>${RK.inr(b.total_amount)}<br><span class="small">Adv ${RK.inr(b.advance_amount)}</span>
          ${b.payment_ref ? `<br><span class="small">UTR: <code>${esc(b.payment_ref)}</code></span>` : ""}</td>
        <td>
          <select data-field="status">${opts(["pending", "confirmed", "completed", "cancelled"], b.status)}</select>
          <select data-field="payment_status">${opts(["unpaid", "advance_paid", "paid"], b.payment_status)}</select>
          <textarea data-field="admin_notes" rows="2" placeholder="Private notes">${esc(b.admin_notes || "")}</textarea>
        </td>
        <td class="actions">
          <a class="btn btn-sm btn-wa" target="_blank" rel="noopener" href="${RK.waLink(waMsg, "91" + RK.normalizePhone(b.phone))}">WhatsApp</a>
          <a class="btn btn-sm btn-outline" href="tel:${esc(b.phone)}">Call</a>
        </td></tr>`;
    }).join("") : '<tr><td colspan="6" class="center muted">No bookings found.</td></tr>';
  }

  $("bookingRows").addEventListener("change", async (e) => {
    const field = e.target.dataset.field;
    if (!field) return;
    const id = e.target.closest("tr").dataset.id;
    try {
      await DB.updateBooking(id, { [field]: e.target.value || null });
      const b = bookings.find((x) => String(x.id) === id);
      if (b) b[field] = e.target.value || null;
      renderStats();
      if (field === "status") renderRows();
      RK.toast("Saved", "ok");
    } catch (err) {
      RK.toast("Save failed: " + err.message, "err");
    }
  });

  ["search", "statusFilter", "whenFilter"].forEach((id) => $(id).addEventListener("input", renderRows));
  $("refreshBtn").addEventListener("click", loadBookings);

  $("exportBtn").addEventListener("click", () => {
    const cols = ["booking_code", "created_at", "event_date", "event_time", "name", "phone", "email", "event_type", "package", "addons", "venue", "guests", "notes", "total_amount", "advance_amount", "status", "payment_status", "payment_ref", "admin_notes"];
    const cell = (v) => {
      let s = Array.isArray(v) ? v.join("; ") : v == null ? "" : String(v);
      if (/^[=+\-@]/.test(s)) s = "'" + s; // prevent spreadsheet formula injection
      return '"' + s.replace(/"/g, '""') + '"';
    };
    const csv = [cols.join(","), ...filtered().map((b) => cols.map((c) => cell(b[c])).join(","))].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv" }));
    a.download = "rk-bookings-" + RK.todayISO() + ".csv";
    a.click();
  });

  // ----- Blocked dates -----
  async function loadBlocked() {
    try {
      const list = await DB.listBlockedDates();
      $("blockedList").innerHTML = list.length ? list.map((d) =>
        `<li><span>${RK.formatDate(d.day)}${d.reason ? " – " + esc(d.reason) : ""}</span>
         <button class="btn btn-sm btn-outline" data-unblock="${esc(d.day)}">Unblock</button></li>`).join("")
        : '<li class="muted">No blocked dates.</li>';
    } catch (err) {
      RK.toast("Could not load blocked dates: " + err.message, "err");
    }
  }

  $("blockForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await DB.addBlockedDate(e.target.day.value, e.target.reason.value.trim() || null);
      e.target.reset();
      loadBlocked();
      RK.toast("Date blocked", "ok");
    } catch (err) {
      RK.toast(err.message, "err");
    }
  });

  $("blockedList").addEventListener("click", async (e) => {
    const day = e.target.dataset.unblock;
    if (!day) return;
    await DB.removeBlockedDate(day);
    loadBlocked();
  });

  init();
})();
