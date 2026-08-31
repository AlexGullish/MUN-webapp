'use client';

import React, { useState, useActionState, useTransition, useRef, useEffect } from 'react';
import { createOrUpdateUserAction, deleteUserAction } from '../actions';
import styles from './admin.module.css';

interface CommitteeOption { id: string; name: string; }
interface UserType {
  id: string;
  name: string;
  email: string;
  role: string;
  school: string;
  country: string;
  loginCode: string;
  allergies?: string | null;
  committeeId?: string | null;
  committee?: { name: string } | null;
}

interface UserManagerProps {
  initialUsers: UserType[];
  committees: CommitteeOption[];
}

export default function UserManager({ initialUsers, committees }: UserManagerProps) {
  const [users, setUsers] = useState(initialUsers);
  const [editing, setEditing] = useState<UserType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [state, formAction, isPending] = useActionState(createOrUpdateUserAction, null);
  const [deleteTransition, startDeleteTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      window.location.reload();
    }
  }, [state]);

  const handleDelete = (id: string) => {
    if (!confirm('Delete this user? This action cannot be undone.')) return;
    startDeleteTransition(async () => {
      try {
        await deleteUserAction(id);
        setUsers(prev => prev.filter(u => u.id !== id));
      } catch {
        alert('Failed to delete user.');
      }
    });
  };

  const handleEdit = (user: UserType) => {
    setEditing(user);
    setShowForm(true);
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'badge-rejected',
    CHAIR: 'badge-pending',
    DELEGATE: 'badge-published',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          onClick={() => { setEditing(null); setShowForm(!showForm); }}
          className={`btn ${showForm ? 'btn-secondary' : 'btn-primary'}`}
        >
          {showForm ? 'Cancel' : '+ Add New User'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <h3 className="cardTitle" style={{ marginBottom: '1.25rem', paddingBottom: 0, borderBottom: 'none' }}>
            {editing ? `Editing: ${editing.name}` : 'Create New Account'}
          </h3>
          <form action={formAction} ref={formRef} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {editing && <input type="hidden" name="userId" value={editing.id} />}

            {state?.error && (
              <div className="errorAlert">
                {state.error}
              </div>
            )}

            <div className="grid-cols-2">
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Full Name</label>
                <input name="name" type="text" required defaultValue={editing?.name || ''} className="input-field" placeholder="Delegate Name" />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Email Address</label>
                <input name="email" type="email" required defaultValue={editing?.email || ''} className="input-field" placeholder="email@school.com" />
              </div>
            </div>
            <div className="grid-cols-2">
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Role</label>
                <select name="role" defaultValue={editing?.role || 'DELEGATE'} className="select-field">
                  <option value="DELEGATE">Delegate</option>
                  <option value="CHAIR">Chair</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Committee (optional)</label>
                <select name="committeeId" defaultValue={editing?.committeeId || ''} className="select-field">
                  <option value="">No Committee</option>
                  {committees.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid-cols-2">
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">School</label>
                <input name="school" type="text" required defaultValue={editing?.school || ''} className="input-field" placeholder="School or Academy Name" />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Country / Delegation</label>
                <input name="country" type="text" required defaultValue={editing?.country || ''} className="input-field" placeholder="Country" />
              </div>
            </div>
            <div className="grid-cols-2">
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Allergies (optional)</label>
                <input name="allergies" type="text" defaultValue={editing?.allergies || ''} className="input-field" placeholder="Nut allergy, etc." />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Custom Access Code (optional)</label>
                <input name="loginCode" type="text" defaultValue={''} className="input-field" placeholder="Leave blank to auto-generate" />
              </div>
            </div>

            <button type="submit" disabled={isPending} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              {isPending ? 'Saving...' : editing ? 'Save Changes' : 'Create Account'}
            </button>
          </form>
        </div>
      )}

      <div className={styles.userList}>
        {users.map(user => (
          <div key={user.id} className={styles.userRow}>
            <div className={styles.userInfo}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="font-semibold" style={{ fontSize: '0.95rem' }}>{user.name}</span>
                <span className={`badge ${roleColors[user.role] || 'badge-draft'}`}>
                  {user.role}
                </span>
              </div>
              <span className={styles.userEmail}>{user.email} • {user.country} • {user.school}</span>
              <span className={styles.userCode}>{user.loginCode}</span>
            </div>
            <div className="flex-gap-2">
              <button onClick={() => handleEdit(user)} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                Edit
              </button>
              <button onClick={() => handleDelete(user.id)} disabled={deleteTransition} className="btn btn-danger" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
