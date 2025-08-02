// app/layout.js
import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

// Configure IBM Plex Sans for Latin text
const ibm_plex_sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
});

// Configure IBM Plex Sans Arabic for Arabic text
const ibm_plex_sans_arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans-arabic",
});

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  ),
  title: "LCGPA Store",
  description: "E-commerce platform inspired by LCGPA",
};

export default function RootLayout({ children }) {
  return (
    <html
      className={`${ibm_plex_sans.variable} ${ibm_plex_sans_arabic.variable}`}
      suppressHydrationWarning
    >
      <body className='font-sans' suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
