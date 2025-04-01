import React, { useState } from 'react';
import styles from './Hero.module.css';
import AnimatedSection from '../AnimatedSection/AnimatedSection';
import TypingEffect from '../TypingEffect/TypingEffect';

interface HeroProps {
  onOpenRegistration: () => void;
}

const scrollJourney = async () => {
  const sections = [
    'nft-section',
    'projects',
    'tokenomics-section'
  ];

  for (const sectionId of sections) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      section.classList.add(styles.highlight);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      section.classList.remove(styles.highlight);
    }
  }

  await new Promise(resolve => setTimeout(resolve, 500));
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

  const heroSection = document.getElementById('hero-section');
  if (heroSection) {
    heroSection.classList.add(styles.highlight);
    setTimeout(() => heroSection.classList.remove(styles.highlight), 2000);
  }
};

const Hero: React.FC<HeroProps> = ({ onOpenRegistration }) => {
  return (
    <section id="hero" className={styles.hero}>
      <AnimatedSection id="hero-section" animationType="hero" className={styles.hero}>
        <h1 className={styles.greetingMessage}>Welcome to <span className={styles.ecocoinText}>EcoCoin</span></h1>
        <p className={styles.messageUnderGreeting}>Enter the world of blockchain farming with NFT crops.</p>
        
        <div className={styles.buttonContainer}>
          <button 
            className={styles.buttonWithIcon}
            onClick={scrollJourney}
          >
            <svg className={styles.svgIcon} viewBox="0 0 512 512">
              <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm50.7-186.9L162.4 380.6c-19.4 7.5-38.5-11.6-31-31l55.5-144.3c3.3-8.5 9.9-15.1 18.4-18.4l144.3-55.5c19.4-7.5 38.5 11.6 31 31L325.1 306.7c-3.2 8.5-9.9 15.1-18.4 18.4zM288 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"></path>
            </svg>
            Explore
          </button>

          <button 
          className={styles.loginWithTelegram}>
            <div className={styles.svgTelegramIcon}>
    <div className="svg-wrapper">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <path fill="none" d="M0 0h24v24H0z"></path>
        <path d="M12 2.04c-5.52 0-10 4.48-10 10s4.48 10 10 10c5.52 0 10-4.48 10-10s-4.48-10-10-10zm4.88 7.38l-1.36 6.44c-.1.47-.37.58-.75.36l-2.1-1.56-1.01.97c-.11.11-.2.2-.41.2l.15-2.18 3.96-3.56c.17-.15-.04-.24-.27-.09l-4.91 3.11-2.12-.66c-.46-.14-.47-.45.1-.67l8.26-3.19c.38-.14.72.09.6.66z"/>
      </svg>
    </div>
  </div>
  <span>Login with Telegram</span>
          </button>

          <button 
            onClick={onOpenRegistration}
            className={styles.joinNowButton}
          >
            Join Now
          </button>
        </div>
      </AnimatedSection>
    </section>
  );
};

export default Hero;