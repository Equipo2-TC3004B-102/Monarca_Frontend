/**
 * FileName: formatMoney.tsx
 * Description: Provides a utility function for formatting numerical values into a standardized Mexican Peso (MXN) currency format, ensuring consistent display of monetary values across the application.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 20/04/2026 [Sebastián Borjas] Added support for advance money currency.
 */

/**
 * FunctionName: formatMoney, formats a number into Mexican Peso (MXN) currency string.
 * Input: a number representing an amount in Mexican Pesos
 * Output: a formatted currency string in the format "$X,XXX.XX" (e.g., "$1,234.56")
 */
const formatMoney = (value: any, currencyCode: string = 'MXN'): string => {
    const parsedValue = typeof value === 'number' ? value : parseFloat(value);
    if (typeof parsedValue !== 'number' || isNaN(parsedValue)) {
        return '$0.00';
    }
    return parsedValue.toLocaleString('es-MX', { style: 'currency', currency: currencyCode });
}

export default formatMoney;