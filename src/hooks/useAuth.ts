import { useState } from 'react';

export interface Credentials {
  email: string;
  password: string;
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const login = async ({ email, password }: Credentials) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    return { email, token: `${btoa(email)}.${btoa(password)}` };
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsLoading(false);
    return { provider: 'google', token: 'google-demo-token' };
  };

  return { isLoading, login, loginWithGoogle };
};
