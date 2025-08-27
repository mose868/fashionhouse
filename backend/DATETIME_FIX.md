# MySQL Datetime Fix

## Problem
The application was encountering the following error when inserting data into MySQL:
```
Internal server error: Incorrect datetime value: '2025-08-26T18:31:09.572Z' for column 'createdAt' at row 1
```

## Root Cause
MySQL's `TIMESTAMP` data type expects the format `YYYY-MM-DD HH:MM:SS`, but the application was sending ISO 8601 format strings like `2025-08-26T18:31:09.572Z`.

## Solution
Created a utility function `toMySQLTimestamp()` in `src/data/db.js` that converts ISO date strings to MySQL-compatible format:

```javascript
export const toMySQLTimestamp = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toISOString().slice(0, 19).replace('T', ' ');
};
```

## Files Modified

### 1. `src/data/db.js`
- Added `toMySQLTimestamp()` utility function
- Exported the function for use throughout the application

### 2. `src/routes/reviews.js`
- Imported `toMySQLTimestamp` function
- Updated review creation to use proper MySQL timestamp format

### 3. `src/routes/admin.js`
- Imported `toMySQLTimestamp` function
- Updated product creation to use proper MySQL timestamp format

### 4. `src/routes/payments.js`
- Imported `toMySQLTimestamp` function
- Created `nowMySQL()` helper function
- Updated all payment database operations to use proper MySQL timestamp format

### 5. `src/data/persistence.js`
- Imported `toMySQLTimestamp` function
- Updated all database save operations to use proper MySQL timestamp format

## Testing
The fix was tested with various date formats:
- ISO strings: `2025-08-26T18:31:09.572Z` → `2025-08-26 18:36:23`
- Current dates: `2025-08-26T18:36:23.498Z` → `2025-08-26 18:36:23`
- Null/undefined values are handled gracefully

## Result
All database operations now use the correct MySQL timestamp format, preventing the datetime error from occurring.
