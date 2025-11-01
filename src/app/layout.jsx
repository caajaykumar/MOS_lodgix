'use client';

import { Inter } from 'next/font/google';
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import Header from "@/app/components/Header/Header";
import Footer from "@/app/components/Footer/Footer";
import LoaderProvider from "@/app/components/LoaderProvider";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLoader } from '@/app/components/LoaderProvider';

import './lib/fontawesome';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});



function LayoutBody({ children }){
  const pathname = usePathname();
  const { hideLoader } = useLoader();
  useEffect(() => { try { hideLoader(250); } catch {} }, [pathname, hideLoader]);
  return (
    <div className="wrapper">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
        /> */}
      </head>
      <body className={inter.className}>
        <LoaderProvider>
          <LayoutBody>{children}</LayoutBody>
        </LoaderProvider>
      </body>
    </html>
  );
}
