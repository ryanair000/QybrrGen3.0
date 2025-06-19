'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

// Define a type for the profile data for better type safety
type Profile = {
  id: string;
  created_at: string;
  updated_at: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Error getting session:', sessionError);
        setError('Could not fetch user session.');
        setLoading(false);
        return;
      }

      if (!session) {
        // If no session, redirect to login
        router.push('/login');
        return;
      }

      setUser(session.user);

      // Fetch profile data from 'profiles' table
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single(); // Use .single() as ID is primary key

        if (profileError) {
          // Handle cases where the profile might not exist yet (though trigger should prevent this)
          if (profileError.code === 'PGRST116') { // PostgREST error code for no rows found
            console.warn('Profile not found for user:', session.user.id);
            // Optionally create a profile here if the trigger failed?
          } else {
            throw profileError;
          }
        }
        setProfile(profileData as Profile);
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.message || 'Failed to fetch profile data.');
      }

      setLoading(false);
    };

    fetchUserProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        Error: {error}
      </div>
    );
  }

  if (!user) {
    // Should have been redirected, but as a fallback
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        Your Profile
      </h1>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
            <dd className="mt-1 text-base text-gray-900 dark:text-white">{user.email || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</dt>
            <dd className="mt-1 text-base text-gray-900 dark:text-white">{profile?.username || 'Not set'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</dt>
            <dd className="mt-1 text-base text-gray-900 dark:text-white">{profile?.full_name || 'Not set'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Website</dt>
            <dd className="mt-1 text-base text-gray-900 dark:text-white">{profile?.website ? <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline dark:text-indigo-400">{profile.website}</a> : 'Not set'}</dd>
          </div>
           <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</dt>
            <dd className="mt-1 text-xs text-gray-700 dark:text-gray-300">{user.id}</dd>
          </div>
           <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Profile Last Updated</dt>
            <dd className="mt-1 text-xs text-gray-700 dark:text-gray-300">{profile ? new Date(profile.updated_at).toLocaleString() : 'N/A'}</dd>
          </div>
        </dl>
        {/* TODO: Add button/link to an Edit Profile page */}
        {/* <div className="mt-6">
          <button className="text-indigo-600 hover:underline dark:text-indigo-400">Edit Profile</button>
        </div> */}
      </div>
    </div>
  );
} 