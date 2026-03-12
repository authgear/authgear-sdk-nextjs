import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "@authgear/nextjs",
  tagline: "Authgear SDK for Next.js 16",
  favicon: "img/favicon.ico",

  future: {
    v4: true,
  },

  url: "https://authgear.github.io",
  baseUrl: "/authgear-sdk-nextjs/",

  organizationName: "authgear",
  projectName: "authgear-sdk-nextjs",

  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  plugins: [
    [
      "docusaurus-plugin-typedoc",
      {
        entryPoints: [
          "../src/index.ts",
          "../src/client.ts",
          "../src/server.ts",
          "../src/proxy.ts",
        ],
        tsconfig: "../tsconfig.json",
        out: "api",
        sidebar: {
          autoConfiguration: true,
          pretty: true,
        },
        hideGenerator: true,
        readme: "none",
        skipErrorChecking: true,
        groupOrder: ["Functions", "Classes", "Interfaces", "Type Aliases", "Enumerations", "*"],
      },
    ],
  ],

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          routeBasePath: "/",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "@authgear/nextjs",
      items: [
        {
          type: "docSidebar",
          sidebarId: "guideSidebar",
          position: "left",
          label: "Guide",
        },
        {
          type: "docSidebar",
          sidebarId: "apiSidebar",
          position: "left",
          label: "API Reference",
        },
        {
          href: "https://github.com/authgear/authgear-sdk-nextjs",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            { label: "Getting Started", to: "/" },
            { label: "API Reference", to: "/api" },
          ],
        },
        {
          title: "Authgear",
          items: [
            { label: "Website", href: "https://www.authgear.com/" },
            { label: "Portal", href: "https://portal.authgear.com/" },
            { label: "Documentation", href: "https://docs.authgear.com/" },
          ],
        },
        {
          title: "Community",
          items: [
            { label: "GitHub", href: "https://github.com/authgear" },
            { label: "Discord", href: "https://discord.gg/Kdn5vcYwAS" },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Authgear. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["bash", "typescript"],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
