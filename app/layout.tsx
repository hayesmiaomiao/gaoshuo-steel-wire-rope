import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCompany } from "@/lib/data/company";
import { defaultDescription, getSiteUrl, isStagingNoindex, siteName } from "@/lib/seo/metadata";
import { organizationSchema, websiteSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "Custom Wire Rope Assemblies and Cable Solutions",
    template: `%s | ${siteName}`
  },
  description: defaultDescription,
  robots: isStagingNoindex() ? { index: false, follow: false } : { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const company = getCompany();
  return (
    <html lang="en">
      <body>
        <JsonLd data={[organizationSchema(company), websiteSchema()]} />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
