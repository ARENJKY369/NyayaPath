import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NyayaPath — Your legal clarity workspace",
  description: "Understand agreements, compare wording and prepare your next step with source-linked document checks.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
