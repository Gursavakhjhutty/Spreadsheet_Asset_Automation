📄 Google Forms → Sheet Upsert Automation
This script automates processing of Google Form submissions by updating or inserting records into category-specific sheets. It ensures each Identifier is unique and keeps its Location up to date.

🚀 Overview
When a form response is submitted:

The script reads the submission data
Determines the target sheet based on the Category
Checks if the Identifier already exists

✅ If it exists → updates the Location
➕ If it does not exist → adds a new row


Applies normalization to prevent duplicates caused by spacing/case differences
Supports a special check-in keyword (Data Systems) for consistent location entries


🧩 Features

✅ Prevents duplicate identifiers
✅ Case-insensitive matching
✅ Trims and normalizes input data
✅ Dynamic sheet routing by category
✅ Efficient bulk reads for performance
✅ Easy configuration via CONFIG object


⚙️ Configuration
All configurable values are defined at the top of the script:
🔧 Key Settings
const CONFIG = {
  RESPONSE_SHEET_NAME: 'Form Responses 1',

  IDENTIFIER_COL: 1,  // Column A
  LOCATION_COL: 2,    // Column B

  CHECKIN_TOKEN: 'DATA SYSTEMS',
  CANONICAL_CHECKIN: 'Data Systems',

  FORM_HEADERS: {
    TIMESTAMP: 'Timestamp',
    CATEGORY: 'Category',
    IDENTIFIER: 'Identifier',
    LOCATION: 'Location'
  },

  CATEGORY_TO_SHEET: null
};

Setting  Description
RESPONSE_SHEET_NAME  Name of the form response sheet
IDENTIFIER_COL  Column index for Identifier
LOCATION_COL  Column index for Location
CHECKIN_TOKEN  Case-insensitive keyword for check-in
CANONICAL_CHECKIN  Standardized location value
FORM_HEADERS  Column names in the form response sheet
CATEGORY_TO_SHEET  Optional mapping for category → sheet name

📂 Sheet Structure Requirements
Each category sheet should:

Have headers in row 1
Include:

Column A → Identifier
Column B → Location

Example:

Identifier  Location
ABC123  Warehouse
XYZ789  Data Systems

🔁 How It Works
1. Form Submission Trigger
The onFormSubmit(e) function executes automatically when a form is submitted.
2. Data Extraction
The script maps form responses using header names:
getResponseObject_(e)
3. Normalization
Identifiers and location values are normalized:

Trimmed
Collapsed whitespace
Converted to uppercase (for comparison)

normalizeKey_(value)
4. Category Routing
Determines which sheet to update:
resolveCategorySheetName_(category)

Optional mapping can be defined if sheet names differ from category values.

5. Upsert Logic
Handled by:
upsertByIdentifier_(ws, identifier, location)

Searches for existing Identifier
Updates row if found
Appends new row if not


🔍 Special Behavior: Check-In Detection
If the submitted Location matches (case-insensitive):
Data Systems

It will always be stored as:
Data Systems

This ensures consistency across entries.

🛠️ Installation

Open your Google Sheet
Go to Extensions → Apps Script
Paste the script into the editor
Save the project
Set up a trigger:

Event Type: On form submit
Function: onFormSubmit




🧪 Example Workflow
Form Input:



Field  Value
Category  Laptops
Identifier  abc 123
Location  datasystems
Result in "Laptops" sheet:

Identifier  Location  
ABC 123  Data Systems

⚠️ Error Handling

Missing required fields → skipped
Invalid category sheet → logged via Logger.log
Script failures → safely caught in try/catch


📌 Notes

Identifiers are treated as unique keys
Matching is case-insensitive
Sheets must already exist
Script assumes headers match configuration exactly


✅ Customization Ideas

Add timestamp tracking in category sheets
Expand row structure with more fields
Add email notifications on updates
Validate allowed categories


👤 Author
Maintained by: Gursavakh Jhutty
