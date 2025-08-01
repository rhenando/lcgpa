// app/layout.js (Updated with IBM Plex Sans font)

import { IBM_Plex_Sans } from "next/font/google"; // 1. Changed the font import
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// 2. Configured IBM Plex Sans instead of Poppins
const ibm_plex_sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // '500' is Medium weight
});

export const metadata = {
  title: "LCGPA Store",
  description: "E-commerce platform inspired by LCGPA",
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body
        // 3. Applied the new font's className to the body
        className={`${ibm_plex_sans.className} flex flex-col min-h-screen bg-gray-50`}
      >
        <Header />
        <main className='flex-grow container mx-auto px-4 py-8'>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
