"use client";

import React, { createContext, useContext } from 'react';

// 1. 定义用户数据的类型
// 我们也可以把它放在一个全局的 lib/definitions.ts 文件中
export interface UserSession {
  id: string;
  username: string;
  role: string;
}

// 2. 创建 Context
// 提供一个默认值 null，表示在 Provider 外部访问时没有会话
const SessionContext = createContext<UserSession | null>(null);

// 3. 创建 Provider 组件
interface SessionProviderProps {
  user: UserSession | null;
  children: React.ReactNode;
}

export function SessionProvider({ user, children }: SessionProviderProps) {
  // Provider 接收从服务器组件传来的 user 信息，并将其作为 value 提供给所有子组件
  return (
    <SessionContext.Provider value={user}>
      {children}
    </SessionContext.Provider>
  );
}

// 4. 创建一个自定义钩子，方便消费 Context
// 这是最佳实践，可以避免在每个消费者组件中都导入 useContext 和 SessionContext
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    // 这通常不应该发生，因为我们会确保在受保护的路由中使用这个钩子
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}