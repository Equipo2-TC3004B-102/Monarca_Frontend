/**
 * FileName: formatDate.tsx
 * Description: Provides a utility function for formatting date strings into a more human-readable format, specifically in the "dd/MM/yyyy" format, to be used throughout the application for consistent date display.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 02/06/2026 [Nicolas Quintana] Removed comment redundancies.
 */

/**
 * FunctionName: formatDate, formats a date string into "dd/MM/yyyy" format.
 * Input: a date string in any standard format
 * Output: a formatted date string in "dd/MM/yyyy" format
 */
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
    const year = date.getFullYear();
  
    return `${day}/${month}/${year}`;
  };
  
  export default formatDate;
  