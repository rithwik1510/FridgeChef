'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth';
import { isHttpError } from '@/lib/errors';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChefHat } from '@phosphor-icons/react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    try {
      await registerUser(data.email, data.password, data.name);
      router.push('/dashboard');
    } catch (err: unknown) {
      if (isHttpError(err, 400)) {
        setError('Email already registered');
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-cream-lightest bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cream-dark via-cream-lightest to-cream-lightest">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-terracotta/10 rounded-2xl flex items-center justify-center">
              <ChefHat size={48} className="text-terracotta" weight="duotone" />
            </div>
          </div>
          <h1 className="text-4xl font-fraunces text-charcoal mb-2">Join the Kitchen</h1>
          <p className="text-charcoal/60 text-lg">Start cooking smarter today.</p>
        </div>

        {/* Register Card */}
        <div className="glass-card rounded-2xl p-8 backdrop-blur-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <Input
              label="Name"
              type="text"
              placeholder="Chef Ramsey"
              autoComplete="name"
              {...register('name')}
              error={errors.name?.message}
            />

            <Input
              label="Email"
              type="email"
              placeholder="chef@example.com"
              autoComplete="email"
              {...register('email')}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('password')}
              error={errors.password?.message}
              helperText="Must be at least 8 characters"
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
                Create Account
              </Button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-charcoal/60">
            <p>
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-terracotta font-semibold hover:text-terracotta-dark transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
           <Link href="/" className="text-sm text-charcoal/40 hover:text-charcoal/80 transition-colors">
             ← Back to Home
           </Link>
        </div>
      </div>
    </main>
  );
}
