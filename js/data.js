// ===== Services, packages, add-ons, gallery, reviews, FAQ =====
// Prices are sample values – change them to your real prices.
window.RK_DATA = {
  services: [
    {
      id: "birthday", name: "Birthday Decoration", icon: "🎂",
      desc: "Balloon arches, theme backdrops, name banners and cake table setups for kids and adults.",
      packages: [
        { name: "Basic", price: 2499, includes: ["100 balloons", "Happy Birthday banner", "Simple backdrop"] },
        { name: "Premium", price: 4999, includes: ["250 balloons + arch", "Theme backdrop", "Cake table decor", "Fairy lights"] },
        { name: "Luxury", price: 9999, includes: ["Full theme setup", "Neon name sign", "Balloon garland & pillars", "Entry decor"] }
      ]
    },
    {
      id: "anniversary", name: "Anniversary / Room Surprise", icon: "💖",
      desc: "Romantic room and candle-light decorations with roses, candles and heart balloons.",
      packages: [
        { name: "Basic", price: 1999, includes: ["Heart balloons", "Rose petals", "LED candles"] },
        { name: "Premium", price: 3999, includes: ["Ceiling balloons", "Photo strings", "Rose path", "Fairy lights"] },
        { name: "Luxury", price: 7499, includes: ["Full room makeover", "Canopy", "Neon sign", "Flower bouquet"] }
      ]
    },
    {
      id: "wedding", name: "Wedding Stage & Mandap", icon: "💍",
      desc: "Grand stage, mandap, entry gate and flower decoration for weddings and receptions.",
      packages: [
        { name: "Basic", price: 24999, includes: ["Stage backdrop", "Sofa set", "Artificial flowers"] },
        { name: "Premium", price: 49999, includes: ["Mandap + stage", "Fresh flowers", "Entry gate", "Lighting"] },
        { name: "Luxury", price: 99999, includes: ["Designer theme", "Full venue decor", "Walkway & photo booth", "Special lighting"] }
      ]
    },
    {
      id: "baby-shower", name: "Baby Shower / Seemantha", icon: "🍼",
      desc: "Traditional seemantha and modern baby shower decor with swing, flowers and pastel balloons.",
      packages: [
        { name: "Basic", price: 3499, includes: ["Pastel balloons", "Backdrop", "Chair decor"] },
        { name: "Premium", price: 6999, includes: ["Flower swing", "Theme backdrop", "Photo props"] },
        { name: "Luxury", price: 12999, includes: ["Full stage", "Fresh flowers", "Entry decor", "Lighting"] }
      ]
    },
    {
      id: "haldi-mehendi", name: "Haldi & Mehendi", icon: "🌼",
      desc: "Bright marigold, umbrella and floral setups for haldi and mehendi functions.",
      packages: [
        { name: "Basic", price: 4999, includes: ["Marigold backdrop", "Seating decor"] },
        { name: "Premium", price: 9999, includes: ["Umbrella decor", "Floral backdrop", "Photo corner"] },
        { name: "Luxury", price: 17999, includes: ["Full venue theme", "Swing", "Entry & lighting"] }
      ]
    },
    {
      id: "engagement", name: "Engagement / Ring Ceremony", icon: "💐",
      desc: "Elegant stage and ring-ceremony decor with flowers, lights and name boards.",
      packages: [
        { name: "Basic", price: 7999, includes: ["Stage backdrop", "Name board", "Sofa"] },
        { name: "Premium", price: 14999, includes: ["Floral stage", "Ring platter decor", "Lighting"] },
        { name: "Luxury", price: 29999, includes: ["Designer stage", "Entry gate", "Photo booth", "Fresh flowers"] }
      ]
    },
    {
      id: "housewarming", name: "Griha Pravesha / Pooja", icon: "🏠",
      desc: "Traditional flower torans, rangoli and pooja area decoration for housewarming.",
      packages: [
        { name: "Basic", price: 2999, includes: ["Main door toran", "Pooja area flowers"] },
        { name: "Premium", price: 5999, includes: ["Full entrance decor", "Rangoli", "Pooja backdrop"] },
        { name: "Luxury", price: 10999, includes: ["Complete house flowers", "Lighting", "Entrance arch"] }
      ]
    },
    {
      id: "naming", name: "Naming Ceremony / Cradle", icon: "👶",
      desc: "Cradle decoration, name boards and themed backdrops for naamkaran.",
      packages: [
        { name: "Basic", price: 2999, includes: ["Cradle flowers", "Name board"] },
        { name: "Premium", price: 5999, includes: ["Theme backdrop", "Cradle decor", "Balloons"] },
        { name: "Luxury", price: 9999, includes: ["Full stage", "Fresh flowers", "Neon name sign"] }
      ]
    },
    {
      id: "corporate", name: "Corporate & Shop Opening", icon: "🏢",
      desc: "Office events, shop inaugurations, ribbon cutting and branded balloon decor.",
      packages: [
        { name: "Basic", price: 3999, includes: ["Balloon arch", "Ribbon setup"] },
        { name: "Premium", price: 7999, includes: ["Entry arch", "Flower garlands", "Stage backdrop"] },
        { name: "Luxury", price: 14999, includes: ["Full venue decor", "Branding backdrop", "Lighting"] }
      ]
    }
  ],

  addons: [
    { id: "lights", name: "Fairy / LED lights", price: 799 },
    { id: "cake-table", name: "Cake table setup", price: 999 },
    { id: "extra-balloons", name: "Extra 100 balloons", price: 699 },
    { id: "flowers", name: "Fresh flower garlands", price: 1499 },
    { id: "photo-booth", name: "Photo booth frame", price: 1499 },
    { id: "neon", name: "Neon name sign (rental)", price: 1199 },
    { id: "cold-pyro", name: "Cold pyro / fog entry", price: 2999 }
  ],

  timeSlots: ["Morning (8 AM – 12 PM)", "Afternoon (12 PM – 4 PM)", "Evening (4 PM – 8 PM)", "Night (8 PM – 11 PM)"],

  // Add your photos to the "images" folder and put the file path in "src", e.g. "images/birthday1.jpg"
  gallery: [
    { src: "", title: "Birthday balloon arch", category: "birthday", icon: "🎈" },
    { src: "", title: "Wedding stage", category: "wedding", icon: "💍" },
    { src: "", title: "Romantic room surprise", category: "anniversary", icon: "💖" },
    { src: "", title: "Seemantha swing", category: "baby-shower", icon: "🌸" },
    { src: "", title: "Haldi marigold decor", category: "haldi-mehendi", icon: "🌼" },
    { src: "", title: "Griha pravesha toran", category: "housewarming", icon: "🏠" },
    { src: "", title: "Engagement stage", category: "engagement", icon: "💐" },
    { src: "", title: "Shop opening arch", category: "corporate", icon: "🏢" }
  ],

  // Sample reviews – replace with real customer reviews
  reviews: [
    { name: "Priya S.", rating: 5, text: "Beautiful birthday decoration for my son. Setup was on time and exactly like the photo!" },
    { name: "Rahul K.", rating: 5, text: "The anniversary room surprise was amazing. My wife loved it. Highly recommended in Kalaburagi." },
    { name: "Sneha P.", rating: 4, text: "Very good seemantha decoration at a reasonable price. Team was polite and quick." }
  ],

  faqs: [
    { q: "How do I confirm my booking?", a: "Submit the booking form and pay the advance by UPI. We will call or WhatsApp you to confirm." },
    { q: "How much advance do I need to pay?", a: "An advance (shown in the booking summary) is required to block your date. The balance is paid after setup." },
    { q: "Which areas do you serve?", a: "We serve Kalaburagi city and nearby areas. Travel charges may apply for locations outside the city." },
    { q: "Can I customise a package?", a: "Yes! Write your ideas in 'Special requests' or chat with us on WhatsApp." },
    { q: "What is your cancellation policy?", a: "Cancel 3+ days before the event for a full advance refund. Later cancellations may not be refundable." },
    { q: "How long does setup take?", a: "Small setups take 1–2 hours; wedding/stage setups may take 4–8 hours. We arrive in advance." }
  ]
};
