'use client';

import React, { useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import styles from './resolutions.module.css';

interface ResolutionFiltersProps {
  committees: Array<{ id: string; name: string }>;
  showStatusFilter: boolean;
}

export default function ResolutionFilters({ committees, showStatusFilter }: ResolutionFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className={styles.filterBar}>
      {/* Search Input */}
      <div className={`${styles.filterGroup} ${styles.searchGroup}`}>
        <label htmlFor="search" className="input-label">Search Resolutions</label>
        <input
          id="search"
          type="text"
          placeholder="Search by title, topic, or sponsor..."
          defaultValue={searchParams.get('search') || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="input-field"
        />
      </div>

      {/* Committee Select */}
      <div className={styles.filterGroup}>
        <label htmlFor="committee" className="input-label">Committee</label>
        <select
          id="committee"
          defaultValue={searchParams.get('committee') || ''}
          onChange={(e) => handleFilterChange('committee', e.target.value)}
          className={styles.selectField}
        >
          <option value="">All Committees</option>
          {committees.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status Select (Admins/Chairs only) */}
      {showStatusFilter && (
        <div className={styles.filterGroup}>
          <label htmlFor="status" className="input-label">Status</label>
          <select
            id="status"
            defaultValue={searchParams.get('status') || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={styles.selectField}
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>
      )}
    </div>
  );
}
