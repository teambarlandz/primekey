'use client';

import { useState, FormEvent } from 'react';

export default function FinalCTA() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    interest: '',
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <section className="final-cta" aria-labelledby="cta-heading">
      <div className="container final-cta__grid">
        <div className="final-cta__content">
          <p className="eyebrow eyebrow--light">Ready when you are</p>
          <h2 id="cta-heading" className="final-cta__headline">
            Your next home is one click away.
          </h2>
          <p className="final-cta__sub">
            Join 10,000+ happy customers. Get a free property consultation in the next 24 hours.
          </p>

          <ul className="final-cta__perks" role="list">
            <li>✓ Free consultation</li>
            <li>✓ No obligation</li>
            <li>✓ Cancel anytime</li>
          </ul>
        </div>

        <form className="final-cta__form" onSubmit={handleSubmit} aria-label="Request a callback">
          <p className="final-cta__form-title">Get a free callback</p>

          <label className="sr-only" htmlFor="cta-name">Your name</label>
          <input
            id="cta-name"
            name="name"
            type="text"
            placeholder="Your name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <label className="sr-only" htmlFor="cta-phone">Phone number</label>
          <input
            id="cta-phone"
            name="phone"
            type="tel"
            placeholder="Phone number"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <label className="sr-only" htmlFor="cta-interest">I'm interested in</label>
          <select
            id="cta-interest"
            name="interest"
            required
            value={formData.interest}
            onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
          >
            <option value="" disabled>I'm interested in…</option>
            <option value="buy">Buying a property</option>
            <option value="rent">Renting a property</option>
            <option value="sell">Selling my property</option>
            <option value="builder">Builder partnership</option>
          </select>

          <button type="submit" className="btn btn--primary btn--lg btn--full">
            Request my free callback
          </button>

          <p className="final-cta__urgency">
            🔥 Only <strong>7 slots</strong> left for consultations this week
          </p>

          <ul className="final-cta__badges" role="list">
            <li>🔒 256-bit SSL</li>
            <li>✓ RERA registered</li>
            <li>★ 4.8/5 rating</li>
          </ul>
        </form>
      </div>
    </section>
  );
}