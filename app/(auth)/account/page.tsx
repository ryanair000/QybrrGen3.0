'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { sampleProducts } from '@/lib/products';

const UserIcon = ({ className = 'w-6 h-6' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
    />
  </svg>
);

const LockIcon = ({ className = 'w-5 h-5' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
      clipRule="evenodd"
    />
  </svg>
);

const BellIcon = ({ className = 'w-5 h-5' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
  </svg>
);

const BackArrowIcon = ({ className = 'w-5 h-5' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
    />
  </svg>
);

const SubscriptionIcon = ({ className = 'w-5 h-5' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-1.5h5.25m-5.25 0h5.25m-5.25 0h5.25m-5.25 0h5.25M3 4.5h18a1.5 1.5 0 011.5 1.5v12A1.5 1.5 0 0121 19.5H3a1.5 1.5 0 01-1.5-1.5v-12A1.5 1.5 0 013 4.5z"
    />
  </svg>
);

type AccountTab = 'profile' | 'password' | 'notifications' | 'subscriptions';

type Subscription = {
  productId: string;
  name: string;
  status: string;
  trialEndsAt?: string;
};

type NotificationSettings = {
  product_updates: boolean;
  weekly_digest: boolean;
  [key: string]: boolean;
};

type AccountNotification = {
  id: string;
  type?: string;
  message: string;
  read: boolean;
  createdAt: string;
};

type AccountUser = User & {
  user_metadata: {
    username?: string;
    avatar_url?: string;
    subscriptions?: Subscription[];
    notifications?: AccountNotification[];
    notification_settings?: NotificationSettings;
  };
};

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<AccountUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AccountTab>('profile');

  useEffect(() => {
    const supabaseClient = supabase;

    if (!supabaseClient) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      const { data, error } = await supabaseClient.auth.getUser();
      if (error || !data.user) {
        router.push('/login');
      } else {
        setUser(data.user as AccountUser);
      }
      setLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'USER_UPDATED' && session?.user) {
          setUser(session.user as AccountUser);
          router.refresh();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    const supabaseClient = supabase;

    if (!supabaseClient) {
      return;
    }

    await supabaseClient.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const renderContent = () => {
    if (!user) {
      return null;
    }

    switch (activeTab) {
      case 'profile':
        return <ProfileContent user={user} />;
      case 'password':
        return <PasswordContent />;
      case 'subscriptions':
        return (
          <ProductAccessContent
            subscriptions={user.user_metadata.subscriptions || []}
          />
        );
      case 'notifications':
        return (
          <NotificationsContent
            notifications={user.user_metadata.notifications || []}
            user={user}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-lg font-medium text-gray-600">
          Loading Account...
        </div>
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-center">
        <p className="text-gray-700">
          Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to
          enable the account area.
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-gray-600 transition-colors hover:text-purple-700"
          >
            <BackArrowIcon className="mr-2" />
            Back to Home
          </Link>
        </div>
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
          <aside className="py-6 px-2 sm:px-6 lg:col-span-3 lg:px-0 lg:py-0">
            <div className="space-y-1">
              <div className="flex items-center space-x-3 px-3 py-2">
                <Image
                  src={
                    user.user_metadata.avatar_url ||
                    '/img/3d-rendering-cute-robot.jpg'
                  }
                  alt="Profile"
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-gray-800">
                    {user.user_metadata.username || user.email}
                  </p>
                  <p className="truncate text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <nav className="mt-4 space-y-1">
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
                <SidebarButton
                  icon={<SubscriptionIcon />}
                  label="Product Access"
                  isActive={activeTab === 'subscriptions'}
                  onClick={() => setActiveTab('subscriptions')}
                />
              </nav>
            </div>
            <div className="mt-6">
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center rounded-md py-2 px-4 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </aside>

          <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SidebarButton = ({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactElement<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex w-full items-center rounded-md px-3 py-2 text-sm font-medium ${
      isActive
        ? 'bg-purple-100 text-purple-700'
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {React.cloneElement(icon, {
      className: `w-5 h-5 mr-3 ${
        isActive ? 'text-purple-500' : 'text-gray-400'
      }`,
    })}
    <span>{label}</span>
  </button>
);

const ProfileContent = ({ user }: { user: AccountUser }) => {
  const [username, setUsername] = useState(user.user_metadata.username || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.user_metadata.avatar_url || null
  );
  const [loading, setLoading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    let avatarUrl = user.user_metadata.avatar_url;
    const supabaseClient = supabase;

    if (!supabaseClient) {
      toast.error('Supabase is not configured.');
      setLoading(false);
      return;
    }

    if (avatarFile) {
      const filePath = `${user.id}/${Date.now()}_${avatarFile.name}`;
      const { error: uploadError } = await supabaseClient.storage
        .from('avatars')
        .upload(filePath, avatarFile);

      if (uploadError) {
        toast.error('Failed to upload avatar: ' + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabaseClient.storage
        .from('avatars')
        .getPublicUrl(filePath);
      avatarUrl = urlData.publicUrl;
    }

    const { error: updateError } = await supabaseClient.auth.updateUser({
      data: { username, avatar_url: avatarUrl },
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
      <h2 className="mb-1 text-2xl font-bold text-gray-800">Profile</h2>
      <p className="mb-6 text-sm text-gray-500">
        This information will be displayed publicly.
      </p>
      <form onSubmit={handleProfileUpdate} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Photo
          </label>
          <div className="mt-2 flex items-center space-x-4">
            <Image
              src={avatarPreview || '/img/3d-rendering-cute-robot.jpg'}
              alt="Profile Preview"
              width={64}
              height={64}
              className="h-16 w-16 rounded-full object-cover"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              ref={avatarInputRef}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Change
            </button>
          </div>
        </div>
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Username
          </label>
          <input
            type="text"
            name="username"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={user.email || ''}
            disabled
            className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 py-2 px-3 shadow-sm sm:text-sm"
          />
        </div>
        <div className="mt-6 flex justify-end border-t border-gray-200 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300"
          >
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

  const handlePasswordUpdate = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    const supabaseClient = supabase;
    if (!supabaseClient) {
      toast.error('Supabase is not configured.');
      return;
    }

    setLoading(true);
    const { error } = await supabaseClient.auth.updateUser({ password });
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
      <h2 className="mb-1 text-2xl font-bold text-gray-800">
        Change Password
      </h2>
      <p className="mb-6 text-sm text-gray-500">Update your password here.</p>
      <form onSubmit={handlePasswordUpdate} className="space-y-6">
        <div>
          <label
            htmlFor="new_password"
            className="block text-sm font-medium text-gray-700"
          >
            New Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            name="new_password"
            id="new_password"
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="confirm_password"
            className="block text-sm font-medium text-gray-700"
          >
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            name="confirm_password"
            id="confirm_password"
            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm"
          />
        </div>
        <div className="mt-6 flex justify-end border-t border-gray-200 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

const ProductAccessContent = ({
  subscriptions,
}: {
  subscriptions: Subscription[];
}) => {
  if (!subscriptions.length) {
    return (
      <div>
        <h2 className="mb-1 text-2xl font-bold text-gray-800">Product Access</h2>
        <p className="text-sm text-gray-500">
          You have no active product access.
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold text-gray-800">
        Product Access
      </h2>
      <p className="mb-6 text-sm text-gray-500">
        Manage your active product access.
      </p>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {subscriptions.map((sub) => {
          const product = sampleProducts.find((item) => item.id === sub.productId);
          return (
            <div
              key={sub.productId}
              className="flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition-shadow duration-300 ease-in-out hover:shadow-lg"
            >
              <div className="flex-grow p-6">
                <div className="flex items-start justify-between">
                  <h3 className="mb-2 text-xl font-bold text-gray-900">
                    {sub.name}
                  </h3>
                  <span
                    className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800"
                  >
                    Active Access
                  </span>
                </div>
                {sub.trialEndsAt && (
                  <p className="mb-4 text-sm text-gray-600">
                    Access record updated:{' '}
                    <span className="font-semibold text-gray-800">
                      {formatDate(sub.trialEndsAt)}
                    </span>
                  </p>
                )}
                {product && (
                  <p className="text-sm text-gray-600">{product.accessNote}</p>
                )}
              </div>
              {product && (
                <div className="bg-gray-50 p-4">
                  <Link
                    href={product.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg bg-purple-600 px-4 py-2 text-center text-sm font-semibold text-white transition-colors duration-300 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    {product.ctaLabel}
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const NotificationsContent = ({
  notifications,
  user,
}: {
  notifications: AccountNotification[];
  user: AccountUser;
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(
    user.user_metadata.notification_settings || {
      product_updates: true,
      weekly_digest: false,
    }
  );
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<AccountNotification | null>(null);
  const [localNotifications, setLocalNotifications] =
    useState<AccountNotification[]>(notifications);

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSettingsUpdate = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    const supabaseClient = supabase;

    if (!supabaseClient) {
      toast.error('Supabase is not configured.');
      return;
    }

    setLoading(true);
    const { error } = await supabaseClient.auth.updateUser({
      data: { notification_settings: settings },
    });
    if (error) {
      toast.error('Failed to save settings: ' + error.message);
    } else {
      toast.success('Notification settings saved!');
    }
    setLoading(false);
  };

  const handleNotificationClick = (notification: AccountNotification) => {
    setSelectedNotification(notification);
    if (!notification.read) {
      const updatedNotifications = localNotifications.map((item) =>
        item.id === notification.id ? { ...item, read: true } : item
      );
      setLocalNotifications(updatedNotifications);
      if (supabase) {
        supabase.auth.updateUser({ data: { notifications: updatedNotifications } });
      }
    }
  };

  return (
    <>
      <div>
        <h2 className="mb-1 text-2xl font-bold text-gray-800">
          Notifications
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          Manage your notification preferences.
        </p>
        <form onSubmit={handleSettingsUpdate} className="space-y-5">
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="product_updates"
                name="product_updates"
                type="checkbox"
                checked={settings.product_updates}
                onChange={handleSettingChange}
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor="product_updates"
                className="font-medium text-gray-700"
              >
                Product Updates
              </label>
              <p className="text-gray-500">
                Get notified about new products and feature updates.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="weekly_digest"
                name="weekly_digest"
                type="checkbox"
                checked={settings.weekly_digest}
                onChange={handleSettingChange}
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor="weekly_digest"
                className="font-medium text-gray-700"
              >
                Weekly Digest
              </label>
              <p className="text-gray-500">
                Receive a weekly summary of activity.
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-end border-t border-gray-200 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>

        <h3 className="mt-10 mb-4 text-xl font-bold text-gray-800">
          Recent Notifications
        </h3>
        <div className="space-y-4">
          {localNotifications.length > 0 ? (
            localNotifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`flex cursor-pointer items-start space-x-3 rounded-lg p-4 transition-all duration-200 ${
                  notification.read
                    ? 'bg-gray-50 hover:bg-gray-100'
                    : 'bg-blue-50 hover:bg-blue-100'
                }`}
              >
                <div
                  className={`mt-1 h-2.5 w-2.5 rounded-full ${
                    notification.read ? 'bg-gray-300' : 'bg-blue-500'
                  }`}
                />
                <div>
                  <p
                    className={`text-sm ${
                      notification.read
                        ? 'text-gray-600'
                        : 'font-semibold text-gray-800'
                    }`}
                  >
                    {notification.message}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              You have no new notifications.
            </p>
          )}
        </div>
      </div>

      {selectedNotification && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300"
          onClick={() => setSelectedNotification(null)}
        >
          <div
            className="m-4 w-full max-w-md scale-95 transform rounded-2xl bg-white shadow-2xl transition-all duration-300 hover:scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-lg font-bold text-gray-900">
                  Notification Details
                </h4>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <p className="mb-4 text-gray-700">{selectedNotification.message}</p>
              <p className="text-right text-xs text-gray-400">
                Received on{' '}
                {new Date(selectedNotification.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
