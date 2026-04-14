import { collection, fields } from '@keystatic/core';

export const commanders = collection({
    label: 'Commanders',
    slugField: 'name',
    path: 'src/content/commanders/*',
    columns: ['dob', 'dod'],
    schema: {
        name: fields.slug({ name: { label: 'Name', validation: { isRequired: true } } }),

        image: fields.image({
            label: 'Image',
            directory: 'src/assets/commanders',
            publicPath: '@/assets/commanders/',
        }),

        dob: fields.date({ label: 'Date of Birth', validation: { isRequired: true } }),
        dod: fields.date({ label: 'Date of Death' }),

        servicePeriods: fields.array(
            fields.object({
                startYear: fields.integer({ label: 'Start Year', validation: { isRequired: true } }),
                endYear: fields.integer({ label: 'End Year' }),
            }),
            {
                label: 'Periods of Command',
                itemLabel: (props) => {
                    const start = props.fields.startYear.value;
                    const end = props.fields.endYear.value;
                    return `${start} - ${end ?? 'Present'}`;
                },
            }
        ),
    },
})