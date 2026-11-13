import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://reviewlink-commit.vercel.app"),
  title: {
    default: "ReviewLink — Client approval without a Buffer login",
    template: "%s — ReviewLink",
  },
  description:
    "Share a private link. Your client reviews next week’s Buffer posts on their phone, taps Approve or Request changes, and every decision lands back in Buffer as a note.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "ReviewLink — Client approval without a Buffer login",
    description:
      "Share a private, no-login link to next week’s Buffer queue. Decisions write back as Notes.",
    url: "https://reviewlink-commit.vercel.app",
    siteName: "ReviewLink",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ReviewLink",
    description: "Client approval without a Buffer login.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
