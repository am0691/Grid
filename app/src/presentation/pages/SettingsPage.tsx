/**
 * SettingsPage
 * 사용자 설정 페이지
 */

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User,
  Bell,
  Key,
  Palette,
  Save,
  AlertCircle,
  CheckCircle2,
  LogOut,
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Profile settings
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // AI settings
  const [geminiApiKey, setGeminiApiKey] = useState('');

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [crisisAlerts, setCrisisAlerts] = useState(true);

  // Theme settings
  const [darkMode, setDarkMode] = useState(false);

  const handleSaveProfile = async () => {
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // TODO: Implement profile update API call
      console.log('Saving profile:', { name, email });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '저장에 실패했습니다.');
    }
  };

  const handleSaveAISettings = async () => {
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // TODO: Implement AI settings update API call
      console.log('Saving AI settings:', { geminiApiKey: '***' });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '저장에 실패했습니다.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">설정</h1>
        <p className="text-muted-foreground mt-2">
          계정 및 애플리케이션 설정을 관리합니다
        </p>
      </div>

      {saveSuccess && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>설정이 성공적으로 저장되었습니다.</AlertDescription>
        </Alert>
      )}

      {saveError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>프로필</CardTitle>
          </div>
          <CardDescription>개인 정보를 관리합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              disabled
            />
            <p className="text-xs text-muted-foreground">
              이메일 변경은 고객 지원을 통해 가능합니다
            </p>
          </div>
          <div className="pt-2">
            <Button onClick={handleSaveProfile}>
              <Save className="h-4 w-4 mr-2" />
              프로필 저장
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <CardTitle>AI 설정</CardTitle>
          </div>
          <CardDescription>
            AI 기능을 사용하기 위한 설정입니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gemini-api-key">Gemini API Key</Label>
            <Input
              id="gemini-api-key"
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="API 키를 입력하세요"
            />
            <p className="text-xs text-muted-foreground">
              AI 기반 추천 및 분석 기능을 사용하려면 Gemini API 키가 필요합니다.{' '}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                API 키 발급받기
              </a>
            </p>
          </div>
          <div className="pt-2">
            <Button onClick={handleSaveAISettings}>
              <Save className="h-4 w-4 mr-2" />
              AI 설정 저장
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>알림 설정</CardTitle>
          </div>
          <CardDescription>알림 수신 방법을 설정합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="email-notifications">이메일 알림</Label>
              <p className="text-sm text-muted-foreground">
                중요한 업데이트를 이메일로 받습니다
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="weekly-reports">주간 리포트</Label>
              <p className="text-sm text-muted-foreground">
                매주 영혼 양육 진행 상황을 받습니다
              </p>
            </div>
            <Switch
              id="weekly-reports"
              checked={weeklyReports}
              onCheckedChange={setWeeklyReports}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="crisis-alerts">위기 알림</Label>
              <p className="text-sm text-muted-foreground">
                영혼의 영적 위기 감지 시 즉시 알림을 받습니다
              </p>
            </div>
            <Switch
              id="crisis-alerts"
              checked={crisisAlerts}
              onCheckedChange={setCrisisAlerts}
            />
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <CardTitle>테마</CardTitle>
          </div>
          <CardDescription>화면 표시 설정을 변경합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="dark-mode">다크 모드</Label>
              <p className="text-sm text-muted-foreground">
                어두운 테마를 사용합니다
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>계정 관리</CardTitle>
          <CardDescription>계정 관련 작업을 수행합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">로그아웃</p>
              <p className="text-sm text-muted-foreground">
                현재 세션에서 로그아웃합니다
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              로그아웃
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
            <div>
              <p className="font-medium text-destructive">계정 삭제</p>
              <p className="text-sm text-muted-foreground">
                모든 데이터가 영구적으로 삭제됩니다
              </p>
            </div>
            <Button variant="destructive" disabled>
              삭제
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
