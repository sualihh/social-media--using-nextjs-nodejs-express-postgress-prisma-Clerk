import type { Metadata } from "next";
import localFont from "next/font/local";
import {
  ClerkProvider
} from '@clerk/nextjs';
import { ThemeProvider } from "@/components/ThemeProvider";
import NavBar from "@/components/NavBar";
import { Toaster } from "react-hot-toast"
import "./globals.css"


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Hulux | Your social space",
  description: "A more thoughtful space to share, connect, and talk.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen">
              <NavBar />

              <main className="min-h-[calc(100vh-4rem)] bg-background py-5 sm:py-8">
                <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-10">
                  {children}
                </div>
              </main>
            </div>
            <Toaster
              toastOptions={{
                style: {
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  color: "hsl(var(--card-foreground))",
                },
              }}
            />
        </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
