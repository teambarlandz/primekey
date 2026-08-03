'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { submitPropertyInquiry } from '@/lib/api-client';

const BRAND_COLOR = '#04164a';

interface PropertyInquiryFormProps {
  propertyId: string;
  propertyTitle: string;
}

export const PropertyInquiryForm: React.FC<PropertyInquiryFormProps> = ({ propertyId, propertyTitle }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await submitPropertyInquiry(propertyId, {
        full_name: fullName,
        phone,
        email: email || undefined,
        inquiry_message: message,
        ndpr_consent: consent,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-sm p-6 text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="font-heading text-base font-bold mb-2" style={{ color: BRAND_COLOR }}>
          Inquiry sent!
        </h3>
        <p className="text-sm text-[#4a607a] font-body leading-relaxed">
          Thanks for your interest in this property. A Primekey Homes advisor will reach out within 2 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-sm p-6">
      <h3 className="font-heading text-base font-bold mb-1" style={{ color: BRAND_COLOR }}>
        Make an inquiry
      </h3>
      <p className="text-xs text-[#4a607a] font-body mb-5">
        Interested in this listing? Tell us a little and we'll get back to you fast.
      </p>

      {error && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="inq-name" className="block text-xs font-semibold text-[#4a607a] mb-1.5 font-heading">Full name</label>
          <input
            id="inq-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full h-10 px-3 rounded-xl border border-purple-200 bg-white text-sm font-body focus:outline-none focus:ring-[#04164a]/20 text-[#22376e]"
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label htmlFor="inq-phone" className="block text-xs font-semibold text-[#4a607a] mb-1.5 font-heading">Phone number</label>
          <input
            id="inq-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full h-10 px-3 rounded-xl border border-purple-200 bg-white text-sm font-body focus:outline-none focus:ring-[#04164a]/20 text-[#22376e]"
            placeholder="08012345678"
          />
        </div>
        <div>
          <label htmlFor="inq-email" className="block text-xs font-semibold text-[#4a607a] mb-1.5 font-heading">Email (optional)</label>
          <input
            id="inq-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-purple-200 bg-white text-sm font-body focus:outline-none focus:ring-[#04164a]/20 text-[#22376e]"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="inq-message" className="block text-xs font-semibold text-[#4a607a] mb-1.5 font-heading">Your message</label>
          <textarea
            id="inq-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={3}
            className="w-full px-3 py-2 rounded-xl border border-purple-200 bg-white text-sm font-body focus:outline-none focus:ring-[#04164a]/20 text-[#22376e]"
            placeholder="I'd like to arrange a viewing…"
          />
        </div>
        <label className="flex items-start gap-2.5 text-xs text-[#4a607a] font-body cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
            className="mt-0.5 w-4 h-4 accent-[#04164a]"
          />
          <span>
            I consent to Primekey Homes processing my contact details to respond to this inquiry, under the Nigeria Data Protection Regulation (NDPR).
          </span>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold font-heading text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          <Send className="w-4 h-4" />
          {loading ? 'Sending…' : 'Send inquiry'}
        </button>
      </form>
    </div>
  );
};
