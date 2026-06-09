'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '../app/actions';
import styles from './Navbar.module.css';

interface NavbarProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    committeeId?: string | null;
    country: string;
    school: string;
  };
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  const getLinks = () => {
    switch (user.role) {
      case 'ADMIN':
        return [
          { name: 'Dashboard', path: '/admin' },
          { name: 'Resolutions', path: '/resolutions' },
          { name: 'Committee', path: '/committee' },
        ];
      case 'CHAIR':
        return [
          { name: 'Dashboard', path: '/chair' },
          { name: 'Resolutions', path: '/resolutions' },
          { name: 'Committee', path: '/committee' },
        ];
      default:
        return [
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Resolutions', path: '/resolutions' },
          { name: 'Committee', path: '/committee' },
        ];
    }
  };

  const links = getLinks();

  return (
    <nav className={styles.navWrapper}>
      <div className={styles.navContainer}>
        {/* Logo */}
        <Link href={user.role === 'ADMIN' ? '/admin' : user.role === 'CHAIR' ? '/chair' : '/dashboard'}>
          <div className={styles.logoArea}>
            <span className={styles.logoText}>MUN Portal</span>
            <span className={styles.logoTag}>{user.role}</span>
          </div>
        </Link>

        {/* Links */}
        <ul className={styles.navLinks}>
          {links.map((link) => {
            const isActive = pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path));
            return (
              <li key={link.name}>
                <Link
                  href={link.path}
                  className={`${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* User Profile & Logout */}
        <div className={styles.profileMenu}>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user.name}</div>
            <div className={styles.userRole}>
              {user.role === 'DELEGATE' ? `${user.country} • ${user.school}` : user.role}
            </div>
          </div>
          
          <form action={logoutAction}>
            <button type="submit" title="Logout" className={styles.logoutBtn}>
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
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
