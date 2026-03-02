/**
 * SignupPage
 * 회원가입 페이지 컴포넌트
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { AuthLayout } from '../layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { UserPlus, AlertCircle, CheckCircle2, Mail } from 'lucide-react';

// Zod 스키마 정의
const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, '이름은 2자 이상이어야 합니다.')
      .max(50, '이름은 50자를 초과할 수 없습니다.'),
    email: z
      .string()
      .email('올바른 이메일 형식이 아닙니다.')
      .min(1, '이메일을 입력해주세요.'),
    password: z
      .string()
      .min(8, '비밀번호는 8자 이상이어야 합니다.')
      .max(100, '비밀번호는 100자를 초과할 수 없습니다.'),
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signUp, loading } = useAuth();
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);

  const handleChange = (field: keyof SignupFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // 입력 시 해당 필드의 에러 제거
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      signupSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof SignupFormData, string>> = {};
        error.issues.forEach((err) => {
          const field = err.path[0] as keyof SignupFormData;
          if (!fieldErrors[field]) {
            fieldErrors[field] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    try {
      const result = await signUp(formData.email, formData.password, formData.name);

      if (result.emailConfirmationRequired) {
        // 이메일 인증이 필요한 경우 안내 메시지 표시
        setEmailConfirmationSent(true);
      } else {
        // 이메일 인증이 필요 없는 경우 바로 홈으로 이동
        navigate('/');
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
    }
  };

  // 이메일 인증 안내 화면
  if (emailConfirmationSent) {
    return (
      <AuthLayout
        title="이메일을 확인해주세요"
        description="회원가입이 거의 완료되었습니다"
      >
        <div className="space-y-6 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>

          <div className="space-y-2">
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">{formData.email}</span>
              로 인증 메일을 보냈습니다.
            </p>
            <p className="text-sm text-muted-foreground">
              받은편지함에서 인증 링크를 클릭하면 가입이 완료됩니다.
            </p>
          </div>

          <Alert className="text-left">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              메일이 보이지 않으면 스팸함을 확인해주세요.
            </AlertDescription>
          </Alert>

          <div className="pt-4">
            <Link
              to="/login"
              className="font-semibold text-primary hover:underline underline-offset-4 transition-colors"
            >
              로그인 페이지로 이동
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="회원가입"
      description="GRID에 가입하여 시작하세요"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {submitError && (
          <Alert variant="destructive" className="animate-in slide-in-from-top-1 duration-300">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              이름
              {formData.name && !errors.name && (
                <CheckCircle2 className="inline-block ml-1 h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              )}
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="홍길동"
              value={formData.name}
              onChange={handleChange('name')}
              disabled={loading}
              aria-invalid={!!errors.name}
              autoComplete="name"
              className="h-11"
            />
            {errors.name && (
              <p className="text-sm text-destructive animate-in fade-in duration-200">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              이메일
              {formData.email && !errors.email && (
                <CheckCircle2 className="inline-block ml-1 h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              )}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange('email')}
              disabled={loading}
              aria-invalid={!!errors.email}
              autoComplete="email"
              className="h-11"
            />
            {errors.email && (
              <p className="text-sm text-destructive animate-in fade-in duration-200">
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              비밀번호
              {formData.password && !errors.password && (
                <CheckCircle2 className="inline-block ml-1 h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              )}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange('password')}
              disabled={loading}
              aria-invalid={!!errors.password}
              autoComplete="new-password"
              className="h-11"
            />
            {errors.password && (
              <p className="text-sm text-destructive animate-in fade-in duration-200">
                {errors.password}
              </p>
            )}
            {!errors.password && formData.password && (
              <p className="text-xs text-muted-foreground">
                8자 이상 입력해주세요
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              비밀번호 확인
              {formData.confirmPassword &&
                formData.password === formData.confirmPassword &&
                !errors.confirmPassword && (
                  <CheckCircle2 className="inline-block ml-1 h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                )}
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              disabled={loading}
              aria-invalid={!!errors.confirmPassword}
              autoComplete="new-password"
              className="h-11"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive animate-in fade-in duration-200">
                {errors.confirmPassword}
              </p>
            )}
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
            <UserPlus className="mr-2 h-4 w-4" />
          )}
          {loading ? '가입 중...' : '회원가입'}
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            이미 계정이 있으신가요?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary hover:underline underline-offset-4 transition-colors"
            >
              로그인
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};
