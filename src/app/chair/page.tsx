import React from 'react';
import { getSession } from '../../lib/session';
import { prisma } from '../../lib/prisma';
import Navbar from '../../components/Navbar';
import ChairConsole from './ChairConsole';
import { redirect } from 'next/navigation';
import styles from './chair.module.css';

export default async function ChairDashboardPage() {
  const session = await getSession();
  
  if (!session || !['CHAIR', 'ADMIN'].includes(session.role)) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      committee: true,
    },
  });

  if (!user || !user.committee) {
    return (
      <div className="animate-fade-in">
        <Navbar user={session} />
        <div className={styles.errorCard}>
          <h2 className="text-danger">No Assigned Committee</h2>
          <p className="text-muted">
            Your account is registered as a Committee Chair, but you have not been assigned to any committee. Please contact the Secretariat Administrator to map your account.
          </p>
        </div>
      </div>
    );
  }

  const committee = user.committee;

  const resolutions = await prisma.resolution.findMany({
    where: { committeeId: committee.id },
    orderBy: { createdAt: 'desc' },
  });

  const amendments = await prisma.amendment.findMany({
    where: {
      resolution: {
        committeeId: committee.id,
      },
      status: 'PENDING',
    },
    include: {
      user: {
        select: {
          name: true,
          country: true,
        },
      },
      resolution: {
        select: {
          title: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const delegates = await prisma.user.findMany({
    where: {
      committeeId: committee.id,
      role: 'DELEGATE',
    },
    select: {
      id: true,
      name: true,
      email: true,
      school: true,
      country: true,
      allergies: true,
    },
    orderBy: { country: 'asc' },
  });

  return (
    <div className="animate-fade-in">
      <Navbar user={session} />

      <main className={styles.chairWrapper}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>
            Chair Console — {committee.name}
          </h1>
          <p className={styles.pageSubtitle}>
            Central cockpit to manage your assigned committee, publish resolutions, and review amendments. Assigned Room: <strong className="text-primary">{committee.roomNumber}</strong>
          </p>
        </div>

        <ChairConsole
          resolutions={resolutions}
          amendments={amendments}
          delegates={delegates}
        />
      </main>
    </div>
  );
}
