import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Sprout, LogIn, Check, Sparkles, Shield, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { OAuthButtons } from '@/components/auth/OAuthButtons';

export function LoginPage() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  // If already authenticated, redirect directly to destination
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, redirectPath]);

  const rememberedEmail = localStorage.getItem('agri_remembered_email') || '';
  const [formData, setFormData] = useState({
    email: location.state?.email || rememberedEmail || '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedEmail));
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!formData.email.trim()) {
      setErrors((prev) => ({ ...prev, email: 'Email address is required' }));
      return;
    }
    if (!formData.password) {
      setErrors((prev) => ({ ...prev, password: 'Password is required' }));
      return;
    }

    setIsLoading(true);
    try {
      if (rememberMe) {
        localStorage.setItem('agri_remembered_email', formData.email.trim());
      } else {
        localStorage.removeItem('agri_remembered_email');
      }

      await login(formData);
      toast.success('Signed in successfully! Welcome back.');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      if (err.validationErrors) {
        setErrors(err.validationErrors);
      }
      toast.error(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (email, password) => {
    setFormData({ email, password });
    setIsLoading(true);
    try {
      if (rememberMe) {
        localStorage.setItem('agri_remembered_email', email);
      }
      await login({ email, password });
      toast.success(`Signed in as ${email.includes('admin') ? 'Administrator' : 'Farmer'}!`);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Quick login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-soft-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-600 text-white shadow-soft-sm mb-2 hover:bg-brand-700 transition-colors"
          >
            <Sprout className="w-7 h-7" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Sign in to manage your harvest listings, orders, and advisory
          </p>
        </div>

        {/* 1-Click Quick Demo Sign-in Box */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              1-Click Instant Sign-In
            </span>
            <span className="text-slate-400 font-normal">Pre-seeded accounts</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickLogin('user@agrimarket.com', 'User@123')}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/60 bg-white text-slate-800 hover:text-brand-800 transition-all shadow-soft-xs flex items-center justify-center gap-1.5"
            >
              <span>🚜</span>
              <span>Farmer Demo</span>
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickLogin('admin@agrimarket.com', 'Admin@123')}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 hover:border-slate-800 hover:bg-slate-100 bg-white text-slate-800 hover:text-slate-950 transition-all shadow-soft-xs flex items-center justify-center gap-1.5"
            >
              <span>🛡️</span>
              <span>Admin Demo</span>
            </button>
          </div>
        </div>

        {/* OAuth2 Providers (Google & GitHub) */}
        <OAuthButtons redirectPath={redirectPath} disabled={isLoading} />

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            or sign in with email
          </span>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="login-email"
            name="email"
            label="Email Address"
            type="email"
            autoComplete="username"
            placeholder="you@example.com"
            icon={Mail}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            disabled={isLoading}
            required
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Password <span className="text-rose-500">*</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              icon={Lock}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              disabled={isLoading}
              required
            />
          </div>

          {/* Remember Me Option */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500"
              />
              <span className="text-xs font-semibold text-slate-600">Remember my account</span>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
            icon={LogIn}
          >
            Sign In
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have an AgriMarket account?{' '}
          <Link to="/register" className="font-bold text-brand-700 hover:text-brand-800">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
export default LoginPage;
