import { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useShopSettings } from '@/context/ShopSettingsContext';
import { cn } from '@/lib/utils';

export function AdminLoginPage() {
  const { signIn } = useAuth();
  const { settings } = useShopSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError(signInError);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="font-display text-3xl tracking-wide text-white">
            {settings?.shop_name || 'Sachdeva Mens Wear'}
          </span>
          <p className="text-sm text-primary-400 mt-1">Admin Dashboard Login</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h1 className="text-xl font-semibold text-primary-900 mb-6 text-center">
            Sign in to your account
          </h1>

          {error && (
            <div className="bg-error-50 border border-error-200 text-error-700 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="admin@example.com"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn('input pl-10 pr-10')}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-primary-200">
            <Link
              to="/"
              className="text-sm text-primary-500 hover:text-primary-900 flex items-center gap-1 justify-center"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
