import { Inter } from "next/font/google";
import { Roboto_Slab } from "next/font/google";
import { Source_Sans_3 } from "next/font/google";
import Providers from "./Providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  variable: "--font-roboto-slab",
  weight: ["400", "600", "700"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "Gen AI Analytics Dashboard",
  description: "Democratizing data insights across business units",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`
        ${inter.variable} 
        ${robotoSlab.variable} 
        ${sourceSans.variable} 
        antialiased bg-gray-50
      `}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
