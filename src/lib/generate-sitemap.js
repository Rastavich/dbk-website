const fs = require("fs");

const globby = require("globby");

(async () => {
  // Ignore Svelte.js specific files (e.g., _app.js) and API routes.
  const routes = await globby([]);
  const sitemap = `
        <?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            ${routes
              .map((page) => {
                const path = page
                  .replace("routes", "")
                  .replace(".js", "")
                  .replace(".mdx", "");
                const route = path === "/index" ? "" : path;

                return `
                        <url>
                            <loc>${`https://digitalbk.app${route}`}</loc>
                        </url>
                    `;
              })
              .join("")}
        </urlset>
    `;

  // If you're not using Prettier, you can remove this.
  const formatted = sitemap;

  fs.writeFileSync("static/sitemap.xml", formatted);
})();
