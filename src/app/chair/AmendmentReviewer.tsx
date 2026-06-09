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
        // Remove reviewed item from the pending list
        setAmendments(amendments.filter((a) => a.id !== id));
      } catch (err) {
        alert('Failed to update amendment status. Please try again.');
      } finally {
        setActioningId(null);
      }
    });
  };

  if (amendments.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '3rem',
          color: 'var(--text-secondary)',
          background: 'rgba(255, 255, 255, 0.01)',
          border: '1px dashed var(--border-color)',
          borderRadius: '12px',
        }}
      >
        No pending amendments to review.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {amendments.map((amendment) => {
        const isCurrentlyActioning = amendment.id === actioningId;
        
        return (
          <div className={styles.amendmentCard} key={amendment.id}>
            <div className={styles.amendmentHeader}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <strong style={{ color: 'white', fontSize: '0.95rem' }}>
                  {amendment.user.name} ({amendment.user.country})
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Proposed for: <strong>{amendment.resolution.title}</strong>
                </span>
              </div>
              <span className="badge badge-pending">PENDING REVIEW</span>
            </div>

            <p className={styles.amendmentText}>"{amendment.text}"</p>

            {amendment.description && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '0.5rem' }}>
                <strong>Rationale:</strong> {amendment.description}
              </p>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '0.75rem',
                marginTop: '0.25rem',
              }}
            >
              <button
                onClick={() => handleReview(amendment.id, 'REJECTED')}
                disabled={isPending && isCurrentlyActioning}
                className="btn btn-secondary"
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem',
                  color: 'var(--danger)',
                  borderColor: 'rgba(244, 63, 94, 0.2)',
                  background: 'rgba(244, 63, 94, 0.05)',
                }}
              >
                Reject Amendment
              </button>

              <button
                onClick={() => handleReview(amendment.id, 'APPROVED')}
                disabled={isPending && isCurrentlyActioning}
                className="btn btn-primary"
                style={{
                  padding: '0.4rem 1.2rem',
                  fontSize: '0.8rem',
                  background: 'linear-gradient(135deg, var(--success), #34d399)',
                  boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)',
                }}
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
