import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { JSDOM } from "jsdom";

const getMeta = (doc: Document, selectors: string[]): string | null => {
  for (const selector of selectors) {
    const content =
      doc.querySelector(selector)?.getAttribute("content") ||
      doc.querySelector(selector)?.textContent;
    if (content?.trim()) return content.trim();
  }
  return null;
};

export const ServerRoute = createServerFileRoute("/api/get-og-info").methods({
  GET: async ({ request }) => {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return json({ error: "Missing 'url' query parameter" }, { status: 400 });
    }

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
            "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        redirect: "follow",
      });

      if (!response.ok) {
        return json(
          { error: `Failed to fetch page: ${response.statusText}` },
          { status: response.status },
        );
      }

      const html = await response.text();
      const dom = new JSDOM(html);
      const doc = dom.window.document;

      const previewImage = getMeta(doc, [
        'meta[property="og:image"]',
        'meta[name="twitter:image"]',
      ]);

      const previewTitle = getMeta(doc, [
        'meta[property="og:title"]',
        'meta[name="twitter:title"]',
        "title",
      ]);

      const previewDescription = getMeta(doc, [
        'meta[property="og:description"]',
        'meta[name="twitter:description"]',
        'meta[name="description"]',
      ]);

      return json({
        previewImage,
        previewTitle,
        previewDescription,
      });
    } catch (error) {
      console.error("OpenGraph scraping error:", error);
      return json({ error: "Internal server error" }, { status: 500 });
    }
  },
});
