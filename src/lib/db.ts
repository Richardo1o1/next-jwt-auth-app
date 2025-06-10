import { User } from '@/lib/definitions';
import { hashPassword } from '@/lib/password';

// 模拟用户表
export const users: User[] = [];

// 模拟 Refresh Token 存储。在生产环境中，这应该是一个数据库表。
export const validRefreshTokens = new Map<string, string>();

// 初始化模拟数据
(async () => {
    const adminPassword = await hashPassword('admin123');
    const userPassword = await hashPassword('user123');
    
    users.push({ id: 'user-1', username: 'admin', passwordHash: adminPassword, role: 'admin' });
    users.push({ id: 'user-2', username: 'user', passwordHash: userPassword, role: 'user' });
})();