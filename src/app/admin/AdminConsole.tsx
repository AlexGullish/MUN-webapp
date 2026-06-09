'use client';

import React, { useState } from 'react';
import UserManager from './UserManager';
import CommitteeManager from './CommitteeManager';
import CsvImporter from './CsvImporter';
import styles from './admin.module.css';

interface Props {
  users: any[];
  committees: any[];
  chairs: any[];
  resolutions: any[];
  pendingAmendments: number;
}

const statColors: Record<string, string> = {
  Delegates: 'var(--color-primary)',
  Chairs: 'var(--color-neutral-700)',
  Committees: 'var(--color-success)',
  'Pending Amendments': 'var(--color-warning)',
};

export default function AdminConsole({ users, committees, chairs, resolutions, pendingAmendments }: Props) {
  const [activeTab, setActiveTab] = useState<'users' | 'committees' | 'resolutions' | 'import'>('users');

  const delegateCount = users.filter(u => u.role === 'DELEGATE').length;
  const chairCount = users.filter(u => u.role === 'CHAIR').length;

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: 'users', label: `Users (${users.length})` },
    { key: 'committees', label: `Committees (${committees.length})` },
    { key: 'resolutions', label: `Resolutions (${resolutions.length})` },
    { key: 'import', label: 'CSV Import' },
  ];

  const getStatColorClass = (label: string) => {
    if (label === 'Delegates') return 'statCard--primary';
    if (label === 'Committees') return 'statCard--success';
    if (label === 'Pending Amendments') return pendingAmendments > 0 ? 'statCard--warning' : 'statCard--muted';
    return 'statCard--muted';
  };

  return (
    <div className="animate-fade-in">
      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {[
          { label: 'Delegates', value: delegateCount },
          { label: 'Chairs', value: chairCount },
          { label: 'Committees', value: committees.length },
          { label: 'Pending Amendments', value: pendingAmendments },
        ].map((stat) => (
          <div key={stat.label} className={`${styles.statCard} ${getStatColorClass(stat.label)}`}>
            <span className={styles.statLabel}>{stat.label}</span>
            <span className={styles.statValue}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Tabbed Management Console */}
      <div className={styles.sectionCard}>
        <div className={styles.tabsBar}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`${styles.tabBtn} ${activeTab === tab.key ? styles.activeTabBtn : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'users' && (
          <UserManager
            initialUsers={users}
            committees={committees.map(c => ({ id: c.id, name: c.name }))}
          />
        )}

        {activeTab === 'committees' && (
          <CommitteeManager
            initialCommittees={committees}
            chairs={chairs}
          />
        )}

        {activeTab === 'resolutions' && (
          <div>
            <p className="text-muted" style={{ marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              Global view of all conference resolutions. Use Chair dashboards to upload or edit individual resolutions.
            </p>
            <div className={styles.tableWrapper}>
              <table className="table-utilitarian">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Committee</th>
                    <th>Sponsor</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {resolutions.map((res: any) => (
                    <tr key={res.id}>
                      <td>
                        <a href={`/resolution/${res.id}`} className="text-primary font-semibold" style={{ fontSize: '0.85rem' }}>{res.title}</a>
                      </td>
                      <td>{res.committee?.name}</td>
                      <td>{res.country}</td>
                      <td>
                        <span className={`badge ${res.status === 'PUBLISHED' ? 'badge-published' : res.status === 'SUBMITTED' ? 'badge-pending' : 'badge-draft'}`}>
                          {res.status}
                        </span>
                      </td>
                      <td>{new Date(res.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'import' && <CsvImporter />}
      </div>
    </div>
  );
}
