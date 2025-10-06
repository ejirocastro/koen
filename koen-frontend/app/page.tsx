import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ScrollingCards from '@/components/ScrollingCards';
import FloatingElements from '@/components/FloatingElements';
import Features from '@/components/Features';
import AnimatedTestimonials from '@/components/AnimatedTestimonials';
import Stats from '@/components/Stats';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <ScrollingCards />
      <FloatingElements />
      <Features />
      <AnimatedTestimonials />
      <Stats />
      <CTA />
      <Footer />
    </main>
  );
}
