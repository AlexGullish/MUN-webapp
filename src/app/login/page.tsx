'use client';

import React, { useActionState } from 'react';
import { loginAction } from '../actions';
import styles from './login.module.css';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className={styles.loginContainer}>
      {/* Decorative Orbs */}
      <div className={`${styles.orb} ${styles.orbLeft}`} />
      <div className={`${styles.orb} ${styles.orbRight}`} />

      <div className={`${styles.loginCard} glass-panel`}>
        <div className={styles.header}>
          <h1 className={styles.title}>MUN Portal</h1>
          <p className={styles.subtitle}>Model United Nations Conference Management</p>
        </div>

        <form action={formAction} className={styles.form}>
          {state?.error && (
            <div className={styles.errorAlert}>
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
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{state.error}</span>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email" className="input-label">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="delegate@school.com"
              className="input-field"
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="loginCode" className="input-label">
              Conference Access Code
            </label>
            <input
              id="loginCode"
              name="loginCode"
              type="text"
              required
              placeholder="MUN-XXXX-XXXX"
              className="input-field"
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className={`${styles.submitBtn} btn btn-primary`}
          >
            {isPending ? (
              <>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="animate-spin"
                  style={{ animation: 'spin 1s linear infinite' }}
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="rgba(255, 255, 255, 0.2)"
                  />
                  <path d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
                </svg>
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>Secure Sign In</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </form>

        <p className={styles.footerNote}>
          Access codes are pre-generated. No public sign-ups are allowed.
          <br />
          If you have lost your access code, contact your Committee Chair.
        </p>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
