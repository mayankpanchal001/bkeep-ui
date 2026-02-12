
/**
 * Utility functions for invoice calculations
 * Handles floating point precision by rounding at appropriate steps
 */

export type LineItem = {
    qty: number;
    price: number;
};

export type InvoiceTotals = {
    subtotal: number;
    discountAmount: number;
    taxableAmount: number;
    taxAmount: number;
    totalAmount: number;
};

/**
 * Rounds a number to 2 decimal places
 */
export const roundToTwoDecimals = (num: number): number => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
};

/**
 * Calculates the total for a single line item
 */
export const calculateLineItemTotal = (qty: number, price: number): number => {
    return roundToTwoDecimals(qty * price);
};

/**
 * Calculates invoice totals
 * @param lineItems Array of line items with qty and price
 * @param discountValue Value of the discount (percentage or fixed amount)
 * @param discountType Type of discount ('percentage' | 'fixed')
 * @param taxRatePercentage Tax rate as a percentage (e.g. 13 for 13%)
 */
export const calculateInvoiceTotals = (
    lineItems: LineItem[],
    discountValue: number,
    discountType: 'percentage' | 'fixed',
    taxRatePercentage: number
): InvoiceTotals => {
    // 1. Calculate Subtotal
    // Sum of rounded line item totals
    const subtotal = lineItems.reduce((sum, item) => {
        return roundToTwoDecimals(sum + calculateLineItemTotal(item.qty, item.price));
    }, 0);

    // 2. Calculate Discount Amount
    let discountAmount = 0;
    if (discountType === 'percentage') {
        // Calculate percentage on the subtotal
        discountAmount = roundToTwoDecimals(subtotal * (discountValue / 100));
    } else {
        // Fixed amount
        discountAmount = roundToTwoDecimals(discountValue);
    }

    // Ensure discount doesn't exceed subtotal
    if (discountAmount > subtotal) {
        discountAmount = subtotal;
    }

    // 3. Calculate Taxable Amount
    const taxableAmount = roundToTwoDecimals(subtotal - discountAmount);

    // 4. Calculate Tax Amount
    // Tax is applied to the taxable amount (post-discount)
    const taxAmount = roundToTwoDecimals(taxableAmount * (taxRatePercentage / 100));

    // 5. Calculate Total Amount
    const totalAmount = roundToTwoDecimals(taxableAmount + taxAmount);

    return {
        subtotal,
        discountAmount,
        taxableAmount,
        taxAmount,
        totalAmount,
    };
};
