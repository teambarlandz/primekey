'use client';

import React from 'react';
import Link from 'next/link';
import { Scale, Landmark, User, ShieldCheck, FileCheck2, Database, ClipboardCheck, Lock, Trash2, Users, Inbox, AlertTriangle, Mail } from 'lucide-react';
import LegalPage, { LegalSection } from '@/components/legal/LegalPage';
import { COMPANY } from '@/lib/companyInfo';

const sections: LegalSection[] = [
  {
    id: 'commitment',
    title: '1. Our Compliance Commitment',
    content: (
      <>
        <p>
          <strong>Primekey Homes and Properties Ltd</strong> is committed to protecting the privacy and personal data of every person who interacts with our platform. This notice explains how we comply with Nigerian data protection law, the measures we have put in place, and how you can exercise your rights.
        </p>
        <p>
          Data protection and privacy are not add-ons at Primekey Homes — they are designed into our products, our processes, and our technology. We process personal data lawfully, fairly, and transparently, and we hold ourselves accountable for doing so.
        </p>
      </>
    ),
  },
  {
    id: 'legal-framework',
    title: '2. Legal Framework',
    content: (
      <>
        <p>Our data protection practices are built on the following Nigerian legal instruments:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>The Nigeria Data Protection Regulation (NDPR), 2019</strong> — issued by the National Information Technology Development Agency (NITDA), establishing rules for the processing of personal data and the rights of data subjects;
          </li>
          <li>
            <strong>The Nigeria Data Protection Act, 2023 (NDPA 2023)</strong> — the principal legislation on data protection in Nigeria, which repeals and replaces the NDPR and establishes the <strong>Nigeria Data Protection Commission (NDPC)</strong> as the independent regulator;
          </li>
          <li>
            <strong>Guidance and directives issued by the NDPC</strong> from time to time.
          </li>
        </ul>
        <p>
          In this notice, references to "NDPR" should be read alongside the NDPA 2023, which now governs data protection compliance in Nigeria.
        </p>
      </>
    ),
  },
  {
    id: 'controller',
    title: '3. Data Controller Information',
    content: (
      <>
        <p>
          The data controller responsible for the processing of personal data on the Platform is:
        </p>
        <div className="space-y-3 bg-[#f3f0ff]/60 border border-purple-100 rounded-xl p-5">
          <p><strong>{COMPANY.name}</strong></p>
          <p>Registered in the Federal Republic of Nigeria (RC: 0000000).</p>
          <p>Office: {COMPANY.headOffice.full} (by appointment only).</p>
          <p>Email: <a href="mailto:hello@primekeyhomesandpropertiesltd.com" className="underline font-semibold">hello@primekeyhomesandpropertiesltd.com</a></p>
        </div>
      </>
    ),
  },
  {
    id: 'principles',
    title: '4. Data Protection Principles',
    content: (
      <>
        <p>We apply the following principles to every processing activity we undertake:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Lawfulness, fairness, and transparency:</strong> We always have a lawful basis and we explain our practices in plain language;</li>
          <li><strong>Purpose limitation:</strong> We collect data only for specified, explicit, and legitimate purposes and do not use it for incompatible purposes;</li>
          <li><strong>Data minimisation:</strong> We collect only the personal data that is adequate, relevant, and necessary;</li>
          <li><strong>Accuracy:</strong> We take reasonable steps to keep personal data accurate and up to date;</li>
          <li><strong>Storage limitation:</strong> We keep personal data only for as long as necessary and anonymize it when it is no longer needed;</li>
          <li><strong>Integrity and confidentiality:</strong> We protect personal data with appropriate technical and organisational security measures; and</li>
          <li><strong>Accountability:</strong> We can demonstrate and evidence our compliance, including through audit trails.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'consent',
    title: '5. Consent Management',
    content: (
      <>
        <p>
          Where we rely on consent as our lawful basis, your consent must be freely given, specific, informed, and unambiguous. On the Platform:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Every form that collects personal information — such as the 2-Week Concierge request and landlord registration — requires you to actively tick an NDPR consent checkbox before submission;
          </li>
          <li>
            Each consent interaction is recorded in an <strong>immutable consent log</strong> that captures the purpose, the consent text, the version, your identifier, the IP address, and the exact timestamp;
          </li>
          <li>
            Consent records are versioned so that changes to our privacy terms are traceable; and
          </li>
          <li>
            You may <strong>withdraw consent at any time</strong> with the same ease with which you gave it. Withdrawing consent does not affect the lawfulness of processing based on consent before its withdrawal.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'data-we-process',
    title: '6. Data We Process',
    content: (
      <>
        <p>
          Consistent with the principle of data minimisation, we process only the personal data necessary for the purposes of the Platform, including:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Contact details provided through concierge requests (name, phone, email) and landlord registration (name, phone, email, identification details);</li>
          <li>Your property preferences, budget range, and requirements;</li>
          <li>Your phone number for OTP-based account authentication;</li>
          <li>Technical data such as IP address, user agent, referrer, and timestamps, captured in consent and security logs.</li>
        </ul>
        <p>
          For the full list of categories of personal data and our lawful bases for processing, please see our <Link href="/privacy" className="underline font-semibold">Privacy Policy</Link>.
        </p>
      </>
    ),
  },
  {
    id: 'retention',
    title: '7. Retention & Automated Anonymization',
    content: (
      <>
        <p>
          We retain personal data only for as long as is necessary for the purposes for which it was collected.
        </p>
        <p>
          Our retention policy includes an <strong>automated anonymization routine</strong>: concierge leads that are inactive for six (6) months are automatically scrubbed and anonymized. When anonymization occurs:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Identifying fields are irreversibly anonymized, so the data can no longer be linked to you;</li>
          <li>A cryptographic (SHA-256) hash of the original data is retained so we can demonstrate accountability; and</li>
          <li>Every anonymization event is recorded in an immutable audit log with the trigger, date, and scope.</li>
        </ul>
        <p>
          This means that even if we were required to do so, we could not re-identify your data after anonymization.
        </p>
      </>
    ),
  },
  {
    id: 'rights',
    title: '8. Data Subject Rights',
    content: (
      <>
        <p>
          The NDPR and the NDPA 2023 give you the following rights over your personal data:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Right of access</strong> — obtain confirmation of whether we process your data and a copy of it;</li>
          <li><strong>Right to rectification</strong> — correct inaccurate or incomplete data;</li>
          <li><strong>Right to erasure</strong> — request deletion or anonymization of your data;</li>
          <li><strong>Right to restrict processing</strong> — limit how we use your data in certain circumstances;</li>
          <li><strong>Right to data portability</strong> — receive your data in a structured, commonly used, machine-readable format;</li>
          <li><strong>Right to object</strong> — object to processing based on legitimate interests or for direct marketing;</li>
          <li><strong>Right to withdraw consent</strong> — at any time, with equivalent ease to giving it; and</li>
          <li><strong>Right not to be subject to automated decision-making</strong> that produces legal effects on you, without appropriate safeguards.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'how-to-exercise',
    title: '9. How to Exercise Your Rights',
    content: (
      <>
        <p>You can exercise your rights in two ways:</p>
        <div className="space-y-4">
          <div>
            <p className="font-semibold" style={{ color: '#04164a' }}>a) Through the Platform</p>
            <p>
              Our compliance service provides secure, code-verified processes for data requests. You may request a copy of your data (data export) or request erasure (right to be forgotten) by contacting us at <a href="mailto:hello@primekeyhomesandpropertiesltd.com" className="underline font-semibold">hello@primekeyhomesandpropertiesltd.com</a>, and we will verify your identity before processing your request.
            </p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#04164a' }}>b) In Writing</p>
            <p>
              Write to our Data Protection Officer (DPO) at the address below with sufficient detail to identify you and your request.
            </p>
          </div>
        </div>
        <p>
          We will respond to verifiable requests within the timeframes required by law (typically one month, and not later than the statutory deadline), and we will inform you if we require additional information or an extension.
        </p>
      </>
    ),
  },
  {
    id: 'complaints',
    title: '10. Complaints & The NDPC',
    content: (
      <>
        <p>
          If you are not satisfied with how we have handled your personal data or your request, you have the right to lodge a complaint with the independent data protection regulator in Nigeria:
        </p>
        <div className="space-y-3 bg-[#f3f0ff]/60 border border-purple-100 rounded-xl p-5">
          <p className="font-semibold" style={{ color: '#04164a' }}>Nigeria Data Protection Commission (NDPC)</p>
          <p>Plot 139, Apo-Dutse Road, Abuja, FCT, Nigeria</p>
          <p>
            Website: <a href="https://ndpc.gov.ng" target="_blank" rel="noopener noreferrer" className="underline font-semibold">ndpc.gov.ng</a>
          </p>
        </div>
        <p>
          We encourage you to contact us first so that we can resolve any concern directly and promptly.
        </p>
      </>
    ),
  },
  {
    id: 'dpo',
    title: '11. Our Data Protection Officer',
    content: (
      <>
        <p>
          Primekey Homes has appointed a Data Protection Officer (DPO) who is responsible for overseeing our data protection strategy and compliance programme. You may contact the DPO directly at:
        </p>
        <div className="space-y-3 bg-[#f3f0ff]/60 border border-purple-100 rounded-xl p-5">
          <p><strong>Data Protection Officer</strong>, {COMPANY.name}</p>
          <p>{COMPANY.headOffice.full}</p>
          <p className="flex items-center gap-2">
            <Mail className="w-4 h-4 shrink-0" />
            Email: <a href="mailto:hello@primekeyhomesandpropertiesltd.com" className="underline font-semibold">hello@primekeyhomesandpropertiesltd.com</a>
          </p>
        </div>
      </>
    ),
  },
  {
    id: 'review',
    title: '12. Review of This Notice',
    content: (
      <>
        <p>
          We review this notice periodically and may update it to reflect changes in our practices or in Nigerian data protection law. The "Last updated" date at the top of this page indicates the most recent review. Please check this page from time to time for updates.
        </p>
        <p>
          Related documents: <Link href="/privacy" className="underline font-semibold">Privacy Policy</Link> · <Link href="/terms" className="underline font-semibold">Terms &amp; Conditions</Link> · <Link href="/cookies" className="underline font-semibold">Cookie Policy</Link>.
        </p>
      </>
    ),
  },
];

export default function NDPRCompliancePage() {
  return (
    <LegalPage
      icon={<Scale className="w-8 h-8" />}
      badge="Legal & Trust"
      title="NDPR Compliance Notice"
      subtitle="How Primekey Homes meets its obligations under the Nigeria Data Protection Act 2023 and the NDPR 2019 — and how you can hold us accountable."
      effectiveDate="2 August 2026"
      intro={
        <>
          <p className="text-sm mb-4">
            This notice sets out Primekey Homes&rsquo; data protection and compliance posture in relation to Nigerian data protection law. It complements our <Link href="/privacy" className="underline font-semibold">Privacy Policy</Link> and focuses specifically on our NDPR/NDPA compliance measures, consent practices, retention controls, and the rights of data subjects.
          </p>
          <p className="text-sm">
            Our compliance is not a static document — it is enforced in our systems: consent is logged immutably at the point of collection, and inactive data is automatically anonymized on a schedule.
          </p>
        </>
      }
      sections={sections}
    />
  );
}
