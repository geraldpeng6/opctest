import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "OPC Test",
  description: "Minimal pixel-style agent benchmark exam site.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
