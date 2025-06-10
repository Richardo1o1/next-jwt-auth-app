"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // 组件加载时调用受保护的 API
    const fetchData = async () => {
      const res = await fetch('/api/data');
      if (!res.ok) {
        setError('Failed to fetch protected data. You might be logged out.');
        // 如果API调用失败（例如token过期），可以重定向到登录页
        // router.push('/login');
        return;
      }
      const json = await res.json();
      setData(json);
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p>Welcome! This page is protected.</p>
        
        <div className="bg-gray-100 p-4 rounded-lg text-left w-full max-w-md">
            <h2 className="font-bold text-lg mb-2 text-black">Protected API Data:</h2>
            {error && <p className="text-red-500">{error}</p>}
            {data ? (
                <pre className="text-sm text-black bg-white p-2 rounded">{JSON.stringify(data, null, 2)}</pre>
            ) : (
                <p className="text-gray-500">Loading data...</p>
            )}
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </main>
  );
}