const fs = require('fs');
const path = require('path');

const PUBLIC = path.join(__dirname, 'public');

// --- Helpers ---

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyDir(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const data = {};
  for (const line of match[1].split('\n')) {
    const sep = line.indexOf(':');
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    let val = line.slice(sep + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    data[key] = val;
  }
  return data;
}

function readCollection(folder) {
  const items = [];
  if (!fs.existsSync(folder)) return items;
  for (const file of fs.readdirSync(folder).sort()) {
    const filePath = path.join(folder, file);
    if (file.endsWith('.json')) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (data && typeof data === 'object') items.push(data);
      } catch(e) { /* skip invalid JSON */ }
    } else if (file.endsWith('.md')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = parseFrontmatter(content);
      if (data) items.push(data);
    }
  }
  return items;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Netlify Image CDN URL builder
function cdnUrl(imagePath, width) {
  return `/.netlify/images?url=${encodeURIComponent(imagePath)}&w=${width}&q=75&fm=webp`;
}

// Check if a local image exists, return placeholder URL if not
function resolveImage(imagePath, title) {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return { url: imagePath, external: true };
  // Check if local file exists in source tree or static directory
  const localPath = path.join(__dirname, imagePath);
  if (fs.existsSync(localPath)) return { url: imagePath, external: false };
  const staticPath = path.join(__dirname, 'static', imagePath);
  if (fs.existsSync(staticPath)) return { url: imagePath, external: false };
  // Fallback to placehold.co
  const text = encodeURIComponent(title || 'Tattoo');
  return { url: `https://placehold.co/600x800/111111/888888?text=${text}`, external: true };
}

// Generate a single gallery card
function galleryCard(item, index) {
  const title = escapeHtml(item.title || '');
  const cat = escapeHtml(item.category || '');
  const delay = index > 0 ? ` reveal-delay-${Math.min((index % 3) + 1, 3)}` : '';
  const lazy = index > 0 ? ' loading="lazy"' : '';

  const resolved = resolveImage(item.image, item.title);
  if (resolved) {
    let src, srcset;
    if (resolved.external) {
      src = resolved.url;
      srcset = '';
    } else {
      src = cdnUrl(resolved.url, 600);
      srcset = ` srcset="${[400, 600, 900].map(w => `${cdnUrl(resolved.url, w)} ${w}w`).join(', ')}"`;
    }
    return `    <div class="gallery-item reveal${delay}" data-category="${cat}">
      <img src="${src}"${srcset} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"${lazy} decoding="async" alt="${title}" />
      <div class="gallery-item-overlay">
        <div class="gallery-item-info">
          <span class="gallery-badge">${cat}</span>
          <h4>${title}</h4>
        </div>
      </div>
    </div>`;
  }

  // Placeholder for items without image at all
  return `    <div class="gallery-item reveal${delay}" data-category="${cat}">
      <div class="gallery-placeholder"></div>
      <div class="gallery-item-overlay" style="opacity:1">
        <div class="gallery-item-info">
          <span class="gallery-badge">${cat}</span>
          <h4>${title}</h4>
        </div>
      </div>
    </div>`;
}

// Generate a single review card
function reviewCard(item, index) {
  const name = escapeHtml(item.name || '');
  const body = escapeHtml(item.body || '');
  const type = escapeHtml(item.type || '');
  const initial = name.charAt(0).toUpperCase();
  const delay = index > 0 ? ` reveal-delay-${Math.min(index, 2)}` : '';

  return `    <div class="testimonial-card reveal${delay}">
      <div class="stars">★ ★ ★ ★ ★</div>
      <p class="testimonial-text">${body}</p>
      <div class="testimonial-author">
        <div class="testimonial-avatar">${initial}</div>
        <div class="testimonial-author-info">
          <h4>${name}</h4>
          <p>${type}</p>
        </div>
      </div>
    </div>`;
}

// --- Build ---

console.log('Building Redmoon Tattoo...');

// 1. Read source index.html
let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// 2. Read collections
const gallery = readCollection(path.join(__dirname, 'content', 'gallery'));
const reviews = readCollection(path.join(__dirname, 'content', 'reviews'));

// 3. Inject gallery cards
if (gallery.length > 0) {
  const cards = gallery.map((item, i) => galleryCard(item, i)).join('\n');
  html = html.replace(
    /<!-- GALLERY_ITEMS_START -->[\s\S]*?<!-- GALLERY_ITEMS_END -->/,
    `<!-- GALLERY_ITEMS_START -->\n${cards}\n    <!-- GALLERY_ITEMS_END -->`
  );
  console.log(`  -> gallery: ${gallery.length} items injected`);
} else {
  console.log(`  -> gallery: keeping static fallback (no content yet)`);
}

// 4. Inject review cards (always, even without images)
if (reviews.length > 0) {
  const cards = reviews.map((item, i) => reviewCard(item, i)).join('\n');
  html = html.replace(
    /<!-- REVIEWS_ITEMS_START -->[\s\S]*?<!-- REVIEWS_ITEMS_END -->/,
    `<!-- REVIEWS_ITEMS_START -->\n${cards}\n    <!-- REVIEWS_ITEMS_END -->`
  );
  console.log(`  -> reviews: ${reviews.length} items injected`);
}

// 5. Write output
ensureDir(PUBLIC);
fs.writeFileSync(path.join(PUBLIC, 'index.html'), html);

// 6. Copy admin panel
copyDir(path.join(__dirname, 'admin'), path.join(PUBLIC, 'admin'));

// 7. Create _redirects
fs.writeFileSync(path.join(PUBLIC, '_redirects'), '/admin/* /admin/index.html 200\n');

// 8. Copy static assets (CMS uploaded images)
const STATIC = path.join(__dirname, 'static');
if (fs.existsSync(STATIC)) {
  copyDir(STATIC, PUBLIC);
  console.log('  -> static assets copied');
}

// 9. Ensure uploads directory
ensureDir(path.join(PUBLIC, 'images', 'uploads'));

// 9. Generate data JSON files (for JS dynamic fetch)
const dataDir = path.join(PUBLIC, 'data');
ensureDir(dataDir);

const settingsPath = path.join(__dirname, 'content', 'settings.json');
if (fs.existsSync(settingsPath)) {
  fs.copyFileSync(settingsPath, path.join(dataDir, 'settings.json'));
}
fs.writeFileSync(path.join(dataDir, 'gallery.json'), JSON.stringify(gallery, null, 2));
fs.writeFileSync(path.join(dataDir, 'reviews.json'), JSON.stringify(reviews, null, 2));

// 10. Generate robots.txt
fs.writeFileSync(path.join(PUBLIC, 'robots.txt'), `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: https://www.redmoontattoo.fr/sitemap.xml
`);

// 11. Generate sitemap.xml
fs.writeFileSync(path.join(PUBLIC, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.redmoontattoo.fr/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`);

console.log('Build complete!');
