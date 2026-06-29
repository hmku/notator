import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { PiecesProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Notator",
  description: "Fast music idea scratchpad for chords, beats, and notes",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Notator",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1115",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PiecesProvider>{children}</PiecesProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
