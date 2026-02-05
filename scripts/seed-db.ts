/**
 * Seed script: reads gilboa_restaurants.csv and pushes data to Convex.
 *
 * Usage:
 *   npx tsx scripts/seed-db.ts
 *
 * Requires NEXT_PUBLIC_CONVEX_URL in .env.local
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!CONVEX_URL || CONVEX_URL.includes("placeholder")) {
  console.error("ERROR: Set NEXT_PUBLIC_CONVEX_URL in .env.local first.");
  console.error("Run: npx convex dev  to get your URL.");
  process.exit(1);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractVideoId(url: string): string {
  const match = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : "";
}

function parseCSV(csvPath: string) {
  const content = fs.readFileSync(csvPath, "utf-8");
  const lines = content.split("\n").filter((l) => l.trim());

  // First line is header
  const header = lines[0];
  const rows = lines.slice(1);

  const restaurants = [];

  for (const line of rows) {
    // Parse CSV with quoted fields
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        fields.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    fields.push(current.trim());

    if (fields.length < 10) continue;

    const [name, nameHe, address, description, descriptionHe, type, typeHe, madadStr, date, url] = fields;

    const madadNumber = parseFloat(madadStr) || 0;
    const videoId = extractVideoId(url);
    const slug = slugify(name) || slugify(nameHe) || `restaurant-${videoId}`;

    if (!name && !nameHe) continue;

    restaurants.push({
      name: name || "",
      nameHe: nameHe || "",
      address: address || "",
      description: description || "",
      descriptionHe: descriptionHe || "",
      type: type || "",
      typeHe: typeHe || "",
      madadNumber,
      date: date || "",
      youtubeUrl: url || "",
      videoId,
      slug,
    });
  }

  return restaurants;
}

async function main() {
  const csvPath = path.resolve("gilboa_restaurants.csv");
  console.log(`Reading CSV from: ${csvPath}`);

  const restaurants = parseCSV(csvPath);
  console.log(`Parsed ${restaurants.length} restaurants`);

  if (restaurants.length === 0) {
    console.error("No restaurants found in CSV. Run extract_data.py first.");
    process.exit(1);
  }

  const client = new ConvexHttpClient(CONVEX_URL!);

  // Seed in batches of 50
  const BATCH_SIZE = 50;
  let totalInserted = 0;
  let totalSkipped = 0;

  for (let i = 0; i < restaurants.length; i += BATCH_SIZE) {
    const batch = restaurants.slice(i, i + BATCH_SIZE);
    console.log(
      `Seeding batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(restaurants.length / BATCH_SIZE)} (${batch.length} restaurants)...`
    );

    const result = await client.action(api.seed.seedRestaurants, {
      restaurants: batch,
    });

    totalInserted += result.inserted;
    totalSkipped += result.skipped;
  }

  console.log(
    `\nDone! Inserted: ${totalInserted}, Skipped: ${totalSkipped}, Total: ${restaurants.length}`
  );
}

main().catch(console.error);
