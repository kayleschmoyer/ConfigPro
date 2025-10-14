import { motion } from 'framer-motion';
import { useState, type FormEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Loader } from '../../../components/elements/Loader';
import { useAuth } from '../../../hooks/useAuth';

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 }
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
    <motion.section
      className="relative w-full max-w-lg"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      <motion.form
        layout
        onSubmit={handleSubmit}
        className="relative flex w-full flex-col gap-6 overflow-hidden rounded-2xl border border-foreground/8 bg-background/85 px-8 py-10 shadow-lg shadow-primary/20 backdrop-blur-xl sm:px-10"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-background/60" />
        <div className="space-y-2 text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">
            Welcome back
          </p>
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Sign in to ConfigPro
          </h1>
          <p className="text-sm text-muted">
            Access your projects, orchestrate rollouts, and keep every location in sync.
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
        <Button type="submit" disabled={isLoading} className="w-full" size="lg">
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader /> Authenticating
            </span>
          ) : (
            'Sign in'
          )}
        </Button>
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
          <span className="h-px flex-1 bg-muted/40" />
          <span>or</span>
          <span className="h-px flex-1 bg-muted/40" />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogle}
          disabled={isLoading}
          className="w-full"
        >
          <span className="flex items-center justify-center gap-3">
            <svg
              aria-hidden
              className="h-5 w-5"
              viewBox="0 0 24 24"
              role="presentation"
            >
              <path
                fill="currentColor"
                d="M21.6 12.23c0-.68-.06-1.36-.18-2.02H12v3.83h5.4a4.62 4.62 0 0 1-2 3.03v2.5h3.24c1.9-1.75 2.96-4.34 2.96-7.34Z"
              />
              <path
                fill="currentColor"
                d="M12 22c2.7 0 4.96-.9 6.6-2.43l-3.24-2.5c-.9.6-2.06.94-3.36.94-2.58 0-4.78-1.74-5.56-4.08H3.02v2.58A10 10 0 0 0 12 22Z"
                opacity="0.6"
              />
              <path
                fill="currentColor"
                d="M6.44 13.93a5.98 5.98 0 0 1 0-3.86V7.49H3.02a10 10 0 0 0 0 9.02l3.42-2.58Z"
                opacity="0.6"
              />
              <path
                fill="currentColor"
                d="M12 6.88c1.46 0 2.76.5 3.8 1.49l2.86-2.86C16.96 3.6 14.7 2.67 12 2.67A10 10 0 0 0 3.02 7.5l3.42 2.58C7.22 8.52 9.42 6.88 12 6.88Z"
                opacity="0.6"
              />
            </svg>
            Continue with Google
          </span>
        </Button>
        {message && (
          <p className="rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-center text-xs font-medium text-accent">
            {message}
          </p>
        )}
      </motion.form>
    </motion.section>
  );
};
