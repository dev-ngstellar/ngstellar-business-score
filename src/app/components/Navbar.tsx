'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, ExternalLink } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 text-white shadow-lg backdrop-blur-xl no-print">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <img
                src="/images/ng-stellar-logo.png"
                alt="NG Stellar"
                className="h-auto w-[150px] object-contain transition-transform group-hover:scale-[1.02] sm:w-[200px] md:w-[220px]"
              />
            </Link>
            {isAdmin && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Admin Portal
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isAdmin ? (
              <Link
                href="/"
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-medium text-slate-300 hover:text-white hover:border-white/20 transition-all"
              >
                <span>View Live Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <a
                href="#assessment"
                className="rounded-xl bg-gradient-to-r from-sky-400 via-teal-400 to-lime-400 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 active:translate-y-0"
              >
                Get Health Check
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
