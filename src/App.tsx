import React, { useEffect, useState } from 'react';
import RegistrationForm from './components/RegistrationForm/RegistrationForm';
import NavbarSection from './components/NavbarSection/NavbarSection';
import Hero from './components/Hero/Hero';
import NFTSection from './components/NFTSection/NFTSection';
import OurProjectsSection from './components/OurProjectsSection/OurProjectsSection';
import TokenomicsRoadmapSection from './components/TokenomicsRoadmapSection/TokenomicsRoadmapSection';
import Footer from './components/Footer/Footer';

const App: React.FC = () => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [authData, setAuthData] = useState<{ id: string; username: string } | null>(null);

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
      <Hero onOpenRegistration={() => setIsRegistrationOpen(true)} />
      <NFTSection />
      <OurProjectsSection />
      <TokenomicsRoadmapSection />
      <Footer />

      <RegistrationForm
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        onAuthSuccess={(userData) => {
          setAuthData(userData);
          console.log('Authentication successful:', userData); // Логируем успешную авторизацию
        }}
      />
    </>
  );
};

export default App;