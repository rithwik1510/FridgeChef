'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { passwordResetApi } from '@/lib/api';
import { isHttpError } from '@/lib/errors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Key, Copy, Check } from '@phosphor-icons/react';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    setError(null);
    try {
      const response = await passwordResetApi.request(data.email);
      if (response.reset_token) {
        setResetToken(response.reset_token);
      }
    } catch (err: unknown) {
      if (isHttpError(err, 404)) {
        setError('No account found with this email address.');
      } else if (isHttpError(err, 429)) {
        setError('Too many requests. Please try again later.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  const handleCopyToken = async () => {
    if (!resetToken) return;
    try {
      await navigator.clipboard.writeText(resetToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the text
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-cream-lightest bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cream-dark via-cream-lightest to-cream-lightest">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-terracotta/10 rounded-2xl flex items-center justify-center">
              <Key size={48} className="text-terracotta" weight="duotone" />
            </div>
          </div>
          <h1 className="text-4xl font-fraunces text-charcoal mb-2">Forgot Password</h1>
          <p className="text-charcoal/60 text-lg">
            {resetToken ? 'Use this token to reset your password.' : 'Enter your email to get a reset token.'}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 backdrop-blur-xl">
          {resetToken ? (
            <div className="space-y-6">
              {/* Token Display */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Your Reset Token</label>
                <div className="flex gap-2">
                  <code className="flex-1 bg-cream-dark px-4 py-3 rounded-xl text-sm text-charcoal break-all font-mono">
                    {resetToken}
                  </code>
                  <button
                    onClick={handleCopyToken}
                    className="flex-shrink-0 p-3 bg-cream-dark rounded-xl text-charcoal/70 hover:text-terracotta transition-colors"
                    title="Copy token"
                  >
                    {copied ? <Check size={20} weight="bold" className="text-sage" /> : <Copy size={20} weight="bold" />}
                  </button>
                </div>
                <p className="mt-2 text-xs text-charcoal/50">This token expires in 30 minutes.</p>
              </div>

              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={() => router.push('/reset-password')}
                className="font-fraunces"
              >
                Reset Password
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <Input
                label="Email"
                type="email"
                placeholder="chef@example.com"
                autoComplete="email"
                {...register('email')}
                error={errors.email?.message}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  isLoading={isSubmitting}
                  className="font-fraunces"
                >
                  Get Reset Token
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-3">
          <Link href="/login" className="text-sm text-charcoal/40 hover:text-charcoal/80 transition-colors">
            Back to Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
