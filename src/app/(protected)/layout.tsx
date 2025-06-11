import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import type { JWTPayload } from 'jose';
import { redirect } from 'next/navigation';
import { SessionProvider } from '@/providers/session-provider';


// 定义我们期望从 token 中解码出的 payload 结构
interface DecodedTokenPayload extends JWTPayload {
  userId: string;
  username: string
  role: string
}

// 这是一个异步的服务器组件
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    redirect('/login');
  }

  const decodedToken = await verifyToken<DecodedTokenPayload>(accessToken, 'access');

  if (!decodedToken) {
    redirect('/login');
  }
  
  // 到这里，我们已经确认用户登录了，并且拿到了用户信息
  const currentUser = {
    id: decodedToken.userId,
    username: decodedToken.username,
    role: decodedToken.role
  };

  
  console.log("User authenticated in layout:", currentUser);

  return (
    <SessionProvider user={currentUser}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm p-4">
          <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-xl font-bold">My App</h1>
              <p className="text-sm">User: {currentUser.id} Role: <span className="font-semibold">{currentUser.role}</span></p>
          </div>
        </header>
        <main>
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}