import React, { useEffect } from 'react';
import NavbarSection from './components/NavbarSection/NavbarSection';
import Hero from './components/Hero/Hero';
import NFTSection from './components/NFTSection/NFTSection';
import OurProjectsSection from './components/OurProjectsSection/OurProjectsSection';
import TokenomicsRoadmapSection from './components/TokenomicsRoadmapSection/TokenomicsRoadmapSection';
import Footer from './components/Footer/Footer';

const App: React.FC = () => {
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        document.body.classList.remove('menu-open');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <NavbarSection />
      <Hero />
      <NFTSection />
      <OurProjectsSection  />
      <TokenomicsRoadmapSection  />
      <Footer />
    </>
  );
};

export default App;