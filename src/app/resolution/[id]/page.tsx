import React from 'react';
import { getSession } from '../../../lib/session';
import { prisma } from '../../../lib/prisma';
import Navbar from '../../../components/Navbar';
import AmendmentForm from './AmendmentForm';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import styles from './resolutionDetail.module.css';

interface ResolutionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ResolutionDetailPage({ params }: ResolutionDetailPageProps) {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  // Await the dynamic URL params (Next.js 15+ convention)
  const resolvedParams = await params;
  const resolutionId = resolvedParams.id;

  // Fetch resolution with committee, uploader, and amendments
  const resolution = await prisma.resolution.findUnique({
    where: { id: resolutionId },
    include: {
      committee: true,
      uploadedBy: true,
      amendments: {
        include: {
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!resolution) {
    notFound();
  }

  // Role visibility validation: Delegates can only see DRAFT resolutions if they belong to their committee?
  // Let's enforce that DRAFT resolutions are only visible to Chairs and Admins, and the committee's own users if published.
  if (resolution.status === 'DRAFT' && session.role === 'DELEGATE') {
    // Hide draft completely from delegates
    notFound();
  }

  const isDelegateInCommittee = session.role === 'DELEGATE' && session.committeeId === resolution.committeeId;

  return (
    <div className="animate-fade-in">
      <Navbar user={session} />

      <main className={styles.pageContainer}>
        <Link href="/resolutions" className={styles.backBtn}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Back to Directory</span>
        </Link>

        <div className={styles.mainLayout}>
          <div className={styles.contentColumn}>
            <div
              className="resolution-content animate-fade-in"
              dangerouslySetInnerHTML={{ __html: resolution.renderedHtml }}
            />

            {isDelegateInCommittee && (
              <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <AmendmentForm resolutionId={resolution.id} />
              </div>
            )}
          </div>

          <div className={styles.sidebar}>
            <div className={styles.metaCard}>
              <h3 className={styles.metaTitle}>Resolution Details</h3>
              <div className={styles.metaList}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Title</span>
                  <span className={styles.metaValue}>{resolution.title}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Topic</span>
                  <span className={styles.metaValue}>{resolution.topic}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Committee</span>
                  <span className={styles.metaValue}>{resolution.committee.name}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Committee Room</span>
                  <span className={styles.metaValue} style={{ color: 'var(--primary)' }}>
                    {resolution.committee.roomNumber}
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Sponsor Country</span>
                  <span className={styles.metaValue}>{resolution.country}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Status</span>
                  <div>
                    <span
                      className={`badge ${
                        resolution.status === 'PUBLISHED'
                          ? 'badge-published'
                          : resolution.status === 'SUBMITTED'
                          ? 'badge-pending'
                          : 'badge-draft'
                      }`}
                    >
                      {resolution.status}
                    </span>
                  </div>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Uploaded By</span>
                  <span className={styles.metaValue}>{resolution.uploadedBy.name}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Submission Date</span>
                  <span className={styles.metaValue}>
                    {new Date(resolution.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Amendments History Card */}
            <div className={`${styles.amendmentsCard} glass-panel`}>
              <h3 className={styles.amendmentsTitle}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="4" y1="9" x2="20" y2="9" />
                  <line x1="4" y1="15" x2="20" y2="15" />
                  <line x1="10" y1="3" x2="8" y2="21" />
                  <line x1="16" y1="3" x2="14" y2="21" />
                </svg>
                <span>Proposed Amendments ({resolution.amendments.length})</span>
              </h3>

              <div className={styles.amendmentsList}>
                {resolution.amendments.length > 0 ? (
                  resolution.amendments.map((amendment) => (
                    <div className={styles.amendmentItem} key={amendment.id}>
                      <div className={styles.amendmentHeader}>
                        <span className={styles.submitterName}>
                          {amendment.user.name} ({amendment.user.country})
                        </span>
                        <span
                          className={`badge ${
                            amendment.status === 'APPROVED'
                              ? 'badge-approved'
                              : amendment.status === 'REJECTED'
                              ? 'badge-rejected'
                              : 'badge-pending'
                          }`}
                          style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}
                        >
                          {amendment.status}
                        </span>
                      </div>
                      <p className={styles.amendmentText}>"{amendment.text}"</p>
                      {amendment.description && (
                        <p className={styles.amendmentExplanation}>
                          <strong>Rationale:</strong> {amendment.description}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className={styles.noAmendments}>
                    No amendments have been proposed yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
