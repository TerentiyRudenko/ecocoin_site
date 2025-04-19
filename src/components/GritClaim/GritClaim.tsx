import React, { useEffect, useRef, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { createClient } from '@supabase/supabase-js';
import { Connection, Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import styles from './GritClaim.module.css';

const supabaseUrl = 'https://nffhqgtgwazclqshtjzj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mZmhxZ3Rnd2F6Y2xxc2h0anpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzYxMTgyNCwiZXhwIjoyMDU5MTg3ODI0fQ.Mlfek6R_vpRcDRlI69f7xLtqbhvqxaH-Zg4b6y4lvHc';
const supabase = createClient(supabaseUrl, supabaseKey);

interface UserData {
  solana_wallet: string;
  tg_id: string;
  tg_username: string;
  points?: number;
}

interface StoredData {
  isVerified: boolean;
  username: string | null;
  telegramId: string | null;
  points: number;
}

const GritClaim = () => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [oneTimeCode, setOneTimeCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [lastCodeGenerationTime, setLastCodeGenerationTime] = useState<number | null>(null);
  const [storedData, setStoredData] = useState<StoredData>({
    isVerified: false,
    username: null,
    telegramId: null,
    points: 0,
  });
  const [canGenerateNewCode, setCanGenerateNewCode] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { publicKey, connect, connecting, disconnect, wallet } = useWallet();
  const { setVisible } = useWalletModal();

  const saveToLocalStorage = (data: StoredData) => {
    try {
      localStorage.setItem('gritUserData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const getFromLocalStorage = (): StoredData => {
    try {
      const data = localStorage.getItem('gritUserData');
      return data ? JSON.parse(data) : { 
        isVerified: false, 
        username: null, 
        telegramId: null, 
        points: 0 
      };
    } catch (error) {
      return { isVerified: false, username: null, telegramId: null, points: 0 };
    }
  };

  const generateOneTimeCode = () => {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  };

  const checkVerificationStatus = async (telegramId: string) => {
    try {
      const { data, error } = await supabase
        .from('users_login_test')
        .select('isverifiedforcurrentcode, username, telegram_id')
        .eq('telegram_id', telegramId)
        .single();

      if (error) throw error;

      if (data?.isverifiedforcurrentcode) {
        const walletAddress = publicKey?.toBase58();
        const { data: testData } = await supabase
          .from('test')
          .select('points')
          .eq('solana_wallet', walletAddress)
          .single();

        const verifiedData = {
          isVerified: true,
          username: data.username,
          telegramId: data.telegram_id,
          points: testData?.points || 0
        };

        saveToLocalStorage(verifiedData);
        setStoredData(verifiedData);
        setOneTimeCode(null); // Скрываем код после подтверждения
        return verifiedData;
      }

      return { isVerified: false, username: null, telegramId: null, points: 0 };
    } catch (err) {
      console.error('Verification check error:', err);
      return { isVerified: false, username: null, telegramId: null, points: 0 };
    }
  };

  const checkWalletInDatabase = async (walletAddress: string) => {
    try {
      const { data, error } = await supabase
        .from('test')
        .select('solana_wallet, tg_id, tg_username, points')
        .eq('solana_wallet', walletAddress)
        .single();

      if (error || !data) {
        setErrorMessage('Wallet not found.');
        return null;
      }

      return {
        solana_wallet: data.solana_wallet,
        tg_id: data.tg_id,
        tg_username: data.tg_username,
        points: data.points || 0
      };
    } catch (err) {
      setErrorMessage('Error checking wallet.');
      return null;
    }
  };

  const createTransaction = async () => {
    if (!publicKey || !wallet) return;

    setIsClaiming(true);
    try {
      const connection = new Connection('https://api.devnet.solana.com');
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey('RECIPIENT_ADDRESS'),
          lamports: storedData.points * 1000000000,
        })
      );

      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      alert('Transaction successful!');
    } catch (error) {
      console.error('Transaction error:', error);
      alert('Transaction failed.');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleClaim = async () => {
    if (isClaiming) return;

    if (!publicKey) {
      setVisible(true);
    } else if (storedData.isVerified) {
      await createTransaction();
    } else {
      const walletAddress = publicKey.toBase58();
      const user = await checkWalletInDatabase(walletAddress);

      if (user) {
        setUserData(user);
        setShowConfirmModal(true);
      } else {
        setErrorMessage('Wallet not linked to Telegram.');
      }
    }
  };

  const generateNewCode = async () => {
    if (!publicKey || !userData || !canGenerateNewCode) return;

    const currentTime = Date.now();
    if (lastCodeGenerationTime && currentTime - lastCodeGenerationTime < 10000) {
      const remainingTime = Math.ceil((10000 - (currentTime - lastCodeGenerationTime)) / 1000);
      setErrorMessage(`Please wait ${remainingTime} seconds before generating a new code.`);
      return;
    }

    setCanGenerateNewCode(false);
    const code = generateOneTimeCode();
    setOneTimeCode(code);
    setCopied(false);
    setLastCodeGenerationTime(currentTime);

    try {
      const { error } = await supabase
        .from('users_login_test')
        .upsert(
          {
            username: userData.tg_username,
            telegram_id: userData.tg_id,
            one_time_code: code,
            isverifiedforcurrentcode: false,
          },
          { onConflict: ['telegram_id'] }
        );

      if (error) throw error;
    } catch (err) {
      setErrorMessage('Error generating new code.');
    }

    setTimeout(() => setCanGenerateNewCode(true), 10000);
  };

  const confirmTelegramAccount = async () => {
    if (!publicKey || !userData) return;

    await generateNewCode();
    setShowConfirmModal(false);
    setIsClaiming(true);
    setTimeout(() => setIsClaiming(false), 1000);
  };

  const handleCopyCode = () => {
    if (oneTimeCode) {
      navigator.clipboard.writeText(oneTimeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (publicKey) {
      const savedData = getFromLocalStorage();
      if (savedData.isVerified) {
        setStoredData(savedData);
      }
    } else {
      // Сбрасываем все данные при отключении кошелька
      setStoredData({ isVerified: false, username: null, telegramId: null, points: 0 });
      setUserData(null);
      setOneTimeCode(null);
      setShowConfirmModal(false);
    }
  }, [publicKey]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (userData?.tg_id && !storedData.isVerified) {
      interval = setInterval(() => {
        checkVerificationStatus(userData.tg_id);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [userData, storedData.isVerified]);

  useEffect(() => {
    if (!publicKey && !connecting) {
      connect().catch(err => console.error('Connection error:', err));
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
            <span className={styles.token}>$GRIT</span>
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
                ? storedData.isVerified
                  ? 'Claim $GRIT'
                  : 'Claim Now'
                : 'Connect Wallet'}
            </span>
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

          {publicKey && storedData.isVerified && (
            <>
              <div className={styles.verifiedMessage}>
                <i className="fas fa-check-circle"></i> Verified
              </div>
              <div className={styles.pointsDisplay}>
                <p>Your $GRIT points: {storedData.points}</p>
              </div>
            </>
          )}

          {oneTimeCode && !storedData.isVerified && (
            <div className={styles.codeDisplay}>
              <div className={styles.codeGlow}></div>
              <p className={styles.codeText}>Your one-time code:</p>
              <div className={styles.codeValue}>
                {oneTimeCode.split('').map((char, index) => (
                  <span key={index} style={{ animationDelay: `${index * 0.1}s` }}>{char}</span>
                ))}
              </div>
              <p className={styles.codeInstruction}>
                Send this code to{' '}
                <a href="https://t.me/YourBot" className={styles.telegramLink} target="_blank" rel="noopener noreferrer">
                  @YourBot
                </a>{' '}
                on Telegram.
              </p>
              <div className={styles.codeButtons}>
                <button 
                  onClick={handleCopyCode} 
                  className={`${styles.codeButton} ${copied ? styles.copied : ''}`}
                >
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
                <button 
                  onClick={generateNewCode} 
                  className={styles.codeButton}
                  disabled={!canGenerateNewCode}
                >
                  {canGenerateNewCode ? 'Get New Code' : 'Wait 10s'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showConfirmModal && userData && (
        <div className={styles.confirmModal}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Account Confirmation</h3>
            <p className={styles.modalText}>Is this your Telegram account?</p>
            <p className={styles.modalInfo}><strong>Username:</strong> {userData.tg_username}</p>
            <p className={styles.modalInfo}><strong>ID:</strong> {userData.tg_id}</p>
            <div className={styles.modalButtons}>
              <button onClick={confirmTelegramAccount} className={styles.confirmButton}>
                Yes, this is my account
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