// Shared helpers used on all pages
(function () {
  const cfg = window.RK_CONFIG;

  const RK = {
    escapeHtml(value) {
      return String(value == null ? "" : value)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    },
    inr(n) {
      return "₹" + Number(n || 0).toLocaleString("en-IN");
    },
    toISO(d) {
      const pad = (x) => String(x).padStart(2, "0");
      return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    },
    todayISO() {
      return RK.toISO(new Date());
    },
    addDaysISO(days) {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return RK.toISO(d);
    },
    formatDate(iso) {
      if (!iso) return "";
      const [y, m, d] = iso.split("-").map(Number);
      return new Date(y, m - 1, d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
    },
    normalizePhone(p) {
      return String(p || "").replace(/\D/g, "").slice(-10);
    },
    isValidPhone(p) {
      return /^[6-9]\d{9}$/.test(RK.normalizePhone(p));
    },
    upiLink(amount, note) {
      const params = new URLSearchParams({ pa: cfg.upiId, pn: cfg.upiName, am: String(amount), cu: "INR", tn: note });
      return "upi://pay?" + params.toString();
    },
    upiQr(amount, note) {
      return "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=" + encodeURIComponent(RK.upiLink(amount, note));
    },
    waLink(text, number) {
      return "https://wa.me/" + (number || cfg.whatsapp) + "?text=" + encodeURIComponent(text);
    },
    statusBadge(status) {
      return '<span class="badge badge-' + RK.escapeHtml(status) + '">' + RK.escapeHtml(String(status).replace("_", " ")) + "</span>";
    },
    toast(msg, type) {
      let el = document.getElementById("toast");
      if (!el) {
        el = document.createElement("div");
        el.id = "toast";
        document.body.appendChild(el);
      }
      el.textContent = msg;
      el.className = "show " + (type || "");
      clearTimeout(el._t);
      el._t = setTimeout(() => (el.className = ""), 3500);
    },
    // Fills elements like <span data-cfg="phone"></span> with values from config.js
    applyConfig() {
      document.querySelectorAll("[data-cfg]").forEach((el) => {
        el.textContent = cfg[el.dataset.cfg] || "";
      });
      document.querySelectorAll("[data-cfg-href]").forEach((el) => {
        const key = el.dataset.cfgHref;
        if (key === "phone") el.href = "tel:" + cfg.phone.replace(/\s/g, "");
        else if (key === "email") el.href = "mailto:" + cfg.email;
        else if (key === "whatsapp") el.href = RK.waLink("Hi " + cfg.businessName + ", I want to know about decoration packages.");
        else if (cfg[key]) el.href = cfg[key];
        else el.style.display = "none";
      });
      const year = document.getElementById("year");
      if (year) year.textContent = new Date().getFullYear();
      if (window.RKDB && window.RKDB.isDemo) {
        const bar = document.createElement("div");
        bar.className = "demo-bar";
        bar.textContent = "DEMO MODE – bookings are saved only in this browser. Add Supabase keys in js/config.js to go live.";
        document.body.prepend(bar);
      }
      if (window.RKDB && window.RKDB.whatsappOnly) {
        document.querySelectorAll(".needs-db").forEach((el) => el.classList.add("hidden"));
      }
      const toggle = document.querySelector(".nav-toggle");
      const nav = document.querySelector(".nav-links");
      if (toggle && nav) {
        toggle.addEventListener("click", () => nav.classList.toggle("open"));
        nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("open")));
      }
    },
    // Payment box HTML (UPI QR + app link + UTR submit form)
    paymentBox(booking) {
      const amt = booking.advance_amount;
      const note = "Advance " + booking.booking_code;
      return (
        '<div class="pay-box">' +
        "<h3>Pay advance " + RK.inr(amt) + " by UPI</h3>" +
        '<img src="' + RK.upiQr(amt, note) + '" alt="UPI QR code" width="200" height="200">' +
        '<p class="muted">Scan with PhonePe / Google Pay / Paytm, or pay to UPI ID <strong>' + RK.escapeHtml(cfg.upiId) + "</strong></p>" +
        '<a class="btn btn-gold" href="' + RK.upiLink(amt, note) + '">Open UPI app (mobile)</a>' +
        (window.RKDB && window.RKDB.whatsappOnly
          ? '<p><a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="' +
            RK.waLink("Hi " + cfg.businessName + ", I have paid the advance " + RK.inr(amt) + " for booking " + booking.booking_code + ". Screenshot attached.") +
            '">Send payment screenshot on WhatsApp</a></p></div>'
          : '<form class="utr-form" data-code="' + RK.escapeHtml(booking.booking_code) + '">' +
            "<label>After paying, enter UPI transaction ID (UTR)</label>" +
            '<div class="row"><input name="utr" required minlength="6" maxlength="40" placeholder="e.g. 412345678901">' +
            '<button class="btn" type="submit">Submit</button></div></form></div>')
      );
    },
    bindUtrForms(container, phone, onDone) {
      container.querySelectorAll(".utr-form").forEach((f) => {
        f.addEventListener("submit", async (e) => {
          e.preventDefault();
          const ok = await window.RKDB.submitPaymentRef(f.dataset.code, phone, f.utr.value).catch(() => false);
          if (ok) {
            RK.toast("Payment reference submitted. We will verify and confirm.", "ok");
            f.innerHTML = '<p class="ok-text">✅ Payment reference received. We will verify shortly.</p>';
            if (onDone) onDone();
          } else {
            RK.toast("Could not submit. Please contact us on WhatsApp.", "err");
          }
        });
      });
    }
  };

  window.RK = RK;
})();
