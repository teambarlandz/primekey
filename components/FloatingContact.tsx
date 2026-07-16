import Link from 'next/link';

export default function FloatingContact() {
  return (
    <Link
      href="https://wa.me/0000000000"
      className="floating-contact"
      aria-label="Chat on WhatsApp"
    >
      💬
    </Link>
  );
}