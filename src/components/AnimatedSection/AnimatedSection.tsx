import { useEffect, useRef, ReactNode } from 'react';
import './useAnimationOnScroll';
import '../../styles/animations.css';

type AnimationType = 
  | 'hero' 
  | 'nft' 
  | 'projects' 
  | 'tokenomics';

interface AnimatedSectionProps {
  id: string;
  children: ReactNode;
  animationType: AnimationType;
  className?: string;
}

const AnimatedSection = ({
  id,
  children,
  animationType,
  className = ''
}: AnimatedSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const animationClass = `${animationType}-animation`;
            entry.target.classList.add(animationClass);
          }
        });
      },
      { threshold: 0.1 }
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [animationType]);

  return (
    <section
      id={id}
      ref={sectionRef}
      className={`${className} animated-section`}
    >
      {children}
    </section>
  );
};

export default AnimatedSection;