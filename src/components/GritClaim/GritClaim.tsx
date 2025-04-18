import React, { useEffect, useRef, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { createClient } from '@supabase/supabase-js';
import styles from './GritClaim.module.css';

// Инициализация Supabase клиента
const supabaseUrl = 'https://nffhqgtgwazclqshtjzj.supabase.co'; // Замените на ваш URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mZmhxZ3Rnd2F6Y2xxc2h0anpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzYxMTgyNCwiZXhwIjoyMDU5MTg3ODI0fQ.Mlfek6R_vpRcDRlI69f7xLtqbhvqxaH-Zg4b6y4lvHc'; // Замените на ваш ключ
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
  const [oneTimeCode, setOneTimeCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { publicKey, connect, connecting, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  // Генерация одноразового кода
  const generateOneTimeCode = () => {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  };

  // Проверка кошелька в базе данных
  const checkWalletInDatabase = async (walletAddress: string) => {
    try {
      const { data, error } = await supabase
        .from('test')
        .select('solana_wallet, tg_id, tg_username')
        .eq('solana_wallet', walletAddress)
        .single();

      if (error || !data) {
        setErrorMessage('Кошелек не найден.');
        return null;
      }

      if (!data.tg_username || !data.tg_id) {
        setErrorMessage('Данные Telegram отсутствуют.');
        return null;
      }

      return data;
    } catch (err) {
      console.error('Unexpected error:', err);
      setErrorMessage('Ошибка при запросе.');
      return null;
    }
  };

  const handleClaim = async () => {
    if (isClaiming) return;

    if (!publicKey) {
      setVisible(true);
    } else {
      const walletAddress = publicKey.toBase58();
      const user = await checkWalletInDatabase(walletAddress);

      if (user) {
        setUserData(user);
        setShowConfirmModal(true);
      } else {
        setErrorMessage('Кошелек не связан с Telegram.');
      }
    }
  };

  // Подтверждение Telegram-аккаунта и запись в users_login_test
  const confirmTelegramAccount = async () => {
    if (!publicKey || !userData) return;
  
    const code = generateOneTimeCode();
    setOneTimeCode(code);
    setCopied(false);
  
    console.log('Upserting data:', {
      username: userData.tg_username,
      telegram_id: userData.tg_id,
      one_time_code: code,
    });
  
    try {
      const { data, error } = await supabase
        .from('users_login_test')
        .upsert(
          {
            username: userData.tg_username,
            telegram_id: userData.tg_id,
            one_time_code: code,
          },
          { onConflict: ['telegram_id'] }
        )
        .select(); // Возвращаем данные для проверки
  
      if (error) {
        console.error('Supabase upsert error:', error);
        setErrorMessage(`Ошибка при сохранении данных: ${error.message}`);
      } else {
        console.log('Data upserted successfully:', data);
        setErrorMessage(null);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setErrorMessage('Произошла непредвиденная ошибка.');
    }
  
    setShowConfirmModal(false);
    setIsClaiming(true);
  
    if (buttonRef.current) {
      buttonRef.current.classList.add(styles.particleBurst);
      setTimeout(() => {
        buttonRef.current?.classList.remove(styles.particleBurst);
        setIsClaiming(false);
      }, 1000);
    }
  };

  // Копирование кода
  const handleCopyCode = () => {
    if (oneTimeCode) {
      navigator.clipboard.writeText(oneTimeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
      className={`${styles.container} ${styles.animateIn}`}
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
                ? 'Processing...'
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
            </div>
          )}

          {oneTimeCode && (
            <div className={styles.codeDisplay}>
              <div className={styles.codeGlow}></div>
              <p className={styles.codeText}>Your One-time code:</p>
              <p className={styles.codeValue}>
                {oneTimeCode.split('').map((char, index) => (
                  <span key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                    {char}
                  </span>
                ))}
              </p>
              <p className={styles.codeInstruction}>
                Send this code to our bot for verification{' '}
                <a href="https://t.me/YourBot" target="_blank" rel="noopener noreferrer" className={styles.telegramLink}>
                  @YourBot
                </a>{' '}
                in Telegram.
              </p>
              <div className={styles.codeButtons}>
                <button
                  onClick={handleCopyCode}
                  className={`${styles.codeButton} ${copied ? styles.copied : ''}`}
                >
                  {copied ? 'Copied!' : 'Copy code'}
                </button>
                <button onClick={confirmTelegramAccount} className={styles.codeButton}>
                  New Code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно подтверждения */}
      {showConfirmModal && userData && (
        <div className={styles.confirmModal}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Account verification</h3>
            <p className={styles.modalText}>Is this your Telegram account?</p>
            <p className={styles.modalInfo}>
              <strong>Username:</strong> {userData.tg_username}
            </p>
            <p className={styles.modalInfo}>
              <strong>ID:</strong> {userData.tg_id}
            </p>
            <div className={styles.modalButtons}>
              <button onClick={confirmTelegramAccount} className={styles.confirmButton}>
              Yes, this is my account.
              </button>
              <button onClick={() => setShowConfirmModal(false)} className={styles.cancelButton}>
              Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GritClaim;