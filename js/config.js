// ===== RK Decoration – site settings =====
// Edit these values. No coding knowledge needed – just change the text inside quotes.
window.RK_CONFIG = {
  businessName: "RK Decoration",
  tagline: "Making every celebration in Kalaburagi beautiful",
  city: "Kalaburagi",
  phone: "+91 88679 65856",          // shown on site, used for "Call" button
  whatsapp: "918867965856",          // country code + number, digits only
  email: "rathodrakesh431@gmail.com",
  address: "Wadi (Jn), Kalaburagi, Karnataka 585101",
  mapQuery: "Kalaburagi, Karnataka",
  workingHours: "Mon – Sun, 9:00 AM – 9:00 PM",
  instagram: "",                     // e.g. "https://instagram.com/rkdecoration"
  facebook: "",
  youtube: "",

  // Payments (free UPI – no gateway fees)
  upiId: "rathodrakesh431-1@okicici", // your UPI ID
  upiName: "RK Decoration",
  advancePercent: 30,                // advance % asked at booking

  // Booking rules
  minNoticeDays: 1,                  // earliest booking = today + this many days
  maxBookingsPerDay: 3,              // keep same value in supabase/schema.sql

  // Free database (Supabase). When empty, the site runs in WhatsApp-only mode:
  // bookings are sent to your WhatsApp and the Track/Admin pages are turned off.
  supabaseUrl: "",
  supabaseAnonKey: "",

  // true = test mode that saves bookings only in this browser (admin password: admin123).
  demoMode: false
};
