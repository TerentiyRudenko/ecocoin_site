import ReactDOM from 'react-dom';
import React, { useEffect, useState } from 'react';
import './setupBuffer';
import RegistrationForm from './components/RegistrationForm/RegistrationForm';
import NavbarSection from './components/NavbarSection/NavbarSection';
import GritClaim from './components/GritClaim/GritClaim';
import Hero from './components/Hero/Hero';
import NFTSection from './components/NFTSection/NFTSection';
import OurProjectsSection from './components/OurProjectsSection/OurProjectsSection';
import TokenomicsRoadmapSection from './components/TokenomicsRoadmapSection/TokenomicsRoadmapSection';
import Footer from './components/Footer/Footer';
import './App.css';

console.log('Buffer is defined:', typeof Buffer !== 'undefined');

import { WalletContext } from './components/WalletContext/WalletContext';


import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

interface AuthData {
  tg_id: string;
  tg_username: string;
}

const App: React.FC = () => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const generateSessionId = () => {
    return crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9);
  };

  const checkAuthStatus = async (token: string) => {
    try {
      const response = await fetch(`https://localhost:4000/auth-status?token=${token}`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();
      if (result.status === 'authenticated') {
        setAuthData({
          tg_id: result.tg_id,
          tg_username: result.tg_username
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Auth status check error:', err);
      return false;
    }
  };

  const handleTelegramAuth = async () => {
    const sessionId = generateSessionId();
    try {
      const response = await fetch('https://localhost:4000/init-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: sessionId }),
      });

      const { url, token } = await response.json();
      setAuthToken(token);
      window.open(url, '_blank');

      // Запускаем проверку статуса
      const interval = setInterval(async () => {
        if (await checkAuthStatus(token)) {
          clearInterval(interval);
        }
      }, 2000);

    } catch (error) {
      console.error('Auth initialization error:', error);
      alert('Ошибка подключения к Telegram');
    }
  };

  const handleStartCommand = async () => {
    if (!authData) {
      alert('Пожалуйста, авторизуйтесь перед отправкой запроса.');
      return;
    }

    try {
      const response = await fetch('https://localhost:4000/start-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tg_id: authData.tg_id }),
      });

      const data = await response.json();
      console.log('Server response:', data);
      alert('Запрос успешно отправлен! Проверьте Telegram.');
    } catch (error) {
      console.error('Request error:', error);
      alert('Произошла ошибка при отправке запроса.');
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        document.body.classList.remove('menu-open');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="app-container">
      <NavbarSection />
      
      <div className="content-wrapper">
        <React.StrictMode>
          <WalletContext>
        <GritClaim />
          </WalletContext>
        </React.StrictMode>
        <Hero onOpenRegistration={() => setIsRegistrationOpen(true)} />
        
        {authData && (
          <div className="auth-success">
            <h2>Добро пожаловать, {authData.tg_username}!</h2>
            <button onClick={handleStartCommand}>Отправить запрос в Telegram</button>
          </div>
        )}

        <NFTSection />
        <OurProjectsSection />
        <TokenomicsRoadmapSection />
      </div>
      
      <Footer />

      <RegistrationForm
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        onAuthSuccess={handleTelegramAuth}
      />
    </div>
  );
};

export default App;