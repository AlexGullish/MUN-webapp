'use client';

import React, { useActionState, useEffect, useRef } from 'react';
import { submitAmendmentAction } from '../../actions';

interface AmendmentFormProps {
  resolutionId: string;
}

export default function AmendmentForm({ resolutionId }: AmendmentFormProps) {
  const [state, formAction, isPending] = useActionState(submitAmendmentAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state]);

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
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
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z" />
        </svg>
        <span>Propose Amendment</span>
      </h3>

      <form action={formAction} ref={formRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <input type="hidden" name="resolutionId" value={resolutionId} />

        {state?.error && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.2)',
              color: '#fda4af',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
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
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
            }}
          >
            Amendment submitted successfully! It is now pending Chair review.
          </div>
        )}

        <div className="input-group">
          <label htmlFor="text" className="input-label">
            Proposed Amendment Text
          </label>
          <textarea
            id="text"
            name="text"
            required
            rows={3}
            placeholder="e.g. Add Operative Clause 3b: 'Requests all member states to provide...'"
            className="input-field"
            style={{ minHeight: '80px', resize: 'vertical', background: 'var(--bg-surface)' }}
          />
        </div>

        <div className="input-group">
          <label htmlFor="description" className="input-label">
            Explanation / Rationale (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            placeholder="Explain why this amendment is necessary or what problem it solves..."
            className="input-field"
            style={{ minHeight: '60px', resize: 'vertical', background: 'var(--bg-surface)' }}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '0.5rem' }}
        >
          {isPending ? 'Submitting proposal...' : 'Submit Amendment to Chair'}
        </button>
      </form>
    </div>
  );
}
