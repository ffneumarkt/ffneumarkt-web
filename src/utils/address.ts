export interface AddressFields {
    street: string;
    postalCode: string;
    town: string;
    country: string;
}

export const formatCityLine = (address: AddressFields): string =>
    `${address.postalCode} ${address.town}`.trim();

export const formatAddressLines = (address: AddressFields): string[] => [
    address.street,
    formatCityLine(address),
    address.country,
];

export const formatAddressMultiline = (
    address: AddressFields
): string => {
    return formatAddressLines(address).join("\n");
};

