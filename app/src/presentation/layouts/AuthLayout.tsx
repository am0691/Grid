/**
 * AuthLayout
 * 인증 페이지용 레이아웃 컴포넌트
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-br from-slate-900 via-blue-800 to-indigo-900 dark:from-slate-100 dark:via-blue-200 dark:to-indigo-100 bg-clip-text text-transparent mb-2">
            GRID
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            영적 성장 추적 시스템
          </p>
        </div>

        <Card className="border-2 backdrop-blur-sm bg-white/90 dark:bg-slate-900/90">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
            {description && (
              <CardDescription className="text-base">{description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  );
};
