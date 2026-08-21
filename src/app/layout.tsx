import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'NG Stellar Business Health Check | Corporate Performance Assessment',
  description: 'Evaluate your business performance with NG Stellar Business Health Check.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased">
        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 text-white shadow-lg backdrop-blur-xl">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-3 group">
                <img
                  src="/images/ng-stellar-logo.png"
                  alt="NG Stellar"
                  className="h-auto w-[160px] object-contain transition-transform group-hover:scale-[1.02] sm:w-[210px] md:w-[240px]"
                />
              </Link>
                <a href="#assessment" className="hidden rounded-lg bg-gradient-to-r from-sky-400 via-teal-400 to-lime-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 sm:inline-flex">
                  Get Health Check
                </a>
            </div>
          </div>
        </header>
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
