'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

// SVG Icon Components
const UserIcon = ({ className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const LockIcon = ({ className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
  </svg>
);

const BellIcon = ({ className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
  </svg>
);

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      } else {
        router.push('/login');
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
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-300 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileContent user={user} />;
      case 'password':
        return <PasswordContent />;
      case 'notifications':
        return <NotificationsContent />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar */}
          <aside className="md:w-64 flex-shrink-0">
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-2xl font-bold">
                  {user.user_metadata.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-lg text-gray-800 truncate">{user.user_metadata.username}</h2>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <nav className="space-y-1">
                <SidebarButton
                  icon={<UserIcon />}
                  label="Profile"
                  isActive={activeTab === 'profile'}
                  onClick={() => setActiveTab('profile')}
                />
                <SidebarButton
                  icon={<LockIcon />}
                  label="Password"
                  isActive={activeTab === 'password'}
                  onClick={() => setActiveTab('password')}
                />
                <SidebarButton
                  icon={<BellIcon />}
                  label="Notifications"
                  isActive={activeTab === 'notifications'}
                  onClick={() => setActiveTab('notifications')}
                />
              </nav>
            </div>
            <div className="mt-6">
                <button 
                    onClick={handleLogout}
                    className="w-full text-left text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 p-3 rounded-md transition-colors duration-200"
                >
                    Log Out
                </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white p-8 rounded-xl shadow-sm min-h-[400px]">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

const SidebarButton = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 p-3 rounded-md text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'bg-purple-50 text-purple-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const ProfileContent = ({ user }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-800 mb-1">Profile</h2>
    <p className="text-sm text-gray-500 mb-6">This information will be displayed publicly so be careful what you share.</p>
    <form className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input type="text" id="username" defaultValue={user.user_metadata.username} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-gray-50 text-gray-500" disabled />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input type="email" id="email" defaultValue={user.email} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-gray-50 text-gray-500" disabled />
            </div>
        </div>
        <div className="pt-4 flex justify-end">
            <button type="submit" className="bg-purple-600 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300" disabled>
                Update Profile
            </button>
        </div>
    </form>
  </div>
);

const PasswordContent = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Change Password</h2>
      <p className="text-sm text-gray-500 mb-6">Choose a strong password to keep your account secure.</p>
      <form className="space-y-6 max-w-sm">
          <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input type="password" id="current-password" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500" />
          </div>
          <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" id="new-password" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500" />
          </div>
          <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input type="password" id="confirm-password" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500" />
          </div>
          <div className="pt-4 flex justify-end">
            <button type="submit" className="bg-purple-600 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                Update Password
            </button>
        </div>
      </form>
    </div>
);

const NotificationsContent = () => (
    <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Notifications</h2>
        <p className="text-sm text-gray-500 mb-6">Manage how you receive notifications.</p>
        <div className="space-y-5">
            <div className="flex items-start">
                <div className="flex items-center h-5">
                    <input id="comments" name="comments" type="checkbox" className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded" />
                </div>
                <div className="ml-3 text-sm">
                    <label htmlFor="comments" className="font-medium text-gray-700">Comments</label>
                    <p className="text-gray-500">Get notified when someones posts a comment on a posting.</p>
                </div>
            </div>
            <div className="flex items-start">
                <div className="flex items-center h-5">
                    <input id="candidates" name="candidates" type="checkbox" className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded" />
                </div>
                <div className="ml-3 text-sm">
                    <label htmlFor="candidates" className="font-medium text-gray-700">Candidates</label>
                    <p className="text-gray-500">Get notified when a candidate applies for a job.</p>
                </div>
            </div>
        </div>
        <div className="pt-6 mt-6 border-t border-gray-200 flex justify-end">
            <button type="submit" className="bg-purple-600 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                Save
            </button>
        </div>
    </div>
);
