import { singleton, fields } from '@keystatic/core';

export const globalSettings = singleton({
    label: 'Global Settings',
    path: 'src/content/settings/data',
    schema: {
        fireBrigadeName: fields.object(
            {
                organization: fields.text({ label: 'Name of organization', description: 'e.g. Freiwillige Feuerwehr', validation: { isRequired: true } }),
                organizationShort: fields.text({ label: 'Shorter version', description: 'e.g. FF' }),

                location: fields.text({ label: 'Name of fire brigade', description: 'e.g. Neumarkt im Mühlkreis', validation: { isRequired: true } }),
                locationShort: fields.text({ label: 'Shorter version', description: 'e.g. Neumarkt', validation: { isRequired: true } }),
            },
            { label: 'Name of the fire brigade' }
        ),
        emergencyNumber: fields.text({ label: 'Emergency Number', defaultValue: '122', validation: { isRequired: true } }),
        email: fields.text({ label: 'Contact Email', defaultValue: '02121@fr.ooelfv.at', validation: { isRequired: true } }),
        siteResponsible: fields.text({ label: 'Responsible for the content', description: 'e.g. Current chief', validation: { isRequired: true } }),
        phone: fields.text({ label: 'Contact Number', description: 'Number will be displayed as contact information, e.g. person responsible for site', validation: { isRequired: true } }),
        facebookUrl: fields.url({ label: 'Facebook Link' }),
        instagramUrl: fields.url({ label: 'Instagram Link' }),
        mapsUrl: fields.url({ label: 'Google Maps Link' }),
        address: fields.object(
            {
                street: fields.text({ label: 'Street', validation: { isRequired: true } }),
                postalCode: fields.text({ label: 'Postal Code', validation: { isRequired: true } }),
                town: fields.text({ label: 'Town / City', validation: { isRequired: true } }),
                country: fields.text({ label: 'Country', validation: { isRequired: true } }),
            },
            { label: 'Station Address' },
        ),
    },
})
