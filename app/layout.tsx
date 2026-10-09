import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import AuthGuard from "./components/AuthGuard";
import { ToastContainer } from "react-toastify";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title:
    "Pathik | Intelligent Guest Analysis & Gujarat Police Compliance System",
  description:
    "Pathik is the official guest analysis system for real-time Gujarat Police reporting. Streamline hotel guest registration, ensure law enforcement compliance, and enhance security with AI-driven insights.",
  keywords:
    "Pathik software Gujarat, hotel guest registration Gujarat, Gujarat Police hotel software, Pathik software login, guest analysis system, hotel security compliance India",
  openGraph: {
    title: "Pathik - Intelligent Guest Analysis & Law Enforcement Integration",
    description:
      "The trusted platform for Gujarat hotels to manage guest data and ensure seamless real-time reporting to local authorities.",
  },
  other: {
    "geo.region": "IN-GJ",
    "geo.placename": "Gujarat",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* FontAwesome Icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body className={`${poppins.variable} font-sans`}>
        <AuthProvider>
          <AuthGuard>{children}</AuthGuard>
          <ToastContainer position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
