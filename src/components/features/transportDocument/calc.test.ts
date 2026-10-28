import { describe, expect, it } from "vitest";
import {
    buildTrips,
    exceedsLimit,
    findUnprintableChar,
    formatTenths,
    parseCount,
    totalTenths,
    validate,
    type FormState,
    type TransportConfig,
} from "./calc";

const config: TransportConfig = {
    cylinder: { label: "6,8", litresTenths: 68 },
    pointsLimit: 1000,
    station: {
        name: "FF Neumarkt",
        street: "Edlwies 3",
        postalCode: "4212",
        town: "Neumarkt im Mühlkreis",
    },
    fillingStation: {
        name: "Atemschutzwerkstätte",
        street: "Teststraße 1",
        postalCode: "4020",
        town: "Linz",
    },
};

const emptyAddress = { name: "", street: "", postalCode: "", town: "" };

const validState = (overrides: Partial<FormState> = {}): FormState => ({
    outboundCount: "4",
    returnCount: "4",
    sender: { choice: "station", other: emptyAddress },
    recipient: { choice: "fillingStation", other: emptyAddress },
    ...overrides,
});

describe("totalTenths", () => {
    it("multiplies count by the cylinder size in tenths", () => {
        expect(totalTenths(1, config.cylinder)).toBe(68);
        expect(totalTenths(147, config.cylinder)).toBe(9996);
        expect(totalTenths(148, config.cylinder)).toBe(10064);
    });
});

describe("exceedsLimit", () => {
    it("converts the points limit to tenths before comparing", () => {
        expect(exceedsLimit(68, 1000)).toBe(false);
        expect(exceedsLimit(9996, 1000)).toBe(false);
        expect(exceedsLimit(10000, 1000)).toBe(false);
        expect(exceedsLimit(10001, 1000)).toBe(true);
        expect(exceedsLimit(10064, 1000)).toBe(true);
    });
});

describe("formatTenths", () => {
    it("uses a decimal comma and drops a zero fraction", () => {
        expect(formatTenths(68)).toBe("6,8");
        expect(formatTenths(9996)).toBe("999,6");
        expect(formatTenths(10064)).toBe("1006,4");
        expect(formatTenths(340)).toBe("34");
        expect(formatTenths(0)).toBe("0");
    });
});

describe("parseCount", () => {
    it("accepts whole numbers >= 0", () => {
        expect(parseCount("0")).toBe(0);
        expect(parseCount(" 12 ")).toBe(12);
    });

    it("rejects empty, negative, fractional and non-numeric input", () => {
        expect(parseCount("")).toBeNull();
        expect(parseCount("-1")).toBeNull();
        expect(parseCount("1,5")).toBeNull();
        expect(parseCount("1.5")).toBeNull();
        expect(parseCount("abc")).toBeNull();
    });
});

describe("findUnprintableChar", () => {
    it("accepts German text and WinAnsi punctuation", () => {
        expect(findUnprintableChar("Straße 1, Öblarn – „Ä“ €")).toBeNull();
    });

    it("returns the first character Helvetica cannot encode", () => {
        expect(findUnprintableChar("Łódź")).toBe("Ł");
        expect(findUnprintableChar("Halle 🚒")).toBe("🚒");
    });
});

describe("validate", () => {
    it("accepts a complete form", () => {
        const result = validate(validState(), config);
        expect(result.formErrors).toEqual([]);
        expect(result.fieldErrors).toEqual({});
        expect(result.valid).toBe(true);
    });

    it("requires an outbound count above 0", () => {
        for (const outboundCount of ["", "0", "x"]) {
            const result = validate(validState({ outboundCount }), config);
            expect(result.formErrors).toContain("Anzahl der Flaschen eingeben.");
            expect(result.valid).toBe(false);
        }
    });

    it("allows 147 cylinders and blocks 148", () => {
        expect(validate(validState({ outboundCount: "147", returnCount: "147" }), config).valid).toBe(true);

        const result = validate(validState({ outboundCount: "148", returnCount: "0" }), config);
        expect(result.formErrors).toContain(
            "Hinfahrt: Mehr als 1000 Punkte (1006,4 Punkte). Ladung auf mehrere Fahrten aufteilen.",
        );
    });

    it("checks the return trip against the limit on its own", () => {
        const result = validate(validState({ outboundCount: "1", returnCount: "148" }), config);
        expect(result.formErrors).toContain(
            "Rückfahrt: Mehr als 1000 Punkte (1006,4 Punkte). Ladung auf mehrere Fahrten aufteilen.",
        );
    });

    it("reports only the outbound count while both are empty", () => {
        const result = validate(validState({ outboundCount: "", returnCount: "" }), config);
        expect(result.formErrors).toEqual(["Anzahl der Flaschen eingeben."]);
    });

    it("allows a return count of 0 but not an invalid one", () => {
        expect(validate(validState({ returnCount: "0" }), config).valid).toBe(true);
        expect(validate(validState({ returnCount: "" }), config).formErrors).toContain(
            "Anzahl der Flaschen für die Rückfahrt eingeben (0, wenn keine Flaschen zurückkommen).",
        );
    });

    it("requires different sender and recipient", () => {
        const result = validate(
            validState({ recipient: { choice: "station", other: emptyAddress } }),
            config,
        );
        expect(result.formErrors).toContain("Absender und Empfänger müssen verschieden sein.");
    });

    it("treats a free-text address equal to a preset as the same party", () => {
        const result = validate(
            validState({ recipient: { choice: "other", other: { ...config.station, name: " ff  neumarkt " } } }),
            config,
        );
        expect(result.formErrors).toContain("Absender und Empfänger müssen verschieden sein.");
    });

    it("validates free-text address fields", () => {
        const result = validate(
            validState({
                recipient: {
                    choice: "other",
                    other: { name: "", street: "x".repeat(81), postalCode: "4020", town: "Łódź" },
                },
            }),
            config,
        );
        expect(result.fieldErrors).toEqual({
            "recipient.name": "Feld ausfüllen.",
            "recipient.street": "Maximal 80 Zeichen.",
            "recipient.town": "Zeichen „Ł“ kann nicht gedruckt werden.",
        });
        expect(result.valid).toBe(false);
    });

    it("ignores free-text fields when a preset is chosen", () => {
        const result = validate(
            validState({ sender: { choice: "station", other: { ...emptyAddress, name: "🚒" } } }),
            config,
        );
        expect(result.fieldErrors).toEqual({});
    });

    it("rejects the filling-station preset when none is configured", () => {
        const result = validate(validState(), { ...config, fillingStation: null });
        expect(result.valid).toBe(false);
    });
});

describe("buildTrips", () => {
    it("builds the return trip with swapped parties", () => {
        const trips = buildTrips(validState({ returnCount: "3" }), config);
        expect(trips).toHaveLength(2);
        expect(trips[0]).toMatchObject({ count: 4, tenths: 272, sender: config.station, recipient: config.fillingStation });
        expect(trips[1]).toMatchObject({ count: 3, tenths: 204, sender: config.fillingStation, recipient: config.station });
    });

    it("drops the return trip when its count is 0", () => {
        expect(buildTrips(validState({ returnCount: "0" }), config)).toHaveLength(1);
    });
});
