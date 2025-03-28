import React, { useState, useEffect } from 'react';
import styles from './NavbarSection.module.css';


const NavbarSection: React.FC = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const sections = [
    { id: 'hero', label: 'Home' },
    { id: 'nft-section', label: 'NFT Farming' },
    { id: 'projects-section', label: 'Our Projects' },
    { id: 'tokenomics-section', label: 'Tokenomics' }
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (isMenuOpen) return;
      
      const scrollPosition = window.scrollY + 100;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMenuOpen]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop,
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
      if (isMobile) {
        setIsMenuOpen(false);
      }
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.logo}>EcoCoin</div>
        
        {/* Кнопка бургера для мобильных */}
        <button 
          className={styles.burgerButton}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <div className={`${styles.burgerLine} ${isMenuOpen ? styles.open1 : ''}`} />
          <div className={`${styles.burgerLine} ${isMenuOpen ? styles.open2 : ''}`} />
          <div className={`${styles.burgerLine} ${isMenuOpen ? styles.open3 : ''}`} />
        </button>

        {/* Меню */}
        <ul className={`${styles.navLinks} ${isMenuOpen ? styles.menuOpen : ''}`}>
          {sections.map((section) => (
            <li key={section.id}>
              <button
                className={`${styles.navLink} ${activeSection === section.id ? styles.active : ''}`}
                onClick={() => scrollToSection(section.id)}
              >
                {section.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default NavbarSection;