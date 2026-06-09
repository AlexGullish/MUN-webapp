import React from 'react';
import { getSession } from '../../lib/session';
import { prisma } from '../../lib/prisma';
import Navbar from '../../components/Navbar';
import AdminConsole from './AdminConsole';
import { redirect } from 'next/navigation';
import styles from './admin.module.css';

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session || session.role !== 'ADMIN') {
    redirect('/login');
  }

  // Fetch all data for admin overview
  const [users, committees, resolutions, pendingAmendmentsCount] = await Promise.all([
    prisma.user.findMany({
      include: { committee: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.committee.findMany({
      include: {
        chairUser: { select: { name: true } },
        _count: { select: { users: true, resolutions: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.resolution.findMany({
      include: { committee: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.amendment.count({ where: { status: 'PENDING' } }),
  ]);

  // Get chairs for committee assignment dropdown
  const chairs = users
    .filter((u) => u.role === 'CHAIR')
    .map((u) => ({ id: u.id, name: u.name }));

  return (
    <div className="animate-fade-in">
      <Navbar user={session} />

      <main className={styles.adminWrapper}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Admin Dashboard</h1>
          <p className={styles.pageSubtitle}>
            Conference oversight console. Manage users, committees, resolutions, and bulk import participants.
          </p>
        </div>

        <AdminConsole
          users={users}
          committees={committees}
          chairs={chairs}
          resolutions={resolutions}
          pendingAmendments={pendingAmendmentsCount}
        />
      </main>
    </div>
  );
}
