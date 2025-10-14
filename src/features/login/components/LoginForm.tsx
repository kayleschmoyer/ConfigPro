import { motion } from 'framer-motion';
import { useState, type FormEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Loader } from '../../../components/elements/Loader';
import { useAuth } from '../../../hooks/useAuth';

const formVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 }
};

export const LoginForm = () => {
  const { login, loginWithGoogle, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await login({ email, password });
    setMessage(`Authenticated as ${result.email}`);
  };

  const handleGoogle = async () => {
    const result = await loginWithGoogle();
    setMessage(`Connected via ${result.provider}`);
  };

  return (
    <motion.form
      variants={formVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.4, ease: 'easeOut' }}
      onSubmit={handleSubmit}
      className="card-shadow flex w-full flex-col gap-6 rounded-card border border-surface/40 bg-surface/60 p-8 backdrop-blur"
    >
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Welcome back</h1>
        <p className="text-sm text-muted">
          Sign in to configure your next retail experience.
        </p>
      </div>
      <Input
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Input
        label="Password"
        type="password"
        name="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader /> Authenticating
          </span>
        ) : (
          'Sign in'
        )}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogle}
        disabled={isLoading}
        className="w-full"
      >
        Continue with Google
      </Button>
      {message && <p className="text-center text-sm text-accent">{message}</p>}
    </motion.form>
  );
};
