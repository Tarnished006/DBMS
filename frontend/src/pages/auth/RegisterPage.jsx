import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Sprout, UserPlus, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { OAuthButtons } from '@/components/auth/OAuthButtons';

export function RegisterPage() {
  const { register, setUserMode, isAuthenticated, isLoading: authLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const [accountType, setAccountType] = useState('FARMER');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isExistingAccountError, setIsExistingAccountError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsExistingAccountError(false);

    if (!formData.fullName.trim()) {
      setErrors((prev) => ({ ...prev, fullName: 'Full name is required' }));
      return;
    }
    if (!formData.email.trim()) {
      setErrors((prev) => ({ ...prev, email: 'Email address is required' }));
      return;
    }
    if (!formData.password) {
      setErrors((prev) => ({ ...prev, password: 'Password is required' }));
      return;
    }
    if (formData.password.length < 8) {
      setErrors((prev) => ({ ...prev, password: 'Password must be at least 8 characters' }));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return;
    }

    setIsLoading(true);
    try {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        accountType: accountType,
      });
      setUserMode(accountType);
      toast.success('Account created & signed in successfully! Welcome to AgriMarket.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const errMsg = err?.message || '';
      const isAlreadyExists =
        errMsg.toLowerCase().includes('already') ||
        errMsg.toLowerCase().includes('exists') ||
        errMsg.toLowerCase().includes('cannot be used');

      if (isAlreadyExists) {
        setIsExistingAccountError(true);
        toast.error('This email is already registered. Please sign in with your password.');
      } else {
        if (err.validationErrors) {
          setErrors(err.validationErrors);
        }
        toast.error(errMsg || 'Registration failed. Please check the entered information.');
      }
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
            Create an Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Join thousands of verified farmers and agricultural buyers
          </p>
        </div>

        {/* OAuth2 Providers */}
        <OAuthButtons redirectPath="/dashboard" disabled={isLoading} />

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            or sign up with email
          </span>
        </div>

        {/* Existing Account Prompt (If email already registered) */}
        {isExistingAccountError && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-2 animate-fade-in">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Account Already Exists</span>
            </div>
            <p className="text-amber-800 leading-snug">
              An account with <strong>{formData.email}</strong> is already registered. You don't need to create a new one!
            </p>
            <Link
              to="/login"
              state={{ email: formData.email }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all shadow-soft-xs mt-1"
            >
              <span>Sign In with this Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Role Mode Selection (Farmer vs Buyer) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            I am joining primarily as:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAccountType('FARMER')}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                accountType === 'FARMER'
                  ? 'border-brand-600 bg-brand-50/60 shadow-soft-sm ring-2 ring-brand-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <span className="text-2xl">🚜</span>
                {accountType === 'FARMER' && (
                  <CheckCircle2 className="w-4 h-4 text-brand-600" />
                )}
              </div>
              <div>
                <p className="font-extrabold text-sm text-slate-900">Farmer / Grower</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Sell crops, track mandi rates, pooling
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAccountType('BUYER')}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                accountType === 'BUYER'
                  ? 'border-blue-600 bg-blue-50/60 shadow-soft-sm ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <span className="text-2xl">🛒</span>
                {accountType === 'BUYER' && (
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div>
                <p className="font-extrabold text-sm text-slate-900">Buyer / Consumer</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Buy fresh produce, bulk & wholesale
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="register-fullName"
            name="fullName"
            label="Full Name"
            placeholder="e.g. Ramesh Patil"
            autoComplete="name"
            icon={User}
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            error={errors.fullName}
            disabled={isLoading}
            required
          />

          <Input
            id="register-email"
            name="email"
            label="Email Address"
            type="email"
            autoComplete="email"
            placeholder="ramesh@example.com"
            icon={Mail}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            disabled={isLoading}
            required
          />

          <Input
            id="register-password"
            name="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            icon={Lock}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
            helperText="Must be minimum 8 characters with letters and numbers"
            disabled={isLoading}
            required
          />

          <Input
            id="register-confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat password"
            icon={Lock}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
            disabled={isLoading}
            required
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
            icon={UserPlus}
          >
            Create Account & Sign In
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{' '}
          <Link to="/login" state={{ email: formData.email }} className="font-bold text-brand-700 hover:text-brand-800">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
export default RegisterPage;
