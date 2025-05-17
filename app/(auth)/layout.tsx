export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 py-4 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
      {children}
    </div>
  );
} 