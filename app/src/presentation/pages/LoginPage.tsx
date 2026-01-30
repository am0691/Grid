/**
 * LoginPage
 * 로그인 페이지 컴포넌트
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthLayout } from '../layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { LogIn, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    }
  };

  return (
    <AuthLayout
      title="로그인"
      description="GRID에 오신 것을 환영합니다"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive" className="animate-in slide-in-from-top-1 duration-300">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
              className="h-11"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-base font-semibold"
          disabled={loading}
        >
          {loading ? (
            <Spinner className="mr-2" />
          ) : (
            <LogIn className="mr-2 h-4 w-4" />
          )}
          {loading ? '로그인 중...' : '로그인'}
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            계정이 없으신가요?{' '}
            <Link
              to="/signup"
              className="font-semibold text-primary hover:underline underline-offset-4 transition-colors"
            >
              회원가입
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};
