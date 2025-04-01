import React, { useState, useEffect, useRef } from 'react';
import styles from './OurProjectsSection.module.css';
import lunarAliensImage from './LunarAliens_photo.jpg';
import ecocoin_logo from './EcoCoinLogo.png';
import AnimatedSection from '../AnimatedSection/AnimatedSection';

const OurProjectsSection: React.FC = () => {
  const [currentProjectIndex, setCurrentProjectIndex] = useState<number>(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAnimation, setModalAnimation] = useState<'opening' | 'open' | 'closing'>('opening');
  const modalRef = useRef<HTMLDivElement>(null);

  const projects = [
    {
      title: 'Lunar Aliens',
      shortDescription: 'Earn $GRIT tokens through gameplay',
      detailedDescription: [
        "• 🏆 53% — Rewards to players: for activity, referrals and achievements. Play, achieve and earn!",
"• 💎 10% — Public sale: a chance for everyone to become a part of the project.",
"• 👥 15% — Team and consultants: support for those who develop the galaxy.",
"• 💧 10% — Liquidity: ensuring the stability and availability of the token.",
"• 📢 7% — Marketing and partnership: community promotion and growth.",
"• 🌍 5% — Social initiatives: support for important projects in the real world."
      ].join('\n'),
      tags: ['Blockchain', 'Solana', 'DeFi', 'GameFi', "P2E", "$GRIT"],
      image: lunarAliensImage,
      link: 'https://t.me/LunarAliens_bot',
      features: ['GameFI', 'DeFI', '$GRIT'],
      roadmap: [
        { quarter: 'Q4 2024', events: ['Start the Lunar Aliens project', "Start the mining phase"] },
        { quarter: 'January, Q1 2025', events: [ "Marketing", 'Integrate new updates to the game'] },
        { quarter: 'Februrary, Q1 2025', events: ['Partnership', 'Start the development of $GRIT presale'] },
        { quarter: 'March, Q1 2025', events: ['End of mining', 'Preparing to the airdrop and listing', "TGE"] },
        { quarter: 'April, Q2 2025', events: ['Start the $GRIT preasale', 'Airdrop and listing'] },
      ]
    },
    {
      title: 'EcoCoin',
      shortDescription: 'Sustainable blockchain ecosystem',
      detailedDescription: [
        'Экосистема для зеленых технологий с собственной экономикой:',
        '✓ Устойчивый консенсус-механизм',
        '✓ Стейкинг с экологичными NFT',
        '✓ Децентрализованное управление',
        '✓ Интеграция с реальным сектором'
      ].join('\n'),
      tags: ['Blockchain', 'Solana', 'DeFi', "P2E", "$ECO"],
      image: ecocoin_logo,
      link: 'https://t.me/LunarAliens_bot',
      features: ['Green Mining', 'Carbon Credits', 'Eco DAO'],
      roadmap: [
        { quarter: 'Q4 2023', events: ['Запуск тестнета', 'Первые партнерства'] },
        { quarter: 'Q1 2024', events: ['Мобильное приложение', 'Листинг'] }
      ]
    }
  ];

  const openModal = (index: number) => {
    setCurrentProjectIndex(index);
    setIsModalOpen(true);
    setModalAnimation('opening');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalAnimation('closing');
    setTimeout(() => {
      setIsModalOpen(false);
      setCurrentProjectIndex(-1);
      document.body.style.overflow = 'auto';
    }, 300);
  };

  useEffect(() => {
    if (isModalOpen && modalAnimation === 'opening') {
      const timer = setTimeout(() => {
        setModalAnimation('open');
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen, modalAnimation]);

  const goToNextProject = () => {
    if (currentProjectIndex < projects.length - 1) {
      setCurrentProjectIndex(currentProjectIndex + 1);
    }
  };

  const goToPrevProject = () => {
    if (currentProjectIndex > 0) {
      setCurrentProjectIndex(currentProjectIndex - 1);
    }
  };

  return (
    <section id="projects" className={styles.section}>
      <div className={styles.container}>
        <AnimatedSection id="projects-animated" animationType="projects">
          <div className={styles.header}>
            <h2 className={styles.sectionTitle}>Our Projects</h2>
            <p className={styles.sectionSubtitle}>This list will be continued</p>
          </div>

          <div className={styles.projectsRow}>
            {projects.map((project, index) => (
              <div key={index} className={styles.projectCard}>
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
                  <p className={styles.projectDescription}>{project.shortDescription}</p>

                  <div className={styles.tagsContainer}>
                    {project.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className={styles.tag}>{tag}</span>
                    ))}
                  </div>

                  <button
                    onClick={() => openModal(index)}
                    className={styles.projectLink}
                    aria-label={`Learn more about ${project.title}`}
                  >
                    Learn More
                    <svg className={styles.linkIcon} viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>

      {isModalOpen && (
        <div
          className={`${styles.modalOverlay} ${styles[`modalOverlay--${modalAnimation}`]}`}
          onClick={closeModal}
          ref={modalRef}
        >
          <div
            className={`${styles.modalContent} ${styles[`modalContent--${modalAnimation}`]}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeButton} onClick={closeModal} aria-label="Close modal">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path stroke="currentColor" strokeWidth="2" d="M6 6L18 18M6 18L18 6"/>
              </svg>
            </button>

            <div className={styles.modalScrollContainer}>
              <div className={styles.modalHeader}>
                <div className={styles.projectCounter}>
                  <span>{currentProjectIndex + 1}</span> / {projects.length}
                </div>
                <div className={styles.modalImageContainer}>
                  <img
                    src={projects[currentProjectIndex].image}
                    alt={projects[currentProjectIndex].title}
                    className={styles.modalImage}
                  />
                </div>
                <h3 className={styles.modalTitle}>
                  <span>{projects[currentProjectIndex].title}</span>
                </h3>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.modalSection}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionIcon}>📌</div>
                    <h4 className={styles.sectionHeading}>Overview</h4>
                  </div>
                  <p className={styles.modalDescription}>
                    {projects[currentProjectIndex].shortDescription}
                  </p>
                </div>

                <div className={styles.modalSection}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionIcon}>📄</div>
                    <h4 className={styles.sectionHeading}>Project Details</h4>
                  </div>
                  <div className={styles.detailedContent}>
                    {projects[currentProjectIndex].detailedDescription.split('\n').map((line, i) => (
                      <div key={i} className={styles.detailedLine}>
                        {line.startsWith('✓') ? (
                          <div className={styles.checkMark}>✓</div>
                        ) : line.startsWith('-') ? (
                          <div className={styles.bulletPoint}>•</div>
                        ) : null}
                        <p>{line.replace(/[✓-]/, '')}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {projects[currentProjectIndex].features && (
                  <div className={styles.modalSection}>
                    <div className={styles.sectionHeader}>
                      <div className={styles.sectionIcon}>✨</div>
                      <h4 className={styles.sectionHeading}>Key Features</h4>
                    </div>
                    <div className={styles.featuresGrid}>
                      {projects[currentProjectIndex].features.map((feature, i) => (
                        <div key={i} className={styles.featureCard}>
                          <div className={styles.featureIcon}>➤</div>
                          <div className={styles.featureText}>{feature}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {projects[currentProjectIndex].roadmap && (
                  <div className={styles.modalSection}>
                    <div className={styles.sectionHeader}>
                      <div className={styles.sectionIcon}>🗓</div>
                      <h4 className={styles.sectionHeading}>Development Roadmap</h4>
                    </div>
                    <div className={styles.roadmapTimeline}>
                      {projects[currentProjectIndex].roadmap.map((stage, i) => (
                        <div key={i} className={styles.roadmapItem}>
                          <div className={styles.roadmapContent}>
                            <div className={styles.roadmapQuarter}>{stage.quarter}</div>
                            <div className={styles.roadmapEvents}>
                              {stage.events.map((event, j) => (
                                <div key={j} className={styles.roadmapEvent}>
                                  <div className={styles.eventMarker}></div>
                                  <div className={styles.eventText}>{event}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.modalSection}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionIcon}>🏷</div>
                    <h4 className={styles.sectionHeading}>Technologies Used</h4>
                  </div>
                  <div className={styles.tagsContainer}>
                    {projects[currentProjectIndex].tags.map((tag, index) => (
                      <span key={index} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <a
                  href={projects[currentProjectIndex].link}
                  className={styles.modalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Project Website
                  <svg className={styles.linkArrow} viewBox="0 0 24 24">
                    <path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className={styles.navigationButtons}>
              <button
                className={`${styles.navButton} ${styles.prevButton} ${currentProjectIndex === 0 ? styles.disabled : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevProject();
                }}
                disabled={currentProjectIndex === 0}
                aria-label="Previous project"
              >
                ← Previous
              </button>
              <button
                className={`${styles.navButton} ${styles.nextButton} ${currentProjectIndex === projects.length - 1 ? styles.disabled : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextProject();
                }}
                disabled={currentProjectIndex === projects.length - 1}
                aria-label="Next project"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default OurProjectsSection;
