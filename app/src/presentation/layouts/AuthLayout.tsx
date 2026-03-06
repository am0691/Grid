/**
 * AuthLayout
 * 인증 페이지용 레이아웃 컴포넌트
 * Deep indigo-to-violet gradient + glassmorphism card
 */

import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export const AuthLayout = ({ children, title, description }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center auth-bg p-4 relative overflow-hidden">
      {/* Background decorative orbs */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-glow-indigo mb-4">
            <span className="text-2xl font-extrabold text-white">G</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-foreground mb-1">
            GRID
          </h1>
          <p className="text-sm text-foreground/70 font-medium">
            영적 성장 추적 시스템
          </p>
        </div>

        {/* Card with glassmorphism */}
        <Card className="border border-white/10 backdrop-blur-xl bg-white/[0.12] shadow-modal">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">{title}</CardTitle>
            {description && (
              <CardDescription className="text-base text-foreground/60">{description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  );
};
