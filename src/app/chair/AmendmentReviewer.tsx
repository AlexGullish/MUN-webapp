'use client';

import React, { useState, useTransition } from 'react';
import { updateAmendmentStatusAction } from '../actions';
import styles from './chair.module.css';

interface AmendmentType {
  id: string;
  text: string;
  description: string | null;
  status: string;
  createdAt: Date;
  user: {
    name: string;
    country: string;
  };
  resolution: {
    title: string;
  };
}

interface AmendmentReviewerProps {
  initialAmendments: AmendmentType[];
}

export default function AmendmentReviewer({ initialAmendments }: AmendmentReviewerProps) {
  const [amendments, setAmendments] = useState(initialAmendments);
  const [isPending, startTransition] = useTransition();
  const [actioningId, setActioningId] = useState<string | null>(null);

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setActioningId(id);
    startTransition(async () => {
      try {
        await updateAmendmentStatusAction(id, status);
        setAmendments(amendments.filter((a) => a.id !== id));
      } catch {
        alert('Failed to update amendment status. Please try again.');
      } finally {
        setActioningId(null);
      }
    });
  };

  if (amendments.length === 0) {
    return (
      <div className={styles.noData}>
        No pending amendments to review.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {amendments.map((amendment) => {
        const isCurrentlyActioning = amendment.id === actioningId;

        return (
          <div className={styles.amendmentCard} key={amendment.id}>
            <div className={styles.amendmentHeader}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <strong style={{ color: 'var(--color-neutral-900)', fontSize: '0.95rem' }}>
                  {amendment.user.name} ({amendment.user.country})
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>
                  Proposed for: <strong>{amendment.resolution.title}</strong>
                </span>
              </div>
              <span className="badge badge-pending">PENDING REVIEW</span>
            </div>

             <p className={styles.amendmentText}>&ldquo;{amendment.text}&rdquo;</p>

            {amendment.description && (
              <p className="text-muted" style={{ fontSize: '0.85rem', paddingLeft: '0.5rem' }}>
                <strong>Rationale:</strong> {amendment.description}
              </p>
            )}

            <div
              className="divider"
              style={{ margin: '0.5rem 0 0.25rem 0' }}
            >
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                paddingTop: '0.5rem',
              }}
            >
              <button
                onClick={() => handleReview(amendment.id, 'REJECTED')}
                disabled={isPending && isCurrentlyActioning}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
              >
                Reject Amendment
              </button>

              <button
                onClick={() => handleReview(amendment.id, 'APPROVED')}
                disabled={isPending && isCurrentlyActioning}
                className="btn btn-primary"
                style={{ padding: '0.4rem 1.2rem', fontSize: '0.8rem' }}
              >
                {isCurrentlyActioning ? 'Updating...' : 'Approve & Publish'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
