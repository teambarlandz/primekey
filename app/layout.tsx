import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] font-sans antialiased">
        {/* Standard Header - Full width with bottom border per ui-context.md */}
        <header className="w-full border-b border-[var(--border-default)] bg-[var(--bg-surface)] sticky top-0 z-50">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              {/* Replace /logo.png with your actual Primekey logo in /public */}
              <Image
                src="/logo.png"
                alt="Primekey Homes and Properties Ltd"
                width={40}
                height={40}
                className="h-10 w-auto object-contain"
                priority
              />
              <span className="text-lg sm:text-xl font-bold text-[var(--text-primary)] leading-tight hidden sm:block">
                Primekey<span className="text-[var(--accent-primary)]">Homes</span>
              </span>
            </Link>

            {/* Navigation - Hidden on mobile, visible on md+ per ui-context.md */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/search"
                className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
              >
                Search Properties
              </Link>
              <Link
                href="/landlord"
                className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
              >
                List Your Property
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow relative">{children}</main>

        {/* Standard Footer - Full width with top border per ui-context.md */}
        <footer className="w-full border-t border-[var(--border-default)] bg-[var(--bg-surface)] py-8 mt-auto">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              &copy; {new Date().getFullYear()} Primekey Homes and Properties Ltd. All rights reserved.
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              Compliant with Nigeria Data Protection Act (NDPA) 2023
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}