import Link from 'next/link';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  defaultOpen?: boolean;
}

const faqItems: FAQItem[] = [
  {
    id: 1,
    question: 'Is PropNest really brokerage-free?',
    answer: 'Yes. Lorem ipsum dolor sit amet, consectetur adipiscing elit. You deal directly with owners or builders — we never charge brokerage from buyers or renters.',
    defaultOpen: true,
  },
  {
    id: 2,
    question: 'How are properties verified?',
    answer: 'Ut enim ad minim veniam. Every listing goes through a 27-point physical and legal verification before going live on the platform.',
  },
  {
    id: 3,
    question: 'How long does it take to close a deal?',
    answer: 'Duis aute irure dolor in reprehenderit. Our average time-to-close is 14 days, compared to the market average of 45+ days.',
  },
  {
    id: 4,
    question: 'Do you help with home loans?',
    answer: 'Excepteur sint occaecat cupidatat non proident. Yes — we partner with 12 leading banks to get you pre-approved in 48 hours at the best rates.',
  },
  {
    id: 5,
    question: 'Can builders list multiple projects?',
    answer: 'Sunt in culpa qui officia deserunt mollit anim. Yes — builders get a dedicated dashboard to manage inventory, leads, and performance across all projects.',
  },
  {
    id: 6,
    question: 'What if I'm not satisfied?',
    answer: 'Laborum nisi ut aliquip ex ea commodo consequat. We offer a 30-day satisfaction guarantee on all paid services — full refund, no questions asked.',
  },
];

export default function FAQ() {
  return (
    <section className="faq" aria-labelledby="faq-heading">
      <div className="container faq__grid">
        <div className="faq__intro">
          <p className="eyebrow">FAQs</p>
          <h2 id="faq-heading" className="section-title">Questions? We've got answers.</h2>
          <p className="section-subtitle">
            Can't find what you're looking for? Our team usually replies in under 5 minutes.
          </p>

          <div className="faq__inline-cta">
            <p className="faq__inline-cta-title">Still unsure? Talk to a real human.</p>
            <Link href="/contact" className="btn btn--primary">Book a free call</Link>
          </div>
        </div>

        <div className="faq__items">
          {faqItems.map((item) => (
            <details key={item.id} className="faq__item" open={item.defaultOpen}>
              <summary className="faq__question">{item.question}</summary>
              <div className="faq__answer">
                <p>{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="faq__fallback">
        <p>Still have questions?</p>
        <div className="faq__fallback-actions">
          <Link href="https://wa.me/0000000000" className="btn btn--ghost">💬 Chat on WhatsApp</Link>
          <Link href="tel:+0000000000" className="btn btn--ghost">📞 Call +00 0000 000 000</Link>
        </div>
      </div>
    </section>
  );
}