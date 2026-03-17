import nextra from "nextra";

const withNextra = nextra({});

export default withNextra({
  output: "export",
  basePath: "/authgear-sdk-nextjs",
  images: { unoptimized: true },
});
