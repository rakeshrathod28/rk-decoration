// Data layer: uses Supabase (free) when configured, otherwise browser localStorage (demo mode).
(function () {
  const cfg = window.RK_CONFIG;
  const live = !!(cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase);

  function genCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const arr = new Uint32Array(6);
    crypto.getRandomValues(arr);
    return "RK" + Array.from(arr, (n) => chars[n % chars.length]).join("");
  }

  const phoneMatch = (a, b) => window.RK.normalizePhone(a) === window.RK.normalizePhone(b);

  // ---------- Supabase ----------
  function liveApi() {
    const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    const check = ({ data, error }) => {
      if (error) throw error;
      return data;
    };
    return {
      isDemo: false,
      async createBooking(b) {
        for (let i = 0; i < 3; i++) {
          const code = genCode();
          const { error } = await sb.from("bookings").insert({ ...b, booking_code: code });
          if (!error) return { booking_code: code };
          if (error.code === "23505") continue; // duplicate booking code, retry
          if ((error.message || "").includes("DATE_UNAVAILABLE")) throw new Error("DATE_UNAVAILABLE");
          throw error;
        }
        throw new Error("Could not create booking, please try again.");
      },
      async getUnavailableDates() {
        const data = check(await sb.rpc("get_unavailable_dates")) || [];
        return data.map((d) => (typeof d === "string" ? d : Object.values(d)[0]));
      },
      async trackBooking(code, phone) {
        const data = check(await sb.rpc("track_booking", { p_code: code.trim(), p_phone: phone }));
        return (data && data[0]) || null;
      },
      async submitPaymentRef(code, phone, ref) {
        return check(await sb.rpc("submit_payment_ref", { p_code: code.trim(), p_phone: phone, p_ref: ref.trim() }));
      },
      async signIn(email, password) {
        check(await sb.auth.signInWithPassword({ email, password }));
      },
      async signOut() {
        await sb.auth.signOut();
      },
      async getSession() {
        const { data } = await sb.auth.getSession();
        return data.session;
      },
      async listBookings() {
        return check(await sb.from("bookings").select("*").order("event_date", { ascending: true }));
      },
      async updateBooking(id, fields) {
        check(await sb.from("bookings").update(fields).eq("id", id));
      },
      async listBlockedDates() {
        return check(await sb.from("blocked_dates").select("*").order("day"));
      },
      async addBlockedDate(day, reason) {
        check(await sb.from("blocked_dates").insert({ day, reason }));
      },
      async removeBlockedDate(day) {
        check(await sb.from("blocked_dates").delete().eq("day", day));
      }
    };
  }

  // ---------- Demo (localStorage) ----------
  function demoApi() {
    const KB = "rk_demo_bookings", KD = "rk_demo_blocked", KS = "rk_demo_session";
    const read = (k) => JSON.parse(localStorage.getItem(k) || "[]");
    const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

    function unavailable() {
      const today = window.RK.todayISO();
      const counts = {};
      read(KB).filter((b) => b.status !== "cancelled").forEach((b) => (counts[b.event_date] = (counts[b.event_date] || 0) + 1));
      const full = Object.keys(counts).filter((d) => counts[d] >= cfg.maxBookingsPerDay);
      return [...new Set([...read(KD).map((x) => x.day), ...full])].filter((d) => d >= today);
    }

    return {
      isDemo: true,
      async createBooking(b) {
        if (unavailable().includes(b.event_date)) throw new Error("DATE_UNAVAILABLE");
        const list = read(KB);
        const row = {
          ...b, id: String(Date.now()) + Math.random().toString(16).slice(2), booking_code: genCode(),
          created_at: new Date().toISOString(), status: "pending", payment_status: "unpaid", payment_ref: null, admin_notes: null
        };
        list.push(row);
        write(KB, list);
        return { booking_code: row.booking_code };
      },
      async getUnavailableDates() {
        return unavailable();
      },
      async trackBooking(code, phone) {
        return read(KB).find((b) => b.booking_code.toUpperCase() === code.trim().toUpperCase() && phoneMatch(b.phone, phone)) || null;
      },
      async submitPaymentRef(code, phone, ref) {
        const list = read(KB);
        const b = list.find((x) => x.booking_code.toUpperCase() === code.trim().toUpperCase() && phoneMatch(x.phone, phone));
        if (!b || b.payment_status !== "unpaid" || b.status === "cancelled") return false;
        b.payment_ref = ref.trim().slice(0, 40);
        write(KB, list);
        return true;
      },
      async signIn(email, password) {
        if (password !== "admin123") throw new Error("Demo mode password is admin123");
        sessionStorage.setItem(KS, email);
      },
      async signOut() {
        sessionStorage.removeItem(KS);
      },
      async getSession() {
        return sessionStorage.getItem(KS);
      },
      async listBookings() {
        return read(KB).sort((a, b) => a.event_date.localeCompare(b.event_date));
      },
      async updateBooking(id, fields) {
        const list = read(KB);
        const b = list.find((x) => x.id === id);
        if (b) Object.assign(b, fields);
        write(KB, list);
      },
      async listBlockedDates() {
        return read(KD).sort((a, b) => a.day.localeCompare(b.day));
      },
      async addBlockedDate(day, reason) {
        const list = read(KD);
        if (list.some((x) => x.day === day)) throw new Error("Date already blocked");
        list.push({ day, reason });
        write(KD, list);
      },
      async removeBlockedDate(day) {
        write(KD, read(KD).filter((x) => x.day !== day));
      }
    };
  }

  // ---------- WhatsApp-only (no database) ----------
  function whatsappApi() {
    const off = async () => { throw new Error("Not available without database"); };
    return {
      isDemo: false,
      whatsappOnly: true,
      async createBooking() { return { booking_code: genCode() }; },
      async getUnavailableDates() { return []; },
      async trackBooking() { return null; },
      async submitPaymentRef() { return false; },
      signIn: off, signOut: async () => {}, getSession: async () => null,
      listBookings: off, updateBooking: off, listBlockedDates: off, addBlockedDate: off, removeBlockedDate: off
    };
  }

  window.RKDB = live ? liveApi() : cfg.demoMode ? demoApi() : whatsappApi();
})();
