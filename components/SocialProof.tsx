import Image from 'next/image';

interface Testimonial {
  id: number;
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: '"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sold my apartment in 18 days — 12% above asking price."',
    name: 'Ananya Sharma',
    role: 'Seller, Bengaluru',
    avatar: 'https://placehold.co/48x48',
  },
  {
    id: 2,
    quote: '"Ut enim ad minim veniam. Found a verified 3BHK within a week — zero brokerage, full legal check done for me."',
    name: 'Rohan Mehta',
    role: 'Buyer, Mumbai',
    avatar: 'https://placehold.co/48x48',
  },
  {
    id: 3,
    quote: '"Duis aute irure dolor in reprehenderit. Listed 120 units across 3 projects — 94% occupied in 60 days."',
    name: 'Vikram Iyer',
    role: 'Builder, Pune',
    avatar: 'https://placehold.co/48x48',
  },
];

export default function SocialProof() {
  return (
    <section className="social-proof" aria-labelledby="sp-heading">
      <div className="container">
        <p className="eyebrow" id="sp-heading">Trusted by leading brands & featured in</p>
        <ul className="logo-strip" role="list">
          {[1, 2, 3, 4, 5].map((num) => (
            <li key={num}>
              <Image
                src={`https://placehold.co/120x40?text=Brand+${num}`}
                alt={`Brand ${num}`}
                width={120}
                height={40}
              />
            </li>
          ))}
        </ul>

        <div className="stats">
          <div className="stat">
            <p className="stat__value">10,000+</p>
            <p className="stat__label">Happy customers</p>
          </div>
          <div className="stat">
            <p className="stat__value">42</p>
            <p className="stat__label">Cities covered</p>
          </div>
          <div className="stat">
            <p className="stat__value">₹1,200 Cr</p>
            <p className="stat__label">Property value transacted</p>
          </div>
          <div className="stat">
            <p className="stat__value">4.8★</p>
            <p className="stat__label">Average rating (3,400 reviews)</p>
          </div>
        </div>

        <div className="testimonials">
          <h2 className="section-title">Real stories. Real results.</h2>

          <div className="testimonials__grid">
            {testimonials.map((testimonial) => (
              <article key={testimonial.id} className="testimonial">
                <div className="testimonial__stars" aria-label="Rated 5 out of 5">★★★★★</div>
                <blockquote className="testimonial__quote">
                  {testimonial.quote}
                </blockquote>
                <footer className="testimonial__author">
                  <Image
                    src={testimonial.avatar}
                    alt=""
                    width={48}
                    height={48}
                    className="testimonial__avatar"
                  />
                  <div>
                    <p className="testimonial__name">{testimonial.name}</p>
                    <p className="testimonial__role">{testimonial.role}</p>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}