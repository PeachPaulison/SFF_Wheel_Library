## 🔄 IMPORTANT UPDATE — PLEASE READ FIRST

**If you installed an earlier version of Wheel Library, you MUST remove it and reinstall.**  
Recent updates changed how the app loads and caches data, and older installs may keep showing outdated or demo content.

### ✅ To update cleanly (takes ~30 seconds)

### 📱 On iPhone / iPad
1. Find **Wheel Library** on your Home Screen  
2. Press and hold the icon  
3. Tap **Remove App** → **Delete App**  
   *(This does NOT delete any shared data — it only removes the local app cache)*  
4. Open Safari and go to:  
   👉 **https://peachpaulison.github.io/SFF_Wheel_Library**  
5. Tap **Share** → **Add to Home Screen**  
6. You're good to go ✨

### 🤖 On Android
1. Uninstall the existing **Wheel Library** app  
2. Open Chrome and visit:  
   👉 **https://peachpaulison.github.io/SFF_Wheel_Library**  
3. Tap **⋮** → **Add to Home Screen**

### 🧠 Why this matters
This app is a **Progressive Web App (PWA)**, which means:
- Your phone remembers older versions  
- Updates don't always refresh automatically  
- A fresh install guarantees you're seeing the newest behavior  

If something looks weird after reinstalling, that's a **bug**, not user error — please tell me 💛

---

<p align="center">
  <img src="wheel_library_banner.png" alt="Wheel Library Banner" width="100%">
</p>

# 🛼 WHEEL LIBRARY (Beta… like REALLY beta)
### *A groovy little experiment for skaters who want to try the wheels before they buy the wheels.*

---

## 🚨 IMPORTANT! THIS IS NOT A FINISHED APP 🚨
This is more than the beginning, probably the middle, but definitely not the end.  
Nothing here is official, complete, or FDA-approved.  

This is a *proof-of-concept*, a *prototype*, and maybe even a *fever dream*.

If you have thoughts, ideas, questions, concerns, compliments, complaints, or cookies — message me in the **Wheel Warehousre in the SFF WhatsApp group**.

---

## 🌈 What This Does (Right Now)
- Lets you check out *pretend* wheels
- Lets you filter wheels by:
  - Environment (color-coded: blue outlines)
  - Size (color-coded: lime green outlines)
  - Durometer (color-coded: hot pink outlines)
  - Material (color-coded: purple outlines)
- Helps you match a "vibe" (and isn't that the whole point anyway?)
- Functions as a **PWA** (Progressive Web App) so you can add it to your phone like a real app
  *(because fake it till you make it)*
- **NEW!** Contribute your own wheels to the library with the sign-up form
- **NEW!** Member verification system (must be in Members list to contribute or borrow)
- **NEW!** Add wheel images via URL (still testing)
- **NEW!** Track bearing information (size, material, included/not included in loan)
- **NEW!** Authentic MSW carpet neon colors - hot pink, electric blue, lime green, purple on dark background
- **NEW!** Color-coded filter sections for easy navigation

---

## 🛞 What This *Will* Do/Have Eventually (✨Manifesting✨)
- Real wheel inventory ✅ **(DONE - syncs with Google Sheets!)**
- Member contribution system ✅ **(DONE - add your wheels to the library!)**
- Member verification ✅ **(DONE - keeps the library secure!)**
- Wheel images ✅ **(DONE - add photos via URL!)**
- Bearing tracking ✅ **(DONE - know what bearings come with each set!)**
- Real check-outs and returns
- Borrower tracking
- **Wheel review system** *(Currently building!)*
- Notes, saved favorites, wheel comparisons
- Display wheel photos in the browse interface
- A full mobile loaner program interface for SFF
- **What the heck, maybe even a snack bar**

---

## 📲 How to Install on Your Phone
1. Open the deployed site in Safari:  
   **https://peachpaulison.github.io/SFF_Wheel_Library**
2. Tap the **Share** button  
3. Choose **Add to Home Screen**  
4. Boom — instant retro wheel app  

*(Android: Chrome → ⋮ → Add to Home Screen)*

---

## 🧪 Want to Help Me Test?
⚠️ **If you previously installed the app and something seems off, try following the directions at the top of this page for deleting and reinstalling — PWAs are sneaky like that.**

I'd *LOVE* testers!  I **need** testers.  Wash your hands. Push the buttons, check out the notes on the bottom of the app.
Just don't lick anything or you'll need a shot.

### Things to Try:
- Test the sign-up form
- Browse and filter wheels
- **Try contributing your own wheels!** (Must sign up first and be in the Members list)
- Add wheel images via URL
- Check out the bearing tracking fields

Message in the **Wheel Warehouse in the SFF WhatsApp group** with:
- Bugs
- Confusing parts
- Missing features
- Weird behavior (the apps, not mine)
- Ideas
- Vibes

If something is just not right, or can be done better, let me know. You won't hurt my feelings — but it is **NOT baby deer hunting season** either.
This whole thing is made of duct tape, unicorn kisses, expired Fruit Stripe gum, and vibes.

---

## 🐞 Known Issues (Working On It!)
- Cache can be sticky sometimes (hence the "delete and reinstall" dance)
- Google Sheets data might take a second to load on first visit
- The loan tracking is just a mockup right now (doesn't persist across sessions)
- Wheel images are tracked but not yet displayed in the browse interface
- That floating button in the corner? That's **Eruda** — my mobile debugging tool. It'll vanish before launch.
- Member verification requires you to be in the Members sheet (message me to get added!)

*These will all get fixed as we go! Rome wasn't debugged in a day.*

---

## 🛠️ Nerd Stuff (If You Care)
- Built as a static HTML/CSS/JS PWA
- Deployed via GitHub Pages
- Uses a service worker for caching
- Icons generated with love and questionable taste
- Designed on an iPhone with Koder like a complete gremlin
  *(yes, really — ancient laptop, ancient editors)*
- **Live data integration** with Google Sheets for wheel inventory
- **Apps Script backend** for wheel contributions and review submissions
- **Member verification** against Members sheet for security
- **Dynamic wheel ID generation** (W001, W002, W003...)
- **Image URL support** for wheel photos
- **Bearing tracking** (included, size, material)

---

## 🔧 Developer Notes

### Google Apps Script Deployment
The app uses Google Apps Script as a backend for both wheel contributions and review submissions.

**Web App URL:**
https://script.google.com/macros/s/AKfycbxXkVjkTFlAOXeSKVxYH1givBV_-vx8_5KCJwGU-Cknjm21BfWFgaPAPvZnTOqz3Awg/exec

**Script Functions:**
- `doPost()` - Handles both wheel contributions and review submissions from PWA
- `doGet()` - Retrieves reviews for display
- `onEdit()` - Auto-generates wheel IDs (W001, W002, W003...) when manually editing the Inventory sheet
- `onFormSubmit()` - Auto-syncs new member registrations from Google Form to Members sheet
- `manualSyncFormToMembers()` - Manually sync form responses to Members sheet (for initial import)
- `importMembersFromCSV()` - Bulk import members from CSV data
- `generateMemberId()` - Auto-generates member IDs (M001, M002, M003...)

**Member Verification:**
- All contributions require phone number verification against the "Members" sheet
- **System accounts** (MAINTENANCE, LIBRARY, ADMIN) bypass phone verification for operational use
- Phone number normalization handles different formats: (555) 123-4567, 555-123-4567, or 5551234567
- Prevents unauthorized additions to the inventory
- Phone numbers are stored to verify membership, but never displayed publicly

**System Accounts:**
Special accounts that bypass member verification:
- **MAINTENANCE** - For wheels checked out for inspection/cleaning after returns
- **LIBRARY** - For library operations
- **ADMIN** - For administrative actions

**Inventory Data Structure:**
- Sheet: "Inventory" in SFF_Wheel_Library workbook
- Each row represents ONE physical set of wheels from ONE lender
- Columns include: wheel_id, wheel_name, brand, wheel_size, wheel_material, durometer_category, best_for, status, lender_id, image_url, bearings_included/not includeds, bearing_size, bearing_material, timestamp

**Review Data Structure:**
- Sheet: "Reviews" in SFF_Wheel_Library workbook
- Columns: phone_number, display_name, wheel_id, wheel_name, experience_level, hours_on_wheels, rating, review_text, environment, timestamp

**Members Data Structure:**
- Sheet: "Members" in SFF_Wheel_Library workbook
- Columns: member_id, phone_number, display_name, email, registered_date
- Auto-populated from registration form submissions
- Used for verification when adding wheels or reviews

**Privacy:** Phone numbers are stored for member verification but never displayed publicly.

---

## 🐛 Mobile Debugging (For Fellow Nerds)
This app includes **Eruda** for on-device debugging:
- That floating button in the bottom-right corner? That's it.
- Tap it to access Console, Network, and Storage tabs
- Super handy for seeing errors on mobile
- **This is temporary** — it'll be removed before the official community launch

*(If you're seeing weird errors in the console, screenshot them and send them my way! Extra credit if you draw a little smiley face on the screenshot.)*

---

## 💌 Contact
Message in the **SFF WhatsApp group**
Or telepathically (results may vary)

---

**Skate safe. Try wheels. Spread joy.**
