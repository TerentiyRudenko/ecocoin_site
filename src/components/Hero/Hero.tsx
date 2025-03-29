import React from 'react';
import styles from './Hero.module.css';
import AnimatedSection from '../AnimatedSection/AnimatedSection';

const scrollJourney = async () => {
  const sections = [
    'nft-section',
    'projects-section',
    'tokenomics-section'
  ];

  // Пройти все секции
  for (const sectionId of sections) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      section.classList.add(styles.highlight);
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Пауза 2 сек
      
      section.classList.remove(styles.highlight);
    }
  }

  // Возврат в начало
  await new Promise(resolve => setTimeout(resolve, 500)); // Небольшая задержка
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

  // Подсветка героя
  const heroSection = document.getElementById('hero-section');
  if (heroSection) {
    heroSection.classList.add(styles.highlight);
    setTimeout(() => heroSection.classList.remove(styles.highlight), 2000);
  }
};

const Hero = () => {
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

        <button className={styles.loginWithTelegram}>
          Login with Telegram
        </button>
      </div>
      </AnimatedSection>
    </section>
  );
};

export default Hero;