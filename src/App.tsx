import { useEffect } from 'react';
import { profile } from './config/profile';
import SmoothScroll from './components/SmoothScroll';
import PageLoader from './components/PageLoader';
import CustomCursor from './components/CustomCursor';
import Nav from './components/Nav';
import Hero from './components/hero/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Ecosystem from './components/Ecosystem';
import Education from './components/Education';
import Goals from './components/Goals';
import Contact from './components/Contact';
import Footer from './components/Footer';
import MobileTouchPress from './mobile3d/MobileTouchPress';

/** Keeps document-level SEO fields in sync with the profile config. */
function useDocumentMeta() {
  useEffect(() => {
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = profile.siteUrl;
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', profile.siteUrl);
    // Structured data helps recruiters' search tools understand the page.
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.jsonld = 'person';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: profile.name,
      jobTitle: 'Cloud Infrastructure Engineer',
      email: `mailto:${profile.email}`,
      address: { '@type': 'PostalAddress', addressRegion: 'Kerala', addressCountry: 'IN' },
      url: profile.siteUrl,
      sameAs: [profile.linkedin, profile.github].filter(Boolean),
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, []);
}

export default function App() {
  useDocumentMeta();

  return (
    <SmoothScroll>
      <PageLoader />
      <CustomCursor />
      <MobileTouchPress />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-lg focus:bg-sky-500 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main" className="relative">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Ecosystem />
        <Education />
        <Goals />
        <Contact />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
