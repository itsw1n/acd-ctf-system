import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ACD CTF",
  description: "Assumption College of Davao Capture The Flag platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
