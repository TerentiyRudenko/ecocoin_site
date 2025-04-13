import React, { useEffect, useRef, useState } from 'react';
import styles from './GritClaim.module.css';

const GritClaim = () => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Автоматическая анимация появления при монтировании
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.classList.add(styles.animateIn);
      }
    }, 100);
  }, []);

  const handleClaim = () => {
    if (isClaiming) return;
    
    setIsClaiming(true);
    
    // Эффект "взрыва" частиц при клике (чистый CSS)
    if (buttonRef.current) {
      buttonRef.current.classList.add(styles.particleBurst);
      setTimeout(() => {
        buttonRef.current?.classList.remove(styles.particleBurst);
        setIsClaiming(false);
      }, 1000);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={styles.container}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.card}>
        <div className={styles.glow}></div>
        
        <div className={styles.content}>
          <h2 className={styles.title}>
          <span className={styles.token}>
  <span className={styles.char1}>$</span>
  <span className={styles.char2}>G</span>
  <span className={styles.char3}>R</span>
  <span className={styles.char4}>I</span>
  <span className={styles.char5}>T</span>
</span>
            <span className={styles.message}>claim is available</span>
          </h2>
          
          <button
            ref={buttonRef}
            className={`${styles.claimButton} ${isHovered ? styles.hoverEffect : ''}`}
            onClick={handleClaim}
            disabled={isClaiming}
          >
            <span>{isClaiming ? 'Claiming...' : 'Claim Now'}</span>
            <div className={styles.buttonShine}></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GritClaim;