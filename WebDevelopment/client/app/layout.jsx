import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import AppShell from "./components/AppShell";
import { AuthProvider } from '@/app/auth/AuthContext.jsx'
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next"

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "ThreadShare",
  description: "An App for sharing clothing, and managing your wardrobe.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="overscroll-y-none" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:'light';}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${playfair.variable} ${inter.variable} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <AppShell>
            {children}
            <SpeedInsights />
            <Analytics />
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
