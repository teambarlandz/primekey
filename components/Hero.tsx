import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-headline">
      <div className="container hero__grid">
        <div className="hero__content">
          <p className="hero__preheadline">Trusted by 10,000+ homeowners across 42 cities</p>
          <h1 id="hero-headline" className="hero__headline">
            Find your next home — <span className="text-accent">without the hassle.</span>
          </h1>
          <p className="hero__subheadline">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Buy, rent, or list verified
            properties in minutes — with zero brokerage and full legal support.
          </p>

          <div className="hero__ctas">
            <Link href="/search" className="btn btn--primary btn--lg">Browse properties</Link>
            <Link href="/demo" className="btn btn--ghost btn--lg">
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24">
                <path fill="currentColor" d="M8 5v14l11-7z"/>
              </svg>
              Watch 2-min demo
            </Link>
          </div>

          <ul className="hero__trust" role="list">
            <li>✓ Verified listings only</li>
            <li>✓ Zero brokerage</li>
            <li>✓ Legal support included</li>
          </ul>
        </div>

        <div className="hero__media">
          <Image
            src="https://placehold.co/720x560/eef2ff/4f46e5?text=Hero+Image"
            alt="Happy couple receiving keys to their new home"
            width={720}
            height={560}
            className="hero__image"
            priority
          />
          <aside className="hero__floating-card" aria-label="Recent transaction">
            <div className="hero__floating-card-avatar">
              <Image
                src="https://placehold.co/40x40"
                alt=""
                width={40}
                height={40}
              />
            </div>
            <div>
              <p className="hero__floating-card-title">Chinedu just rented a 3-bedroom</p>
              <p className="hero__floating-card-sub">apartment flat in Lekki</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}