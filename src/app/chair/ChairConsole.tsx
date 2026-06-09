'use client';

import React, { useState } from 'react';
import ResolutionUploadForm from './ResolutionUploadForm';
import ResolutionsList from './ResolutionsList';
import AmendmentReviewer from './AmendmentReviewer';
import styles from './chair.module.css';

interface ResolutionType {
  id: string;
  title: string;
  topic: string;
  country: string;
  status: string;
  originalDocxPath?: string | null;
}

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

interface DelegateType {
  id: string;
  name: string;
  email: string;
  school: string;
  country: string;
  allergies?: string | null;
}

interface ChairConsoleProps {
  resolutions: ResolutionType[];
  amendments: AmendmentType[];
  delegates: DelegateType[];
}

export default function ChairConsole({
  resolutions,
  amendments,
  delegates,
}: ChairConsoleProps) {
  const [activeTab, setActiveTab] = useState<'resolutions' | 'amendments' | 'delegates'>('resolutions');
  const [editingResolution, setEditingResolution] = useState<ResolutionType | null>(null);

  return (
    <div className={styles.panelGrid}>
      <div className={styles.uploadColumn}>
        <ResolutionUploadForm
          selectedResolution={editingResolution}
          onCancelEdit={() => setEditingResolution(null)}
        />
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.tabsBar}>
          <button
            onClick={() => setActiveTab('resolutions')}
            className={`${styles.tabBtn} ${activeTab === 'resolutions' ? styles.activeTabBtn : ''}`}
          >
            Committee Resolutions ({resolutions.length})
          </button>
          <button
            onClick={() => setActiveTab('amendments')}
            className={`${styles.tabBtn} ${activeTab === 'amendments' ? styles.activeTabBtn : ''}`}
          >
            Pending Amendments ({amendments.length})
          </button>
          <button
            onClick={() => setActiveTab('delegates')}
            className={`${styles.tabBtn} ${activeTab === 'delegates' ? styles.activeTabBtn : ''}`}
          >
            Delegates ({delegates.length})
          </button>
        </div>

        {activeTab === 'resolutions' && (
          <div>
            <p className="text-muted" style={{ marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              Review and update resolutions submitted to your committee.
            </p>
            <ResolutionsList
              resolutions={resolutions}
              onEditSelect={(res) => setEditingResolution(res)}
            />
          </div>
        )}

        {activeTab === 'amendments' && (
          <div>
            <p className="text-muted" style={{ marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              Review amendments submitted by delegates of your committee. Approved amendments publish instantly.
            </p>
            <AmendmentReviewer initialAmendments={amendments} />
          </div>
        )}

        {activeTab === 'delegates' && (
          <div>
            <p className="text-muted" style={{ marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              Registered delegates assigned to your committee.
            </p>
            {delegates.length > 0 ? (
              <div className={styles.tableWrapper}>
                <table className="table-utilitarian">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Country</th>
                      <th>School</th>
                      <th>Allergies</th>
                    </tr>
                  </thead>
                  <tbody>
                    {delegates.map((del) => (
                      <tr key={del.id}>
                        <td className="font-semibold">{del.name}</td>
                        <td>{del.country}</td>
                        <td>{del.school}</td>
                        <td>
                          {del.allergies ? (
                            <span className="text-danger" style={{ fontSize: '0.85rem' }}>{del.allergies}</span>
                          ) : (
                            <span className="text-muted">None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.noData}>
                No delegates registered in this committee yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
