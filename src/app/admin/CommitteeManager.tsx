'use client';

import React, { useState, useActionState, useTransition, useEffect } from 'react';
import { createOrUpdateCommitteeAction, deleteCommitteeAction } from '../actions';
import styles from './admin.module.css';

interface ChairOption { id: string; name: string; }
interface CommitteeType {
  id: string;
  name: string;
  roomNumber: string;
  chairUserId?: string | null;
  chairUser?: { name: string } | null;
  _count?: { users: number; resolutions: number };
}

interface CommitteeManagerProps {
  initialCommittees: CommitteeType[];
  chairs: ChairOption[];
}

export default function CommitteeManager({ initialCommittees, chairs }: CommitteeManagerProps) {
  const [committees, setCommittees] = useState(initialCommittees);
  const [editing, setEditing] = useState<CommitteeType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [state, formAction, isPending] = useActionState(createOrUpdateCommitteeAction, null);
  const [deleteTransition, startDeleteTransition] = useTransition();

  useEffect(() => {
    if (state?.success) {
      window.location.reload();
    }
  }, [state]);

  const handleDelete = (id: string) => {
    if (!confirm('Delete this committee? All related users will be unlinked and resolutions will be permanently deleted.')) return;
    startDeleteTransition(async () => {
      try {
        await deleteCommitteeAction(id);
        setCommittees(prev => prev.filter(c => c.id !== id));
      } catch {
        alert('Failed to delete committee.');
      }
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          onClick={() => { setEditing(null); setShowForm(!showForm); }}
          className={`btn ${showForm ? 'btn-secondary' : 'btn-primary'}`}
        >
          {showForm ? 'Cancel' : '+ Add Committee'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <h3 className="cardTitle" style={{ marginBottom: '1.25rem', paddingBottom: 0, borderBottom: 'none' }}>
            {editing ? `Editing: ${editing.name}` : 'Create New Committee'}
          </h3>
          <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {editing && <input type="hidden" name="committeeId" value={editing.id} />}
            {state?.error && (
              <div className="errorAlert">
                {state.error}
              </div>
            )}
            <div className="grid-cols-2">
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Committee Name</label>
                <input name="name" type="text" required defaultValue={editing?.name || ''} className="input-field" placeholder="e.g. Security Council" />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Room Number</label>
                <input name="roomNumber" type="text" required defaultValue={editing?.roomNumber || ''} className="input-field" placeholder="e.g. Room 101" />
              </div>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Assigned Chair (optional)</label>
              <select name="chairUserId" defaultValue={editing?.chairUserId || ''} className="select-field">
                <option value="">No Chair Assigned</option>
                {chairs.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={isPending} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              {isPending ? 'Saving...' : editing ? 'Save Changes' : 'Create Committee'}
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {committees.map(committee => (
          <div key={committee.id} className={`${styles.userRow} committee-item`}>
            <div className={styles.userInfo}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="font-semibold" style={{ fontSize: '0.95rem' }}>{committee.name}</span>
                <span className="badge badge-published">
                  {committee.roomNumber}
                </span>
              </div>
              <span className={styles.userEmail}>
                Chair: {committee.chairUser?.name || 'Unassigned'}
                {committee._count && ` • ${committee._count.users} delegates • ${committee._count.resolutions} resolutions`}
              </span>
            </div>
            <div className="flex-gap-2">
              <button onClick={() => { setEditing(committee); setShowForm(true); }} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                Edit
              </button>
              <button onClick={() => handleDelete(committee.id)} disabled={deleteTransition} className="btn btn-danger" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
