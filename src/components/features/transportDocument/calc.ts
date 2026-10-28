// All quantities are integers in tenths of a litre (6,8 l = 68) so that sums stay exact.
// For transport category 3 one litre equals one point (ADR 1.1.3.6), so points share that unit.

export interface Cylinder {
    label: string;
    litresTenths: number;
}

export interface Address {
    name: string;
    street: string;
    postalCode: string;
    town: string;
}

export interface TransportConfig {
    cylinder: Cylinder;
    pointsLimit: number;
    station: Address;
    fillingStation: Address | null;
}

export type PartyChoice = "station" | "fillingStation" | "other";

export interface Party {
    choice: PartyChoice;
    other: Address;
}

export interface FormState {
    outboundCount: string;
    returnCount: string;
    sender: Party;
    recipient: Party;
}

export type FieldKey = `${"sender" | "recipient"}.${keyof Address}`;

export interface ValidationResult {
    valid: boolean;
    formErrors: string[];
    fieldErrors: Partial<Record<FieldKey, string>>;
}

export interface Trip {
    sender: Address;
    recipient: Address;
    count: number;
    tenths: number;
}

export const MAX_FIELD_LENGTH = 80;

const ADDRESS_FIELDS: (keyof Address)[] = ["name", "street", "postalCode", "town"];

// Windows-1252 characters outside Latin-1 that the PDF standard fonts can encode.
const WIN_ANSI_EXTRAS = new Set("€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ");

export const totalTenths = (count: number, cylinder: Cylinder): number =>
    count * cylinder.litresTenths;

export const exceedsLimit = (tenths: number, pointsLimit: number): boolean =>
    tenths > pointsLimit * 10;

// No thousands separator: de-AT grouping may use a narrow no-break space, which the PDF font cannot print.
export const formatTenths = (tenths: number): string => {
    const whole = Math.floor(tenths / 10);
    const fraction = tenths % 10;
    return fraction === 0 ? `${whole}` : `${whole},${fraction}`;
};

export const parseCount = (input: string): number | null => {
    const trimmed = input.trim();
    return /^\d+$/.test(trimmed) ? Number(trimmed) : null;
};

export const findUnprintableChar = (text: string): string | null => {
    for (const char of text) {
        const code = char.codePointAt(0)!;
        const isLatin1 = (code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff);
        if (!isLatin1 && !WIN_ANSI_EXTRAS.has(char)) {
            return char;
        }
    }
    return null;
};

export const formatAddressLine = (address: Address): string =>
    [address.name, address.street, `${address.postalCode} ${address.town}`]
        .map((part) => part.trim())
        .filter(Boolean)
        .join(", ");

export const resolveParty = (party: Party, config: TransportConfig): Address | null => {
    switch (party.choice) {
        case "station":
            return config.station;
        case "fillingStation":
            return config.fillingStation;
        case "other":
            return party.other;
    }
};

const normalise = (address: Address): string =>
    formatAddressLine(address).toLocaleLowerCase("de-AT").replace(/\s+/g, " ");

const limitMessage = (tripLabel: string, tenths: number, pointsLimit: number): string =>
    `${tripLabel}: Mehr als ${pointsLimit} Punkte (${formatTenths(tenths)} Punkte). Ladung auf mehrere Fahrten aufteilen.`;

const validateFreeText = (
    role: "sender" | "recipient",
    party: Party,
    fieldErrors: ValidationResult["fieldErrors"],
) => {
    if (party.choice !== "other") {
        return;
    }
    for (const field of ADDRESS_FIELDS) {
        const value = party.other[field].trim();
        const unprintable = findUnprintableChar(value);
        let message: string | null = null;
        if (value === "") {
            message = "Feld ausfüllen.";
        } else if (value.length > MAX_FIELD_LENGTH) {
            message = `Maximal ${MAX_FIELD_LENGTH} Zeichen.`;
        } else if (unprintable) {
            message = `Zeichen „${unprintable}“ kann nicht gedruckt werden.`;
        }
        if (message) {
            fieldErrors[`${role}.${field}`] = message;
        }
    }
};

export const validate = (state: FormState, config: TransportConfig): ValidationResult => {
    const formErrors: string[] = [];
    const fieldErrors: ValidationResult["fieldErrors"] = {};

    const outbound = parseCount(state.outboundCount);
    if (outbound === null || outbound === 0) {
        formErrors.push("Anzahl der Flaschen eingeben.");
    } else {
        const tenths = totalTenths(outbound, config.cylinder);
        if (exceedsLimit(tenths, config.pointsLimit)) {
            formErrors.push(limitMessage("Hinfahrt", tenths, config.pointsLimit));
        }
    }

    const inbound = parseCount(state.returnCount);
    // An invalid outbound count already produced a message; the return count usually just mirrors it.
    if (inbound === null) {
        if (outbound !== null && outbound > 0) {
            formErrors.push("Anzahl der Flaschen für die Rückfahrt eingeben (0, wenn keine Flaschen zurückkommen).");
        }
    } else {
        const tenths = totalTenths(inbound, config.cylinder);
        if (exceedsLimit(tenths, config.pointsLimit)) {
            formErrors.push(limitMessage("Rückfahrt", tenths, config.pointsLimit));
        }
    }

    const sender = resolveParty(state.sender, config);
    const recipient = resolveParty(state.recipient, config);
    if (!sender || !recipient) {
        formErrors.push("Keine Füllstelle konfiguriert. Bitte „Andere Adresse“ wählen.");
    }

    validateFreeText("sender", state.sender, fieldErrors);
    validateFreeText("recipient", state.recipient, fieldErrors);

    if (sender && recipient && normalise(sender) === normalise(recipient)) {
        formErrors.push("Absender und Empfänger müssen verschieden sein.");
    }

    return {
        valid: formErrors.length === 0 && Object.keys(fieldErrors).length === 0,
        formErrors,
        fieldErrors,
    };
};

// Only meaningful for a state that passed validate().
export const buildTrips = (state: FormState, config: TransportConfig): Trip[] => {
    const sender = resolveParty(state.sender, config)!;
    const recipient = resolveParty(state.recipient, config)!;
    const trips: Trip[] = [];

    for (const [count, from, to] of [
        [parseCount(state.outboundCount) ?? 0, sender, recipient],
        [parseCount(state.returnCount) ?? 0, recipient, sender],
    ] as const) {
        if (count > 0) {
            trips.push({ sender: from, recipient: to, count, tenths: totalTenths(count, config.cylinder) });
        }
    }

    return trips;
};
