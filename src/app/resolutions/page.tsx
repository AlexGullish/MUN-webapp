import React from 'react';
import { getSession } from '../../lib/session';
import { prisma } from '../../lib/prisma';
import Navbar from '../../components/Navbar';
import ResolutionFilters from './ResolutionFilters';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import styles from './resolutions.module.css';

interface ResolutionsPageProps {
  searchParams: Promise<{
    search?: string;
    committee?: string;
    status?: string;
  }>;
}

export default async function ResolutionsPage({ searchParams }: ResolutionsPageProps) {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  // Await search parameters (Next.js 15+ convention)
  const params = await searchParams;
  const search = params.search || '';
  const committeeFilter = params.committee || '';
  const statusFilter = params.status || '';

  // Fetch list of all committees for filter dropdown
  const committees = await prisma.committee.findMany({
    orderBy: { name: 'asc' },
  });

  // Construct Prisma filter query
  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { title: { contains: search } },
      { topic: { contains: search } },
      { country: { contains: search } },
    ];
  }

  if (committeeFilter) {
    whereClause.committeeId = committeeFilter;
  }

  // Role visibility: DELEGATE can only view PUBLISHED resolutions
  if (session.role === 'DELEGATE') {
    whereClause.status = 'PUBLISHED';
  } else {
    // ADMIN / CHAIR can view and filter by status
    if (statusFilter) {
      whereClause.status = statusFilter;
    }
  }

  // Execute query
  const resolutions = await prisma.resolution.findMany({
    where: whereClause,
    include: {
      committee: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="animate-fade-in">
      <Navbar user={session} />

      <main className={styles.resolutionsWrapper}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Resolution Directory</h1>
          <p className={styles.subtitle}>
            Explore and review all active Model United Nations resolutions.
          </p>
        </div>

        {/* Filter component */}
        <ResolutionFilters
          committees={committees}
          showStatusFilter={session.role !== 'DELEGATE'}
        />

        {/* Grid listing */}
        <div className={styles.listGrid}>
          {resolutions.length > 0 ? (
            resolutions.map((res) => (
              <Link href={`/resolution/${res.id}`} key={res.id}>
                <div className={styles.resCard}>
                  <div className={styles.resHeader}>
                    <span className={styles.resTitle}>{res.title}</span>
                    <span
                      className={`badge ${
                        res.status === 'PUBLISHED'
                          ? 'badge-published'
                          : res.status === 'SUBMITTED'
                          ? 'badge-pending'
                          : 'badge-draft'
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>

                  <p className={styles.resTopic}>{res.topic}</p>

                  <div className={styles.resMeta}>
                    <div className={styles.metaItem}>
                      <span>Committee</span>
                      <span className={styles.metaValue}>{res.committee.name}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span>Sponsor Country</span>
                      <span className={styles.metaValue}>{res.country}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span>Upload Date</span>
                      <span className={styles.metaValue}>
                        {new Date(res.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className={styles.noResults}>
              <h3>No resolutions found</h3>
              <p className="text-muted">
                Try adjusting your search query or selecting a different committee filter.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
