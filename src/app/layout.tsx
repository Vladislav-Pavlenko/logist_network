import type { Metadata } from "next";
import './reset.css';
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google';
import {ErrorTracker} from "@/app/components/ErrorTracker";

export const metadata: Metadata = {
  title: "Logist network",
  description: "Generated logist documents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" >
      <body>
      <ErrorTracker />
      {children}
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID as string} />
    </html>
  );
}
