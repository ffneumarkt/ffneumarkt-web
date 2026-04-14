import { singleton, fields } from '@keystatic/core';

export const landingPage = singleton({
    label: 'Landing Page',
    path: 'src/content/landingPage/data',
    schema: {
        heroKicker: fields.text({
            label: 'Hero kicker',
            description: 'Short highlight text above the hero title',
            validation: { length: { min: 1 } }
        }),
        heroTagline: fields.text({
            label: 'Hero tagline',
            description: 'Short sentence under the hero title',
            multiline: true,
            validation: { length: { min: 1 } }
        }),
        heroImages: fields.array(
            fields.object({
                image: fields.image({
                    label: 'Image',
                    directory: 'src/assets/hero',
                    publicPath: '@/assets/hero/',
                    validation: { isRequired: true },
                    description: 'Please upload landscape format (recommended: 1920x1080px or 16:9 ratio)',
                }),
                alt: fields.text({
                    label: 'Description',
                    description: 'Important for accessibility (e.g., “Fire truck in front of a fire")',
                    validation: { length: { min: 1 } }
                }),
            }),
            {
                label: 'Grid images',
                itemLabel: (props) => props.fields.alt.value || 'Image',
            }
        ),
        journeyHeroInfoBlocks: fields.array(
            fields.object({
                image: fields.image({
                    label: 'Image',
                    directory: 'src/assets/hero',
                    publicPath: '@/assets/hero/',
                    validation: { isRequired: true },
                    description: 'Large image shown with the info block (recommended: 1920x1080px or 16:9 ratio)',
                }),
                imageAlt: fields.text({
                    label: 'Image description',
                    description: 'Important for accessibility (e.g., “Firefighters training outside")',
                    validation: { length: { min: 1 } }
                }),
                kicker: fields.text({
                    label: 'Kicker',
                    description: 'Small uppercase label for the block',
                    validation: { length: { min: 1 } }
                }),
                title: fields.text({
                    label: 'Title',
                    description: 'Main heading for the block',
                    validation: { length: { min: 1 } }
                }),
                description: fields.text({
                    label: 'Description',
                    description: 'Supporting copy shown under the title',
                    multiline: true,
                    validation: { length: { min: 1 } }
                }),
                link: fields.text({
                    label: 'Path to page it links to',
                    description: 'relative path e.g. /fahrzeuge'
                })
            }),
            {
                label: 'Journey hero info blocks',
                description: 'large images shown with links, therefore upload e.g. 1920x1080px',
                itemLabel: (props) => props.fields.title.value || 'Info block',
            }
        ),
        journeyHeroFactBlocks: fields.array(
            fields.object({
                title: fields.text({
                    label: 'Title',
                    description: 'Short highlight heading',
                    validation: { length: { min: 1 } }
                }),
                description: fields.text({
                    label: 'Description',
                    description: 'Supporting copy for the fact block',
                    validation: { length: { min: 1 } }
                }),
            }),
            {
                label: 'Journey hero fact blocks',
                description: 'facts shown on desktop only',
                itemLabel: (props) => props.fields.title.value || 'Fact block',
            }
        ),
    }
})
