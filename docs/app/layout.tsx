import { Layout, Navbar, Footer } from "nextra-theme-docs";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";
import type { ReactNode } from "react";

export const metadata = {
  title: {
    default: "@authgear/nextjs",
    template: "%s | @authgear/nextjs",
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pageMap = await getPageMap();
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Layout
          pageMap={pageMap}
          docsRepositoryBase="https://github.com/authgear/authgear-sdk-nextjs/tree/main/docs"
          navbar={
            <Navbar
              logo={<span>@authgear/nextjs</span>}
              projectLink="https://github.com/authgear/authgear-sdk-nextjs"
            />
          }
          footer={<Footer>Copyright &copy; 2025 Authgear</Footer>}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
