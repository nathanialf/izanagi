import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Izanagi 3D Viewer",
  description: "3D weapon model viewer with retro effects",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-white">
        {children}
      </body>
    </html>
  );
}