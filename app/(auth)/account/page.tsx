'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { sampleProducts } from '@/lib/products';

const UserIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
);
const LockIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
);
const BellIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
);
const SubscriptionIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-1.5h5.25m-5.25 0h5.25m-5.25 0h5.25m-5.25 0h5.25M3 4.5h18a1.5 1.5 0 011.5 1.5v12A1.5 1.5 0 0121 19.5H3a1.5 1.5 0 01-1.5-1.5v-12A1.5 1.5 0 013 4.5z" /></svg>
);

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push('/login');
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (_event === 'USER_UPDATED' && session) {
            setUser(session.user);
            router.refresh();
        }
    });

    return () => {
        authListener.subscription.unsubscribe();
    };

  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const renderContent = () => {
    if (!user) return null;

    switch (activeTab) {
      case 'profile':
        return <ProfileContent user={user} />;
      case 'password':
        return <PasswordContent />;
      case 'subscriptions':
        return <SubscriptionsContent subscriptions={user.user_metadata.subscriptions} />;
      case 'notifications':
        return <NotificationsContent notifications={user.user_metadata.notifications} user={user} />;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-gray-50"><div className="text-lg font-medium text-gray-600">Loading Account...</div></div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
          <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
            <div className="space-y-1">
                <div className="px-3 py-2 flex items-center space-x-3">
                    <Image 
                        src={user.user_metadata.avatar_url || '/default-avatar.png'} 
                        alt="Profile" 
                        width={48} 
                        height={48} 
                        className="rounded-full object-cover"
                        onError={(e) => e.currentTarget.src = '/default-avatar.png'}
                    />
                    <div>
                        <p className="font-bold text-gray-800">{user.user_metadata.username || user.email}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                </div>
              <nav className="mt-4 space-y-1">
                <SidebarButton icon={<UserIcon />} label="Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                <SidebarButton icon={<LockIcon />} label="Password" isActive={activeTab === 'password'} onClick={() => setActiveTab('password')} />
                <SidebarButton icon={<BellIcon />} label="Notifications" isActive={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
                <SidebarButton icon={<SubscriptionIcon />} label="Subscriptions" isActive={activeTab === 'subscriptions'} onClick={() => setActiveTab('subscriptions')} />
              </nav>
            </div>
            <div className="mt-6">
                <button onClick={handleLogout} className="w-full flex items-center justify-center text-sm font-medium text-red-600 hover:bg-red-50 py-2 px-4 rounded-md">
                    Logout
                </button>
            </div>
          </aside>

          <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
            <div className="bg-white shadow-sm rounded-lg p-6">
                {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SidebarButton = ({ icon, label, isActive, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}>
    {React.cloneElement(icon, { className: `w-5 h-5 mr-3 ${isActive ? 'text-purple-500' : 'text-gray-400'}` })}
    <span>{label}</span>
  </button>
);

const ProfileContent = ({ user }) => {
    const [username, setUsername] = useState(user.user_metadata.username || '');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user.user_metadata.avatar_url || null);
    const [loading, setLoading] = useState(false);
    const avatarInputRef = useRef(null);

    const handleAvatarChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        let avatarUrl = user.user_metadata.avatar_url;

        if (avatarFile) {
            const filePath = `${user.id}/${Date.now()}_${avatarFile.name}`;
            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, avatarFile);

            if (uploadError) {
                toast.error('Failed to upload avatar: ' + uploadError.message);
                setLoading(false);
                return;
            }
            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
            avatarUrl = urlData.publicUrl;
        }

        const { error: updateError } = await supabase.auth.updateUser({
            data: { username, avatar_url: avatarUrl }
        });

        if (updateError) {
            toast.error('Failed to update profile: ' + updateError.message);
        } else {
            toast.success('Profile updated successfully!');
        }
        setLoading(false);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Profile</h2>
            <p className="text-sm text-gray-500 mb-6">This information will be displayed publicly.</p>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Photo</label>
                    <div className="mt-2 flex items-center space-x-4">
                        <Image 
                            src={avatarPreview || '/default-avatar.png'} 
                            alt="Profile Preview" 
                            width={64} 
                            height={64} 
                            className="rounded-full object-cover h-16 w-16"
                            onError={(e) => e.currentTarget.src = '/default-avatar.png'}
                        />
                        <input type="file" accept="image/*" onChange={handleAvatarChange} ref={avatarInputRef} className="hidden" />
                        <button type="button" onClick={() => avatarInputRef.current.click()} className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                            Change
                        </button>
                    </div>
                </div>
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                    <input type="text" name="username" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                    <input type="email" name="email" id="email" value={user.email} disabled className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 sm:text-sm" />
                </div>
                <div className="pt-6 mt-6 border-t border-gray-200 flex justify-end">
                    <button type="submit" disabled={loading} className="bg-purple-600 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300">
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const PasswordContent = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long.');
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
            toast.error('Failed to update password: ' + error.message);
        } else {
            toast.success('Password updated successfully!');
            setPassword('');
            setConfirmPassword('');
        }
        setLoading(false);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Change Password</h2>
            <p className="text-sm text-gray-500 mb-6">Update your password here.</p>
            <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div>
                    <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">New Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} name="new_password" id="new_password" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} name="confirm_password" id="confirm_password" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
                </div>
                <div className="pt-6 mt-6 border-t border-gray-200 flex justify-end">
                    <button type="submit" disabled={loading} className="bg-purple-600 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300">
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const SubscriptionsContent = ({ subscriptions }) => {
  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Subscriptions</h2>
        <p className="text-sm text-gray-500">You have no active subscriptions.</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">My Subscriptions</h2>
      <p className="text-sm text-gray-500 mb-6">Manage your product subscriptions and trials.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subscriptions.map(sub => {
          const product = sampleProducts.find(p => p.id === sub.productId);
          return (
            <div key={sub.productId} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300 ease-in-out">
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-xl text-gray-900 mb-2">{sub.name}</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${sub.status === 'trialing' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {sub.status === 'trialing' ? 'Trial Active' : 'Active'}
                  </span>
                </div>
                {sub.status === 'trialing' && (
                  <p className="text-sm text-gray-600 mb-4">
                    Trial ends on: <span className="font-semibold text-gray-800">{formatDate(sub.trialEndsAt)}</span>
                  </p>
                )}
              </div>
              {product && (
                <div className="bg-gray-50 p-4 flex items-center space-x-3">
                  <button
                    onClick={() => toast('Redirecting to subscription page...')}
                    className="flex-1 text-center bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-300"
                  >
                    Subscribe
                  </button>
                  <button
                    onClick={() => toast.success('Thank you for rating!')}
                    className="flex-1 text-center bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors duration-300"
                  >
                    Rate Product
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
};

const NotificationsContent = ({ notifications, user }) => {
    const [settings, setSettings] = useState(user.user_metadata.notification_settings || { product_updates: true, weekly_digest: false });
    const [loading, setLoading] = useState(false);

    const handleSettingChange = (e) => {
        const { name, checked } = e.target;
        setSettings(prev => ({ ...prev, [name]: checked }));
    };

    const handleSettingsUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.updateUser({ data: { notification_settings: settings } });
        if (error) {
            toast.error('Failed to save settings: ' + error.message);
        } else {
            toast.success('Notification settings saved!');
        }
        setLoading(false);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Notifications</h2>
            <p className="text-sm text-gray-500 mb-6">Manage your notification preferences.</p>
            <form onSubmit={handleSettingsUpdate} className="space-y-5">
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input id="product_updates" name="product_updates" type="checkbox" checked={settings.product_updates} onChange={handleSettingChange} className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="product_updates" className="font-medium text-gray-700">Product Updates</label>
                        <p className="text-gray-500">Get notified about new products and feature updates.</p>
                    </div>
                </div>
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input id="weekly_digest" name="weekly_digest" type="checkbox" checked={settings.weekly_digest} onChange={handleSettingChange} className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="weekly_digest" className="font-medium text-gray-700">Weekly Digest</label>
                        <p className="text-gray-500">Receive a weekly summary of activity.</p>
                    </div>
                </div>
                <div className="pt-6 mt-6 border-t border-gray-200 flex justify-end">
                    <button type="submit" disabled={loading} className="bg-purple-600 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300">
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
            
            <h3 className="text-xl font-bold text-gray-800 mt-10 mb-4">Recent Notifications</h3>
            <div className="space-y-4">
              {notifications && notifications.length > 0 ? (
                notifications.slice(0, 5).map(notif => (
                  <div key={notif.id} className={`p-4 rounded-lg flex items-start space-x-3 ${notif.read ? 'bg-gray-50' : 'bg-blue-50'}`}>
                    <div className={`mt-1 w-2.5 h-2.5 rounded-full ${notif.read ? 'bg-gray-300' : 'bg-blue-500'}`}></div>
                    <div>
                      <p className={`text-sm ${notif.read ? 'text-gray-600' : 'text-gray-800 font-semibold'}`}>{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">You have no new notifications.</p>
              )}
            </div>
        </div>
    );
};
