"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }) {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in by verifying token
    const token = localStorage.getItem('checkmate_auth_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return <>{children}</>;
}
