import fs from "node:fs";
import path from "node:path";

const BASE_URL = "https://kmzpackaging.co.uk";
const PRODUCTS_JSON_PATH = path.resolve("./public/products.json");
const CATEGORIES_JSON_PATH = path.resolve("./public/categories.json");
const OUTPUT_PATH = path.resolve("./public/sitemap.xml");
const STATIC_URLS = [
  "/",
  "/products.html",
  "/about.html",
  "/contact.html",
  "/cookie-policy.html",
  "/privacy-policy.html",
  "/terms-and-conditions.html",
];

function escXml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function fullUrl(p) {
  return `${BASE_URL}${p.startsWith("/") ? "" : "/"}${p}`;
}

function addUrl(urls, loc, { lastmod, changefreq, priority } = {}) {
  const parts = [];
  parts.push(`<url>`);
  parts.push(`  <loc>${escXml(loc)}</loc>`);
  if (lastmod) parts.push(`  <lastmod>${escXml(lastmod)}</lastmod>`);
  if (changefreq) parts.push(`  <changefreq>${escXml(changefreq)}</changefreq>`);
  if (priority != null) parts.push(`  <priority>${priority}</priority>`);
  parts.push(`</url>`);
  urls.push(parts.join("\n"));
}

function isoDateToday() {
  return new Date().toISOString().slice(0, 10);
}

function safeParam(value) {
  return encodeURIComponent(String(value));
}

async function main() {
  const today = isoDateToday();

  if (!fs.existsSync(PRODUCTS_JSON_PATH)) {
    throw new Error(`Missing products.json at: ${PRODUCTS_JSON_PATH}`);
  }
  if (!fs.existsSync(CATEGORIES_JSON_PATH)) {
    throw new Error(`Missing categories.json at: ${CATEGORIES_JSON_PATH}`);
  }

  const productsRaw = JSON.parse(fs.readFileSync(PRODUCTS_JSON_PATH, "utf8"));
  const categoriesRaw = JSON.parse(fs.readFileSync(CATEGORIES_JSON_PATH, "utf8"));

  const products = productsRaw.products ?? [];
  const categories = categoriesRaw.categories ?? [];
  const categorySlugs = categories
    .map((category) => category.slug)
    .filter(Boolean);

  const urls = [];

  // Static pages
  for (const p of STATIC_URLS) {
    addUrl(urls, fullUrl(p), {
      lastmod: today,
      changefreq: p === "/" ? "weekly" : "monthly",
      priority: p === "/" ? 1.0 : p === "/products.html" ? 0.9 : 0.7,
    });
  }

  // Category pages (only include if they actually exist in categories.json)
  for (const slug of categorySlugs) {
    addUrl(urls, fullUrl(`/category.html?name=${safeParam(slug)}`), {
      lastmod: today,
      changefreq: "weekly",
      priority: 0.8,
    });
  }

  // Product pages (only in-stock products)
  const inStock = products.filter((p) => p && p.in_stock === true);
  for (const p of inStock) {
    // Your product page uses: /product.html?id=<model_number>
    // model_number is what you already use in links.
    if (!p.model_number) continue;

    addUrl(urls, fullUrl(`/product.html?id=${safeParam(p.model_number)}`), {
      lastmod: today,
      changefreq: "monthly",
      priority: 0.9,
    });
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.join("\n") +
    `\n</urlset>\n`;

  fs.writeFileSync(OUTPUT_PATH, xml, "utf8");
  console.log(`✅ sitemap.xml generated: ${OUTPUT_PATH}`);
  console.log(`   URLs: ${urls.length}`);
}

main().catch((err) => {
  console.error("❌ Failed to generate sitemap:", err);
  process.exit(1);
});