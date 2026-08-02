import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock GSAP
vi.mock('gsap', () => ({
  default: {
    to: vi.fn(),
    fromTo: vi.fn(),
    timeline: () => ({
      to: vi.fn(),
      fromTo: vi.fn(),
    }),
    registerPlugin: vi.fn(),
    context: vi.fn(() => ({ revert: vi.fn() })),
  },
  ScrollTrigger: {},
}));

vi.mock('@gsap/react', () => ({
  useGSAP: vi.fn(),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => {
  const createIcon = (name: string) => ({ name, render: () => <span data-testid={`icon-${name}`} /> });
  return {
    AlertCircle: createIcon('AlertCircle'),
    ShieldCheck: createIcon('ShieldCheck'),
    User: createIcon('User'),
    Phone: createIcon('Phone'),
    Mail: createIcon('Mail'),
    BadgeCheck: createIcon('BadgeCheck'),
    Building2: createIcon('Building2'),
    ArrowRight: createIcon('ArrowRight'),
    Sparkles: createIcon('Sparkles'),
    Key: createIcon('Key'),
    Target: createIcon('Target'),
    Check: createIcon('Check'),
    Minus: createIcon('Minus'),
    X: createIcon('X'),
    Users: createIcon('Users'),
    FileText: createIcon('FileText'),
    Banknote: createIcon('Banknote'),
    RotateCcw: createIcon('RotateCcw'),
    CheckCircle2: createIcon('CheckCircle2'),
    Lock: createIcon('Lock'),
    IDCard: createIcon('IDCard'),
    MapPin: createIcon('MapPin'),
    Search: createIcon('Search'),
    Filter: createIcon('Filter'),
  };
});

// Suppress specific console warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('useGSAP') || args[0]?.includes?.('gsap')) return;
  originalWarn.apply(console, args);
};