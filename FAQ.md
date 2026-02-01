# Frequently Asked Questions (FAQ)

## Table of Contents
- [General Questions](#general-questions)
- [Installation & Setup](#installation--setup)
- [Using the App](#using-the-app)
- [Borrowing & Returns](#borrowing--returns)
- [Reviews](#reviews)
- [Troubleshooting](#troubleshooting)
- [Privacy & Data](#privacy--data)
- [Contributing & Development](#contributing--development)

---

## General Questions

### What is SFF Wheel Library?

SFF Wheel Library is a Progressive Web App (PWA) designed for the SFF Wheel Warehouse community. It helps skaters browse, filter, and borrow wheels from a shared community library. The app works on iOS, Android, and desktop devices.

### Is this app free to use?

Yes! The SFF Wheel Library app is completely free and open-source. It's built by a baby deer, for the community.

### Is this app affiliated with any wheel manufacturer?

No, this is an independent community project created for the SFF Wheel Warehouse skating community. This is not affiliated with any wheel manufacturers or retailers.

### What makes this a "Progressive Web App" (PWA)?

A PWA is a website that works like a native app. You can:
- Install it on your phone's home screen
- Use it offline (once installed)
- Get app-like performance without downloading from an app store
- Receive automatic updates when new features are released

### Is this app still in beta?

Yes! I'm actively developing and improving the app based on community feedback. You may encounter bugs or incomplete features. Please report issues in the Wheel Warehouse in SFF WhatsApp group.

---

## Installation & Setup

### How do I install the app on iPhone?

1. Open Safari (must use Safari, not Chrome)
2. Visit `https://peachpaulison.github.io/SFF_Wheel_Library`
3. Tap the Share button (square with arrow pointing up)
4. Scroll down and tap "Add to Home Screen"
5. Tap "Add" in the top-right corner
6. The app icon will appear on your home screen

### How do I install the app on Android?

1. Open Chrome (recommended)
2. Visit `https://peachpaulison.github.io/SFF_Wheel_Library`
3. Tap the menu icon (three dots in top-right)
4. Tap "Add to Home Screen" or "Install App"
5. Tap "Install" in the popup
6. The app icon will appear on your home screen

### Can I use this app on desktop?

Yes! You can use it in any modern browser (Chrome, Firefox, Safari, Edge). You can also install it as a desktop PWA:
- Chrome: Click the install icon (computer with arrow) in the address bar
- Edge: Click the install icon in the address bar
- Safari: Limited PWA support, but website works fine

### Why won't the app install on my iPhone?

Common issues:
- **Wrong browser**: You must use Safari (iOS doesn't support PWA installation in Chrome/Firefox)
- **iOS version too old**: PWAs require iOS 11.3 or later
- **Private browsing**: Exit private browsing mode first
- **Storage full**: Free up some space on your device

### Why won't the app install on my Android?

Common issues:
- **Browser compatibility**: Use Chrome for best results
- **Android version too old**: PWAs work best on Android 5.0 or later
- **Disabled installation**: Check Settings > Apps > Special app access > Install unknown apps

### How do I update the app?

The app updates automatically! When you're online, it checks for new versions and downloads updates in the background. Just refresh the page or close and reopen the app to get the latest version.

### How do I uninstall the app?

**iPhone:**
1. Press and hold the app icon
2. Tap "Remove App"
3. Tap "Delete App"

**Android:**
1. Press and hold the app icon
2. Drag to "Uninstall" or tap app info
3. Tap "Uninstall"

**Desktop:**
- Chrome: Settings > Apps > [App Name] > Uninstall
- Edge: Settings > Apps > Manage apps > [App Name] > Uninstall

---

## Using the App

### How do the filters work?

The app has four filter categories:
- **Environment** (blue): Where you'll be skating (rhythm, derby, park, etc.)
- **Size** (lime): Wheel diameter (57mm, 62mm, etc.)
- **Durometer** (pink): Hardness rating (soft, mid, hard)
- **Material** (purple): Construction material (urethane, vanathane, etc.)

Click a chip to select it, click again to deselect. Only wheels matching ALL selected filters will be shown.

### Can I select multiple options in the same filter category?

Currently, no. You can only select one option per category (e.g., one size, one durometer level). This is intentional to help narrow down results. If you need to compare multiple options, try searching separately.

### What does "Best For" mean on each wheel card?

"Best For" indicates which skating disciplines or environments the wheels are optimized for, based on the manufacturer's recommendations and community feedback.

### Why do some wheels appear multiple times?

Each listing represents ONE physical set from ONE lender. If three different people each lend a set of "Radar Energy 57mm" wheels, you'll see three separate listings. This helps you know exactly how many sets are available.

### What does "X sets available" mean?

This shows how many physical sets of that exact wheel are currently available to borrow from the library.

### How is the data updated?

The app pulls live data from our Google Sheets inventory. Updates made to the spreadsheet appear in the app immediately (within a few seconds when you're online).

### Can I use the app offline?

Yes! Once you've installed the PWA and loaded the app while online, it will work offline. However:
- You'll see cached data (not the latest inventory updates)
- You can browse and use filters
- You can't submit reviews or borrow wheels while offline
- The app will show an "OFFLINE" indicator at the top

### Why does the app say "OFFLINE / NO LIVE DATA"?

This means the app couldn't connect to the Google Sheets inventory. Possible reasons:
- You're offline (no internet connection)
- The Google Sheet is temporarily unavailable
- Network issues (slow or intermittent connection)

The app will continue working with cached data from your last online session.

---

## Borrowing & Returns

### How do I borrow wheels?

**CURRENT STATUS**: The borrowing feature is currently a mockup/prototype. Checkouts are stored only in your browser session and are not saved to the library inventory.

**How it works now:**
1. Find wheels you want to borrow
2. Click "Borrow"
3. The app shows them as "checked out" (for your session only)
4. Other users won't see your checkout

**How it will work (coming soon):**
- Real checkout tracking across all users
- Due dates and return reminders
- Member verification
- Lender notifications

### How do I return borrowed wheels?

In your session, go to the "My Loans" section (if available) and click "Return". This removes them from your local checkout list.

**Note:** Since borrowing is currently not persistent, closing the app or clearing your browser will "return" all wheels automatically.

### Can other people see what I've borrowed?

No, not currently. The checkout feature is session-only and stored only on your device. When real borrowing is implemented, your checkouts will be visible to library administrators (to prevent double-booking) but not to other members.

### How long can I keep borrowed wheels?

Since the borrowing system is currently a prototype, there are no enforced due dates. When the real system launches, we'll implement due dates and return reminders.

### What if the wheels I want are already checked out?

The app shows availability status for each wheel set. If all sets of a particular wheel are checked out, you can:
- Wait until they're returned
- Look for similar alternatives using the filters
- Submit a review request asking to be notified when they're available (coming soon)

### Can I reserve wheels in advance?

Not yet. This is a planned feature for the future. Currently, borrowing is first-come, first-served.

---

## Reviews

### How do I submit a review?

1. Click the purple floating review button (bottom-right corner)
2. Fill out the review form:
   - Your phone number (for member verification)
   - Display name (what others will see)
   - Select the wheel you're reviewing
   - Rate your experience (1-5 stars)
   - Add detailed feedback
3. Submit

Your review will be saved to our reviews database.

### Why do you ask for my phone number?

Your phone number is used to verify you're a member of the SFF Wheel Warehouse community. It's **NOT** displayed publicly or shared with anyone. Only your display name and review appear publicly.

### Can I review wheels I haven't borrowed yet?

Technically yes, but we encourage honest reviews based on actual experience. If you're reviewing wheels you tried at a friend's rink or owned previously, that's perfectly fine - just mention it in your review!

### Can I edit or delete my review after submitting?

Not yet. This feature is planned for the future. If you need to correct or remove a review, please message in the wheel Warehouse in SFF WhatsApp group.

### Where can I see reviews from other members?

Review display is currently in development. Soon, you'll be able to see reviews directly on each wheel card. For now, reviews are collected in our backend database.

### What should I include in my review?

Helpful reviews include:
- **Your experience level** (beginner, intermediate, advanced)
- **Where you skated** (rhythm, park, trail, etc.)
- **How long you used them** (hours or sessions)
- **What you liked** (grip, smoothness, durability)
- **What you didn't like** (too soft, too slippery, etc.)
- **Comparison to other wheels** (if applicable)
- **Who they're best for** (skill level, discipline)

Be honest and specific - your feedback helps other skaters make better choices!

---

## Troubleshooting

### The app won't load or shows a blank screen

Try these steps:
1. Check your internet connection
2. Force refresh: Pull down to refresh (mobile) or Cmd+Shift+R / Ctrl+Shift+R (desktop)
3. Clear your browser cache
4. Uninstall and reinstall the app
5. Try a different browser

If the problem persists, message in the SFF WhatsApp group.

### The filters aren't working

Common issues:
- **No results**: Try removing some filters to broaden your search
- **Wrong results**: Check that you've selected the correct filter values
- **Filters stuck**: Try the Reset Filters button or refreshing the page

If filters are genuinely broken, message in the Wheel Warehouse in SFF WhatsApp group with:
- Which filters you selected
- What results you expected
- What results you actually got
- Screenshots if possible

### My review submission failed

Possible reasons:
- You're offline (check "OFFLINE" indicator at top)
- Required fields are missing
- Phone number format issue (try with/without dashes)
- Temporary backend issue

Try again in a few minutes. If it keeps failing, message in the Wheel Warehouse in SFF WhatsApp group.

### The app looks broken on my device

Please message in the Wheel Warehouse in SFF WhatsApp group and include:
- Device type and model
- Browser and version
- Screenshots showing the issue
- Screen size/orientation

### I found a wheel with incorrect information

The inventory data comes from the community entering information that is stored in our Google Sheets database. To report incorrect information:
1. Note the wheel ID (e.g., "W001")
2. Message in the Wheel Warehouse in SFF WhatsApp group with the correction

### The app is slow or laggy

Performance tips:
- Close other apps to free up memory
- Check your internet connection speed
- Try using WiFi instead of cellular data
- Clear your browser cache
- Restart your device

If the app is consistently slow, please message in the Wheel Warehouse in SFF WhatsApp group.

### I see a weird floating shadow icon or debug console (Eruda)

This is intentional during the beta phase to help me troubleshoot issues. It will be removed before the official launch. You can minimize it by tapping the floating button and closing the panel.

---

## Privacy & Data

### What data does the app collect?

The app collects:
- **Wheel browsing activity**: Stored locally in your browser (not sent anywhere)
- **Review submissions**: Display name, phone number (for verification), wheel ID, rating, review text, experience level
- **Checkout history**: Currently session-only, not stored anywhere

### Is my phone number shared or displayed publicly?

**No.** Your phone number is used only for member verification and is never displayed publicly or shared with anyone. Only your display name appears on reviews.

### Where is my data stored?

- **Reviews**: Google Sheets (SFF Wheel Library Reviews sheet)
- **Browsing/checkout data**: Your device only (browser cache/localStorage)
- **Inventory data**: Google Sheets (public read-only)

### Can I delete my data?

Yes. To delete your reviews or personal data, message in the Wheel Warehouse in SFF WhatsApp group.

### Does the app use cookies?

The app uses minimal browser storage (localStorage and cache storage) to:
- Store offline data for PWA functionality
- Remember your filter preferences (optional)
- Cache inventory data for offline use

No third-party tracking cookies are used.

### Is my data encrypted?

- Data transmitted to/from Google Sheets and Google Apps Script is encrypted via HTTPS
- Data stored on your device is protected by your device's security
- We do not implement additional encryption for review data (it's not considered sensitive)

### Who has access to the inventory and reviews data?

- **Inventory data**: Publicly readable (anyone can view the Google Sheet)
- **Review data**: Library administrators have full access
- **Your phone number**: Only stored in the Reviews sheet, not displayed in the app

---

## Contributing & Development

### How can I contribute to the project?

I welcome contributions! You can:
- **Report bugs**: Message in the Wheel Warehouse in SFF WhatsApp group
- **Suggest features**: Message in the Wheel Warehouse in SFF WhatsApp group
- **Test new features**: Try beta features and provide feedback in the Wheel Warehouse in SFF WhatsApp group
- **Write reviews**: Share your experience with wheels you've tried

### I'm not a developer. Can I still help?

Absolutely! You can help by:
- Testing the app and reporting bugs in the Wheel Warehouse in the SFF WhatsApp group
- Suggesting new features or improvements
- Writing helpful reviews for wheels you've tried
- Sharing the app with other skaters in the SFF WhatsApp group
- Providing feedback on UI/UX design

### Where is the source code?

GitHub repository: [https://github.com/PeachPaulison/SFF_Wheel_Library](https://github.com/PeachPaulison/SFF_Wheel_Library)

The app is open-source and available under the MIT License.

### What technologies does the app use?

- **Frontend**: Pure HTML, CSS, vanilla JavaScript (no frameworks)
- **PWA**: Service Worker API for offline functionality
- **Backend**: Google Apps Script + Google Sheets
- **Hosting**: GitHub Pages
- **No build tools**: Direct deployment (no webpack, Vite, etc.)

### How do I set up a local development environment? 

1. Clone the repository:
   ```bash
   git clone https://github.com/PeachPaulison/SFF_Wheel_Library.git
   cd SFF_Wheel_Library
   ```

2. Open `index.html` in your browser, or run a local server:
   ```bash
   python3 -m http.server 8000
   # Visit http://localhost:8000
   ```

3. Make changes to `index.html`, `service-worker.js`, or other files

4. Test your changes

5. Submit a pull request

### What's the roadmap for future features?

Planned features include:
- Real borrowing/checkout system with persistence
- Display reviews on wheel cards
- User accounts and authentication
- Due date tracking and return reminders
- Wheel comparison tool
- Enhanced search/filtering
- Admin dashboard for inventory management
- Photo uploads for wheel reviews
- Favorite wheels feature

Feature requests and priorities are discussed in the Wheel Warehouse in SFF WhatsApp group.

### How are decisions made about new features?

Feature priority is based on:
1. Community feedback and requests
2. Number of users affected
3. Development complexity
4. Alignment with project goals

We encourage community discussion in the SFF WhatsApp group.

### Who maintains this project?

The project is currently maintained by @PeachPaulison with support from the SFF Wheel Warehouse community. I welcome additional maintainers and contributors!

---

## Still Have Questions?

- **Community support**: Message in the Wheel Warehouse in SFF WhatsApp group
- **Bug reports**: Message in the Wheel Warehouse in SFF WhatsApp group
- **Feature requests**: Message in the Wheel Warehouse in SFF WhatsApp group
- **General questions**: Message in the Wheel Warehouse in SFF WhatsApp group

---

**Last Updated**: 2026-01-31
**App Version**: Beta 1.0.2
**Maintained by**: SFF Community
