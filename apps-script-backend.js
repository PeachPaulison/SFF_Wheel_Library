/**
 * SFF Wheel Library - Google Apps Script Backend
 *
 * This script handles:
 * 1. Signup submissions (doPost for member signup/login)
 * 2. Review submissions (doPost for reviews)
 * 3. Add Wheels form submissions (doPost for inventory)
 * 4. Auto-generation of wheel IDs (onEdit trigger)
 * 5. Member validation against Members sheet
 * 6. Member registration sync (onFormSubmit trigger)
 *
 * Deploy as: Web app
 * Execute as: Me
 * Who has access: Anyone with a Google account
 */

// ============================================
// CONFIGURATION
// ============================================

// System accounts that bypass phone verification
const SYSTEM_ACCOUNTS = ['MAINTENANCE', 'LIBRARY', 'ADMIN'];

// ============================================
// HANDLE POST REQUESTS (FORMS)
// ============================================

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const data = JSON.parse(e.postData.contents);

    Logger.log('Received POST data: ' + JSON.stringify(data));

    // Determine submission type:
    // Signup: action === 'signup'
    // Reviews: rating, review_text, experience_level
    // Add Wheels: brand, wheel_name, wheel_size

    if (data.action === 'signup') {
      return handleSignupSubmission(sheet, data);
    } else if (data.action === 'checkout') {
      return handleCheckoutSubmission(sheet, data);
    } else if (data.rating !== undefined || data.review_text !== undefined) {
      return handleReviewSubmission(sheet, data);
    } else if (data.wheel_name !== undefined && data.brand !== undefined) {
      return handleAddWheelSubmission(sheet, data);
    } else {
      throw new Error('Unknown submission type');
    }

  } catch (error) {
    Logger.log('Error in doPost: ' + error.message);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// HANDLE SIGNUP SUBMISSIONS
// ============================================

function handleSignupSubmission(sheet, data) {
  try {
    // Validate required fields
    const requiredFields = ['phone_number', 'display_name', 'experience_level', 'primary_style'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Verify member exists in Members sheet
    if (!verifyMember(sheet, data.phone_number)) {
      throw new Error('Phone number not found in member list. Please ensure you are a registered SFF member.');
    }

    // Optional: Record signup in a tracking sheet (if "Signups" sheet exists)
    const signupsSheet = sheet.getSheetByName('Signups');
    if (signupsSheet) {
      const headers = signupsSheet.getRange(1, 1, 1, signupsSheet.getLastColumn()).getValues()[0];
      const rowData = new Array(headers.length).fill('');

      // Map data to columns
      if (headers.indexOf('phone_number') !== -1) {
        rowData[headers.indexOf('phone_number')] = data.phone_number;
      }
      if (headers.indexOf('display_name') !== -1) {
        rowData[headers.indexOf('display_name')] = data.display_name;
      }
      if (headers.indexOf('experience_level') !== -1) {
        rowData[headers.indexOf('experience_level')] = data.experience_level;
      }
      if (headers.indexOf('primary_style') !== -1) {
        rowData[headers.indexOf('primary_style')] = data.primary_style;
      }
      if (headers.indexOf('timestamp') !== -1) {
        rowData[headers.indexOf('timestamp')] = new Date();
      }

      signupsSheet.appendRow(rowData);
      Logger.log('Signup recorded in Signups sheet');
    }

    Logger.log('Signup successful for: ' + data.display_name);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Successfully signed up! Welcome to SFF Wheel Library.'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error in handleSignupSubmission: ' + error.message);
    throw error;
  }
}

// ============================================
// HANDLE REVIEW SUBMISSIONS
// ============================================

function handleReviewSubmission(sheet, data) {
  try {
    // Validate required fields
    const requiredFields = ['display_name', 'wheel_id', 'rating'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Check if this is a system account
    const isSystemAccount = SYSTEM_ACCOUNTS.includes(data.display_name.toUpperCase());

    // Verify member exists (skip for system accounts)
    if (!isSystemAccount) {
      if (!data.phone_number) {
        throw new Error('Missing required field: phone_number');
      }
      if (!verifyMember(sheet, data.phone_number)) {
        throw new Error('Phone number not found in member list. Please ensure you are a registered SFF member.');
      }
    }

    // Get Reviews sheet
    const reviewsSheet = sheet.getSheetByName('Reviews');
    if (!reviewsSheet) {
      throw new Error('Reviews sheet not found');
    }

    // Use dynamic column mapping
    const headers = reviewsSheet.getRange(1, 1, 1, reviewsSheet.getLastColumn()).getValues()[0];
    const rowData = new Array(headers.length).fill('');

    // Map data to columns
    rowData[headers.indexOf('phone_number')] = data.phone_number || '';
    rowData[headers.indexOf('display_name')] = data.display_name;
    rowData[headers.indexOf('wheel_id')] = data.wheel_id;
    rowData[headers.indexOf('wheel_name')] = data.wheel_name || '';
    rowData[headers.indexOf('experience_level')] = data.experience_level || '';
    rowData[headers.indexOf('hours_on_wheels')] = data.hours_on_wheels || '';
    rowData[headers.indexOf('rating')] = parseInt(data.rating);
    rowData[headers.indexOf('review_text')] = data.review_text || '';
    rowData[headers.indexOf('environment')] = data.environment || '';
    rowData[headers.indexOf('timestamp')] = new Date();

    // Append to sheet
    reviewsSheet.appendRow(rowData);

    Logger.log('Review submitted successfully');

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Review submitted successfully'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error in handleReviewSubmission: ' + error.message);
    throw error;
  }
}

// ============================================
// HANDLE ADD WHEEL SUBMISSIONS
// ============================================

function handleAddWheelSubmission(sheet, data) {
  try {
    // Validate required fields
    const requiredFields = ['lender_display_name', 'wheel_name', 'brand', 'wheel_size', 'durometer', 'material'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Check if this is a system account
    const isSystemAccount = SYSTEM_ACCOUNTS.includes(data.lender_display_name.toUpperCase());

    // Verify member exists (skip for system accounts)
    if (!isSystemAccount) {
      if (!data.lender_phone) {
        throw new Error('Missing required field: lender_phone');
      }
      if (!verifyMember(sheet, data.lender_phone)) {
        throw new Error('Phone number not found in member list. Please ensure you are a registered SFF member.');
      }
    }

    // Get Inventory sheet
    const inventorySheet = sheet.getSheetByName('Inventory');
    if (!inventorySheet) {
      throw new Error('Inventory sheet not found');
    }

    // Generate new wheel ID (W001, W002, W003...)
    const newWheelId = generateNextWheelId(inventorySheet);

    // Get member ID from Members sheet (empty for system accounts)
    const lenderId = isSystemAccount ? '' : getMemberId(sheet, data.lender_phone);

    // Normalize best_for field
    let bestFor = '';
    if (data.best_for) {
      if (Array.isArray(data.best_for)) {
        bestFor = data.best_for.join(', ');
      } else {
        bestFor = String(data.best_for);
      }
    }

    // Use dynamic column mapping
    const headers = inventorySheet.getRange(1, 1, 1, inventorySheet.getLastColumn()).getValues()[0];
    const rowData = new Array(headers.length).fill('');

    // Map data to columns
    rowData[headers.indexOf('wheel_id')] = newWheelId;
    rowData[headers.indexOf('wheel_name')] = data.wheel_name;
    rowData[headers.indexOf('brand')] = data.brand;
    rowData[headers.indexOf('wheel_size')] = data.wheel_size;
    rowData[headers.indexOf('wheel_material')] = data.material;
    rowData[headers.indexOf('durometer_category')] = data.durometer;
    rowData[headers.indexOf('best_for')] = bestFor;
    rowData[headers.indexOf('status')] = 'available';
    rowData[headers.indexOf('lender_id')] = lenderId;
    rowData[headers.indexOf('timestamp')] = new Date();

    // Handle bearing fields
    if (headers.indexOf('bearings_included') !== -1) {
      rowData[headers.indexOf('bearings_included')] = data.bearings_included || 'No';
    }
    if (headers.indexOf('bearing_size') !== -1) {
      rowData[headers.indexOf('bearing_size')] = data.bearing_size || '';
    }
    if (headers.indexOf('bearing_material') !== -1) {
      rowData[headers.indexOf('bearing_material')] = data.bearing_material || '';
    }

    // Append to sheet
    inventorySheet.appendRow(rowData);

    Logger.log('Wheel added successfully: ' + newWheelId);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Wheel added successfully',
      wheel_id: newWheelId
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error in handleAddWheelSubmission: ' + error.message);
    throw error;
  }
}

// ============================================
// HANDLE CHECKOUT SUBMISSIONS
// ============================================

function handleCheckoutSubmission(sheet, data) {
  try {
    // Validate required fields
    const requiredFields = ['phone_number', 'display_name', 'wheel_id'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Check if this is a system account
    const isSystemAccount = SYSTEM_ACCOUNTS.includes(data.display_name.toUpperCase());

    // Verify member exists (skip for system accounts)
    if (!isSystemAccount) {
      if (!verifyMember(sheet, data.phone_number)) {
        throw new Error('Phone number not found in member list. Only verified SFF members can borrow wheels.');
      }
    }

    // Update wheel status in Inventory sheet
    const inventorySheet = sheet.getSheetByName('Inventory');
    if (!inventorySheet) {
      throw new Error('Inventory sheet not found');
    }

    const headers = inventorySheet.getRange(1, 1, 1, inventorySheet.getLastColumn()).getValues()[0];
    const wheelIdColIndex = headers.indexOf('wheel_id');
    const statusColIndex = headers.indexOf('status');

    if (wheelIdColIndex === -1 || statusColIndex === -1) {
      throw new Error('Required columns not found in Inventory sheet');
    }

    const lastRow = inventorySheet.getLastRow();
    const wheelIds = inventorySheet.getRange(2, wheelIdColIndex + 1, lastRow - 1, 1).getValues();

    let wheelRow = -1;
    for (let i = 0; i < wheelIds.length; i++) {
      if (String(wheelIds[i][0]) === String(data.wheel_id)) {
        wheelRow = i + 2; // +2 for 0-index and header row
        break;
      }
    }

    if (wheelRow === -1) {
      throw new Error('Wheel not found in inventory');
    }

    // Update status to checked out
    inventorySheet.getRange(wheelRow, statusColIndex + 1).setValue('checked out');

    Logger.log('Checkout successful: ' + data.wheel_id + ' by ' + data.display_name);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Checkout verified successfully'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error in handleCheckoutSubmission: ' + error.message);
    throw error;
  }
}

// ============================================
// MEMBER VALIDATION
// ============================================

function verifyMember(sheet, phoneNumber) {
  try {
    const membersSheet = sheet.getSheetByName('Members');
    if (!membersSheet) {
      Logger.log('Warning: Members sheet not found - skipping validation');
      return true; // If no Members sheet, allow submission
    }

    // Get all member data
    const headers = membersSheet.getRange(1, 1, 1, membersSheet.getLastColumn()).getValues()[0];
    const phoneColIndex = headers.indexOf('phone_number');

    if (phoneColIndex === -1) {
      Logger.log('Warning: phone_number column not found in Members sheet');
      return true;
    }

    const lastRow = membersSheet.getLastRow();
    if (lastRow <= 1) {
      Logger.log('Warning: No members in Members sheet');
      return true;
    }

    const phoneNumbers = membersSheet.getRange(2, phoneColIndex + 1, lastRow - 1, 1).getValues();

    // Normalize phone number (remove spaces, dashes, parentheses)
    const normalizedInput = normalizePhoneNumber(phoneNumber);

    // Check if phone exists
    for (let i = 0; i < phoneNumbers.length; i++) {
      const memberPhone = normalizePhoneNumber(String(phoneNumbers[i][0]));
      if (memberPhone === normalizedInput) {
        return true;
      }
    }

    return false;

  } catch (error) {
    Logger.log('Error in verifyMember: ' + error.message);
    return true; // If error, allow submission (fail open)
  }
}

function getMemberId(sheet, phoneNumber) {
  try {
    const membersSheet = sheet.getSheetByName('Members');
    if (!membersSheet) {
      return '';
    }

    const headers = membersSheet.getRange(1, 1, 1, membersSheet.getLastColumn()).getValues()[0];
    const phoneColIndex = headers.indexOf('phone_number');
    const idColIndex = headers.indexOf('member_id');

    if (phoneColIndex === -1 || idColIndex === -1) {
      return '';
    }

    const lastRow = membersSheet.getLastRow();
    if (lastRow <= 1) {
      return '';
    }

    const data = membersSheet.getRange(2, 1, lastRow - 1, membersSheet.getLastColumn()).getValues();
    const normalizedInput = normalizePhoneNumber(phoneNumber);

    for (let i = 0; i < data.length; i++) {
      const memberPhone = normalizePhoneNumber(String(data[i][phoneColIndex]));
      if (memberPhone === normalizedInput) {
        return data[i][idColIndex];
      }
    }

    return '';

  } catch (error) {
    Logger.log('Error in getMemberId: ' + error.message);
    return '';
  }
}

function normalizePhoneNumber(phone) {
  if (!phone) return '';

  // Remove all non-digit characters except +
  let normalized = String(phone).replace(/[^\d+]/g, '');

  // Remove leading +1 (US country code)
  if (normalized.startsWith('+1')) {
    normalized = normalized.substring(2);
  } else if (normalized.startsWith('1') && normalized.length === 11) {
    normalized = normalized.substring(1);
  }

  // Return 10-digit format
  return normalized.substring(0, 10);
}

// ============================================
// WHEEL ID GENERATION
// ============================================

function generateNextWheelId(inventorySheet) {
  const headers = inventorySheet.getRange(1, 1, 1, inventorySheet.getLastColumn()).getValues()[0];
  const wheelIdColIndex = headers.indexOf('wheel_id');

  if (wheelIdColIndex === -1) {
    throw new Error('wheel_id column not found in Inventory sheet');
  }

  const lastRow = inventorySheet.getLastRow();
  if (lastRow <= 1) {
    return 'W001'; // First wheel
  }

  const wheelIds = inventorySheet.getRange(2, wheelIdColIndex + 1, lastRow - 1, 1).getValues();

  // Find the highest wheel ID number
  let maxId = 0;
  for (let i = 0; i < wheelIds.length; i++) {
    const wheelId = String(wheelIds[i][0]);
    if (wheelId && wheelId.startsWith('W')) {
      const idNum = parseInt(wheelId.substring(1));
      if (!isNaN(idNum) && idNum > maxId) {
        maxId = idNum;
      }
    }
  }

  // Generate next ID with 3 digits (W001, W002, W003...)
  const nextId = maxId + 1;
  return 'W' + String(nextId).padStart(3, '0');
}

// ============================================
// AUTO-GENERATE WHEEL IDs ON EDIT
// ============================================

function onEdit(e) {
  try {
    const sheet = e.source.getActiveSheet();

    // Only run on Inventory sheet
    if (sheet.getName() !== 'Inventory') {
      return;
    }

    const range = e.range;
    const row = range.getRow();

    // Skip header row
    if (row === 1) {
      return;
    }

    // Get headers
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const wheelIdColIndex = headers.indexOf('wheel_id');

    if (wheelIdColIndex === -1) {
      return;
    }

    // Check if wheel_id is empty
    const wheelIdCell = sheet.getRange(row, wheelIdColIndex + 1);
    const currentValue = wheelIdCell.getValue();

    if (!currentValue || currentValue === '') {
      // Generate and set wheel ID
      const newWheelId = generateNextWheelId(sheet);
      wheelIdCell.setValue(newWheelId);
      Logger.log('Auto-generated wheel ID: ' + newWheelId + ' for row ' + row);
    }

  } catch (error) {
    Logger.log('Error in onEdit: ' + error.message);
  }
}

// ============================================
// GET REVIEWS (FUTURE FEATURE)
// ============================================

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const reviewsSheet = sheet.getSheetByName('Reviews');

    if (!reviewsSheet) {
      throw new Error('Reviews sheet not found');
    }

    const wheelId = e.parameter.wheel_id;

    // Get all reviews (excluding phone numbers for privacy)
    const headers = reviewsSheet.getRange(1, 1, 1, reviewsSheet.getLastColumn()).getValues()[0];
    const lastRow = reviewsSheet.getLastRow();

    if (lastRow <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        reviews: []
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = reviewsSheet.getRange(2, 1, lastRow - 1, reviewsSheet.getLastColumn()).getValues();
    const reviews = [];

    for (let i = 0; i < data.length; i++) {
      const review = {};
      for (let j = 0; j < headers.length; j++) {
        // Exclude phone_number from response
        if (headers[j] !== 'phone_number') {
          review[headers[j]] = data[i][j];
        }
      }

      // Filter by wheel_id if provided
      if (!wheelId || review.wheel_id === wheelId) {
        reviews.push(review);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      reviews: reviews
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error in doGet: ' + error.message);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// MEMBER SYNC & REGISTRATION
// ============================================

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

    if (!formSheet || !membersSheet) {
      Logger.log('Warning: Member Registrations or Members sheet not found');
      return;
    }

    // Get the submitted data (last row from form)
    const lastRow = formSheet.getLastRow();
    const data = formSheet.getRange(lastRow, 1, 1, formSheet.getLastColumn()).getValues()[0];

    // Assuming form columns: [Timestamp, Phone Number, Display Name, Email]
    const timestamp = data[0];
    const phoneRaw = data[1];
    const displayName = data[2];
    const email = data[3] || '';

    // Normalize phone number
    const phone = normalizePhoneNumber(phoneRaw);

    // Validate phone format
    if (!phone || phone.length !== 10) {
      Logger.log('Invalid phone number format: ' + phoneRaw);
      return;
    }

    // Check if already exists in Members sheet
    const membersData = membersSheet.getDataRange().getValues();
    const headers = membersData[0];
    const phoneColIndex = headers.indexOf('phone_number');

    if (phoneColIndex === -1) {
      Logger.log('Error: phone_number column not found in Members sheet');
      return;
    }

    let exists = false;
    for (let i = 1; i < membersData.length; i++) {
      if (normalizePhoneNumber(String(membersData[i][phoneColIndex])) === phone) {
        exists = true;
        break;
      }
    }

    // Add to Members sheet if new
    if (!exists) {
      // Build row based on Members sheet structure
      const memberRow = new Array(headers.length).fill('');
      memberRow[headers.indexOf('phone_number')] = phone;
      memberRow[headers.indexOf('display_name')] = displayName;

      const emailColIndex = headers.indexOf('email');
      if (emailColIndex !== -1) {
        memberRow[emailColIndex] = email;
      }

      const timestampColIndex = headers.indexOf('registered_date');
      if (timestampColIndex !== -1) {
        memberRow[timestampColIndex] = timestamp;
      }

      // Generate member_id if column exists
      const memberIdColIndex = headers.indexOf('member_id');
      if (memberIdColIndex !== -1) {
        memberRow[memberIdColIndex] = generateMemberId(membersSheet);
      }

      membersSheet.appendRow(memberRow);
      Logger.log('✅ Added new member: ' + displayName + ' (' + phone + ')');
    } else {
      Logger.log('ℹ️ Member already exists: ' + phone);
    }

  } catch (error) {
    Logger.log('❌ Error in onFormSubmit: ' + error.toString());
  }
}

/**
 * MANUAL SYNC: Call this function to sync form responses to Members sheet
 * Useful for initial import or when form responses get out of sync
 * Run: Extensions > Apps Script > Select function > Run
 */
function manualSyncFormToMembers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const formSheet = ss.getSheetByName('Member Registrations');
  const membersSheet = ss.getSheetByName('Members');

  if (!formSheet) {
    Logger.log('Error: Member Registrations sheet not found');
    return { added: 0, skipped: 0, error: 'Sheet not found' };
  }

  if (!membersSheet) {
    Logger.log('Error: Members sheet not found');
    return { added: 0, skipped: 0, error: 'Sheet not found' };
  }

  // Get all form responses (skip header row)
  const formData = formSheet.getDataRange().getValues();
  const formHeaders = formData[0];

  let added = 0;
  let skipped = 0;

  // Get existing members
  const membersData = membersSheet.getDataRange().getValues();
  const membersHeaders = membersData[0];
  const phoneColIndex = membersHeaders.indexOf('phone_number');

  const existingPhones = new Set();
  for (let i = 1; i < membersData.length; i++) {
    existingPhones.add(normalizePhoneNumber(String(membersData[i][phoneColIndex])));
  }

  // Process each form submission
  for (let i = 1; i < formData.length; i++) {
    const row = formData[i];
    const timestamp = row[0];
    const phoneRaw = row[1];
    const displayName = row[2];
    const email = row[3] || '';

    const phone = normalizePhoneNumber(phoneRaw);

    // Validate phone format
    if (!phone || phone.length !== 10) {
      Logger.log('Skipping invalid phone: ' + phoneRaw);
      skipped++;
      continue;
    }

    // Skip if already exists
    if (existingPhones.has(phone)) {
      skipped++;
      continue;
    }

    // Build row based on Members sheet structure
    const memberRow = new Array(membersHeaders.length).fill('');
    memberRow[membersHeaders.indexOf('phone_number')] = phone;
    memberRow[membersHeaders.indexOf('display_name')] = displayName;

    const emailColIndex = membersHeaders.indexOf('email');
    if (emailColIndex !== -1) {
      memberRow[emailColIndex] = email;
    }

    const timestampColIndex = membersHeaders.indexOf('registered_date');
    if (timestampColIndex !== -1) {
      memberRow[timestampColIndex] = timestamp;
    }

    // Generate member_id if column exists
    const memberIdColIndex = membersHeaders.indexOf('member_id');
    if (memberIdColIndex !== -1) {
      memberRow[memberIdColIndex] = generateMemberId(membersSheet);
    }

    // Add to Members sheet
    membersSheet.appendRow(memberRow);
    existingPhones.add(phone);
    added++;
  }

  Logger.log('✅ Sync complete: ' + added + ' added, ' + skipped + ' skipped');
  return { added, skipped };
}

/**
 * Generate unique member ID (M001, M002, M003...)
 */
function generateMemberId(membersSheet) {
  const headers = membersSheet.getRange(1, 1, 1, membersSheet.getLastColumn()).getValues()[0];
  const memberIdColIndex = headers.indexOf('member_id');

  if (memberIdColIndex === -1) {
    return ''; // Column doesn't exist
  }

  const lastRow = membersSheet.getLastRow();
  if (lastRow <= 1) {
    return 'M001'; // First member
  }

  const memberIds = membersSheet.getRange(2, memberIdColIndex + 1, lastRow - 1, 1).getValues();

  // Find the highest member ID number
  let maxId = 0;
  for (let i = 0; i < memberIds.length; i++) {
    const memberId = String(memberIds[i][0]);
    if (memberId && memberId.startsWith('M')) {
      const idNum = parseInt(memberId.substring(1));
      if (!isNaN(idNum) && idNum > maxId) {
        maxId = idNum;
      }
    }
  }

  // Generate next ID with 3 digits (M001, M002, M003...)
  const nextId = maxId + 1;
  return 'M' + String(nextId).padStart(3, '0');
}

/**
 * BULK IMPORT: Import members from CSV sheet
 * 1. Create a sheet named "CSV Import"
 * 2. Paste CSV data with columns: phone_number, display_name
 * 3. Run this function
 */
function importMembersFromCSV() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const membersSheet = ss.getSheetByName('Members');
  const csvSheet = ss.getSheetByName('CSV Import');

  if (!csvSheet) {
    Logger.log('Error: CSV Import sheet not found. Create a sheet named "CSV Import" with phone_number, display_name columns.');
    return { added: 0, error: 'CSV Import sheet not found' };
  }

  if (!membersSheet) {
    Logger.log('Error: Members sheet not found');
    return { added: 0, error: 'Members sheet not found' };
  }

  const csvData = csvSheet.getDataRange().getValues();
  let added = 0;

  // Get existing members
  const membersData = membersSheet.getDataRange().getValues();
  const membersHeaders = membersData[0];
  const phoneColIndex = membersHeaders.indexOf('phone_number');

  const existingPhones = new Set();
  for (let i = 1; i < membersData.length; i++) {
    existingPhones.add(normalizePhoneNumber(String(membersData[i][phoneColIndex])));
  }

  // Skip header, process each row
  for (let i = 1; i < csvData.length; i++) {
    const phoneRaw = csvData[i][0];
    const displayName = csvData[i][1] || 'Unknown';

    const phone = normalizePhoneNumber(phoneRaw);

    // Validate phone format
    if (!phone || phone.length !== 10) {
      Logger.log('Skipping invalid phone: ' + phoneRaw);
      continue;
    }

    if (!existingPhones.has(phone)) {
      const memberRow = new Array(membersHeaders.length).fill('');
      memberRow[membersHeaders.indexOf('phone_number')] = phone;
      memberRow[membersHeaders.indexOf('display_name')] = displayName;

      const timestampColIndex = membersHeaders.indexOf('registered_date');
      if (timestampColIndex !== -1) {
        memberRow[timestampColIndex] = new Date();
      }

      const memberIdColIndex = membersHeaders.indexOf('member_id');
      if (memberIdColIndex !== -1) {
        memberRow[memberIdColIndex] = generateMemberId(membersSheet);
      }

      membersSheet.appendRow(memberRow);
      existingPhones.add(phone);
      added++;
    }
  }

  Logger.log('✅ Imported ' + added + ' members from CSV');
  return { added };
}

/**
 * DEACTIVATE MEMBER: Mark member as inactive (for audit trail)
 * Usage: deactivateMember('5551234567')
 * Note: Requires 'active' column in Members sheet
 */
function deactivateMember(phone) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const membersSheet = ss.getSheetByName('Members');

  if (!membersSheet) {
    Logger.log('Error: Members sheet not found');
    return false;
  }

  const data = membersSheet.getDataRange().getValues();
  const headers = data[0];
  const phoneColIndex = headers.indexOf('phone_number');
  const activeColIndex = headers.indexOf('active');

  if (phoneColIndex === -1) {
    Logger.log('Error: phone_number column not found');
    return false;
  }

  if (activeColIndex === -1) {
    Logger.log('Warning: active column not found. Add an "active" column to Members sheet.');
    return false;
  }

  const normalizedPhone = normalizePhoneNumber(phone);

  for (let i = 1; i < data.length; i++) {
    if (normalizePhoneNumber(String(data[i][phoneColIndex])) === normalizedPhone) {
      // Set "active" column to FALSE
      membersSheet.getRange(i + 1, activeColIndex + 1).setValue(false);
      Logger.log('✅ Deactivated member: ' + data[i][headers.indexOf('display_name')] + ' (' + phone + ')');
      return true;
    }
  }

  Logger.log('❌ Member not found: ' + phone);
  return false;
}
