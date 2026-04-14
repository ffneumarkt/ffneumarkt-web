import { defineCollection, z } from 'astro:content';

const vehicles = defineCollection({
    type: 'data',
    schema: ({ image }) => z.object({
        name: z.string(),
        tacticalName: z.string(),
        gallery: z.array(image()).optional(),
        details: z.array(
            z.object({
                amount: z.string().optional(),
                item: z.string(),
            })
        ).default([]),
        specs: z.object({
            power: z.string(),
            weight: z.string(),
            crew: z.string().optional(),
            construction: z.string(),
            manufacturer: z.string(),
        }).optional(),
        sortOrder: z.number(),
    }),
});

const team = defineCollection({
    type: 'data',
    schema: ({ image }) => z.object({
        name: z.string(),
        rank: z.string(),
        role: z.string().optional(),
        group: z.array(z.string()),
        honoraryYear: z.number().optional(),
        photo: image().optional(),
    }),
});

const settings = defineCollection({
    type: 'data',
    schema: z.object({
        fireBrigadeName: z.object({
            organization: z.string(),
            organizationShort: z.string().optional(),
            location: z.string(),
            locationShort: z.string().optional(),
        }),
        emergencyNumber: z.string(),
        siteResponsible: z.string(),
        phone: z.string(),
        email: z.string(),
        facebookUrl: z.string().optional(),
        instagramUrl: z.string().optional(),
        mapsUrl: z.string().optional(),
        address: z.object({
            street: z.string(),
            postalCode: z.string(),
            town: z.string(),
            country: z.string(),
        }),
    }),
});

const landingPage = defineCollection({
    type: 'data',
    schema: ({ image }) => z.object({
        heroKicker: z.string(),
        heroTagline: z.string(),
        heroImages: z.array(
            z.object({
                image: image(),
                alt: z.string(),
            })
        ),
        journeyHeroInfoBlocks: z.array(
            z.object({
                image: image(),
                imageAlt: z.string(),
                kicker: z.string(),
                title: z.string(),
                description: z.string(),
                link: z.string(),
            })
        ),
        journeyHeroFactBlocks: z.array(
            z.object({
                title: z.string(),
                description: z.string(),
            })
        ),
    }),
});

const chronicle = defineCollection({
    type: 'data',
    schema: ({ image }) => z.object({
        year: z.number().int(),
        endYear: z.number().int().optional(),
        title: z.string(),
        description: z.string().optional(),
        image: image().optional(),
        icon: z.enum(['fire', 'truck', 'building', 'medal']).default('fire'),
    }),
});

const commanders = defineCollection(
    {
        type: 'data',
        schema: ({ image }) => z.object({
            name: z.string(),
            dob: z.date(),
            dod: z.date().optional(),
            image: image().optional(),

            servicePeriods: z.array(
                z.object({
                    startYear: z.number(),
                    endYear: z.number().optional(),
                })
            ),
        }),
    }
)

export const collections = { vehicles, team, settings, landingPage, chronicle, commanders };
