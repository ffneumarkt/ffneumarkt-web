import { readdirSync } from "node:fs";
import { join } from "node:path";

const projectRoot = process.cwd();
const vehiclesDir = join(projectRoot, "src/content/vehicles");

function isVehicleDataFile(name: string): boolean {
    return /\.ya?ml$/i.test(name);
}

export function getVehicleSitemapUrls(site: string): string[] {
    try {
        const entries = readdirSync(vehiclesDir, { withFileTypes: true });
        const slugs = entries
            .filter((entry) => entry.isFile() && isVehicleDataFile(entry.name))
            .map((entry) => entry.name.replace(/\.(ya?ml)$/i, ""))
            .sort((a, b) => a.localeCompare(b));

        return slugs.map((slug) => new URL(`/fahrzeuge/${slug}`, site).href);
    } catch {
        return [];
    }
}
