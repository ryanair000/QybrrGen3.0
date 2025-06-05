'use client';

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UserProfile {
  email: string;
  // Add other user profile fields as needed (e.g., name, membershipType)
}

export default function ProfilePage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error.message);
        // Redirect to login if no user session
        router.push('/login');
      } else if (user) {
        setUserProfile({ email: user.email! }); // Assuming email is always present
      } else {
        router.push('/login'); // No user, redirect to login
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [router]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      router.push('/login'); // Redirect to login after sign out
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300">Loading profile...</p>
      </div>
    );
  }

  if (!userProfile) {
    return null; // Should ideally be handled by redirect in useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-lg shadow-lg dark:bg-gray-800">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            User Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Welcome, {userProfile.email}!
          </p>
        </div>
        <div className="mt-8 space-y-6">
          {/* Add more profile fields here */}
          <button
            onClick={handleSignOut}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
} 