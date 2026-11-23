# RK Decoration – Online Booking Website (100% free)

A booking website for RK Decoration, Kalaburagi:

- **Customer site** (`index.html`): services and packages, gallery, booking form with a live price and advance calculation, date availability check, UPI QR advance payment, WhatsApp booking message, reviews, FAQ, contact and map.
- **Track booking** (`track.html`): customers check their status using their Booking ID and mobile number, and can submit their UPI transaction ID.
- **Admin panel** (`admin.html`): login, dashboard stats, bookings list with search and filters, status and payment updates, private notes, WhatsApp and call buttons, CSV export (opens in Excel), and blocking holiday dates.

Everything runs on free services:

| Need | Free service |
|---|---|
| Hosting | Netlify (or GitHub Pages / Cloudflare Pages) |
| Database + admin login | Supabase free plan |
| Payments | Direct UPI QR to your account, with no gateway fees |
| Notifications | WhatsApp click-to-chat |
| Domain | Free `yourname.netlify.app` (buy `rkdecoration.in` later if you want) |

---

## 1. Try it now (demo mode)

Set `demoMode: true` in `js/config.js`, then double-click `index.html` to open it in Chrome and make a test booking. Open `admin.html` and log in with any email and the password **admin123**.

In demo mode, data is saved only in that browser. Set `demoMode` back to `false` before publishing.

**WhatsApp-only mode** (the default when the Supabase keys are empty): customers book on the site, then tap a button that sends the booking details and their payment screenshot to your WhatsApp. The Track Booking and Admin pages stay off until you connect Supabase in step 3.

## 2. Add your business details

Edit **`js/config.js`** in Notepad: business name, phone, WhatsApp number (`91XXXXXXXXXX`), email, address, UPI ID, advance %, and social links.

Edit **`js/data.js`** for your services, package prices, add-ons, reviews and FAQ.

**Photos:** copy them into the `images` folder, then set `src`, for example `src: "images/birthday1.jpg"`, in the `gallery` list in `js/data.js`.

## 3. Connect the free database (Supabase)

1. Go to https://supabase.com, sign up for free, and click **New project**. Pick the Mumbai region (closest to Kalaburagi).
2. Open **SQL Editor → New query**, paste everything from `supabase/schema.sql`, and click **Run**.
3. Go to **Authentication → Users → Add user**, then create your admin email and a strong password.
4. Go to **Authentication → Sign In / Providers** and turn **OFF** "Allow new users to sign up". This is important: only you should be able to log in to the admin panel.
5. Go to **Project Settings → API** and copy the **Project URL** and the **anon public key** into `js/config.js`:
   ```js
   supabaseUrl: "https://xxxx.supabase.co",
   supabaseAnonKey: "eyJhbGciOi...",
   ```
   The anon key is safe to put on a website. Database security rules stop customers from reading other people's bookings. **Never** put the `service_role` key on the site.

If you change `maxBookingsPerDay` in `config.js`, change `select 3` in `rk_max_per_day()` in `schema.sql` to the same number and run that function again.

> Free Supabase projects pause after about 7 days with no activity. Normal bookings and admin visits keep the project active. If it pauses, open the Supabase dashboard and click **Restore**.

## 4. Put it online for free (Netlify)

1. Go to https://app.netlify.com/drop and sign up for free.
2. Drag the whole `rk-decoration` folder onto the page. Your site is live at `something.netlify.app`.
3. In **Site configuration → Change site name**, rename it, for example to `rkdecoration-kalaburagi`.
4. To update the site later, drag the folder again from the **Deploys** tab.

## 5. Get customers to find you (free)

- Create a **Google Business Profile** at https://business.google.com and add your website link.
- Add the website link to your Instagram bio, your WhatsApp Business profile and your visiting cards.
- Submit the site to **Google Search Console** at https://search.google.com/search-console.

## How a booking works

1. The customer fills the form, gets a **Booking ID** (for example `RK7KQ2MX`), and sees the total and the advance amount.
2. The customer pays the advance by **UPI QR** and enters their UTR (transaction ID). They can also send the details to you on **WhatsApp** with one tap.
3. You open `admin.html` and check the UTR against your bank or UPI app. Then set the payment to **advance paid** and the status to **confirmed**, and message the customer with the WhatsApp button.
4. After the event, set the status to **completed** and the payment to **paid**.

Dates with **3 active bookings** (you can change this number) or dates you **blocked** in the admin panel cannot be booked.
