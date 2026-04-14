import { getEntry, type CollectionKey } from "astro:content";

export async function getEntryOrThrow<T extends CollectionKey>(
    collection: T,
    slug: string
) {
    const entry = await getEntry(collection, slug);

    if (!entry) {
        throw new Error(`Entry "${slug}" in collection "${collection}" is missing.`);
    }

    return entry;
}