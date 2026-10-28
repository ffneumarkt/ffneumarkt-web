import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import type { Trip } from "./calc";
import { AddressTooLongError, fillForm } from "./fillForm";

const formBytes = readFileSync(join(process.cwd(), "public/forms/1.5.016_befoerderungspapier.pdf"));

const station = { name: "FF Neumarkt", street: "Edlwies 3", postalCode: "4212", town: "Neumarkt im Mühlkreis" };
const fillingStation = { name: "Atemschutzwerkstätte", street: "Teststraße 1", postalCode: "4020", town: "Linz" };

const outbound: Trip = { sender: station, recipient: fillingStation, count: 4, tenths: 272 };
const inbound: Trip = { sender: fillingStation, recipient: station, count: 3, tenths: 204 };

describe("fillForm", () => {
    it("creates one A4 page per trip", async () => {
        const pdf = await PDFDocument.load(await fillForm(formBytes, [outbound, inbound]));
        expect(pdf.getPageCount()).toBe(2);
        const { width, height } = pdf.getPage(0).getSize();
        expect(Math.round(width)).toBe(595);
        expect(Math.round(height)).toBe(842);
    });

    it("creates a single page without a return trip", async () => {
        const pdf = await PDFDocument.load(await fillForm(formBytes, [outbound]));
        expect(pdf.getPageCount()).toBe(1);
    });

    it("fits a long address by shrinking and wrapping", async () => {
        const words = "Atemschutzwerkstätte Bezirksfeuerwehrkommando ".repeat(2).trim();
        const longAddress = { name: words, street: words, postalCode: "4020", town: "Linz an der Donau" };
        const bytes = await fillForm(formBytes, [{ ...outbound, sender: longAddress }]);
        expect(bytes.byteLength).toBeGreaterThan(0);
    });

    it("refuses an address that does not fit on two lines", async () => {
        const tooLong = { name: "W".repeat(80), street: "W".repeat(80), postalCode: "4020", town: "W".repeat(80) };
        await expect(fillForm(formBytes, [{ ...outbound, sender: tooLong }])).rejects.toBeInstanceOf(AddressTooLongError);
    });
});
