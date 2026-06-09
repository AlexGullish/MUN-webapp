'use client';

import React, { useActionState, useEffect, useRef, useState } from 'react';
import { uploadResolutionAction } from '../actions';

interface ResolutionUploadFormProps {
  selectedResolution?: {
    id: string;
    title: string;
    topic: string;
    country: string;
    status: string;
    originalDocxPath?: string | null;
  } | null;
  onCancelEdit?: () => void;
}

export default function ResolutionUploadForm({
  selectedResolution,
  onCancelEdit,
}: ResolutionUploadFormProps) {
  const [state, formAction, isPending] = useActionState(uploadResolutionAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setSuccess(true);
      const timer = setTimeout(() => setSuccess(false), 4000);
      if (formRef.current && !selectedResolution) {
        formRef.current.reset();
      }
      if (onCancelEdit && selectedResolution) {
        onCancelEdit();
      }
      return () => clearTimeout(timer);
    }
  }, [state, selectedResolution, onCancelEdit]);

  return (
    <div className="card">
      <h3 className="cardTitle" style={{ marginBottom: '1.25rem' }}>
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
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span>{selectedResolution ? 'Edit Resolution Metadata' : 'Upload Resolution Document'}</span>
      </h3>

      <form action={formAction} ref={formRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {selectedResolution && (
          <input type="hidden" name="resolutionId" value={selectedResolution.id} />
        )}

        {state?.error && (
          <div className="errorAlert">
            {state.error}
          </div>
        )}

        {success && (
          <div className="card" style={{ background: 'var(--color-success-light)', border: '1px solid var(--color-success-border)', color: 'var(--color-success)' }}>
            Resolution {selectedResolution ? 'updated' : 'uploaded'} successfully!
          </div>
        )}

        <div className="input-group">
          <label htmlFor="title" className="input-label">
            Resolution Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="e.g. Resolution SC/2026/241"
            defaultValue={selectedResolution?.title || ''}
            className="input-field"
          />
        </div>

        <div className="input-group">
          <label htmlFor="topic" className="input-label">
            Resolution Topic
          </label>
          <input
            id="topic"
            name="topic"
            type="text"
            required
            placeholder="e.g. De-escalation of border tensions in East Africa"
            defaultValue={selectedResolution?.topic || ''}
            className="input-field"
          />
        </div>

        <div className="input-group">
          <label htmlFor="country" className="input-label">
            Sponsor Delegation / Country
          </label>
          <input
            id="country"
            name="country"
            type="text"
            required
            placeholder="e.g. USA, Egypt, South Korea"
            defaultValue={selectedResolution?.country || ''}
            className="input-field"
          />
        </div>

          <div className="grid-cols-2">
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label htmlFor="status" className="input-label">
                Resolution Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={selectedResolution?.status || 'DRAFT'}
                className="select-field"
              >
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label htmlFor="docxFile" className="input-label">
                {selectedResolution ? 'Replace DOCX (Optional)' : 'DOCX Resolution File'}
              </label>
              <input
                id="docxFile"
                name="docxFile"
                type="file"
                accept=".docx"
                required={!selectedResolution}
                className="input-field"
                style={{ padding: '0.5rem', cursor: 'pointer' }}
              />
            </div>
          </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          {selectedResolution && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel Edit
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="btn btn-primary"
            style={{ flex: 2 }}
          >
            {isPending ? 'Processing...' : selectedResolution ? 'Save Changes' : 'Upload and Parse'}
          </button>
        </div>
      </form>
    </div>
  );
}
