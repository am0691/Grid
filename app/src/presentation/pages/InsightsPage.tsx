/**
 * InsightsPage
 * 분석 및 인사이트 페이지
 */

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  Activity,
  Target,
  Lightbulb,
  BarChart3,
  Calendar,
  Users,
  AlertCircle,
  Info,
} from 'lucide-react';

type TimeRange = 'week' | 'month' | 'quarter' | 'year';

export const InsightsPage = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  // Mock data - replace with actual data
  const hasEnoughData = false; // Set to true when sufficient evaluations exist

  return (
    <div className="container max-w-7xl py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">인사이트</h1>
          <p className="text-muted-foreground mt-2">
            활동 효과성과 영적 성장 패턴을 분석합니다
          </p>
        </div>
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
          <TabsList>
            <TabsTrigger value="week">주간</TabsTrigger>
            <TabsTrigger value="month">월간</TabsTrigger>
            <TabsTrigger value="quarter">분기</TabsTrigger>
            <TabsTrigger value="year">연간</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {!hasEnoughData && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            인사이트를 생성하기 위해서는 최소 10회 이상의 활동 평가가 필요합니다.
            <br />
            활동을 수행하고 평가를 진행해주세요.
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">총 활동</p>
                <p className="text-2xl font-bold">
                  {hasEnoughData ? '48' : '-'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            {hasEnoughData && (
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-green-600">+12%</span> 지난달 대비
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">평균 효과성</p>
                <p className="text-2xl font-bold">
                  {hasEnoughData ? '4.2' : '-'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
            {hasEnoughData && (
              <p className="text-xs text-muted-foreground mt-2">
                5점 만점 기준
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">돌파 횟수</p>
                <p className="text-2xl font-bold">
                  {hasEnoughData ? '7' : '-'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            {hasEnoughData && (
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-green-600">+3</span> 지난달 대비
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">위기 대응</p>
                <p className="text-2xl font-bold">
                  {hasEnoughData ? '3' : '-'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            {hasEnoughData && (
              <p className="text-xs text-muted-foreground mt-2">
                평균 대응 시간: 2일
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Effectiveness Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <CardTitle>활동 효과성 추이</CardTitle>
          </div>
          <CardDescription>
            시간에 따른 활동 효과성 변화를 확인합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
            <div className="text-center space-y-2">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">
                {hasEnoughData
                  ? '차트가 여기에 표시됩니다'
                  : '데이터를 수집하는 중입니다'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Challenge Analysis */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <CardTitle>도전 분석</CardTitle>
            </div>
            <CardDescription>
              가장 많이 겪는 어려움과 극복 패턴
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hasEnoughData ? (
                <>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">시간 관리</p>
                      <p className="text-sm text-muted-foreground">
                        15회 언급
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        80% 극복
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">관계 형성</p>
                      <p className="text-sm text-muted-foreground">
                        12회 언급
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        75% 극복
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">영적 침체</p>
                      <p className="text-sm text-muted-foreground">
                        8회 언급
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-amber-600">
                        60% 극복
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  충분한 데이터가 쌓이면 패턴이 표시됩니다
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Success Patterns */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              <CardTitle>성공 패턴</CardTitle>
            </div>
            <CardDescription>
              효과적인 활동 유형과 시간대
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hasEnoughData ? (
                <>
                  <div className="p-4 border rounded-lg">
                    <p className="font-medium mb-2">최적 활동 시간</p>
                    <p className="text-sm text-muted-foreground">
                      주중 오후 7-9시에 가장 높은 효과성
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="font-medium mb-2">효과적인 활동 유형</p>
                    <div className="space-y-2 mt-2">
                      <div className="flex justify-between text-sm">
                        <span>일대일 대화</span>
                        <span className="font-medium">4.8/5</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>함께 기도</span>
                        <span className="font-medium">4.6/5</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>말씀 나눔</span>
                        <span className="font-medium">4.4/5</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="font-medium mb-2">연속 활동 효과</p>
                    <p className="text-sm text-muted-foreground">
                      3일 연속 활동 시 효과성 25% 증가
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  충분한 데이터가 쌓이면 패턴이 표시됩니다
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personal Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            <CardTitle>개인별 추천</CardTitle>
          </div>
          <CardDescription>
            AI가 분석한 맞춤형 양육 전략
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasEnoughData ? (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 mb-1">
                      김영희님 집중 케어 필요
                    </p>
                    <p className="text-sm text-blue-700">
                      최근 2주간 활동 효과성이 감소하고 있습니다. 일대일 시간을
                      늘려보세요.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900 mb-1">
                      주말 활동 추가 권장
                    </p>
                    <p className="text-sm text-green-700">
                      주말에 진행한 활동의 효과성이 평균 20% 높습니다.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-900 mb-1">
                      그룹 활동 도입 고려
                    </p>
                    <p className="text-sm text-purple-700">
                      3명 이상과의 활동이 개별 활동보다 효과적일 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                활동 평가를 10회 이상 완료하면
                <br />
                AI가 분석한 맞춤형 추천을 제공합니다
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
