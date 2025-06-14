"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function RefreshingComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  useEffect(() => {
    // 这个 effect 会在组件挂载后立即执行
    async function performRefresh() {
      try {
        // 调用我们的刷新 API
        const response = await fetch('/api/auth/refresh', { method: 'POST' });

        if (!response.ok) {
          // 如果刷新失败，说明 refresh token 也过期了或无效
          // 直接将用户踢到登录页
          throw new Error('Failed to refresh session.');
        }

        // 刷新成功后，重定向到用户最初想访问的页面
        // 使用 router.replace 而不是 router.push，这样用户的浏览器历史记录中不会留下 /refreshing
        router.replace(redirectTo);

      } catch (error) {
        console.error(error);
        // 任何错误都导向登录页
        router.replace(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
      }
    }

    performRefresh();
  }, [router, redirectTo]); // 添加依赖项

  // 在刷新过程中，向用户显示一个友好的加载界面
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-700">Securing your session...</p>
        <p className="text-sm text-gray-500">Please wait a moment.</p>
        {/* 你可以在这里放一个加载动画（Spinner） */}
      </div>
    </div>
  );
}

// 使用 Suspense 来包裹组件，这是处理 useSearchParams 的推荐做法
export default function RefreshingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RefreshingComponent />
        </Suspense>
    );
}