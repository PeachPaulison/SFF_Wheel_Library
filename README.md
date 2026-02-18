## 📲 New Here? Install the App First

This is a **Progressive Web App (PWA)** — install it fresh from the link below. Don't skip this step or you may see outdated content.

### 📱 iPhone / iPad
1. Open **Safari** and go to: **https://peachpaulison.github.io/SFF_Wheel_Library**
2. Tap **Share** → **Add to Home Screen**
3. You're in ✨

### 🤖 Android
1. Open **Chrome** and go to: **https://peachpaulison.github.io/SFF_Wheel_Library**
2. Tap **⋮** → **Add to Home Screen**

> **Already installed an older version?** Delete the app and reinstall fresh — PWAs cache aggressively and older installs may show outdated behavior. Uninstalling does NOT delete any shared library data.

---

<p align="center">
  <img src="wheel_library_banner.png" alt="Wheel Library Banner" width="100%">
</p>

# 🛼 WHEEL LIBRARY (Beta… like REALLY beta)
### *A groovy little experiment for skaters who want to try the wheels before they buy the wheels.*

---

## 🚨 THIS IS NOT A FINISHED APP 🚨
This is more than the beginning, probably the middle, but definitely not the end.
Nothing here is official, complete, or FDA-approved.

This is a *proof-of-concept*, a *prototype*, and maybe even a *fever dream*.

If you have thoughts, ideas, questions, concerns, compliments, complaints, or cookies — message me in the **Wheel Warehouse in the SFF WhatsApp group**.

---

## 🌈 What This Does (Right Now)
- Browse the real wheel inventory — **live data from Google Sheets**
- Filter wheels by:
  - **Environment** (blue): rhythm, jam, artistic, derby, parks, street, trail, indoor
  - **Size** (lime): 57mm, 59mm, 62mm, 65mm+
  - **Durometer** (pink): soft, mid, hard
  - **Material** (purple): urethane, vanathane, fiberglass, wood, clay, other
- **Check out wheels** from the library (real borrowing, tracked in the sheet!)
- **Sign up as a member** to contribute or borrow wheels
- **Contribute your own wheels** to the library
- **Submit wheel reviews** with ratings and experience notes
- Browse wheel photos, bearing info, and lender details
- Works as a **PWA** — add it to your home screen like a real app

---

## 🛞 What's Still Coming (✨Manifesting✨)
- Notes, saved favorites, wheel comparisons
- Display wheel photos inline in the browse interface
- Return / check-in flow
- A full mobile loaner program interface for SFF
- **What the heck, maybe even a snack bar**

---

## 🧪 Want to Help Me Test?

I'd *LOVE* testers! I **need** testers. Wash your hands. Push the buttons.

### Things to Try:
- **Sign up** as a member (you'll need to be added to the Members list first — message me!)
- **Browse and filter** wheels
- **Check out a wheel** — does the status update? Does it feel right?
- **Contribute wheels** to the library (brand dropdown + name suggestions are new!)
- **Submit a review** on a wheel you've skated
- **Install as a PWA** on your phone and test the home screen experience

**Report back to the Wheel Warehouse in the SFF WhatsApp group with:**
- Bugs
- Confusing parts
- Missing features
- Weird behavior (the app's, not mine)
- Ideas
- Vibes

If something is just not right, or can be done better, let me know. You won't hurt my feelings — but it is **NOT baby deer hunting season** either.
This whole thing is made of duct tape, unicorn kisses, expired Fruit Stripe gum, and vibes.

---

## 🐞 Known Issues (Working On It!)
- Cache can be sticky (hence the "delete and reinstall" dance for older installs)
- Google Sheets data might take a second to load on first visit
- Wheel images are tracked but not yet displayed inline in the browse interface
- That floating button in the corner? That's **Eruda** — my mobile debugging tool. It'll vanish before the real launch.
- To contribute or borrow, you must be in the Members sheet — message me to get added!

*These will all get fixed as we go. Rome wasn't debugged in a day.*

---

## 🛠️ Nerd Stuff (If You Care)
- Built as a static HTML/CSS/JS PWA — no frameworks, no build tools
- Deployed via **GitHub Pages** (auto-deploys from `main`)
- Service worker for offline caching
- **Live inventory** synced from Google Sheets (read-only CSV endpoint)
- **Apps Script backend** handles checkouts, contributions, sign-ups, and reviews
- **Member verification** against the Members sheet — phone normalization handles multiple formats
- **System accounts** (MAINTENANCE, LIBRARY, ADMIN) bypass member verification for ops use
- Dynamic wheel ID generation: W001, W002, W003...
- Designed on an iPhone with Koder like a complete gremlin *(ancient laptop, ancient editors)*

---

## 🔧 Developer Notes

### Data Structures

**Inventory sheet columns:**
`wheel_id, wheel_name, brand, wheel_size, wheel_material, durometer_category, best_for, status, lender_id, image_url, bearings_included, bearing_size, bearing_material, timestamp`

**Reviews sheet columns:**
`phone_number, display_name, wheel_id, wheel_name, experience_level, hours_on_wheels, rating, review_text, environment, timestamp`

**Members sheet columns:**
`member_id, phone_number, display_name, email, registered_date`

### Apps Script Actions
- `signup` — member registration (requires phone verification)
- `checkout` — borrow a wheel (updates inventory status)
- `review` — submit wheel review
- `add wheel` — add to inventory

**Privacy:** Phone numbers are stored for member verification only and are never displayed publicly.

---

## 🐛 Mobile Debugging (For Fellow Nerds)
This app includes **Eruda** for on-device debugging:
- That floating button in the bottom-right corner? That's it.
- Tap it to access Console, Network, and Storage tabs
- Great for catching errors on mobile
- **Temporary** — gone before the official community launch

*(If you're seeing weird errors, screenshot them and send them my way! Extra credit if you draw a little smiley face on the screenshot.)*

---

## 💌 Contact
Message in the **SFF WhatsApp group**
Or telepathically (results may vary)

---

**Skate safe. Try wheels. Spread joy.**
