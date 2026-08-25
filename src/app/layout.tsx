import type { Metadata } from 'next';
import './globals.css';
import { ShieldCheck } from 'lucide-react';
import Navbar from './components/Navbar';

export const metadata: Metadata = {
  title: 'NG Stellar Business Health Check | Corporate Performance Assessment',
  description: 'Evaluate your business performance with NG Stellar Business Health Check.',
  icons: {
    icon: '/images/ngs_favicon.webp',
    shortcut: '/images/ngs_favicon.webp',
    apple: '/images/ngs_favicon.webp',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="bg-slate-950 text-slate-400 border-t border-white/10 text-xs py-8 no-print">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <p>© {new Date().getFullYear()}  NG Stellar Solutions. All Rights Reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
