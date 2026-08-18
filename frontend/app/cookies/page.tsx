'use client';

import React from 'react';
import Link from 'next/link';
import { Cookie, Info, Settings2, BarChart3, Megaphone, SlidersHorizontal, HelpCircle, Mail } from 'lucide-react';
import LegalPage, { LegalSection } from '@/components/legal/LegalPage';
import { COMPANY } from '@/lib/companyInfo';

const sections: LegalSection[] = [
  {
    id: 'what-are-cookies',
    title: '1. What Are Cookies?',
    content: (
      <>
        <p>
          Cookies are small text files placed on your device (computer, tablet, or phone) when you visit a website. They allow the website to recognise your device, remember your preferences, and understand how the website is used.
        </p>
        <p>
          We use cookies and similar technologies on the Primekey Homes platform ("the Platform") to keep it secure, to make it work properly, and to improve your experience. This policy explains what cookies we use, why we use them, and how you can control them.
        </p>
      </>
    ),
  },
  {
    id: 'how-we-use',
    title: '2. How We Use Cookies',
    content: (
      <>
        <p>We use cookies and similar technologies for the following purposes:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Essential operation:</strong> To keep you signed in, protect against cross-site request forgery (CSRF), and keep the Platform secure;</li>
          <li><strong>Authentication state:</strong> To remember that you have verified your phone number and signed in;</li>
          <li><strong>Performance:</strong> To understand how visitors use the Platform so we can improve it; and</li>
          <li><strong>Preferences:</strong> To remember choices you make, such as search filters and preferred locations.</li>
        </ul>
        <p>
          We do not use cookies to build advertising profiles of you without your consent, and we do not sell data derived from cookies.
        </p>
      </>
    ),
  },
  {
    id: 'cookies-we-set',
    title: '3. The Cookies We Set',
    content: (
      <>
        <div className="space-y-4">
          <div>
            <p className="font-semibold" style={{ color: '#04164a' }}>a) Strictly Necessary Cookies</p>
            <p>
              These cookies are required for the Platform to function and cannot be switched off. They include security tokens used by our backend to protect form submissions and sessions. These cookies do not store any directly identifying personal information beyond what is necessary for security.
            </p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#04164a' }}>b) Functional Cookies</p>
            <p>
              These cookies remember your preferences — such as property search filters and alert settings — so that you do not have to re-enter them each time you visit.
            </p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#04164a' }}>c) Analytics & Performance Cookies</p>
            <p>
              These cookies help us measure and understand how visitors interact with the Platform, which pages are most popular, and where visitors may experience issues. They are placed only where permitted by law and are configured to avoid identifying individual users.
            </p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#04164a' }}>d) Marketing Cookies</p>
            <p>
              We do not currently set marketing or advertising cookies. If we introduce them in the future — for example, to support targeted advertising — we will seek your prior consent before placing them.
            </p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'other-technologies',
    title: '4. Other Storage We Use',
    content: (
      <>
        <p>
          In addition to cookies, our sign-in system stores authentication tokens locally in your browser (local storage) after you verify your phone number with a one-time password (OTP). These tokens are used to keep you signed in across pages and are cleared when you sign out. Because these tokens are stored on your device, you should sign out when using shared or public devices.
        </p>
      </>
    ),
  },
  {
    id: 'managing-cookies',
    title: '5. Managing & Disabling Cookies',
    content: (
      <>
        <p>You can control and manage cookies in several ways:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Browser settings:</strong> Most browsers let you view, block, or delete cookies. You can usually find these controls in your browser&rsquo;s settings or privacy menu (for example, Chrome, Firefox, Safari, or Edge);
          </li>
          <li>
            <strong>Consent controls:</strong> Where we use non-essential cookies, we provide consent options before they are placed; and
          </li>
          <li>
            <strong>Local storage:</strong> You can clear your browser&rsquo;s local storage and site data at any time, which will sign you out of the Platform.
          </li>
        </ul>
        <p>
          Please note that blocking or deleting strictly necessary cookies may prevent parts of the Platform from working correctly, including signing in and submitting forms.
        </p>
      </>
    ),
  },
  {
    id: 'third-party',
    title: '6. Third-Party Technologies',
    content: (
      <>
        <p>
          We may engage reputable third-party service providers to help us operate and improve the Platform — for example, hosting, monitoring, and messaging services. Where such providers use cookies or similar technologies on our behalf, they do so under contract and only for the purposes we specify. For details, please see the relevant provider&rsquo;s own cookie and privacy policies.
        </p>
      </>
    ),
  },
  {
    id: 'updates',
    title: '7. Updates to This Policy',
    content: (
      <>
        <p>
          We may update this Cookie Policy from time to time to reflect changes in the cookies we use or in relevant law. The "Last updated" date at the top of this page indicates the most recent revision. Where material changes affect your consent choices, we will ask you to re-confirm your preferences.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    title: '8. Contact Us',
    content: (
      <>
        <p>
          If you have questions about our use of cookies or how to control them, please contact us:
        </p>
        <div className="space-y-3 bg-[#f3f0ff]/60 border border-purple-100 rounded-xl p-5">
          <p><strong>{COMPANY.name}</strong></p>
          <p>{COMPANY.headOffice.full}</p>
          <p className="flex items-center gap-2">
            <Mail className="w-4 h-4 shrink-0" />
            Email: <a href="mailto:hello@primekeyhomesandpropertiesltd.com" className="underline font-semibold">hello@primekeyhomesandpropertiesltd.com</a>
          </p>
        </div>
        <p>
          For more information about how we protect your personal data, please see our <Link href="/privacy" className="underline font-semibold">Privacy Policy</Link> and <Link href="/ndpr" className="underline font-semibold">NDPR Compliance Notice</Link>.
        </p>
      </>
    ),
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalPage
      icon={<Cookie className="w-8 h-8" />}
      badge="Legal & Trust"
      title="Cookie Policy"
      subtitle="What cookies and similar technologies we use on the Primekey Homes platform, why we use them, and how you can control them."
      effectiveDate="2 August 2026"
      intro={
        <p className="text-sm">
          This policy explains how Primekey Homes uses cookies and similar technologies to keep the Platform secure, functional, and easy to use. It describes each category of cookie we use, whether it is essential, and the choices you have.
        </p>
      }
      sections={sections}
    />
  );
}
