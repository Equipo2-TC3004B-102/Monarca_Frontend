/**
 * FileName: formatMoney.tsx
 * Description: Provides a utility function for formatting numerical values into a standardized Mexican Peso (MXN) currency format, ensuring consistent display of monetary values across the application.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Santiago-Coronado] Added detailed comments and documentation for clarity and maintainability.
 */

/**
 * FunctionName: formatMoney, formats a number into Mexican Peso (MXN) currency string.
 * Input: a number representing an amount in Mexican Pesos
 * Output: a formatted currency string in the format "$X,XXX.XX" (e.g., "$1,234.56")
 */
const formatMoney = (value: number): string => {
    if (typeof value !== 'number' || isNaN(value)) {
        return '$0.00';
    }
    return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

export default formatMoney;