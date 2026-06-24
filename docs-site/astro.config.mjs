// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
    site: "https://bcgov.github.io",
    base: "/cas-registration/docs",
    integrations: [
        starlight({
            title: "My Docs",
            pagination: false,
        }),
    ],
});
