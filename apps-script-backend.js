/**
 * SFF Wheel Library - Google Apps Script Backend
 *
 * This script handles:
 * 1. Review submissions (doPost for reviews)
 * 2. Add Wheels form submissions (doPost for inventory)
 * 3. Auto-generation of wheel IDs (onEdit trigger)
 * 4. Member validation against Members sheet
 *
 * Deploy as: Web app
 * Execute as: Me
 * Who has access: Anyone with a Google account
 */

// ============================================
// HANDLE POST REQUESTS (FORMS)
// ============================================

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const data = JSON.parse(e.postData.contents);

    Logger.log('Received POST data: ' + JSON.stringify(data));

    // Determine if this is a review submission or add wheels submission
    // Reviews have: rating, review_text, experience_level
    // Add Wheels has: brand, wheel_name, wheel_size

    if (data.rating !== undefined || data.review_text !== undefined) {
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
// HANDLE REVIEW SUBMISSIONS
// ============================================

function handleReviewSubmission(sheet, data) {
  try {
    // Validate required fields
    const requiredFields = ['phone_number', 'display_name', 'wheel_id', 'rating'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Verify member exists
    if (!verifyMember(sheet, data.phone_number)) {
      throw new Error('Phone number not found in member list. Please ensure you are a registered SFF member.');
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
    rowData[headers.indexOf('phone_number')] = data.phone_number;
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
    const requiredFields = ['lender_phone', 'lender_display_name', 'wheel_name', 'brand', 'wheel_size', 'durometer', 'material'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Verify member exists
    if (!verifyMember(sheet, data.lender_phone)) {
      throw new Error('Phone number not found in member list. Please ensure you are a registered SFF member.');
    }

    // Get Inventory sheet
    const inventorySheet = sheet.getSheetByName('Inventory');
    if (!inventorySheet) {
      throw new Error('Inventory sheet not found');
    }

    // Generate new wheel ID (W001, W002, W003...)
    const newWheelId = generateNextWheelId(inventorySheet);

    // Get member ID from Members sheet
    const lenderId = getMemberId(sheet, data.lender_phone);

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
  // Remove all non-numeric characters
  return String(phone).replace(/\D/g, '');
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
