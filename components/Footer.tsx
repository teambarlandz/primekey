import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Image
              src="/assets/logo.svg"
              alt="PropNest"
              width={140}
              height={40}
              className="footer__logo"
            />
            <p className="footer__tagline">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit — your trusted partner in property.
            </p>
            <ul className="footer__social" role="list">
              <li><Link href="#" aria-label="Facebook">FB</Link></li>
              <li><Link href="#" aria-label="Twitter">TW</Link></li>
              <li><Link href="#" aria-label="Instagram">IG</Link></li>
              <li><Link href="#" aria-label="LinkedIn">IN</Link></li>
              <li><Link href="#" aria-label="YouTube">YT</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4>Company</h4>
            <ul role="list">
              <li><Link href="/about">About us</Link></li>
              <li><Link href="/careers">Careers</Link></li>
              <li><Link href="/press">Press</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4>Services</h4>
            <ul role="list">
              <li><Link href="/buy">Buy a property</Link></li>
              <li><Link href="/rent">Rent a property</Link></li>
              <li><Link href="/sell">Sell your property</Link></li>
              <li><Link href="/builders">For builders</Link></li>
              <li><Link href="/loans">Home loans</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4>Resources</h4>
            <ul role="list">
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/guides">Buyer's guide</Link></li>
              <li><Link href="/calculator">EMI calculator</Link></li>
              <li><Link href="/help">Help centre</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4>Stay updated</h4>
            <p>Get new listings & market insights weekly.</p>
            <form className="footer__newsletter" action="/subscribe" method="post">
              <label className="sr-only" htmlFor="footer-email">Email address</label>
              <input id="footer-email" type="email" name="email" placeholder="you@example.com" required />
              <button type="submit" className="btn btn--primary btn--sm">Subscribe</button>
            </form>
          </div>
        </div>

        <div className="footer__legal">
          <p className="footer__copyright">© 2026 PropNest Pvt. Ltd. All rights reserved.</p>
          <ul className="footer__legal-links" role="list">
            <li><Link href="/terms">Terms & Conditions</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/cookies">Cookie Policy</Link></li>
            <li><Link href="/refund">Refund Policy</Link></li>
            <li><Link href="/grievance">Grievance</Link></li>
            <li><Link href="/sitemap">Sitemap</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}