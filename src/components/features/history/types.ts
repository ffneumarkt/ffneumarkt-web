export interface TimelineEntry {
    comparable: number;
    badge: string;
    title: string;
    description?: string;
    icon?: string;
    image?: TimelineImage;
}

export type TimelineEntryIconMap = Record<string, string>;

interface TimelineImage {
    src: string;
    width: number;
    height: number;
    format: "png" | "jpg" | "jpeg" | "tiff" | "webp" | "gif" | "svg" | "avif";
}

export type ImageRatio = "aspect-video" | "aspect-[3/4]";
