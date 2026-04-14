import { collection, fields } from '@keystatic/core';

export const chronicle = collection({
    label: 'Chronicle',
    slugField: 'title',
    path: 'src/content/chronicle/*',
    columns: ['year', 'endYear', 'icon'],
    schema: {
        year: fields.integer({ label: 'Year', validation: { isRequired: true } }),
        endYear: fields.integer({ label: 'End Year (optional)' }),
        title: fields.slug({ name: { label: 'Event titel', validation: { isRequired: true } } }),
        description: fields.text({ label: 'Description', multiline: true }),
        image: fields.image({
            label: 'Image',
            directory: 'src/assets/chronicle',
            publicPath: '@/assets/chronicle/',
        }),
        icon: fields.select({
            label: 'Icon type',
            options: [
                { label: 'Fire/Deployment', value: 'fire' },
                { label: 'Vehicle', value: 'truck' },
                { label: 'Building', value: 'building' },
                { label: 'Award/Honor', value: 'medal' },
            ],
            defaultValue: 'fire'
        }),
    },
})
