// Text positions for public/forms/1.5.016_befoerderungspapier.pdf (A4, 595.28 × 841.89 pt).
// Coordinates are PDF points from the bottom-left corner. Re-measure when the form file is replaced.

export const FORM_URL = "/forms/1.5.016_befoerderungspapier.pdf";

export const FONT_SIZE = 11;
export const MIN_ADDRESS_FONT_SIZE = 7;

export interface LineSlot {
    x: number;
    y: number;
    maxWidth: number;
}

export interface CellSlot {
    centerX: number;
    y: number;
}

export const formLayout = {
    sender: { x: 112, y: 596, maxWidth: 440 } satisfies LineSlot,
    recipient: { x: 112, y: 568, maxWidth: 440 } satisfies LineSlot,
    row: {
        cylinderMark: { centerX: 246.5, y: 480 } satisfies CellSlot,
        count: { centerX: 406, y: 480 } satisfies CellSlot,
        litres: { centerX: 476, y: 480 } satisfies CellSlot,
        points: { centerX: 544, y: 480 } satisfies CellSlot,
    },
    sum: {
        litres: { centerX: 476, y: 312 } satisfies CellSlot,
        points: { centerX: 544, y: 312 } satisfies CellSlot,
    },
};
