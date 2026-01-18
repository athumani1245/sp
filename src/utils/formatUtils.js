// Utility functions for formatting monetary values

/**
 * Format number with commas for display
 * @param {string|number} value - The value to format
 * @returns {string} - Formatted value with commas
 */
export const formatNumberWithCommas = (value) => {
    if (!value || value === '') return '';
    
    // Remove any existing commas and non-numeric characters except decimal point
    const cleanValue = value.toString().replace(/[^0-9.]/g, '');
    
    // If empty after cleaning, return empty string
    if (!cleanValue) return '';
    
    // Split into integer and decimal parts
    const parts = cleanValue.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    
    // Add commas to integer part
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Return formatted number with decimal part if it exists
    return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

/**
 * Parse formatted number to get raw numeric value
 * @param {string} value - The formatted value with commas
 * @returns {string} - Raw numeric value without commas
 */
export const parseFormattedNumber = (value) => {
    if (!value || value === '') return '';
    
    // Remove commas and return clean number
    return value.toString().replace(/,/g, '');
};

/**
 * Handle input change for monetary fields with comma formatting
 * @param {Event} event - The input change event
 * @param {Function} setFormData - State setter function
 * @param {string} fieldName - Name of the field being updated
 */
export const handleMonetaryInputChange = (event, setFormData, fieldName) => {
    const { value } = event.target;
    
    // Parse the value to remove commas for storage
    const rawValue = parseFormattedNumber(value);
    
    // Update form data with raw value
    setFormData(prevState => ({
        ...prevState,
        [fieldName]: rawValue
    }));
};

/**
 * Format date string to readable format
 * @param {string} dateString - Date string in DD-MM-YYYY format or ISO format
 * @returns {string} - Formatted date (e.g., 'Jan 8, 2026')
 */
export const formatDate = (dateString) => {
    if (!dateString) return '';
    
    let date;
    
    // Try to parse DD-MM-YYYY format first (e.g., "05-01-2026")
    if (typeof dateString === 'string' && dateString.includes('-')) {
        const parts = dateString.split('-');
        // Check if it looks like DD-MM-YYYY (day is first, year is last and 4 digits)
        if (parts.length === 3 && parts[2].length === 4 && parseInt(parts[0]) <= 31) {
            // Parse as DD-MM-YYYY
            const [day, month, year] = parts;
            date = new Date(year, month - 1, day);
        } else {
            // Try as ISO format
            date = new Date(dateString);
        }
    } else {
        date = new Date(dateString);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) return dateString;
    
    // Format: Month Day, Year (e.g., 'Jan 8, 2026')
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};