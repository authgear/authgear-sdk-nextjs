import oursky from "@oursky/eslint-plugin";

const js = "src/**/*.{js,jsx,mjs,mjsx}";
const ts = "src/**/*.{ts,tsx,mts,mtsx}";

export default [
  {
    files: [ts],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: [js, ts],
    ...oursky.configs.eslint,
  },
  {
    files: [ts],
    ...oursky.configs.typescript,
  },
  {
    files: [ts],
    ...oursky.configs.tsdoc,
  },
  {
    files: [js, ts],
    ...oursky.configs.oursky,
  },
  {
    files: [js, ts],
    ...oursky.configs.react,
  },
  {
    files: [js, ts],
    ...oursky.configs["react-hooks"],
  },
  // Disable rules that don't exist in the installed eslint-plugin-react-hooks version
  {
    files: [js, ts],
    rules: {
      "react-hooks/component-hook-factories": "off",
    },
  },
];
