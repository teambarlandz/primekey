'use client';

import React from 'react';
import Link from 'next/link';
import { ScrollText, BookOpen, UserCheck, LayoutGrid, Lock, ConciergeBell, Building2, Banknote, Ban, Copyright, ExternalLink, AlertTriangle, ShieldOff, Scale, RefreshCcw, Mail } from 'lucide-react';
import LegalPage, { LegalSection } from '@/components/legal/LegalPage';
import { COMPANY } from '@/lib/companyInfo';

const sections: LegalSection[] = [
  {
    id: 'acceptance',
    title: '1. Acceptance of These Terms',
    content: (
      <>
        <p>
          These Terms &amp; Conditions ("Terms") govern your access to and use of the website, mobile experience, and related services (collectively, the "Platform") operated by <strong>Primekey Homes and Properties Ltd</strong> ("Primekey Homes", "we", "us", or "our"), a company registered in the Federal Republic of Nigeria.
        </p>
        <p>
          By accessing or using the Platform, you agree to be bound by these Terms and our <Link href="/privacy" className="underline font-semibold">Privacy Policy</Link>, <Link href="/ndpr" className="underline font-semibold">NDPR Compliance Notice</Link>, and <Link href="/cookies" className="underline font-semibold">Cookie Policy</Link>, all of which form an integral part of this agreement. If you do not agree to any of these Terms, you must not use the Platform.
        </p>
      </>
    ),
  },
  {
    id: 'definitions',
    title: '2. Definitions',
    content: (
      <>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>"Platform"</strong> means the Primekey Homes website, mobile experience, and any related services or features we offer.</li>
          <li><strong>"User"</strong> means any person who accesses or uses the Platform, including visitors, buyers, renters, landlords, and property owners.</li>
          <li><strong>"Listing"</strong> means any property information posted or submitted to the Platform by a landlord or property owner.</li>
          <li><strong>"Concierge Service"</strong> means our 2-Week Concierge property sourcing service for buyers and renters.</li>
          <li><strong>"Verified"</strong> means that a property has passed our physical and legal verification checks at the time of assessment.</li>
          <li><strong>"Content"</strong> means text, images, videos, pricing, and any other material made available on the Platform.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'eligibility',
    title: '3. Eligibility',
    content: (
      <>
        <p>You must be at least 18 years old to use the Platform. By using the Platform, you represent and warrant that:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>You are at least 18 years of age;</li>
          <li>You are legally capable of entering into a binding contract; and</li>
          <li>Where you act on behalf of a company or organisation, you are authorised to bind that entity to these Terms.</li>
        </ul>
        <p>
          If you register as a landlord or property owner, you further represent that you own the property you list or are otherwise authorised to list it.
        </p>
      </>
    ),
  },
  {
    id: 'services',
    title: '4. The Services',
    content: (
      <>
        <p>The Platform provides a range of Nigerian real estate services, including:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Searching and browsing verified properties for sale or rent;</li>
          <li>The 2-Week Concierge sourcing service for buyers and renters;</li>
          <li>Free property listing, lead matching, and consultation booking for landlords;</li>
          <li>OTP-based account authentication; and</li>
          <li>Future B2B services for builders and developers (Phase 3).</li>
        </ul>
        <p>
          We may add, change, suspend, or discontinue any part of the Platform at any time, with or without notice. We are not liable to you for any such changes.
        </p>
      </>
    ),
  },
  {
    id: 'accounts',
    title: '5. Accounts & Security',
    content: (
      <>
        <p>
          Certain features require you to sign in using your Nigerian phone number and a one-time password (OTP) sent to that number. You are responsible for maintaining the confidentiality of your phone number and the OTPs sent to it.
        </p>
        <p>You agree to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide accurate, current, and complete information when using the Platform;</li>
          <li>Notify us immediately of any unauthorised use of your account; and</li>
          <li>Not share, distribute, or resell access to your account.</li>
        </ul>
        <p>
          You are responsible for all activity that occurs under your account. We may suspend or terminate your account if we reasonably believe these Terms have been violated.
        </p>
      </>
    ),
  },
  {
    id: 'concierge',
    title: '6. Concierge Service (Buyers & Renters)',
    content: (
      <>
        <p>
          When a search returns no matching results, you may use our 2-Week Concierge Service. By submitting a concierge request, you authorise us to use the information you provide to source and match suitable properties on your behalf.
        </p>
        <p>Please note the following:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>We make reasonable commercial efforts to source properties that match your stated requirements, but we do not guarantee that a suitable property will be found within any specific timeframe;</li>
          <li>Any property sourced for you remains subject to your own independent verification and due diligence;</li>
          <li>Your submission requires explicit NDPR consent to the processing of your contact information, which you may withdraw at any time.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'landlords',
    title: '7. Landlord Listings & Verification',
    content: (
      <>
        <p>
          Listing a property on the Platform is free. When you submit a listing, you must provide accurate and truthful information about the property, including its location, condition, features, and pricing.
        </p>
        <p>You agree that:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>You own the property or are lawfully authorised to list it;</li>
          <li>The information you provide is accurate and not misleading;</li>
          <li>You will promptly update the listing if key details change, and mark the property as no longer available once it is let or sold;</li>
          <li>Our 27-point physical and legal verification reflects the state of the property at the time of inspection and does not guarantee future condition, title perfection, or the conduct of any counterparty;</li>
          <li>You will cooperate with our agents for inspections, viewings, and documentation.</li>
        </ul>
        <p>
          We reserve the right to reject, remove, or refuse any listing that we reasonably believe violates these Terms, applicable law, or our standards.
        </p>
      </>
    ),
  },
  {
    id: 'fees',
    title: '8. Fees & Payments',
    content: (
      <>
        <p>
          Listing a property and using the core search and concierge services is free. Where paid services are introduced — such as featured listings, priority placement, or B2B procurement — applicable fees will be disclosed before you commit to the service.
        </p>
        <p>
          Payments are processed by licensed payment providers (including, in Phase 3, Paystack or Flutterwave). We do not store your card or bank details on our servers. All prices are stated in Nigerian Naira (₦) unless otherwise indicated. You are responsible for any taxes applicable to your transactions.
        </p>
      </>
    ),
  },
  {
    id: 'prohibited',
    title: '9. Prohibited Conduct',
    content: (
      <>
        <p>You agree not to use the Platform to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Post false, misleading, fraudulent, or unlawful listings or Content;</li>
          <li>Harass, abuse, threaten, or harm any person, or collect their data without consent;</li>
          <li>Attempt to gain unauthorised access to the Platform, our systems, or other users&rsquo; accounts;</li>
          <li>Introduce viruses, malware, or any malicious code;</li>
          <li>Scrape, republish, or commercially exploit Platform Content without our written permission;</li>
          <li>Violate any applicable Nigerian law or regulation, including the NDPA 2023.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'ip',
    title: '10. Intellectual Property',
    content: (
      <>
        <p>
          The Platform and all of its Content — including text, graphics, logos, software, and the "Primekey Homes" name and marks — are owned by or licensed to Primekey Homes and are protected by Nigerian and international intellectual property laws.
        </p>
        <p>
          You may use the Platform and Content for your personal, non-commercial use only. Any other use, including reproduction, modification, distribution, or republication, requires our prior written consent. Nothing in these Terms transfers any intellectual property rights to you.
        </p>
      </>
    ),
  },
  {
    id: 'third-party',
    title: '11. Third-Party Links & Services',
    content: (
      <>
        <p>
          The Platform may contain links to third-party websites, services, or payment providers that we do not operate. We are not responsible for the content, policies, or practices of any third party. Your use of third-party services is at your own risk and subject to their own terms and privacy policies.
        </p>
      </>
    ),
  },
  {
    id: 'disclaimers',
    title: '12. Disclaimers',
    content: (
      <>
        <p>
          THE PLATFORM AND ALL CONTENT AND SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. TO THE MAXIMUM EXTENT PERMITTED BY LAW, PRIMEKEY HOMES MAKES NO WARRANTIES, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING WITHOUT LIMITATION IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR ACCURACY.
        </p>
        <p>
          While we verify listings to the best of our ability, we do not guarantee the accuracy, completeness, or reliability of any property information, price, or third-party statement on the Platform. All property transactions are concluded directly between the parties involved.
        </p>
      </>
    ),
  },
  {
    id: 'liability',
    title: '13. Limitation of Liability',
    content: (
      <>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, PRIMEKEY HOMES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE PLATFORM.
        </p>
        <p>
          OUR TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATING TO THESE TERMS SHALL NOT EXCEED THE GREATER OF: (A) THE AMOUNTS YOU HAVE PAID TO US IN THE SIX (6) MONTHS PRECEDING THE CLAIM; OR (B) FIVE HUNDRED THOUSAND NAIRA (₦500,000).
        </p>
        <p>
          Nothing in these Terms limits liability that cannot be limited under applicable law.
        </p>
      </>
    ),
  },
  {
    id: 'indemnification',
    title: '14. Indemnification',
    content: (
      <>
        <p>
          You agree to indemnify, defend, and hold harmless Primekey Homes and Properties Ltd, its affiliates, officers, directors, employees, and agents from and against any claims, damages, liabilities, costs, and expenses (including reasonable legal fees) arising out of or related to: (a) your use of the Platform; (b) your violation of these Terms; (c) your violation of any third-party right, including intellectual property or privacy rights; or (d) any claim arising from your Listing or Content.
        </p>
      </>
    ),
  },
  {
    id: 'governing-law',
    title: '15. Governing Law & Dispute Resolution',
    content: (
      <>
        <p>
          These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any dispute, controversy, or claim arising out of or in connection with these Terms shall first be referred for good-faith negotiation between the parties.
        </p>
        <p>
          If the dispute is not resolved through negotiation within thirty (30) days, either party may refer the matter to mediation or arbitration administered under the Arbitration and Conciliation Act, Cap A18, Laws of the Federation of Nigeria 2004, seated in Lagos, Nigeria.
        </p>
        <p>
          Any dispute that is not subject to arbitration shall be submitted to the exclusive jurisdiction of the courts of Nigeria, sitting in Lagos.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: '16. Changes to These Terms',
    content: (
      <>
        <p>
          We may revise these Terms from time to time. The "Last updated" date at the top of this page indicates when the Terms were most recently revised. Continued use of the Platform after such changes take effect constitutes your acceptance of the revised Terms. We will take reasonable steps to notify you of material changes.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    title: '17. Contact Us',
    content: (
      <>
        <p>
          If you have any questions about these Terms, please contact us:
        </p>
        <div className="space-y-3 bg-[#f3f0ff]/60 border border-purple-100 rounded-xl p-5">
          <p><strong>{COMPANY.name}</strong></p>
          <p>{COMPANY.headOffice.full}</p>
          <p className="flex items-center gap-2">
            <Mail className="w-4 h-4 shrink-0" />
            Email: <a href="mailto:hello@primekeyhomesandpropertiesltd.com" className="underline font-semibold">hello@primekeyhomesandpropertiesltd.com</a>
          </p>
          <p className="text-sm">Our team typically responds within 24 hours on business days.</p>
        </div>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      icon={<ScrollText className="w-8 h-8" />}
      badge="Legal & Trust"
      title="Terms & Conditions"
      subtitle="The terms that govern your use of the Primekey Homes platform — from property searches and concierge sourcing to landlord listings."
      effectiveDate="2 August 2026"
      intro={
        <p className="text-sm">
          These Terms apply whenever you access or use the Platform, whether as a visitor, prospective buyer or renter, or as a landlord and property owner. They form a legally binding agreement between you and Primekey Homes and Properties Ltd. Please read them carefully before using the Platform.
        </p>
      }
      sections={sections}
    />
  );
}
