import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageProgress from "@/components/PageProgress";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Preetham Nimmagadda | AI Agent Developer & Full Stack Engineer",
  description: "Portfolio of Preetham Nimmagadda, an AI Engineer and Full Stack Developer from IIT (ISM) Dhanbad. Specializing in Autonomous AI Agents, CrewAI, Next.js, and System Architecture. Top 1% on CodeChef & Codeforces Specialist.",
  keywords: [
    "Preetham Nimmagadda", 
    "AI Agent Developer", 
    "Full Stack Engineer", 
    "IIT Dhanbad", 
    "CrewAI", 
    "LangChain",
    "Next.js Developer",
    "Autonomous Agents",
    "Software Engineer Portfolio"
  ],
  authors: [{ name: "Preetham Nimmagadda", url: "https://preethamnimmagadda.github.io" }],
  creator: "Preetham Nimmagadda",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://preethamnimmagadda.github.io",
    title: "Preetham Nimmagadda | Building Autonomous AI Systems",
    description: "Explore the portfolio of Preetham Nimmagadda - showcasing innovative projects in AI Agents, Full Stack Dev, and award-winning hackathon builds.",
    siteName: "Preetham Nimmagadda Portfolio",
    images: [{
      url: "/og-image.png", // We should create this
      width: 1200,
      height: 630,
      alt: "Preetham Nimmagadda Portfolio Preview"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Preetham Nimmagadda | AI Agent Developer",
    description: "Building the future with Autonomous Agents and Scalable Systems.",
    images: ["/og-image.png"], 
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        suppressHydrationWarning
        className={`${spaceGrotesk.variable} antialiased bg-background text-foreground selection:bg-primary selection:text-black`}
      >
        <PageProgress />
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
