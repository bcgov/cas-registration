const { createGlobPatternsForDependencies } = require("@nx/react/tailwind");
const { join } = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("../../tailwind-workspace-preset")],
  content: [
    join(
      __dirname,
      "{src,components,app}/**/*!(*.stories|*.spec).{js,jsx,ts,tsx,html}",
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
};
