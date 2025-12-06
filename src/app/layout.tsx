import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageProgress from "@/components/PageProgress";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://preethamnimmagadda.github.io"),
  title: "Preetham Nimmagadda | AI Agent Developer & Full Stack Engineer",
  description: "Portfolio of Preetham Nimmagadda, an AI Engineer and Full Stack Developer from IIT (ISM) Dhanbad. Specializing in Autonomous AI Agents, CrewAI, Next.js, and System Architecture. Top 1% on CodeChef & Codeforces Specialist.",
  manifest: "/manifest.json",
  keywords: [
    "Preetham Nimmagadda", 
    "AI Agent Developer", 
    "Full Stack Engineer", 
    "IIT Dhanbad", 
    "CrewAI", 
    "LangChain",
    "Next.js Developer",
    "Autonomous Agents",
    "Software Engineer Portfolio",
    "React Developer",
    "Python Developer",
    "Machine Learning",
    "Generative AI"
  ],
  authors: [{ name: "Preetham Nimmagadda", url: "https://preethamnimmagadda.github.io" }],
  creator: "Preetham Nimmagadda",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://preethamnimmagadda.github.io",
    title: "Preetham Nimmagadda | Building Autonomous AI Systems",
    description: "Explore the portfolio of Preetham Nimmagadda - showcasing innovative projects in AI Agents, Full Stack Dev, and award-winning hackathon builds.",
    siteName: "Preetham Nimmagadda Portfolio",
    images: [{
      url: "/og-image.png",
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
  verification: {
    google: "your-google-verification-code", // Replace with actual code when you have one
  },
};

// JSON-LD Structured Data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Preetham Nimmagadda",
  url: "https://preethamnimmagadda.github.io",
  image: "https://preethamnimmagadda.github.io/ai-headshot.jpeg",
  jobTitle: "AI Agent Developer & Full Stack Engineer",
  worksFor: {
    "@type": "Organization",
    name: "IIT (ISM) Dhanbad"
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Indian Institute of Technology (ISM) Dhanbad"
  },
  knowsAbout: [
    "Artificial Intelligence",
    "Autonomous Agents",
    "CrewAI",
    "LangChain",
    "Next.js",
    "React",
    "Python",
    "Full Stack Development"
  ],
  sameAs: [
    "https://github.com/preethamnimmagadda",
    "https://linkedin.com/in/preethamnimmagadda"
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased bg-background text-foreground selection:bg-primary selection:text-black`}
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

