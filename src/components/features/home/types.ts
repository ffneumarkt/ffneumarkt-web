export type GalleryImage = { src: string; alt: string };
export type InfoBlock = {
  image: GalleryImage;
  kicker: string;
  title: string;
  description: string;
  link: string;
};
export type FactBlock = { title: string; description: string };

export type JourneyHeroContext = {
  heroKicker: string;
  fireBrigadeName: string;
  location: string;
  heroTagline: string;
  galleryItems: GalleryImage[];
  infoBlocks: InfoBlock[];
  factBlocks: FactBlock[];
};
