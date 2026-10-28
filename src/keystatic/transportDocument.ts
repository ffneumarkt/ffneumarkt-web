import { singleton, fields } from '@keystatic/core';

export const transportDocument = singleton({
    label: 'Beförderungspapier',
    path: 'src/content/transportDocument/data',
    schema: {
        cylinder: fields.object(
            {
                label: fields.text({
                    label: 'Label',
                    description: 'Nominal capacity as printed in the form column, e.g. 6,8',
                    validation: { isRequired: true },
                }),
                litresTenths: fields.integer({
                    label: 'Capacity in tenths of a litre',
                    description: 'e.g. 68 for 6,8 l',
                    validation: { isRequired: true, min: 1 },
                }),
            },
            { label: 'Cylinder size' }
        ),
        pointsLimit: fields.integer({
            label: 'Points limit per transport unit',
            description: 'ADR 1.1.3.6, in points (= litres for transport category 3), e.g. 1000',
            defaultValue: 1000,
            validation: { isRequired: true, min: 1 },
        }),
        fillingStation: fields.object(
            {
                name: fields.text({ label: 'Name', description: 'Leave empty to hide the filling-station preset' }),
                street: fields.text({ label: 'Street' }),
                postalCode: fields.text({ label: 'Postal Code' }),
                town: fields.text({ label: 'Town / City' }),
            },
            { label: 'Default filling station' }
        ),
        checklist: fields.array(
            fields.text({ label: 'Item', validation: { length: { min: 1 } } }),
            {
                label: 'Pre-trip checklist',
                description: 'Shown as reminders above the download button; not required for the download',
                itemLabel: (props) => props.value || 'Item',
            }
        ),
    },
})
