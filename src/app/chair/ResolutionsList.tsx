'use client';

import React, { useTransition } from 'react';
import { deleteResolutionAction } from '../actions';
import styles from './chair.module.css';

interface ResolutionType {
  id: string;
  title: string;
  topic: string;
  country: string;
  status: string;
  originalDocxPath?: string | null;
}

interface ResolutionsListProps {
  resolutions: ResolutionType[];
  onEditSelect: (res: ResolutionType) => void;
}

export default function ResolutionsList({ resolutions, onEditSelect }: ResolutionsListProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    if (confirm('Are you absolutely sure you want to delete this resolution? All submitted amendments will be deleted as well.')) {
      startTransition(async () => {
        try {
          await deleteResolutionAction(id);
        } catch {
          alert('Failed to delete resolution.');
        }
      });
    }
  };

  if (resolutions.length === 0) {
    return (
      <div className={styles.noData}>
        No resolutions uploaded yet. Use the upload panel to submit your first resolution.
      </div>
    );
  }

  return (
    <div className={styles.resList}>
      {resolutions.map((res) => (
        <div className={styles.resRow} key={res.id}>
          <div className={styles.resInfo}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className={styles.resTitle}>{res.title}</span>
              <span
                className={`badge ${
                  res.status === 'PUBLISHED'
                    ? 'badge-published'
                    : res.status === 'SUBMITTED'
                    ? 'badge-pending'
                    : 'badge-draft'
                }`}
                style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}
              >
                {res.status}
              </span>
            </div>
            <span className={styles.resDetails}>
              Sponsor: <strong>{res.country}</strong> • Topic: {res.topic}
            </span>
          </div>

          <div className={styles.actionGroup}>
            <button
              onClick={() => onEditSelect(res)}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            >
              Edit
            </button>
              <button
                onClick={() => handleDelete(res.id)}
                disabled={isPending}
                className="btn btn-danger"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              >
                Delete
              </button>
          </div>
        </div>
      ))}
    </div>
  );
}
