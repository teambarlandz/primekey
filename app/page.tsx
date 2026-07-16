import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import SocialProof from '@/components/SocialProof';
import Benefits from '@/components/Benefits';
import FAQ from '@/components/FAQ';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';
import FloatingContact from '@/components/FloatingContact';
import './globals.css';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <Benefits />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <FloatingContact />
    </>
  );
}