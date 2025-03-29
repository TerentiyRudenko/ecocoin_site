import React from 'react';
import styles from './OurProjectsSection.module.css'
import lunarAliensImage from './LunarAliens_photo.jpg'; // Укажите правильный путь к изображению
import AnimatedSection from '../AnimatedSection/AnimatedSection';

const OurProjectsSection: React.FC = () => {
  const project = {
    title: 'Lunar Aliens',
    description: 'A game where you can earn $GRIT tokens by playing and completing tasks. Soon will be listing and launch the $GRIT Presale.',
    tags: ['Blockchain', 'Solana', 'DeFi'],
    image: lunarAliensImage,
    link: 'https://t.me/LunarAliens_bot'
  };

  return (
    <section id="projects-section" className={styles.section}>
        <AnimatedSection id="projects-section" animationType="projects" className={styles.container}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Our Projects</h2>
        <p className={styles.sectionSubtitle}>This list will be continued</p>
        
        <div className={styles.projectCard}>
          <div className={styles.projectImageWrapper}>
            <img 
              src={project.image} 
              alt={project.title} 
              className={styles.projectImage}
              loading="lazy"
            />
            <div className={styles.imageOverlay} />
          </div>
          
          <div className={styles.projectContent}>
            <h3 className={styles.projectTitle}>{project.title}</h3>
            <p className={styles.projectDescription}>{project.description}</p>
            
            <div className={styles.tagsContainer}>
              {project.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>{tag}</span>
              ))}
            </div>
            
            <a 
              href={project.link} 
              className={styles.projectLink}
              aria-label={`Learn more about ${project.title}`}
            >
              Learn More
              <svg className={styles.linkIcon} viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
      </AnimatedSection>
    </section>
  );
};

export default OurProjectsSection;