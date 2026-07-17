import Link from 'next/link';
import Image from 'next/image';

interface Benefit {
  id: number;
  icon: string;
  title: string;
  text: string;
}

const benefits: Benefit[] = [
  {
    id: 1,
    icon: '🔒',
    title: '100% Verified Listings',
    text: 'Every property is physically verified and legally checked before it goes live.',
  },
  {
    id: 2,
    icon: '💰',
    title: 'Zero Brokerage',
    text: 'Talk directly to owners or builders. Save up to 2 months\' rent in brokerage fees.',
  },
  {
    id: 3,
    icon: '⚡',
    title: 'Close Deals in Days',
    text: 'Our average time-to-close is 14 days — 3x faster than the market average.',
  },
  {
    id: 4,
    icon: '📜',
    title: 'End-to-End Legal',
    text: 'From agreement drafting to registration — We handle it all.',
  },
];

interface ComparisonRow {
  feature: string;
  propnest: string;
  traditional: string;
  others: string;
}

const comparisonData: ComparisonRow[] = [
  { feature: 'Verified listings', propnest: '✓', traditional: '✗', others: 'Some' },
  { feature: 'Zero brokerage', propnest: '✓', traditional: '✗', others: '✗' },
  { feature: 'Legal support included', propnest: '✓', traditional: '✗', others: 'Paid add-on' },
  { feature: 'Direct owner contact', propnest: '✓', traditional: '✗', others: 'Limited' },
  { feature: 'Builder inventory access', propnest: '✓', traditional: '✗', others: '✓' },
];

export default function Benefits() {
  return (
    <section className="benefits" aria-labelledby="benefits-heading">
      <div className="container">
        <header className="section-header">
          <p className="eyebrow">Why PropNest</p>
          <h2 id="benefits-heading" className="section-title">Everything you need. Nothing you don't.</h2>
          <p className="section-subtitle">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit — built for buyers, renters, owners, and builders.
          </p>
        </header>

        <div className="benefit-cards">
          {benefits.map((benefit) => (
            <article key={benefit.id} className="benefit-card">
              <div className="benefit-card__icon" aria-hidden="true">{benefit.icon}</div>
              <h3 className="benefit-card__title">{benefit.title}</h3>
              <p className="benefit-card__text">{benefit.text}</p>
            </article>
          ))}
        </div>

        <div className="how-it-works">
          <h3 className="how-it-works__title">How it works — 3 simple steps</h3>
          <ol className="steps">
            <li className="step">
              <span className="step__number">1</span>
              <h4 className="step__title">Search & Shortlist</h4>
              <p className="step__text">Browse verified listings with photos, floor plans, and neighbourhood scores.</p>
            </li>
            <li className="step">
              <span className="step__number">2</span>
              <h4 className="step__title">Schedule a Visit</h4>
              <p className="step__text">Book a tour with the owner or our relationship manager — at your time.</p>
            </li>
            <li className="step">
              <span className="step__number">3</span>
              <h4 className="step__title">Close with Confidence</h4>
              <p className="step__text">We handle paperwork, legal checks, and payment protection — end to end.</p>
            </li>
          </ol>
        </div>

        <div className="comparison">
          <h3 className="comparison__title">PropNest vs the rest</h3>
          <table className="comparison__table" role="table">
            <thead>
              <tr>
                <th scope="col">Feature</th>
                <th scope="col" className="comparison__us">PropNest</th>
                <th scope="col">Traditional brokers</th>
                <th scope="col">Other portals</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, index) => (
                <tr key={index}>
                  <td>{row.feature}</td>
                  <td className="yes">{row.propnest}</td>
                  <td className={row.traditional === '✗' ? 'no' : 'partial'}>{row.traditional}</td>
                  <td className={row.others === '✗' ? 'no' : row.others === '✓' ? 'yes' : 'partial'}>{row.others}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="split">
          <Image
            src="https://placehold.co/640x480?text=Split+Image"
            alt="PropNest relationship manager helping a family"
            width={640}
            height={480}
            className="split__image"
          />
          <div className="split__content">
            <p className="eyebrow">Built for humans</p>
            <h3 className="split__title">A dedicated manager for every deal</h3>
            <p className="split__text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Your manager handles
              negotiations, site visits, paperwork, and post-sale support — so you never feel lost.
            </p>
            <ul className="checklist" role="list">
              <li>Single point of contact</li>
              <li>Available 7 days a week</li>
              <li>Post-sale support for 90 days</li>
            </ul>
            <Link href="/contact" className="btn btn--primary">Meet your manager</Link>
          </div>
        </div>
      </div>
    </section>
  );
}