export const SITE_URL = (process.env.SITE_URL ?? "http://localhost:3100").replace(/\/$/, "");
export const abs = (path: string) => `${SITE_URL}${path}`;

/** Serialise JSON-LD safely inside a <script>: escape `<` so a `</script>` in data can't break out. */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\u003c");
