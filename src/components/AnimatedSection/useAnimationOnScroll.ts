import { useEffect, useState } from 'react';

const useAnimationOnScroll = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('.animated-section');
      
      elements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight * 0.85) {
          element.classList.add('animate-fadeInUp');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Проверить при загрузке
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
};

export default useAnimationOnScroll;