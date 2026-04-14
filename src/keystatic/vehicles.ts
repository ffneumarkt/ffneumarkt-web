import { fields, collection } from '@keystatic/core';

export const vehicles = collection({
    label: 'Vehicle',
    slugField: 'name',
    path: 'src/content/vehicles/*',
    format: { data: 'yaml' },
    columns: ['sortOrder'],
    schema: {
        name: fields.slug({ name: { label: 'Vehicle Name', validation: { isRequired: true } } }),
        tacticalName: fields.text({ label: 'Tactical Name (e.g. Tank 1)', validation: { isRequired: true } }),
        gallery: fields.array(
            fields.image({
                label: 'Photo',
                directory: 'src/assets/vehicles',
                publicPath: '@/assets/vehicles/',
            }),
            { label: 'Photo Gallery', itemLabel: _ => 'Image' }
        ),
        sortOrder: fields.integer({ label: 'Sort order', validation: { isRequired: true } }),
        specs: fields.object({
            power: fields.text({ label: 'Power', validation: { isRequired: true } }),
            weight: fields.text({ label: 'Weight', validation: { isRequired: true } }),
            crew: fields.text({ label: 'Crew' }),
            construction: fields.text({
                label: 'Year of Construction',
                validation: {
                    length: { min: 4, max: 4 },
                }
            }),
            manufacturer: fields.text({
                label: 'Manufacturer', validation: { isRequired: true }
            })
        }, { label: 'Technical Data' }),
        details: fields.array(
            fields.object({
                amount: fields.text({
                    label: 'Quantity / Performance',
                    description: 'e.g. “2 000 liters” “14 kVA”',
                }),
                item: fields.text({
                    label: 'Equipment',
                    validation: { isRequired: true },
                }),
            }),
            {
                label: 'Details & Loading',
                itemLabel: (props) => props.fields.item.value || 'Detail',
            }
        ),
    },
});
