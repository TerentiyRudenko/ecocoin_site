import React, { useEffect, useRef, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { createClient } from '@supabase/supabase-js';
import { Connection, Transaction, PublicKey } from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, 
  createTransferInstruction 
} from '@solana/spl-token';
import styles from './GritClaim.module.css';

// Buffer polyfill check
if (typeof Buffer === 'undefined') {
  console.error('Buffer is not defined. Ensure the buffer polyfill is applied.');
}

const supabaseUrl = 'https://nffhqgtgwazclqshtjzj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mZmhxZ3Rnd2F6Y2xxc2h0anpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzYxMTgyNCwiZXhwIjoyMDU5MTg3ODI0fQ.Mlfek6R_vpRcDRlI69f7xLtqbhvqxaH-Zg4b6y4lvHc';
const supabase = createClient(supabaseUrl, supabaseKey);

interface UserData {
  solana_wallet: string;
  tg_id: string;
  tg_username: string;
  points?: number;
  issession?: boolean;
  device?: string | null;
  registered_devices?: string[];
  is_localstorage_empty?: boolean;
}

interface StoredData {
  isVerified: boolean;
  username: string | null;
  telegramId: string | null;
  points: number;
}

const GritClaim: React.FC = () => {
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [storedData, setStoredData] = useState<StoredData>({
    isVerified: false,
    username: null,
    telegramId: null,
    points: 0,
  });
  const [balance, setBalance] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [oneTimeCode, setOneTimeCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [lastCodeGenerationTime, setLastCodeGenerationTime] = useState<number | null>(null);
  const [canGenerateNewCode, setCanGenerateNewCode] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { publicKey, connect, connecting, disconnect, signTransaction } = useWallet();
  const { setVisible } = useWalletModal();

  // Service wallet and token info
  const SERVICE_WALLET = new PublicKey("4CFXVLLVSZuLm5HVqEjNv6Hrgo1jHvMZKd2Me3AML8cK");
  const GRIT_TOKEN_MINT = new PublicKey("fEatBaHPoLyJtZJQ9J92QH3PPzze9PqU6hV5uCjGUqF");
  const DECIMALS = 9;

  const getDeviceInfo = (): string => {
    const userAgent = navigator.userAgent;
    let deviceName = 'Unknown Device';
    
    if (/Android/.test(userAgent)) {
      deviceName = 'Android Device';
      const modelMatch = userAgent.match(/Android.*;\s([^;]+)\sBuild/i);
      if (modelMatch) deviceName = modelMatch[1];
    } else if (/iPhone|iPad|iPod/.test(userAgent)) {
      deviceName = 'Apple Device';
      const modelMatch = userAgent.match(/iPhone|iPad|iPod/i);
      if (modelMatch) deviceName = modelMatch[0];
    } else if (/Windows/.test(userAgent)) {
      deviceName = 'Windows PC';
    } else if (/Macintosh/.test(userAgent)) {
      deviceName = 'Mac';
    } else if (/Linux/.test(userAgent)) {
      deviceName = 'Linux PC';
    }
    
    return deviceName;
  };

  const saveToLocalStorage = (data: StoredData): void => {
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
        points: 0,
      };
    } catch (error) {
      return { isVerified: false, username: null, telegramId: null, points: 0 };
    }
  };

  const getTokenBalance = async () => {
    if (!publicKey) return;

    try {
      const connection = new Connection("https://api.devnet.solana.com", "confirmed");
      const userTokenAccount = await getAssociatedTokenAddress(
        GRIT_TOKEN_MINT,
        publicKey
      );

      const balance = await connection.getTokenAccountBalance(userTokenAccount);
      setBalance(Number(balance.value.amount) / 10 ** DECIMALS);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(0);
    }
  };

  const checkWalletInDatabase = async (walletAddress: string): Promise<UserData | null> => {
    try {
      const { data, error } = await supabase
        .from('test')
        .select('*')
        .eq('solana_wallet', walletAddress)
        .single<UserData>();

      if (error || !data) {
        setErrorMessage('Wallet not found');
        return null;
      }

      if (
        typeof data.solana_wallet !== 'string' ||
        typeof data.tg_id !== 'string' ||
        typeof data.tg_username !== 'string'
      ) {
        throw new Error('Invalid data structure from database');
      }

      const userData: UserData = {
        solana_wallet: data.solana_wallet,
        tg_id: data.tg_id,
        tg_username: data.tg_username,
        points: data.points || 0,
        issession: data.issession || false,
        device: data.device || null,
        registered_devices: data.registered_devices || [],
        is_localstorage_empty: 
          typeof data.is_localstorage_empty === 'boolean' 
            ? data.is_localstorage_empty 
            : true
      };

      return userData;

    } catch (err) {
      console.error('Database error:', err);
      setErrorMessage('Error fetching wallet data');
      return null;
    }
  };

  const sendTokensToUser = async (points: number) => {
    if (!publicKey || !signTransaction) {
      throw new Error("Wallet not ready");
    }

    setIsClaiming(true);
    setErrorMessage(null);

    try {
      const connection = new Connection("https://api.devnet.solana.com", "confirmed");
      const amount = BigInt(Math.floor(points * 10 ** DECIMALS));

      // Get token accounts
      const senderTokenAccount = await getAssociatedTokenAddress(
        GRIT_TOKEN_MINT,
        SERVICE_WALLET
      );

      const recipientTokenAccount = await getAssociatedTokenAddress(
        GRIT_TOKEN_MINT,
        publicKey
      );

      // Create transaction
      const transaction = new Transaction();

      // Check if recipient has ATA, create if not
      try {
        await connection.getAccountInfo(recipientTokenAccount);
      } catch {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            recipientTokenAccount,
            publicKey,
            GRIT_TOKEN_MINT
          )
        );
      }

      // Add transfer instruction
      transaction.add(
        createTransferInstruction(
          senderTokenAccount,
          recipientTokenAccount,
          SERVICE_WALLET,
          amount,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      // Sign and send transaction
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signedTx = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      
      // Confirm transaction
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      // Update points in database to 0 after successful transfer
      await supabase
        .from('test')
        .update({ points: 0 })
        .eq('solana_wallet', publicKey.toBase58());

      // Update local state
      setStoredData(prev => ({ ...prev, points: 0 }));
      saveToLocalStorage({ ...storedData, points: 0 });
      await getTokenBalance();

      alert(`Success! ${points} GRIT tokens sent to your wallet. Transaction: ${signature}`);

    } catch (error) {
      console.error("Transfer failed:", error);
      setErrorMessage(error instanceof Error ? error.message : "Transfer failed");
      throw error;
    } finally {
      setIsClaiming(false);
    }
  };

  const handleClaim = async () => {
    if (isClaiming || !publicKey) {
      if (!publicKey) setVisible(true);
      return;
    }

    const walletAddress = publicKey.toBase58();
    
    try {
      // 1. Get fresh points data from DB
      const { data, error } = await supabase
        .from('test')
        .select('points')
        .eq('solana_wallet', walletAddress)
        .single();

      if (error || !data?.points) throw new Error("No points in DB");
      
      const availablePoints = Number(data.points);
      if (availablePoints <= 0) {
        setErrorMessage("You have no points to claim");
        return;
      }

      // 2. Update local state
      setStoredData(prev => ({
        ...prev,
        points: availablePoints
      }));

      // 3. Send tokens to user's wallet
      await sendTokensToUser(availablePoints);

    } catch (err) {
      console.error("Claim error:", err);
      setErrorMessage(err instanceof Error ? err.message : "Claim failed");
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
          points: testData?.points || 0,
        };

        saveToLocalStorage(verifiedData);
        setStoredData(verifiedData);
        setOneTimeCode(null);
        
        await supabase
          .from('test')
          .update({ is_localstorage_empty: false })
          .eq('solana_wallet', walletAddress);

        return verifiedData;
      }

      return { isVerified: false, username: null, telegramId: null, points: 0 };
    } catch (err) {
      console.error('Verification check error:', err);
      return { isVerified: false, username: null, telegramId: null, points: 0 };
    }
  };

  const generateNewCode = async () => {
    if (!publicKey || !canGenerateNewCode) return;

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
            telegram_id: storedData.telegramId,
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
    if (!publicKey) return;

    const deviceInfo = getDeviceInfo();
    
    const registeredDevices = Array.isArray(storedData.registered_devices) 
      ? [...storedData.registered_devices, deviceInfo]
      : [deviceInfo];

    await generateNewCode();
    setShowConfirmModal(false);
    setIsClaiming(true);

    try {
      const { error } = await supabase
        .from('test')
        .update({
          issession: true,
          device: deviceInfo,
          registered_devices: registeredDevices,
          is_localstorage_empty: false
        })
        .eq('solana_wallet', publicKey.toBase58());

      if (error) throw error;

      setStoredData(prev => ({
        ...prev,
        issession: true,
        device: deviceInfo,
        registered_devices: registeredDevices,
        is_localstorage_empty: false
      }));

    } catch (err) {
      setErrorMessage('Error updating device information.');
    } finally {
      setTimeout(() => setIsClaiming(false), 1000);
    }
  };

  const handleCopyCode = () => {
    if (oneTimeCode) {
      navigator.clipboard.writeText(oneTimeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = async (): Promise<void> => {
    if (publicKey) {
      try {
        await supabase
          .from('test')
          .update({
            issession: false,
            device: null,
            is_localstorage_empty: true,
          })
          .eq('solana_wallet', publicKey.toBase58());
          
        localStorage.removeItem('gritUserData');
      } catch (err) {
        console.error('Error clearing session:', err);
      }
    }
    disconnect();
  };

  useEffect(() => {
    if (publicKey) {
      const savedData = getFromLocalStorage();
      if (savedData.isVerified) {
        setStoredData(savedData);
      }
      getTokenBalance();
    } else {
      setStoredData({ isVerified: false, username: null, telegramId: null, points: 0 });
    }
  }, [publicKey]);

  useEffect(() => {
    if (!publicKey && !connecting) {
      connect().catch((err) => console.error('Connection error:', err));
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
              <p>Balance: {balance.toFixed(2)} GRIT</p>
              <button onClick={handleDisconnect} className={styles.disconnectButton}>
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

      {showConfirmModal && (
        <div className={styles.confirmModal}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Account Confirmation</h3>
            <p className={styles.modalText}>Is this your Telegram account?</p>
            <p className={styles.modalInfo}><strong>Username:</strong> {storedData.username}</p>
            <p className={styles.modalInfo}><strong>ID:</strong> {storedData.telegramId}</p>
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