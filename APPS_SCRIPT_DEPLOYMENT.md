# Google Apps Script Deployment Guide

## Overview

This guide will help you deploy the updated backend code to Google Apps Script.

## What's New in This Version

### Features Added:
1. ✅ **Signup form handler** - NEW! Handles member signup/login submissions
2. ✅ **Member validation** - Phone numbers verified against Members sheet
3. ✅ **System accounts** - MAINTENANCE, LIBRARY, ADMIN bypass phone verification
4. ✅ **Bearing fields support** - Handles bearings_included, bearing_size, bearing_material
5. ✅ **Removed num_sets** - No longer processing number of sets
6. ✅ **Dynamic column mapping** - Resilient to column reordering
7. ✅ **Proper JSON responses** - Returns success/error messages
8. ✅ **Fixed wheel ID format** - Uses 3 digits (W001, W002, W003)
9. ✅ **Phone number normalization** - Handles different phone formats
10. ✅ **Member registration sync** - Auto-sync from Google Forms to Members sheet

### Issues Fixed:
1. ✅ Wheel ID format consistency (both doPost and onEdit use 3 digits)
2. ✅ Sheet name corrected to "Inventory" in onEdit
3. ✅ Dynamic column mapping (no more hardcoded column order)
4. ✅ Normalized best_for field handling (arrays and strings)
5. ✅ Member validation with phone number normalization

## Prerequisites

Before deploying, ensure your Google Sheet has these sheets:

### 1. **Inventory Sheet**
Required columns (order doesn't matter with dynamic mapping):
- wheel_id
- wheel_name
- brand
- wheel_size
- wheel_material
- durometer_category
- best_for
- status
- lender_id
- timestamp
- bearings_included
- bearing_size
- bearing_material

### 2. **Reviews Sheet**
Required columns:
- phone_number
- display_name
- wheel_id
- wheel_name
- experience_level
- hours_on_wheels
- rating
- review_text
- environment
- timestamp

### 3. **Members Sheet** (NEW - REQUIRED)
Required columns:
- member_id (e.g., V001, V002, V003)
- phone_number (e.g., 5551234567 or (555) 123-4567)
- display_name
- email (optional)
- join_date (optional)

**IMPORTANT**: The Members sheet is used to validate that only registered SFF members can sign up, add wheels, or submit reviews. If this sheet doesn't exist, the script will log a warning but allow submissions (fail-open behavior).

### 4. **Signups Sheet** (OPTIONAL)
Optional columns:
- phone_number
- display_name
- experience_level
- primary_style
- timestamp

**Purpose**: If this sheet exists, the backend will record each signup attempt. This is useful for tracking who has signed up to use the library. If the sheet doesn't exist, signups will still work but won't be recorded.

### 5. **System Accounts** (Special Handling)

The following display names are treated as **system accounts** and do NOT require phone verification:
- **MAINTENANCE** - Used when wheels are checked out for inspection/cleaning
- **LIBRARY** - Reserved for library operations
- **ADMIN** - Administrative actions

**Use Case Example**: When a member returns wheels, they're checked out to MAINTENANCE for inspection. Once inspected, they're marked as available again.

**No Members sheet entry needed** - These accounts bypass phone verification entirely.

## Deployment Steps

### Step 1: Open Apps Script Editor

1. Open your Google Sheet: **SFF_Wheel_Library**
2. Click **Extensions > Apps Script**
3. This opens the Apps Script editor

### Step 2: Replace Existing Code

1. In the Apps Script editor, you should see a file called `Code.gs`
2. **Select ALL existing code** and delete it
3. **Copy the entire contents** of `apps-script-backend.js` (the file in this directory)
4. **Paste** it into the `Code.gs` file

### Step 3: Set Up Triggers

The script needs an **onEdit** trigger to auto-generate wheel IDs.

1. In Apps Script editor, click the **clock icon** (Triggers) on the left sidebar
2. Click **+ Add Trigger** (bottom right)
3. Configure the trigger:
   - Choose which function to run: **onEdit**
   - Choose which deployment should run: **Head**
   - Select event source: **From spreadsheet**
   - Select event type: **On edit**
4. Click **Save**
5. You may need to authorize the script (click through the prompts)

### Step 4: Deploy as Web App

1. Click **Deploy > New deployment** (top right)
2. Click the **gear icon** next to "Select type"
3. Select **Web app**
4. Configure the deployment:
   - Description: "SFF Wheel Library Backend - v2 (Member validation + bearings)"
   - Execute as: **Me** (your Google account)
   - Who has access: **Anyone with a Google account**
5. Click **Deploy**
6. **Copy the Web App URL** (you'll need this for the frontend)

### Step 5: Update Frontend

1. Open `index.html` in the repository
2. Find the line with `REVIEW_SCRIPT_URL`
3. **Replace** the old URL with your new Web App URL from Step 4

```javascript
// OLD (example - your actual URL may differ)
const REVIEW_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbynqdoLigNVyALncipI-FaDVl7mUjxgBqgD0cCn730ONoVGlc_IYHsFF06SlDQih8sP/exec";

// NEW (use YOUR Web App URL from Step 4)
const REVIEW_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_NEW_DEPLOYMENT_ID_HERE/exec";
```

**NOTE**: If you redeploy the same script, you can use the same URL - you don't need to update the frontend each time.

### Step 6: Test the Deployment

#### Test 0: Signup Form (NEW)
1. Open the app and click the **"Sign Up"** button
2. Fill out the signup form with a **valid** member phone number (one that exists in Members sheet)
   - Phone: Use format like `(347) 581-4805` or `3475814805` (both should work)
   - Display Name: Your name from WhatsApp group
   - Experience Level: Select one
   - Primary Style: Select one
   - Check the agreement box
3. Click **"Sign Up"**
   - Should succeed with message: "Welcome to SFF Wheel Library!"
4. Try again with an **invalid** phone number (not in Members sheet)
   - Should fail with error: "Phone number not found in member list"
5. Check Apps Script logs to verify the signup was processed

#### Test 1: Member Validation
1. Try submitting the Add Wheels form with a **valid** member phone number
   - Should succeed
2. Try submitting with an **invalid** phone number
   - Should fail with error: "Phone number not found in member list"
3. Try submitting with display_name "MAINTENANCE" and no phone number
   - Should succeed (system account bypasses verification)

#### Test 2: Wheel ID Generation
1. Submit the Add Wheels form successfully
2. Check the Inventory sheet
3. Verify the wheel_id is formatted correctly: **W001**, **W002**, **W003**, etc. (3 digits)

#### Test 3: Bearing Fields
1. Submit a wheel **with bearings**:
   - Check "Bearings Included"
   - Select bearing size and material
2. Check the Inventory sheet
3. Verify bearings_included = "Yes", bearing_size and bearing_material are populated
4. Submit a wheel **without bearings**:
   - Leave "Bearings Included" unchecked
5. Verify bearings_included = "No", other bearing fields are empty

#### Test 4: Dynamic Column Mapping
1. In the Inventory sheet, **move a column** (e.g., swap "brand" and "wheel_name")
2. Submit a new wheel
3. Verify data appears in the **correct columns** (not shifted)

#### Test 5: Review Submission
1. Submit a review with a valid member phone number
2. Check the Reviews sheet
3. Verify data appears correctly

## Troubleshooting

### Error: "Members sheet not found"
- Create a sheet named **"Members"** (exact spelling, capital M)
- Add columns: member_id, phone_number, display_name
- Add at least one test member

### Error: "wheel_id column not found"
- Check the Inventory sheet has a column header named **"wheel_id"** (exact spelling)
- Header must be in row 1

### Error: "Missing required field: X"
- The frontend form is not sending all required fields
- Check browser console for errors
- Verify all form fields have correct `id` attributes

### Phone Number Format Issues
- The script normalizes phone numbers by removing all non-numeric characters
- (555) 123-4567 → 5551234567
- 555-123-4567 → 5551234567
- 5551234567 → 5551234567
- All formats should work

### No Error, But Data Not Appearing
1. Check Apps Script logs:
   - Click **Executions** (left sidebar)
   - Look for errors in recent executions
2. Check that the Web App URL is correct in `index.html`
3. Verify CORS is not blocking (Apps Script should handle this)

### Script Timeout
- Apps Script has a 30-second execution limit
- If your Members sheet is very large (thousands of rows), consider indexing
- Current implementation is O(n) for member lookup

## Maintenance

### Adding New Fields to Forms

1. Add the field to the frontend form (`index.html`)
2. Add the column to the Google Sheet
3. The Apps Script will automatically handle it with dynamic mapping
4. No code changes needed unless you want validation

### Updating the Script

1. Make changes in Apps Script editor
2. Click **Deploy > Manage deployments**
3. Click the pencil icon next to your deployment
4. Change version to **New version**
5. Click **Deploy**
6. The Web App URL stays the same (no frontend update needed)

### Viewing Logs

1. In Apps Script editor, click **Executions** (left sidebar)
2. View recent executions with status (Success/Failed)
3. Click on an execution to see logs
4. Use `Logger.log()` statements to debug

## Security Notes

### Current Security Model

- **Execute as**: Your Google account
  - Script runs with YOUR permissions
  - Can read/write to YOUR spreadsheet

- **Who has access**: Anyone
  - Anyone with the URL can submit forms
  - Member validation prevents unauthorized additions

### Recommendations

1. **Keep the Web App URL secret** - Don't share it publicly
2. **Monitor submissions** - Check Executions tab regularly
3. **Backup your sheet** - File > Make a copy (weekly)
4. **Test in a copy** - Before major changes, test in a duplicate sheet

### Rate Limiting

Apps Script has quotas:
- Consumer accounts: 20,000 URL fetches per day
- For a small community, this should be plenty
- Monitor quota usage at: script.google.com/home/my-quota

## Support

If you encounter issues:
1. Check the **Executions** tab in Apps Script for error logs
2. Check browser console for frontend errors
3. Review CLAUDE.md for architecture details
4. File an issue on GitHub: https://github.com/PeachPaulison/SFF_Wheel_Library/issues

---

**Version**: 2.2
**Last Updated**: 2026-02-01
**Session**: session_015pArBe6Yyeb3pdyvePzfBb
