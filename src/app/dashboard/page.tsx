import React from 'react';
import { getSession } from '../../lib/session';
import { prisma } from '../../lib/prisma';
import Navbar from '../../components/Navbar';
import InteractiveMap from '../../components/InteractiveMap';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import styles from './dashboard.module.css';

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  // Fetch full delegate profile, including their committee
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      committee: {
        include: {
          chairUser: true,
          resolutions: {
            where: {
              status: { in: ['SUBMITTED', 'PUBLISHED'] },
            },
          },
        },
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  const committee = user.committee;
  const resolutions = committee?.resolutions || [];

  return (
    <div className="animate-fade-in">
      <Navbar user={session} />

      <main className={styles.dashboardWrapper}>
        {/* Welcome Section */}
        <section className={styles.welcomeSection}>
          <h1 className={styles.welcomeTitle}>Welcome back, {user.name}</h1>
          <p className={styles.welcomeSubtitle}>
            Delegate of <strong className="text-primary">{user.country}</strong> • {user.school}
          </p>
        </section>

        {/* Dashboard Grid */}
        <div className={styles.topGrid}>
          {/* Profile Card */}
          <div className={`${styles.profileCard} card`}>
            <div className={styles.profileHeader}>
              <div className={styles.profileAvatar}>
                {user.country.substring(0, 2).toUpperCase()}
              </div>
              <div className={styles.profileInfo}>
                <span className={styles.userRole}>Delegate Profile</span>
                <h2 className={styles.profileName}>{user.name}</h2>
              </div>
            </div>

            <div className={styles.profileDetailList}>
              <div className={styles.profileDetailItem}>
                <span className={styles.detailLabel}>Delegation / Country</span>
                <span className={styles.detailValue}>{user.country}</span>
              </div>
              <div className={styles.profileDetailItem}>
                <span className={styles.detailLabel}>Representing School</span>
                <span className={styles.detailValue}>{user.school}</span>
              </div>
              <div className={styles.profileDetailItem}>
                <span className={styles.detailLabel}>Assigned Committee</span>
                <span className={styles.detailValue}>
                  {committee ? committee.name : 'Not Assigned'}
                </span>
              </div>
              <div className={styles.profileDetailItem}>
                <span className={styles.detailLabel}>Committee Room</span>
                <span className="text-primary">{committee ? committee.roomNumber : 'N/A'}</span>
              </div>
              {user.allergies && (
                <div className={styles.profileDetailItem}>
                  <span className={styles.detailLabel}>Dietary / Allergies</span>
                  <span className="text-danger">
                    {user.allergies}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Venue Map */}
              <div className={`${styles.mapCard} card`} style={{ padding: '1.5rem', height: '100%' }}>
            <h3 className={styles.cardTitle}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Venue Room Locator</span>
            </h3>
            <div className={styles.mapContainer}>
              <div className={styles.mapPlaceholder}>
                <InteractiveMap roomNumber={committee?.roomNumber} />
              </div>
            </div>
          </div>
        </div>

        {/* Resolutions quick widget */}
        <section className={styles.resolutionsSection}>
          <div className="flex-row-center">
            <h3 className={styles.cardTitle}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span>Your Committee Resolutions</span>
            </h3>
            <Link href="/resolutions" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
              View All Conference Resolutions
            </Link>
          </div>

          <div className={styles.resolutionsGrid}>
            {resolutions.length > 0 ? (
              resolutions.map((res) => (
                <Link href={`/resolution/${res.id}`} key={res.id}>
                  <div className={`${styles.resolutionCard} glass-panel`}>
                    <div className={styles.resolutionHeader}>
                      <span className={styles.resolutionTitle}>{res.title}</span>
                      <span
                        className={`badge ${
                          res.status === 'PUBLISHED' ? 'badge-published' : 'badge-pending'
                        }`}
                      >
                        {res.status}
                      </span>
                    </div>
                    <p className={styles.resolutionTopic}>{res.topic}</p>
                    <div className={styles.resolutionFooter}>
                      <span>Sponsor: {res.country}</span>
                      <span>{new Date(res.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className={styles.noResolutions}>
                No resolutions have been published yet for the {committee?.name || 'your committee'}.
                <br />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Once your Chair uploads and publishes resolutions, they will appear here.
                </span>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
