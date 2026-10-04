import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-shell p-4 sm:p-6">
      <div className="w-full max-w-md animate-[rise_400ms_ease-out]">{children}</div>
    </div>
  );
}
