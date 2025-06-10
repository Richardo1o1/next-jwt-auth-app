export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: 'admin' | 'user';
}

export interface DecodedToken {
  userId: string;
  role: string;
}