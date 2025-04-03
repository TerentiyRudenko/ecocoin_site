import { useState, useEffect } from 'react';
import './RegistrationForm.css';

interface RegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegistrationForm = ({ isOpen, onClose }: RegistrationFormProps) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!isOpen) setIsClosing(false);
  }, [isOpen]);

  const startClosing = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handleTelegramClick = () => {
    // URL вашего Telegram бота или deeplink
    const telegramUrl = 'https://t.me/ecocoin_login_bot';
    window.open(telegramUrl, '_blank');
  };

  const handleSolanaClick = () => {
    console.log('Solana wallet connect clicked');
    // Здесь будет логика подключения кошелька Solana
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div id="login-form" className={`overlay ${isClosing ? 'closing' : ''}`} onClick={startClosing}>
      <div className="registration-form-container">
        <div className="registration-form" onClick={(e) => e.stopPropagation()}>
          <button className="close-button" onClick={startClosing}>
            <svg viewBox="0 0 24 24" fill="none">
              <path 
                d="M18 6L6 18M6 6l12 12" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            </svg>
          </button>
          
          <h2>Join EcoCoin</h2>
          <p className="subtitle">Choose your preferred login method</p>
          
          <div className="auth-methods">
            <button 
              className="auth-button telegram"
              onClick={handleTelegramClick}
            >
              <svg className="auth-icon" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.26.26-.428.26l.213-3.05 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.86 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.57-4.458c.53-.222.53-.222.53-.222.178 0 .02.222-.08.314z"/>
              </svg>
              Continue with Telegram
            </button>

            <button 
              className="auth-button solana"
              onClick={handleSolanaClick}
            >
              <svg className="auth-icon" viewBox="0 0 24 24">
                <path d="M4.158 15.326c-.28 0-.42.2-.467.28-.047.14.093.326.28.326h3.73c.14 0 .28-.093.467-.28l8.13-8.13c.094-.093.14-.233.14-.373 0-.14-.047-.28-.14-.373l-.794-.794c-.093-.094-.233-.14-.373-.14s-.28.046-.373.14l-8.13 8.13c-.187.188-.28.328-.28.467zm0 5.476c-.28 0-.42.2-.467.28-.047.14.093.326.28.326H7.89c.14 0 .28-.093.467-.28l8.13-8.13c.094-.093.14-.233.14-.373 0-.14-.047-.28-.14-.373l-.794-.794c-.093-.094-.233-.14-.373-.14s-.28.046-.373.14l-8.13 8.13c-.187.188-.28.328-.28.467z"/>
                <path d="M16.502 4.187c.093-.093.233-.14.373-.14s.28.047.373.14l.794.794c.093.094.14.233.14.373s-.047.28-.14.373l-8.13 8.13c-.187.187-.327.28-.467.28H5.13c-.187 0-.327-.14-.327-.326v-.467c0-.14.093-.28.28-.467l8.13-8.13c.093-.094.233-.14.373-.14s.28.046.373.14l2.383 2.383z"/>
              </svg>
              Connect Solana Wallet
            </button>
          </div>

          <p className="disclaimer">
            By connecting, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;