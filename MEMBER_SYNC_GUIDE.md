# Member Phone Verification Sync Guide

## Overview

This guide explains how to sync SFF WhatsApp group members to the Members sheet for phone number verification in the Wheel Library app.

**Challenge**: WhatsApp doesn't provide an API to automatically export group members, so we need a semi-automated approach.

---

## Recommended Approach: Member Registration Form

### Option A: Google Forms (Easiest)

**Setup Steps**:

1. **Create a Google Form**:
   - Go to [Google Forms](https://forms.google.com)
   - Create new form: "SFF Wheel Library Registration"
   - Add fields:
     - Phone Number (Short answer, required)
     - Display Name (Short answer, required)
     - Email (optional, for notifications)

2. **Link form to your spreadsheet**:
   - In Google Forms, click Responses tab
   - Click green Sheets icon
   - Select "Create a new spreadsheet" or link to existing
   - Name it "Member Registrations" (new sheet in your workbook)

3. **Set up auto-sync** (see Apps Script below)

4. **Share the form**:
   - Post link in WhatsApp group
   - Pin message so new members can register
   - Example message:
     ```
     📝 Register for the Wheel Library!

     To borrow wheels, please register your phone number:
     [Form Link]

     This helps us verify you're part of our community.
     ```

---

### Option B: Custom Registration Form in PWA

**For a more integrated experience**, add registration directly to the app.

**Implementation** (requires editing index.html):

```javascript
// Add this function to handle member registration
async function registerMember() {
  const phone = prompt("Enter your phone number (for verification):");
  const displayName = prompt("Enter your display name:");

  if (!phone || !displayName) {
    alert("Both phone and name are required!");
    return;
  }

  try {
    const response = await fetch(REGISTRATION_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'register',
        phone_number: phone,
        display_name: displayName
      })
    });

    const result = await response.json();

    if (result.success) {
      alert("✅ Registration successful! You can now borrow wheels.");
    } else {
      alert("❌ Registration failed: " + result.message);
    }
  } catch (err) {
    alert("Network error. Please try again.");
  }
}
```

---

## Apps Script: Auto-Sync from Form to Members Sheet

Add this to your `apps-script-backend.js`:

```javascript
/**
 * AUTO-SYNC: Triggered when Google Form submits new registration
 * Set up trigger: Edit > Current project's triggers > Add Trigger
 * Choose: onFormSubmit, From spreadsheet, On form submit
 */
function onFormSubmit(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const formSheet = ss.getSheetByName('Member Registrations'); // Form responses
    const membersSheet = ss.getSheetByName('Members');

    // Get the submitted data (last row from form)
    const lastRow = formSheet.getLastRow();
    const data = formSheet.getRange(lastRow, 1, 1, formSheet.getLastColumn()).getValues()[0];

    // Assuming form columns: [Timestamp, Phone Number, Display Name, Email]
    const timestamp = data[0];
    const phoneRaw = data[1];
    const displayName = data[2];
    const email = data[3] || '';

    // Normalize phone number
    const phone = normalizePhone(phoneRaw);

    // Check if already exists in Members sheet
    const membersData = membersSheet.getDataRange().getValues();
    const phoneColumn = 0; // Assuming phone is first column

    let exists = false;
    for (let i = 1; i < membersData.length; i++) {
      if (normalizePhone(membersData[i][phoneColumn]) === phone) {
        exists = true;
        break;
      }
    }

    // Add to Members sheet if new
    if (!exists) {
      membersSheet.appendRow([phone, displayName, email, timestamp]);
      Logger.log(`✅ Added new member: ${displayName} (${phone})`);
    } else {
      Logger.log(`ℹ️ Member already exists: ${phone}`);
    }

  } catch (err) {
    Logger.log('❌ Error in onFormSubmit: ' + err.toString());
  }
}

/**
 * Normalize phone numbers to consistent format
 * Handles: (555) 123-4567, 555-123-4567, 5551234567, +1-555-123-4567
 */
function normalizePhone(phone) {
  if (!phone) return '';

  // Remove all non-digit characters except +
  let normalized = phone.toString().replace(/[^\d+]/g, '');

  // Remove leading +1 (US country code)
  if (normalized.startsWith('+1')) {
    normalized = normalized.substring(2);
  } else if (normalized.startsWith('1') && normalized.length === 11) {
    normalized = normalized.substring(1);
  }

  // Return 10-digit format
  return normalized.substring(0, 10);
}

/**
 * MANUAL SYNC: Call this function to sync form responses to Members sheet
 * Useful for initial import or when form responses get out of sync
 */
function manualSyncFormToMembers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const formSheet = ss.getSheetByName('Member Registrations');
  const membersSheet = ss.getSheetByName('Members');

  // Get all form responses (skip header row)
  const formData = formSheet.getDataRange().getValues();
  const headers = formData[0];

  let added = 0;
  let skipped = 0;

  // Get existing members
  const membersData = membersSheet.getDataRange().getValues();
  const existingPhones = new Set();
  for (let i = 1; i < membersData.length; i++) {
    existingPhones.add(normalizePhone(membersData[i][0]));
  }

  // Process each form submission
  for (let i = 1; i < formData.length; i++) {
    const row = formData[i];
    const timestamp = row[0];
    const phoneRaw = row[1];
    const displayName = row[2];
    const email = row[3] || '';

    const phone = normalizePhone(phoneRaw);

    // Skip if already exists
    if (existingPhones.has(phone)) {
      skipped++;
      continue;
    }

    // Add to Members sheet
    membersSheet.appendRow([phone, displayName, email, timestamp]);
    existingPhones.add(phone);
    added++;
  }

  Logger.log(`✅ Sync complete: ${added} added, ${skipped} skipped`);
  return { added, skipped };
}

/**
 * MEMBER REGISTRATION via App/Custom Form
 * Alternative to Google Forms - receives POST from PWA
 */
function registerMemberViaApp(phoneRaw, displayName, email = '') {
  const ss = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID'); // Replace with your ID
  const membersSheet = ss.getSheetByName('Members');

  const phone = normalizePhone(phoneRaw);

  // Validate phone
  if (!phone || phone.length !== 10) {
    return { success: false, message: 'Invalid phone number format' };
  }

  // Check if already exists
  const membersData = membersSheet.getDataRange().getValues();
  for (let i = 1; i < membersData.length; i++) {
    if (normalizePhone(membersData[i][0]) === phone) {
      return { success: false, message: 'Phone number already registered' };
    }
  }

  // Add to Members sheet
  const timestamp = new Date();
  membersSheet.appendRow([phone, displayName, email, timestamp]);

  return { success: true, message: 'Registration successful' };
}
```

---

## Setting Up Auto-Sync Trigger

**In Google Apps Script Editor**:

1. Open your Apps Script project
2. Click ⏰ Triggers (clock icon on left sidebar)
3. Click "+ Add Trigger"
4. Configure:
   - Function: `onFormSubmit`
   - Deployment: Head
   - Event source: From spreadsheet
   - Event type: On form submit
5. Click "Save"

**Now**: Every time someone submits the Google Form, their phone number is automatically added to the Members sheet!

---

## Manual WhatsApp Export (for verification)

**Periodically verify your Members sheet matches the WhatsApp group**:

### How to Export WhatsApp Group Members:

1. **Open WhatsApp group** (SFF Wheel Warehouse)
2. **Tap group name** at top
3. **Scroll to participants section**
4. **Copy member list**:
   - **iOS**: Long press on participant list, select all, copy
   - **Android**: Tap ⋮ menu > Export participants

5. **Paste into spreadsheet** for comparison

6. **Cross-reference**:
   - Compare exported list with Members sheet
   - Add any missing members
   - Remove any who left the group

**Recommended frequency**: Monthly or when you notice discrepancies

---

## Members Sheet Structure

Your Members sheet should have these columns:

| Column | Description | Example |
|--------|-------------|---------|
| phone_number | 10-digit normalized | 5551234567 |
| display_name | Member's preferred name | Jess |
| email | Optional, for notifications | jess@example.com |
| registered_date | When they registered | 2025-01-30 10:30:00 |

**Important**: The verification script only checks the `phone_number` column, so other columns are optional but recommended for record-keeping.

---

## Member Management Functions

### Bulk Import from CSV

If you have a CSV of phone numbers from another source:

```javascript
/**
 * Import phone numbers from CSV format
 * CSV should have columns: phone_number, display_name
 */
function importMembersFromCSV() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const membersSheet = ss.getSheetByName('Members');

  // Paste your CSV data into a temporary sheet named "CSV Import"
  const csvSheet = ss.getSheetByName('CSV Import');
  const csvData = csvSheet.getDataRange().getValues();

  let added = 0;

  // Get existing members
  const membersData = membersSheet.getDataRange().getValues();
  const existingPhones = new Set();
  for (let i = 1; i < membersData.length; i++) {
    existingPhones.add(normalizePhone(membersData[i][0]));
  }

  // Skip header, process each row
  for (let i = 1; i < csvData.length; i++) {
    const phoneRaw = csvData[i][0];
    const displayName = csvData[i][1] || 'Unknown';

    const phone = normalizePhone(phoneRaw);

    if (!existingPhones.has(phone)) {
      membersSheet.appendRow([phone, displayName, '', new Date()]);
      existingPhones.add(phone);
      added++;
    }
  }

  Logger.log(`✅ Imported ${added} members`);
}
```

### Remove Members Who Left

```javascript
/**
 * Mark members as inactive (don't delete, for audit trail)
 * Add an "active" column to Members sheet
 */
function deactivateMember(phone) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const membersSheet = ss.getSheetByName('Members');
  const data = membersSheet.getDataRange().getValues();

  const normalizedPhone = normalizePhone(phone);

  for (let i = 1; i < data.length; i++) {
    if (normalizePhone(data[i][0]) === normalizedPhone) {
      // Set "active" column (column 5) to FALSE
      membersSheet.getRange(i + 1, 5).setValue(false);
      Logger.log(`✅ Deactivated member: ${data[i][1]} (${phone})`);
      return true;
    }
  }

  Logger.log(`❌ Member not found: ${phone}`);
  return false;
}
```

---

## Workflow Summary

### Initial Setup (One-time)

1. ✅ Create Google Form for registration
2. ✅ Link form to spreadsheet (new sheet: "Member Registrations")
3. ✅ Copy Apps Script functions to your project
4. ✅ Set up onFormSubmit trigger
5. ✅ Share form link in WhatsApp group
6. ✅ Run `manualSyncFormToMembers()` for initial sync

### Ongoing Maintenance

**Weekly**:
- Check form responses
- Review any registration issues

**Monthly**:
- Export WhatsApp group members
- Cross-reference with Members sheet
- Add missing members
- Deactivate members who left

**When someone can't borrow**:
- Check if they're in Members sheet
- Verify phone number format matches
- Ask them to re-submit registration form

---

## Troubleshooting

### "Phone number not verified" error but member is registered

**Possible causes**:
1. **Phone format mismatch**:
   - Form: `(555) 123-4567`
   - They entered: `555-123-4567`
   - Solution: Use `normalizePhone()` function

2. **Leading zeros dropped**:
   - Some spreadsheets remove leading zeros
   - Solution: Format phone_number column as "Plain text"

3. **Spaces or special characters**:
   - Solution: `normalizePhone()` handles this

### Member registered twice with different numbers

**Solution**: Add duplicate detection to form:
```javascript
// In onFormSubmit, before adding to Members
if (checkDuplicateByName(displayName)) {
  // Send email notification to admin
  MailApp.sendEmail({
    to: 'admin@example.com',
    subject: 'Duplicate registration detected',
    body: `${displayName} registered again with ${phone}`
  });
}
```

### Form not syncing automatically

**Check**:
1. Trigger is set up correctly (⏰ Triggers in Apps Script)
2. Function name is exactly `onFormSubmit`
3. Event type is "On form submit" not "On change"
4. Check execution logs for errors

---

## Privacy & Security Notes

**Phone Number Storage**:
- Store in Members sheet (private, not published)
- Never display phone numbers publicly
- Only use for verification
- Follow your community's privacy policy

**System Accounts**:
- MAINTENANCE, LIBRARY, ADMIN bypass phone verification
- Don't add these to Members sheet
- They're hardcoded in the script

**Data Retention**:
- Keep inactive members in sheet (set active=false)
- Don't delete for audit trail
- Consider GDPR/privacy laws if applicable

---

## Next Steps

1. **Choose your approach**: Google Forms (easier) or Custom Form (more integrated)
2. **Set up the form** and link to spreadsheet
3. **Add Apps Script functions** from this guide
4. **Set up trigger** for auto-sync
5. **Share form** in WhatsApp group
6. **Test** with a few members
7. **Monitor** for any issues

**Questions?** Message in the SFF WhatsApp group!

---

**Last Updated**: 2026-01-30
**Related**: APPS_SCRIPT_DEPLOYMENT.md, CLAUDE.md
