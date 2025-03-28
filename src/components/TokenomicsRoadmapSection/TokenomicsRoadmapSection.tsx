import React from 'react';
import styles from './TokenomicsRoadmapSection.module.css';
import defaultBg from './ecocoin_photo_site.jpg'; // Укажите правильный путь


interface TokenomicsRoadmapSectionProps {
  customBackground?: string;
  blurIntensity?: number;
}

const TokenomicsRoadmapSection: React.FC<TokenomicsRoadmapSectionProps> = ({
  customBackground,
  blurIntensity = 10
}) => {
  const backgroundImage = customBackground || defaultBg;

  return (
    <section id="tokenomics-section" className={styles.section}>
      {/* Размытый фон */}
      <div 
        className={styles.backgroundImage} 
        style={{
          backgroundImage: `url(${backgroundImage})`,
          filter: `blur(${blurIntensity}px)`
        }}
      />
      
      {/* Контент поверх фона */}
      <div className={styles.contentContainer}>
        <h2 className={styles.title}>Tokenomics & Roadmap</h2>
        <div className={styles.comingSoon}>
          <span className={styles.comingSoonText}>Coming Soon</span>
          <p className={styles.followText}>
            Follow our social media to don't miss important updates
          </p>
          <div className={styles.socialLinks}>
            <SocialLink platform="twitter" />
            <SocialLink platform="discord" />
            <SocialLink platform="telegram" />
          </div>
        </div>
      </div>
    </section>
  );
};

// Типы для социальных ссылок
type SocialPlatform = 'twitter' | 'discord' | 'telegram';

interface SocialLinkProps {
  platform: SocialPlatform;
}

const SocialLink: React.FC<SocialLinkProps> = ({ platform }) => {
  const platformData = {
    twitter: { url: 'https://twitter.com', label: 'Twitter' },
    discord: { url: 'https://discord.com', label: 'Discord' },
    telegram: { url: 'https://t.me', label: 'Telegram' }
  };

  return (
    <a
      href={platformData[platform].url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.socialLink}
    >
      {platformData[platform].label}
    </a>
  );
};

export default TokenomicsRoadmapSection;