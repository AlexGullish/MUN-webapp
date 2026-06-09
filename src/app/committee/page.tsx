import React from 'react';
import { getSession } from '../../lib/session';
import { prisma } from '../../lib/prisma';
import Navbar from '../../components/Navbar';
import InteractiveMap from '../../components/InteractiveMap';
import { redirect } from 'next/navigation';
import styles from './committee.module.css';

export default async function CommitteePage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // For delegates, show only their committee
  // For chairs/admins, show all committees they can manage
  let committees;
  let userCommittee = null;

  if (session.role === 'DELEGATE') {
    userCommittee = await prisma.committee.findUnique({
      where: { id: session.committeeId || '' },
      include: {
        chairUser: true,
        users: {
          where: { role: 'DELEGATE' },
        },
        resolutions: {
          where: { status: { in: ['SUBMITTED', 'PUBLISHED'] } },
        },
      },
    });
  } else if (session.role === 'CHAIR') {
    // Chairs see their own committee
    userCommittee = await prisma.committee.findUnique({
      where: { id: session.committeeId || '' },
      include: {
        chairUser: true,
        users: {
          where: { role: 'DELEGATE' },
        },
        resolutions: true,
      },
    });
  } else {
    // Admins see all committees
    committees = await prisma.committee.findMany({
      include: {
        chairUser: true,
        users: {
          where: { role: 'DELEGATE' },
        },
        resolutions: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  // Single committee view (Delegate or Chair)
  if (session.role !== 'ADMIN' && userCommittee) {
    return (
      <div className="animate-fade-in">
        <Navbar user={session} />

        <main className={styles.committeeWrapper}>
          <div className={styles.pageHeader}>
            <h1 className={styles.title}>{userCommittee.name}</h1>
            <p className={styles.subtitle}>
              Committee room location and delegate information
            </p>
          </div>

           <div className={styles.singleCommittee}>
             {/* Committee Info */}
             <div className={styles.infoSection}>
               <h3 className={styles.sectionTitle}>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                   <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                   <circle cx="12" cy="10" r="3" />
                 </svg>
                 Room Information
               </h3>

              <div className={styles.roomBlock}>
                <div className={styles.roomLabel}>Room Number</div>
                <div className={styles.roomNumber}>
                  {userCommittee.roomNumber}
                </div>
              </div>

              {userCommittee.chairUser && (
                <div className={styles.roomBlock}>
                  <div className={styles.roomLabel}>Committee Chair</div>
                  <div className={styles.chairInfo}>
                    <div className={styles.chairAvatar}>
                      {userCommittee.chairUser.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <div className={styles.chairName}>{userCommittee.chairUser.name}</div>
                      <div className={styles.chairEmail}>
                        {userCommittee.chairUser.email}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.roomBlock}>
                <div className={styles.roomLabel}>Delegates Registered</div>
                <div className={styles.delegateCount}>
                  {userCommittee.users.length}
                </div>
              </div>
            </div>

             {/* Delegate List */}
             <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Registered Delegates
              </h3>

              <div className={styles.delegateList}>
                {userCommittee.users.length > 0 ? (
                  userCommittee.users.map((delegate) => (
                    <div key={delegate.id} className={styles.delegateItem}>
                      <div className={styles.delegateAvatar}>
                        {delegate.country.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className={styles.delegateName}>{delegate.name}</div>
                        <div className={styles.delegateCountry}>{delegate.country}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.noDelegates}>
                    No delegates registered yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Map */}
          <div className={styles.infoSection} style={{ marginTop: '1.5rem' }}>
            <h3 className={styles.sectionTitle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
              Venue Map
            </h3>
            <InteractiveMap roomNumber={userCommittee.roomNumber} />
          </div>
        </main>
      </div>
    );
  }

  // Admin view - show all committees
  return (
    <div className="animate-fade-in">
      <Navbar user={session} />

      <main className={styles.committeeWrapper}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>All Committees</h1>
          <p className={styles.subtitle}>
            Overview of all conference committees and their delegates
          </p>
        </div>

        <div className={styles.committeeGrid}>
          {committees && committees.length > 0 ? (
            committees.map((committee) => (
              <div key={committee.id} className={styles.committeeCard}>
                <div className={styles.committeeHeader}>
                  <div>
                    <h3 className={styles.committeeName}>{committee.name}</h3>
                    <span className={styles.committeeId}>
                      {committee.resolutions.length} resolution(s)
                    </span>
                  </div>
                  <div className={styles.roomInfo}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {committee.roomNumber}
                  </div>
                </div>

                <div className={styles.delegateCount}>
                  {committee.users.length} delegate(s) registered
                </div>

                {committee.chairUser && (
                  <div className={styles.chairInfo}>
                    <div className={styles.chairAvatar}>
                      {committee.chairUser.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <div className={styles.chairLabel}>Chair</div>
                      <div className={styles.chairName}>{committee.chairUser.name}</div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className={styles.noCommittees}>
              <h3>No Committees Created</h3>
              <p>Committees will appear here once they are created by administrators.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}