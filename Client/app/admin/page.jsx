'use client';

import React from 'react';
import AdminDashboard from '../../components/AdminDashboard';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  return (
    <AdminDashboard 
      onNavigateHome={() => router.push('/')} 
    />
  );
}
