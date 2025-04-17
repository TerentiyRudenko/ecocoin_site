import React, { useEffect, useRef, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { createClient } from '@supabase/supabase-js'; // Импортируем Supabase
import styles from './GritClaim.module.css';

// Инициализация Supabase клиента
const supabaseUrl = 'https://nffhqgtgwazclqshtjzj.supabase.co'; // Замените на ваш Supabase URL
const supabaseKey = 'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mZmhxZ3Rnd2F6Y2xxc2h0anpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzYxMTgyNCwiZXhwIjoyMDU5MTg3ODI0fQ.Mlfek6R_vpRcDRlI69f7xLtqbhvqxaH-Zg4b6y4lvHc'; // Замените на ваш анонимный ключ
const supabase = createClient(supabaseUrl, supabaseKey);

interface UserData {
  solana_wallet: string;
  tg_id: string;
  tg_username: string;
}

const GritClaim = () => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

  // Проверка кошелька в базе данных
  const checkWalletInDatabase = async (walletAddress: string) => {
    try {
      const { data, error } = await supabase
        .from('users_login_test') // Замените на имя вашей таблицы
        .select('solana_wallet, tg_id, tg_username')
        .eq('solana_wallet', walletAddress)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        setErrorMessage('Ошибка при проверке кошелька в базе данных.');
        return null;
      }

      return data;
    } catch (err) {
      console.error('Unexpected error:', err);
      setErrorMessage('Произошла непредвиденная ошибка.');
      return null;
    }
  };

  const handleClaim = async () => {
    if (isClaiming) return;

    if (!publicKey) {
      // Открываем модальное окно выбора кошелька
      setVisible(true);
    } else {
      // Проверяем кошелек в базе данных
      const walletAddress = publicKey.toBase58();
      const user = await checkWalletInDatabase(walletAddress);

      if (user) {
        // Кошелек найден, показываем данные пользователя и запрашиваем подтверждение
        setUserData(user);
        setShowConfirmModal(true);
      } else {
        // Кошелек не найден, предлагаем связать аккаунт
        setErrorMessage('Кошелек не связан с Telegram. Пожалуйста, свяжите аккаунт.');
      }
    }
  };

  // Подтверждение Telegram-аккаунта
  const confirmTelegramAccount = async () => {
    if (!publicKey || !userData) return;

    console.log('Confirmed Telegram account:', userData.tg_username);
    setShowConfirmModal(false);
    setIsClaiming(true);

    // Эффект "взрыва" частиц
    if (buttonRef.current) {
      buttonRef.current.classList.add(styles.particleBurst);
      setTimeout(() => {
        buttonRef.current?.classList.remove(styles.particleBurst);
        setIsClaiming(false);
      }, 1000);
    }
  };

  // Связывание кошелька с Telegram
  const linkWalletToTelegram = async () => {
    console.log('Initiating wallet linking process...');
    setErrorMessage('Функция связывания аккаунта в разработке.');
  };

  // Автоматическое подключение кошелька
  useEffect(() => {
    if (!publicKey && !connecting) {
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

          {errorMessage && (
            <div className={styles.errorMessage}>
              <p>{errorMessage}</p>
              {errorMessage.includes('не связан') && (
                <button onClick={linkWalletToTelegram} className={styles.linkButton}>
                  Связать кошелек
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно подтверждения Telegram */}
      {showConfirmModal && userData && (
        <div className={styles.confirmModal}>
          <div className={styles.modalContent}>
            <h3>Подтверждение аккаунта</h3>
            <p>Это ваш Telegram-аккаунт?</p>
            <p>
              <strong>Username:</strong> {userData.tg_username}
            </p>
            <p>
              <strong>ID:</strong> {userData.tg_id}
            </p>
            <div className={styles.modalButtons}>
              <button onClick={confirmTelegramAccount} className={styles.confirmButton}>
                Да, это мой аккаунт
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className={styles.cancelButton}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GritClaim;