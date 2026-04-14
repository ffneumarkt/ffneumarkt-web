export interface fireBrigadeName {
    organization: string;
    location: string;
    organizationShort?: string | undefined;
    locationShort?: string | undefined;
}

export const organizationShort = (name: fireBrigadeName): string =>
    `${name.organizationShort || name.organization}`.trim();

export const locationShort = (name: fireBrigadeName): string =>
    `${name.locationShort || name.location}`.trim();

export const formatLongFireBrigadeName = (name: fireBrigadeName): string =>
    `${name.organization} ${name.location}`.trim();

export const formatShortFireBrigadeName = (name: fireBrigadeName): string =>
    `${name.organizationShort} ${name.locationShort}`.trim();