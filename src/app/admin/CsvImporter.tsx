'use client';

import React, { useActionState, useRef } from 'react';
import { importCsvAction, ImportResult } from '../actions';
import styles from './admin.module.css';

export default function CsvImporter() {
  const [state, formAction, isPending] = useActionState(importCsvAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.2rem',
          fontWeight: 700,
          color: 'white',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 16 12 12 8 16" />
          <line x1="12" y1="12" x2="12" y2="21" />
          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
        </svg>
        <span>Bulk CSV Import</span>
      </h3>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
        Import participants from a CSV file. The system will auto-generate unique access codes. Duplicate emails will be skipped. Required columns:{' '}
        <code style={{ background: 'rgba(255,255,255,0.06)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.8rem' }}>
          name, email, role
        </code>. Optional:{' '}
        <code style={{ background: 'rgba(255,255,255,0.06)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.8rem' }}>
          school, country, committee, allergies
        </code>.
      </p>

      {state?.error && (
        <div
          style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            color: '#fda4af',
            padding: '0.85rem 1rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
          }}
        >
          {state.error}
        </div>
      )}

      {state?.success && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            color: '#a7f3d0',
            padding: '1rem 1.25rem',
            borderRadius: '6px',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
          }}
        >
          <strong>Import Successful!</strong>
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '2rem' }}>
            <span>✓ <strong>{state.importedCount}</strong> user{(state.importedCount ?? 0) !== 1 ? 's' : ''} imported</span>
            {(state.committeesCreated ?? 0) > 0 && (
              <span>✓ <strong>{state.committeesCreated}</strong> new committee{(state.committeesCreated ?? 0) !== 1 ? 's' : ''} created</span>
            )}
          </div>
        </div>
      )}

      <form action={formAction} ref={formRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <label
          htmlFor="csvFile"
          className={styles.csvUploadArea}
          style={{ cursor: 'pointer' }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)', opacity: 0.8 }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-display)' }}>
            Click or drag CSV file here
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Accepts .csv files only</p>
          <input
            id="csvFile"
            name="csvFile"
            type="file"
            accept=".csv"
            required
            style={{ display: 'none' }}
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          {isPending ? 'Importing and Creating Accounts...' : 'Import Participants from CSV'}
        </button>
      </form>

      <div
        style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
        }}
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 600 }}>
          Sample CSV Format:
        </p>
        <pre
          style={{
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            lineHeight: '1.6',
            overflowX: 'auto',
          }}
        >
          {`name,email,school,country,committee,allergies,role\nAlex Carter,alex@school.com,Oxford Prep,USA,Security Council,None,DELEGATE\nSarah Jenkins,sarah@school.com,Cambridge High,UK,Security Council,,CHAIR`}
        </pre>
      </div>
    </div>
  );
}
