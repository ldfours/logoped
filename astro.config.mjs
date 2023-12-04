import { defineConfig } from 'astro/config';

import tailwind from "@astrojs/tailwind";

// https://astro.build /config /en/guides/deploy/github/
export default defineConfig({
  integrations: [tailwind()],
  site: 'https://logoped.ca'
});
