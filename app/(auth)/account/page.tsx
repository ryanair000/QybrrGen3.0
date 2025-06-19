'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      } else {
        router.push('/login'); // Redirect to login if not authenticated
      }
      setLoading(false);
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Or a redirect component
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">My Account</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Username</label>
            <p className="text-lg text-gray-900">{user.user_metadata.username || 'Not set'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <p className="text-lg text-gray-900">{user.email}</p>
          </div>
        </div>
        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-600 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
