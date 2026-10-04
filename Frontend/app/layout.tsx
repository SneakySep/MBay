import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Discover Movies & TV`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: `${SITE_NAME} — Discover Movies & TV`,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen flex-col font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
