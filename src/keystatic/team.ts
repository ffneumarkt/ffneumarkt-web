import { collection, fields } from '@keystatic/core';
import { RANK_CONFIG } from '@/config/ranks';

export const teamCollection = collection({
    label: 'Team',
    slugField: 'name',
    path: 'src/content/team/*',
    format: { data: 'yaml' },
    columns: ['name', 'rank', 'role'],
    schema: {
        name: fields.slug({ name: { label: 'Name', validation: { isRequired: true } } }),
        rank: fields.select({
            label: 'Rank',
            defaultValue: 'HBM',
            options: RANK_CONFIG.map(
                rank => ({
                    label: rank.value,
                    value: rank.value,
                })
            ),
        }),
        role: fields.text({ label: 'Role' }),
        group: fields.multiselect({
            label: 'Group',
            options: [
                { label: 'Kommando', value: 'officer' },
                { label: 'Erweitertes Kommando', value: 'charge' },
                { label: 'Ehrendienstgradträger', value: 'honorary' },
            ]
        }),
        honoraryYear: fields.integer({
            label: 'Honorary year',
            description: 'Important for sorting of honorary rank holders '
        }),
        photo: fields.image({
            label: 'Image',
            directory: 'src/assets/team',
            publicPath: '@/assets/team/',
        }),
    },
});