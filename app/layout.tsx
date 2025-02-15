import type { Metadata } from "next"
import { Geist, Sora } from "next/font/google"
import "./globals.css"
import type React from "react" // Import React

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})
const soraSans = Sora({
  variable: "--font-sora-sans",
  subsets: ["latin"],
})


export const metadata: Metadata = {
  title: "Airbnb Morocco",
  description: "Airbnb Morocco",
  icons: {
    icon: '/favicon.ico', // Pointing to your favicon
  },
  // openGraph: {
  //   title: "My Website Name",
  //   description: "This is the description of my website.",
  //   url: 'https://www.example.com',
  //   images: [
  //     {
  //       url: '/images/6349232.jpg', // The URL to the Open Graph image
  //       width: 1200, // Optional width
  //       height: 630, // Optional height
  //       alt: 'Description of image', // Optional alt text for the image
  //     },
  //   ],
  // },
  // twitter: {
  //   card: "summary_large_image",
  //   title: "My Website Name",
  //   description: "This is the description of my website.",
  //   image: '/images/6349232.jpg', // This works for Twitter cards
  // },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${soraSans.variable} antialiased h-full bg-violet-950`}>
        {children}
      </body>
    </html>
  )
}
