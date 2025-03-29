import React from 'react';
import styles from './NFTSection.module.css';;
import AnimatedSection from '../AnimatedSection/AnimatedSection';

const NFTSection = () => {
  return (
      <section id="nft-section" className={styles.nft}>
        <AnimatedSection id="nft-section" animationType="nft" className={styles.section}>
      <h2>How does NFT Harvest work?</h2>
      <div className={styles.cards}>
        {['Seed', 'Sprout', 'Mature Plant'].map((stage, idx) => (
          <div key={idx} className={styles.card}>
            <span className={styles.number}>{idx + 1}</span>
            <h3>{stage}</h3>
            <p>Each stage grows your NFT crop.</p>
          </div>
        ))}
      </div>
      </AnimatedSection>
    </section>
  );
};

export default NFTSection;