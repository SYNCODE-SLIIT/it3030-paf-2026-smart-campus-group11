'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';

const navItems = [
  { label: 'Home',       href: '/' },
  { label: 'About',      href: '/about' },
  { label: 'Contact',    href: '/contact' },
  { label: 'Components', href: '/components' },
];

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <Navbar items={navItems} currentPath={pathname} />
      <main style={{ paddingTop: 80 }}>
        {children}
      </main>
    </>
  );
}
