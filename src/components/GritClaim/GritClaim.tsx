import React, { useEffect, useRef, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui'; // Import useWalletModal from react-ui
import styles from './GritClaim.module.css';

const GritClaim = () => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { publicKey, connect, connecting, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  useEffect(() => {
    // Автоматическая анимация появления при монтировании
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.classList.add(styles.animateIn);
      }
    }, 100);
  }, []);

  const handleClaim = async () => {
    if (isClaiming) return;

    if (!publicKey) {
      // Открываем модальное окно выбора кошелька
      setVisible(true);
    } else {
      // Логика для "Claim" после подключения кошелька
      setIsClaiming(true);

      // Эффект "взрыва" частиц при клике
      if (buttonRef.current) {
        buttonRef.current.classList.add(styles.particleBurst);
        setTimeout(() => {
          buttonRef.current?.classList.remove(styles.particleBurst);
          setIsClaiming(false);
        }, 1000);
      }

      console.log('Wallet connected:', publicKey.toBase58());
    }
  };

  // Обработка подключения после выбора кошелька
  useEffect(() => {
    if (!publicKey && !connecting) {
      // Попытка автоматического подключения, если кошелек уже был выбран
      const tryConnect = async () => {
        try {
          await connect();
        } catch (error) {
          console.error('Auto-connect failed:', error);
        }
      };
      tryConnect();
    }
  }, [publicKey, connect, connecting]);

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
            disabled={isClaiming || connecting}
          >
            <span>
              {connecting
                ? 'Connecting...'
                : isClaiming
                ? 'Claiming...'
                : publicKey
                ? 'Claim Now'
                : 'Connect Wallet'}
            </span>
            <div className={styles.buttonShine}></div>
          </button>

          {publicKey && (
            <div className={styles.walletInfo}>
              <p>Connected: {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}</p>
              <button onClick={disconnect} className={styles.disconnectButton}>
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GritClaim;