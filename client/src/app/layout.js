import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Zomato Clone | Food Delivery & Dining Out",
  description: "Discover the best food and drinks in your city with Zomato Clone.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
