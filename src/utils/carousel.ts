interface CarouselConfig {
    rootSelector?: string;
    slideSelector?: string;
    prevSelector?: string;
    nextSelector?: string;
    thumbSelector?: string;
    thumbIndexAttr?: string;
    intervalMs: number;
    pauseOnHover?: boolean;
    activeSlideClasses: string[];
    inactiveSlideClasses: string[];
    activeThumbClasses?: string[];
    inactiveThumbClasses?: string[];
    initializedFlag: string;
    getIntervalMs?: (root: HTMLElement) => number;
}

const ROOT_SELECTOR = "[data-carousel-root]";
const SLIDE_SELECTOR = "[data-carousel-slide]";
const PREV_SELECTOR = "[data-carousel-prev]";
const NEXT_SELECTOR = "[data-carousel-next]";
const THUMB_SELECTOR = "[data-carousel-thumb]";
const THUMB_INDEX_ATTR = "data-carousel-index";

const applyClassState = (
    element: HTMLElement,
    isActive: boolean,
    activeClasses: string[],
    inactiveClasses: string[],
) => {
    activeClasses.forEach((className) => {
        element.classList.toggle(className, isActive);
    });
    inactiveClasses.forEach((className) => {
        element.classList.toggle(className, !isActive);
    });
};

const resolveInterval = (
    root: HTMLElement,
    intervalMs: number,
    getIntervalMs?: (root: HTMLElement) => number,
) => {
    const resolved = getIntervalMs ? getIntervalMs(root) : intervalMs;
    return Number.isFinite(resolved) && resolved > 0 ? resolved : intervalMs;
};

const initCarouselRoot = ({
    rootSelector = ROOT_SELECTOR,
    slideSelector = SLIDE_SELECTOR,
    prevSelector = PREV_SELECTOR,
    nextSelector = NEXT_SELECTOR,
    thumbSelector = THUMB_SELECTOR,
    thumbIndexAttr = THUMB_INDEX_ATTR,
    intervalMs,
    pauseOnHover = false,
    activeSlideClasses,
    inactiveSlideClasses,
    activeThumbClasses = [],
    inactiveThumbClasses = [],
    initializedFlag,
    getIntervalMs,
}: CarouselConfig) => {
    const root = document.querySelector<HTMLElement>(rootSelector);
    if (!root) {
        return;
    }
    if (root.dataset[initializedFlag] === "true") {
        return;
    }
    root.dataset[initializedFlag] = "true";

    const slides = Array.from(root.querySelectorAll<HTMLElement>(slideSelector));
    if (slides.length <= 1) {
        return;
    }

    const thumbs = Array.from(root.querySelectorAll<HTMLElement>(thumbSelector));
    const prevButton = root.querySelector<HTMLElement>(prevSelector);
    const nextButton = root.querySelector<HTMLElement>(nextSelector);
    const timerInterval = resolveInterval(root, intervalMs, getIntervalMs);

    let selectedIndex = 0;
    let timer: ReturnType<typeof setInterval> | null = null;

    const setActiveSlide = (index: number) => {
        slides.forEach((slide, slideIndex) => {
            applyClassState(
                slide,
                slideIndex === index,
                activeSlideClasses,
                inactiveSlideClasses,
            );
        });

        thumbs.forEach((thumb, thumbIndex) => {
            applyClassState(
                thumb,
                thumbIndex === index,
                activeThumbClasses,
                inactiveThumbClasses,
            );
        });

        selectedIndex = index;
    };

    const nextSlide = () => {
        setActiveSlide((selectedIndex + 1) % slides.length);
    };

    const prevSlide = () => {
        setActiveSlide((selectedIndex - 1 + slides.length) % slides.length);
    };

    const stopTimer = () => {
        if (timer !== null) {
            clearInterval(timer);
            timer = null;
        }
    };

    const startTimer = () => {
        stopTimer();
        timer = setInterval(nextSlide, timerInterval);
    };

    prevButton?.addEventListener("click", () => {
        stopTimer();
        prevSlide();
        startTimer();
    });

    nextButton?.addEventListener("click", () => {
        stopTimer();
        nextSlide();
        startTimer();
    });

    thumbs.forEach((thumb) => {
        thumb.addEventListener("click", () => {
            const index = Number(thumb.getAttribute(thumbIndexAttr));
            if (Number.isNaN(index)) {
                return;
            }
            stopTimer();
            setActiveSlide(index);
            startTimer();
        });
    });

    if (pauseOnHover) {
        root.addEventListener("mouseenter", stopTimer);
        root.addEventListener("mouseleave", startTimer);
    }

    setActiveSlide(0);
    startTimer();
};

export const initVehicleCarousel = () => {
    initCarouselRoot({
        intervalMs: 5000,
        pauseOnHover: true,
        activeSlideClasses: ["block"],
        inactiveSlideClasses: ["hidden"],
        activeThumbClasses: ["border-accent", "opacity-100"],
        inactiveThumbClasses: ["border-transparent", "opacity-60"],
        initializedFlag: "vehicleGalleryInitialized",
        getIntervalMs: (root) => Number(root.dataset.carouselInterval),
    });
};
