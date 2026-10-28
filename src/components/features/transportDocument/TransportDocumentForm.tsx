import { useId, useState } from "react";
import {
    buildTrips,
    formatAddressLine,
    formatTenths,
    MAX_FIELD_LENGTH,
    parseCount,
    resolveParty,
    totalTenths,
    validate,
    type Address,
    type FieldKey,
    type FormState,
    type Party,
    type PartyChoice,
    type TransportConfig,
} from "./calc";
import { FORM_URL } from "./formLayout";

interface Props {
    config: TransportConfig;
    checklist: string[];
    stationLabel: string;
}

const emptyAddress: Address = { name: "", street: "", postalCode: "", town: "" };

const addressFieldLabels: Record<keyof Address, string> = {
    name: "Name",
    street: "Straße und Hausnummer",
    postalCode: "PLZ",
    town: "Ort",
};

const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

const pad = (value: number) => `${value}`.padStart(2, "0");

const fileName = (date: Date) =>
    `Befoerderungspapier_${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}.pdf`;

function TripTotal({ count, config }: { count: number | null; config: TransportConfig }) {
    if (count === null || count === 0) {
        return <p className="text-sm text-muted">Keine Flaschen.</p>;
    }
    const tenths = totalTenths(count, config.cylinder);
    return (
        <p className="text-sm text-secondary" aria-live="polite">
            {count} Flaschen à {config.cylinder.label} l = {formatTenths(tenths)} l ={" "}
            <strong>{formatTenths(tenths)} Punkte</strong> (max. {config.pointsLimit})
        </p>
    );
}

function PartyField({
    role,
    legend,
    party,
    onChange,
    options,
    fieldErrors,
    touched,
    onTouch,
}: {
    role: "sender" | "recipient";
    legend: string;
    party: Party;
    onChange: (party: Party) => void;
    options: { value: PartyChoice; label: string }[];
    fieldErrors: Partial<Record<FieldKey, string>>;
    touched: Set<FieldKey>;
    onTouch: (key: FieldKey) => void;
}) {
    const id = useId();
    return (
        <fieldset className="space-y-2">
            <legend className="font-semibold text-primary mb-1">{legend}</legend>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
                {options.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name={`${id}-${role}`}
                            value={option.value}
                            checked={party.choice === option.value}
                            onChange={() => onChange({ ...party, choice: option.value })}
                            className="accent-accent h-4 w-4"
                        />
                        {option.label}
                    </label>
                ))}
            </div>
            {party.choice === "other" && (
                <div className="grid gap-3 sm:grid-cols-[8rem_1fr] pt-2">
                    {(Object.keys(addressFieldLabels) as (keyof Address)[]).map((field) => {
                        const key: FieldKey = `${role}.${field}`;
                        // Show a field's message only once the user has left it, so an untouched form stays calm.
                        const error = touched.has(key) ? fieldErrors[key] : undefined;
                        const inputId = `${id}-${role}-${field}`;
                        return (
                            <div key={field} className={field === "postalCode" ? "" : "sm:col-span-2"}>
                                <label htmlFor={inputId} className="block text-sm text-secondary mb-1">
                                    {addressFieldLabels[field]}
                                </label>
                                <input
                                    id={inputId}
                                    type="text"
                                    maxLength={MAX_FIELD_LENGTH + 20}
                                    value={party.other[field]}
                                    aria-invalid={error ? true : undefined}
                                    aria-describedby={error ? `${inputId}-error` : undefined}
                                    onChange={(event) =>
                                        onChange({ ...party, other: { ...party.other, [field]: event.target.value } })
                                    }
                                    onBlur={() => onTouch(key)}
                                    className={inputClass}
                                />
                                {error && (
                                    <p id={`${inputId}-error`} className="text-sm text-accent-text mt-1">
                                        {error}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </fieldset>
    );
}

export default function TransportDocumentForm({ config, checklist, stationLabel }: Props) {
    const [outboundCount, setOutboundCount] = useState("");
    const [returnCountOverride, setReturnCountOverride] = useState<string | null>(null);
    const [sender, setSender] = useState<Party>({ choice: "station", other: emptyAddress });
    const [recipient, setRecipient] = useState<Party>({
        choice: config.fillingStation ? "fillingStation" : "other",
        other: emptyAddress,
    });
    const [touched, setTouched] = useState<Set<FieldKey>>(() => new Set());
    const touch = (key: FieldKey) => setTouched((previous) => new Set(previous).add(key));
    const [busy, setBusy] = useState(false);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    const state: FormState = {
        outboundCount,
        returnCount: returnCountOverride ?? outboundCount,
        sender,
        recipient,
    };
    const result = validate(state, config);

    const options: { value: PartyChoice; label: string }[] = [
        { value: "station", label: stationLabel },
        ...(config.fillingStation ? [{ value: "fillingStation" as const, label: config.fillingStation.name }] : []),
        { value: "other", label: "Andere Adresse" },
    ];

    const describe = (party: Party) => {
        const address = resolveParty(party, config);
        return address ? formatAddressLine(address) || "–" : "–";
    };

    const download = async () => {
        setBusy(true);
        setDownloadError(null);
        try {
            // pdf-lib is loaded only when a PDF is actually requested.
            const { fillForm } = await import("./fillForm");
            const response = await fetch(FORM_URL);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const bytes = await fillForm(await response.arrayBuffer(), buildTrips(state, config));
            const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }));
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName(new Date());
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 10_000);
        } catch (error) {
            setDownloadError(
                error instanceof Error && error.name === "AddressTooLongError"
                    ? "Eine Adresse ist zu lang für das Formular. Bitte kürzen."
                    : "PDF konnte nicht erstellt werden. Bitte Verbindung prüfen und erneut versuchen.",
            );
        } finally {
            setBusy(false);
        }
    };

    const outboundId = useId();
    const returnId = useId();

    return (
        <form className="space-y-6" onSubmit={(event) => event.preventDefault()} noValidate>
            <section className="bg-white rounded-xl shadow-sm p-5 space-y-5">
                <h2 className="text-xl font-bold">Hinfahrt</h2>
                <div>
                    <label htmlFor={outboundId} className="block font-semibold mb-1">
                        Anzahl Flaschen à {config.cylinder.label} l
                    </label>
                    <input
                        id={outboundId}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={1}
                        value={outboundCount}
                        onChange={(event) => setOutboundCount(event.target.value)}
                        className={`${inputClass} max-w-40`}
                    />
                </div>
                <PartyField
                    role="sender"
                    legend="Absender"
                    party={sender}
                    onChange={setSender}
                    options={options}
                    fieldErrors={result.fieldErrors}
                    touched={touched}
                    onTouch={touch}
                />
                <PartyField
                    role="recipient"
                    legend="Empfänger"
                    party={recipient}
                    onChange={setRecipient}
                    options={options}
                    fieldErrors={result.fieldErrors}
                    touched={touched}
                    onTouch={touch}
                />
                <TripTotal count={parseCount(state.outboundCount)} config={config} />
            </section>

            <section className="bg-white rounded-xl shadow-sm p-5 space-y-4">
                <h2 className="text-xl font-bold">Rückfahrt</h2>
                <dl className="grid grid-cols-[6rem_1fr] gap-y-1 text-sm">
                    <dt className="text-secondary">Absender</dt>
                    <dd>{describe(recipient)}</dd>
                    <dt className="text-secondary">Empfänger</dt>
                    <dd>{describe(sender)}</dd>
                </dl>
                <div>
                    <label htmlFor={returnId} className="block font-semibold mb-1">
                        Anzahl Flaschen à {config.cylinder.label} l
                    </label>
                    <input
                        id={returnId}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={1}
                        value={state.returnCount}
                        onChange={(event) => setReturnCountOverride(event.target.value)}
                        className={`${inputClass} max-w-40`}
                    />
                    <p className="text-sm text-muted mt-1">
                        Übernimmt die Anzahl der Hinfahrt, bis sie geändert wird. 0, wenn keine Flaschen
                        zurückkommen.
                    </p>
                </div>
                <TripTotal count={parseCount(state.returnCount)} config={config} />
            </section>

            <section className="bg-white rounded-xl shadow-sm p-5 space-y-3">
                <h2 className="text-xl font-bold">Vor der Fahrt</h2>
                <ul className="list-disc pl-5 space-y-1 text-secondary">
                    {checklist.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            </section>

            <div className="space-y-3">
                {(result.formErrors.length > 0 || Object.keys(result.fieldErrors).length > 0) && (
                    <ul className="bg-accent-bg text-accent-text rounded-lg p-4 text-sm space-y-1 list-disc pl-8" aria-live="polite">
                        {result.formErrors.map((message) => (
                            <li key={message}>{message}</li>
                        ))}
                        {Object.keys(result.fieldErrors).length > 0 && <li>Adressfelder prüfen.</li>}
                    </ul>
                )}
                {downloadError && (
                    <p role="alert" className="bg-accent-bg text-accent-text rounded-lg p-4 text-sm">
                        {downloadError}
                    </p>
                )}
                <button
                    type="button"
                    onClick={download}
                    disabled={!result.valid || busy}
                    className="w-full sm:w-auto bg-accent text-on-accent font-bold px-6 py-3 rounded-lg shadow-sm hover:brightness-110 disabled:bg-slate-300 disabled:text-secondary disabled:cursor-not-allowed"
                >
                    {busy ? "PDF wird erstellt …" : "PDF herunterladen"}
                </button>
            </div>
        </form>
    );
}
