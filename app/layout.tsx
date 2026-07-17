import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "开卷评测场",
  description: "中文开卷闯关评测。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
