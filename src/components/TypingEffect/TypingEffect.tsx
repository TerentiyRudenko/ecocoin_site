import React, { useEffect, useState, useRef } from 'react';
import styles from './Typing.module.css';

interface TypingEffectProps {
  text: string;
  speed?: number;
  cursorColor?: string;
  fontSize?: string;
  startDelay?: number;
  showCursor?: boolean;
}

const TypingEffect: React.FC<TypingEffectProps> = ({
  text,
  speed = 100,
  cursorColor = '#333',
  fontSize = '1rem',
  startDelay = 0,
  showCursor = true
}) => {
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isBlinking, setIsBlinking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const cursor = cursorRef.current;
    
    if (container && cursor) {
      // Устанавливаем кастомные CSS-переменные
      container.style.setProperty('--cursor-color', cursorColor);
      container.style.fontSize = fontSize;
      cursor.style.backgroundColor = cursorColor;
    }
  }, [cursorColor, fontSize]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const animationId: number = window.setTimeout(() => {
      let index = 0;
      
      const typeCharacter = () => {
        if (index < text.length) {
          setCurrentText(prev => prev + text[index]);
          index++;
          timeoutId = setTimeout(typeCharacter, speed);
        } else {
          setIsTyping(false);
          setIsBlinking(true);
        }
      };

      typeCharacter();
    }, startDelay);

    // Очистка таймеров при размонтировании
    return () => {
      clearTimeout(timeoutId);
      window.clearTimeout(animationId);
    };
  }, [text, speed, startDelay]);

  return (
    <div className={styles.typingContainer} ref={containerRef}>
      <span className={styles.text}>
        {currentText}
        {showCursor && (
          <span 
            ref={cursorRef}
            className={`${styles.cursor} ${isBlinking ? styles.blink : ''} ${
              isTyping ? styles.typing : ''
            }`}
            style={{
              backgroundColor: cursorColor,
              height: fontSize,
              top: `calc(50% - ${parseInt(fontSize) / 2}px)`
            }}
          />
        )}
      </span>
    </div>
  );
};

export default TypingEffect;