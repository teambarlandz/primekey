'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, FileText, Database, Users, Scale, Cookie, Share2, Clock, Lock, Globe, Baby, RefreshCcw, Mail } from 'lucide-react';
import LegalPage, { LegalSection } from '@/components/legal/LegalPage';

const sections: LegalSection[] = [
  {
    id: 'overview',
    title: '1. Overview & Who We Are',
    content: (
      <>
        <p>
          This Privacy Policy explains how <strong>Primekey Homes and Properties Ltd</strong> ("Primekey Homes", "we", "us", or "our"), a company registered in the Federal Republic of Nigeria, collects, uses, discloses, and protects personal information when you use our website, mobile experience, and related services (collectively, the "Platform").
        </p>
        <p>
          We process personal data in accordance with the <strong>Nigeria Data Protection Regulation, 2019 (NDPR)</strong>, the <strong>Nigeria Data Protection Act, 2023 (NDPA 2023)</strong>, and any other applicable Nigerian data protection laws and regulations, under the supervision of the Nigeria Data Protection Commission (NDPC).
        </p>
        <p>
          By using the Platform, you agree to the collection and use of information in accordance with this policy. Where we rely on your consent, you will be asked to provide it expressly — for example, by ticking the NDPR consent box on our forms — before we process your personal data.
        </p>
      </>
    ),
  },
  {
    id: 'information-we-collect',
    title: '2. Information We Collect',
    content: (
      <>
        <p>We collect personal information in several ways, depending on how you interact with the Platform:</p>
        <div className="space-y-4">
          <div>
            <p className="font-semibold" style={{ color: '#04164a' }}>a) Concierge Property Sourcing (Buyers & Renters)</p>
            <p>
              When you submit a 2-Week Concierge request, we collect your full name, phone number, email address (optional), preferred location, budget range, property type, and number of bedrooms. This is used to match you with verified properties.
            </p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#04164a' }}>b) Landlord Registration</p>
            <p>
              When you register as a landlord or property owner, we collect your full name, phone number, email address, government-issued identification type and number, and the number of properties you own. This is used to verify your identity and onboard your listing.
            </p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#04164a' }}>c) Account Authentication (OTP)</p>
            <p>
              When you sign in or register using our phone-based OTP system, we collect and verify your Nigerian phone number, which acts as your account identifier.
            </p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#04164a' }}>d) Technical & Usage Data</p>
            <p>
              We automatically collect certain technical information when you visit the Platform, including your IP address, browser type, user agent, referring URLs, pages viewed, and timestamps. This data supports security, fraud prevention, and platform improvement.
            </p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#04164a' }}>e) Cookies & Similar Technologies</p>
            <p>
              We use cookies and similar technologies to keep you signed in, remember your preferences, and measure Platform performance. See our <Link href="/cookies" className="underline font-semibold">Cookie Policy</Link> for details.
            </p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'how-we-use',
    title: '3. How We Use Your Information',
    content: (
      <>
        <p>We use the personal information we collect to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide, operate, and maintain the Platform and its features;</li>
          <li>Process and respond to your concierge sourcing requests and landlord registrations;</li>
          <li>Match buyers, renters, and landlords with relevant, verified properties and leads;</li>
          <li>Verify your identity and secure your account via OTP authentication;</li>
          <li>Assign and track service-level obligations, including our 2-hour lead response target;</li>
          <li>Send service communications, property alerts, and — only with your separate consent — marketing communications;</li>
          <li>Detect, prevent, and address technical or security issues and fraudulent activity;</li>
          <li>Comply with legal obligations and enforce our <Link href="/terms" className="underline font-semibold">Terms &amp; Conditions</Link>.</li>
        </ul>
        <p>
          We will never sell your personal information. We process personal data strictly for the purposes disclosed at the point of collection.
        </p>
      </>
    ),
  },
  {
    id: 'lawful-bases',
    title: '4. Lawful Bases for Processing',
    content: (
      <>
        <p>
          Under the NDPA 2023 and NDPR 2019, we rely on the following lawful bases when processing personal data:
        </p>
        <div className="space-y-4">
          <div>
            <p className="font-semibold" style={{ color: '#04164a' }}>Consent</p>
            <p>
              Where you have given us clear, affirmative, and informed consent — for example, by ticking the NDPR consent box when submitting a concierge request or landlord registration. Every consent is recorded in an immutable consent log (see our <Link href="/ndpr" className="underline font-semibold">NDPR Compliance Notice</Link>). You may withdraw consent at any time.
            </p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#04164a' }}>Performance of a Contract</p>
            <p>
              Where processing is necessary to deliver a service you have requested, such as sourcing a property, listing your property, or scheduling a consultation.
            </p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#04164a' }}>Legitimate Interests</p>
            <p>
              Where processing is necessary for our legitimate business interests — such as preventing fraud, securing the Platform, and improving our services — provided your rights and interests do not override those interests.
            </p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#04164a' }}>Legal Obligation</p>
            <p>
              Where processing is necessary to comply with applicable laws, regulations, or regulatory requests, including obligations under Nigerian real estate and anti-money-laundering regulations.
            </p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'cookies',
    title: '5. Cookies & Similar Technologies',
    content: (
      <>
        <p>
          We use essential cookies to operate the Platform (for example, session and security tokens), and we may use analytics cookies to understand how visitors use our services. Non-essential cookies are only placed where permitted.
        </p>
        <p>
          You can manage or disable cookies through your browser settings at any time; however, some features of the Platform may not function correctly without them. For full details, please review our <Link href="/cookies" className="underline font-semibold">Cookie Policy</Link>.
        </p>
      </>
    ),
  },
  {
    id: 'sharing',
    title: '6. Sharing & Disclosure',
    content: (
      <>
        <p>We share personal information only in the circumstances described below:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>With our agents and partners:</strong> To fulfil your request — for example, sharing verified lead details with vetted property agents and field staff who manage viewings and inspections.</li>
          <li><strong>With service providers:</strong> Trusted vendors who host the Platform, deliver SMS and email messages, process payments (e.g., Paystack or Flutterwave in Phase 3), and provide analytics. These providers are bound by data processing agreements and may only process data on our instructions.</li>
          <li><strong>For legal and safety reasons:</strong> Where required by law, regulation, court order, or the NDPC, or where necessary to protect the rights, property, or safety of Primekey Homes, our users, or the public.</li>
          <li><strong>In a business transaction:</strong> If we are involved in a merger, acquisition, or sale of assets, your data may be transferred as part of that transaction, subject to appropriate notice.</li>
        </ul>
        <p>
          We do not sell, rent, or trade your personal information to third parties for their own marketing purposes.
        </p>
      </>
    ),
  },
  {
    id: 'retention',
    title: '7. Data Retention',
    content: (
      <>
        <p>
          We retain personal data only for as long as necessary to fulfil the purposes described in this policy, unless a longer retention period is required or permitted by law.
        </p>
        <p>
          <strong>Concierge leads</strong> that remain inactive for <strong>six (6) months</strong> are automatically scrubbed and anonymized through our scheduled retention routine. When this happens, identifying fields are irreversibly anonymized and only a cryptographic (SHA-256) hash is retained for audit and accountability purposes.
        </p>
        <p>
          Where we process data on the basis of consent and you withdraw that consent, we will stop processing your data and delete or anonymize it, subject to any legal retention obligations.
        </p>
      </>
    ),
  },
  {
    id: 'your-rights',
    title: '8. Your Data Protection Rights',
    content: (
      <>
        <p>
          Under the NDPA 2023 and NDPR 2019, you have the following rights with respect to your personal data:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Right of access:</strong> Request a copy of the personal data we hold about you, via our secure export process.</li>
          <li><strong>Right to rectification:</strong> Request correction of inaccurate or incomplete data.</li>
          <li><strong>Right to erasure ("right to be forgotten"):</strong> Request that we delete or anonymize your personal data.</li>
          <li><strong>Right to restrict processing:</strong> Request that we limit how we process your data in certain circumstances.</li>
          <li><strong>Right to data portability:</strong> Receive your data in a structured, machine-readable format where technically feasible.</li>
          <li><strong>Right to withdraw consent:</strong> Withdraw any consent you have given at any time, without affecting the lawfulness of processing based on consent before withdrawal.</li>
          <li><strong>Right to object and not be subject to automated decision-making</strong> where such decisions produce legal effects on you.</li>
          <li><strong>Right to complain:</strong> Lodge a complaint with the <strong>Nigeria Data Protection Commission (NDPC)</strong> or a court of competent jurisdiction.</li>
        </ul>
        <p>
          To exercise any of these rights, you can initiate a data export or erasure request through our Platform, or contact our Data Protection Officer using the details in Section 12 below. We will respond within the timeline required by law and verify your identity before fulfilling any request.
        </p>
      </>
    ),
  },
  {
    id: 'security',
    title: '9. Data Security',
    content: (
      <>
        <p>
          We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction, including:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Encryption of data in transit (HTTPS) and, where applicable, at rest;</li>
          <li>Role-based access controls so that only authorised staff can access personal data;</li>
          <li>Automated rate limiting and security monitoring on our public endpoints;</li>
          <li>Anonymization of inactive data and secure disposal of records.</li>
        </ul>
        <p>
          While no method of transmission over the internet is completely secure, we work hard to protect your information and to comply with NDPR/NDPA accountability requirements. In the event of a data breach that is likely to result in a high risk to your rights and freedoms, we will notify you and the NDPC as required by law.
        </p>
      </>
    ),
  },
  {
    id: 'international-transfers',
    title: '10. International Data Transfers',
    content: (
      <>
        <p>
          Some of our service providers may store or process data in locations outside Nigeria. Where we transfer personal data internationally, we ensure that appropriate safeguards are in place — such as data processing agreements, contractual clauses, and adequacy decisions — so that your information receives a level of protection consistent with the NDPA 2023 and NDPR 2019.
        </p>
      </>
    ),
  },
  {
    id: 'children',
    title: '11. Children&rsquo;s Privacy',
    content: (
      <>
        <p>
          The Platform is intended for use by individuals who are at least 18 years old. We do not knowingly collect personal data from children under the age of 18. If you believe we have collected a child&rsquo;s data, please contact us so that we can delete it promptly.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: '12. Changes to This Policy',
    content: (
      <>
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. The date at the top of this page indicates when the policy was last updated. Where changes are material, we will take reasonable steps to notify you — for example, by posting a notice on the Platform or contacting you directly. Continued use of the Platform after changes take effect constitutes acceptance of the revised policy.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    title: '13. Contact Us & Our Data Protection Officer',
    content: (
      <>
        <p>
          If you have any questions, concerns, or requests about this Privacy Policy or our handling of your personal data, please contact us:
        </p>
        <div className="space-y-3 bg-[#f3f0ff]/60 border border-purple-100 rounded-xl p-5">
          <p><strong>Primekey Homes and Properties Ltd</strong></p>
          <p>Victoria Island, Lagos, Nigeria</p>
          <p className="flex items-center gap-2">
            <Mail className="w-4 h-4 shrink-0" />
            Email: <a href="mailto:hello@primekeyhomesandpropertiesltd.com" className="underline font-semibold">hello@primekeyhomesandpropertiesltd.com</a>
          </p>
          <p className="text-sm">
            Attn: Data Protection Officer (DPO)
          </p>
        </div>
        <p>
          You may also lodge a complaint with the Nigeria Data Protection Commission (NDPC) at any time:
          <br />
          <span className="font-semibold" style={{ color: '#04164a' }}>Nigeria Data Protection Commission</span>, Plot 139, Apo-Dutse Road, Abuja, FCT, Nigeria — <a href="https://ndpc.gov.ng" target="_blank" rel="noopener noreferrer" className="underline font-semibold">ndpc.gov.ng</a>
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      icon={<ShieldCheck className="w-8 h-8" />}
      badge="Legal & Trust"
      title="Privacy Policy"
      subtitle="How Primekey Homes collects, uses, and protects your personal information — compliant with the Nigeria Data Protection Act 2023 and NDPR 2019."
      effectiveDate="2 August 2026"
      intro={
        <>
          <p className="text-sm mb-4">
            This policy applies to all visitors and users of the Platform, including prospective buyers and renters, property owners and landlords, and any other persons who interact with our services. It describes the personal data we collect, why we collect it, how we use it, and the choices and rights you have regarding your information.
          </p>
          <p className="text-sm">
            Please read this policy carefully. Where we refer to "personal data" or "personal information", we mean any information relating to an identified or identifiable natural person, as defined under the NDPA 2023.
          </p>
        </>
      }
      sections={sections}
    />
  );
}
