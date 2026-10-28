import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { formatAddressLine, formatTenths, type Trip } from "./calc";
import {
    FONT_SIZE,
    MIN_ADDRESS_FONT_SIZE,
    formLayout,
    type CellSlot,
    type LineSlot,
} from "./formLayout";

const black = rgb(0, 0, 0);

export class AddressTooLongError extends Error {
    constructor(address: string) {
        super(`Adresse passt nicht in das Formular: ${address}`);
        this.name = "AddressTooLongError";
    }
}

const fits = (font: PDFFont, text: string, size: number, maxWidth: number) =>
    font.widthOfTextAtSize(text, size) <= maxWidth;

// Greedy word wrap into at most two lines; null if the text needs more.
const wrapTwoLines = (font: PDFFont, text: string, size: number, maxWidth: number): string[] | null => {
    const words = text.split(" ");
    let first = "";
    while (words.length > 0) {
        const candidate = first ? `${first} ${words[0]}` : words[0];
        if (!fits(font, candidate, size, maxWidth)) {
            break;
        }
        first = candidate;
        words.shift();
    }
    const second = words.join(" ");
    return first && fits(font, second, size, maxWidth) ? [first, second] : null;
};

// Shrinks the text until it fits on one line, then falls back to two lines between the label rows.
const drawLine = (page: PDFPage, font: PDFFont, text: string, slot: LineSlot) => {
    for (let size = FONT_SIZE; size >= MIN_ADDRESS_FONT_SIZE; size -= 0.5) {
        if (fits(font, text, size, slot.maxWidth)) {
            page.drawText(text, { x: slot.x, y: slot.y, size, font, color: black });
            return;
        }
    }
    for (let size = MIN_ADDRESS_FONT_SIZE + 2; size >= MIN_ADDRESS_FONT_SIZE; size -= 0.5) {
        const lines = wrapTwoLines(font, text, size, slot.maxWidth);
        if (lines) {
            const offset = size * 0.55;
            page.drawText(lines[0], { x: slot.x, y: slot.y + offset, size, font, color: black });
            page.drawText(lines[1], { x: slot.x, y: slot.y - offset, size, font, color: black });
            return;
        }
    }
    throw new AddressTooLongError(text);
};

const drawCentered = (page: PDFPage, font: PDFFont, text: string, slot: CellSlot) => {
    const width = font.widthOfTextAtSize(text, FONT_SIZE);
    page.drawText(text, { x: slot.centerX - width / 2, y: slot.y, size: FONT_SIZE, font, color: black });
};

// Returns a new PDF with one filled copy of the form's first page per trip.
export async function fillForm(formBytes: ArrayBuffer | Uint8Array, trips: Trip[]): Promise<Uint8Array> {
    const form = await PDFDocument.load(formBytes);
    const output = await PDFDocument.create();
    const font = await output.embedFont(StandardFonts.Helvetica);

    for (const trip of trips) {
        const [page] = await output.copyPages(form, [0]);
        output.addPage(page);

        const amount = formatTenths(trip.tenths);
        drawLine(page, font, formatAddressLine(trip.sender), formLayout.sender);
        drawLine(page, font, formatAddressLine(trip.recipient), formLayout.recipient);
        drawCentered(page, font, "X", formLayout.row.cylinderMark);
        drawCentered(page, font, `${trip.count}`, formLayout.row.count);
        drawCentered(page, font, amount, formLayout.row.litres);
        drawCentered(page, font, amount, formLayout.row.points);
        drawCentered(page, font, amount, formLayout.sum.litres);
        drawCentered(page, font, amount, formLayout.sum.points);
    }

    output.setTitle("Beförderungspapier für Pressluftflaschen");
    return output.save();
}
