/**
 * InsightsPage
 * 분석 및 인사이트 페이지 - 실제 스토어 데이터 기반
 */

import { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
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
  TrendingDown,
  Activity,
  Target,
  Lightbulb,
  BarChart3,
  Users,
  AlertCircle,
  Info,
  Minus,
} from 'lucide-react';
import { useSoulStore } from '@/store/soulStore';
import { usePastoralLogStore } from '@/store/pastoralLogStore';
import { useActivityPlanStore } from '@/store/activityPlanStore';
import { RuleBasedInsightsService } from '@/application/services/rule-based-insights-service';
import type { SoulInsightSummary, WeeklySummary } from '@/application/services/ai-insights-service';

type TimeRange = 'week' | 'month' | 'quarter' | 'year';

const insightsService = new RuleBasedInsightsService();

function getRangeStart(range: TimeRange): Date {
  const now = new Date();
  switch (range) {
    case 'week':
      now.setDate(now.getDate() - 7);
      break;
    case 'month':
      now.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      now.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      now.setFullYear(now.getFullYear() - 1);
      break;
  }
  return now;
}

export const InsightsPage = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  const { souls, fetchSouls } = useSoulStore();
  const { logs: logsBySoul, fetchLogs } = usePastoralLogStore();
  const { plans: plansBySoul, fetchPlans } = useActivityPlanStore();

  // Fetch data for all souls on mount
  useEffect(() => {
    fetchSouls().catch(() => {});
  }, [fetchSouls]);

  useEffect(() => {
    souls.forEach(soul => {
      fetchLogs(soul.id).catch(() => {});
      fetchPlans(soul.id).catch(() => {});
    });
  }, [souls, fetchLogs, fetchPlans]);

  // Flatten all logs and plans
  const allLogs = useMemo(
    () => Object.values(logsBySoul).flat(),
    [logsBySoul]
  );
  const allPlans = useMemo(
    () => Object.values(plansBySoul).flat(),
    [plansBySoul]
  );

  // Filter by selected time range
  const rangeStart = useMemo(() => getRangeStart(timeRange), [timeRange]);

  const filteredLogs = useMemo(
    () => allLogs.filter(l => new Date(l.recordedAt) >= rangeStart),
    [allLogs, rangeStart]
  );
  const filteredPlans = useMemo(
    () => allPlans.filter(p => new Date(p.scheduledAt) >= rangeStart),
    [allPlans, rangeStart]
  );

  // Stats
  const totalActivities = filteredPlans.length;
  const logsWithRating = filteredLogs.filter(l => l.rating != null);
  const averageRating =
    logsWithRating.length > 0
      ? logsWithRating.reduce((sum, l) => sum + (l.rating ?? 0), 0) / logsWithRating.length
      : null;
  const breakthroughCount = filteredLogs.filter(l => l.hasBreakthrough).length;
  const attentionCount = souls.filter(soul => {
    const soulLogs = logsBySoul[soul.id] || [];
    const insight = insightsService.computeSoulInsight(soul, soulLogs, plansBySoul[soul.id] || []);
    return insight.attentionNeeded;
  }).length;

  const hasData = filteredLogs.length > 0 || filteredPlans.length > 0;

  // Soul-level insights
  const soulInsights: SoulInsightSummary[] = useMemo(
    () =>
      souls.map(soul =>
        insightsService.computeSoulInsight(
          soul,
          logsBySoul[soul.id] || [],
          plansBySoul[soul.id] || []
        )
      ),
    [souls, logsBySoul, plansBySoul]
  );

  // Weekly summary for the most recent week in range
  const weeklyStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  }, []);

  const weeklySummary: WeeklySummary = useMemo(
    () => insightsService.computeWeeklySummary(allLogs, allPlans, weeklyStart),
    [allLogs, allPlans, weeklyStart]
  );

  // Chart data: mood over time (last N data points from filteredLogs)
  const chartData = useMemo(() => {
    const sorted = [...filteredLogs].sort(
      (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    );
    return sorted.map(l => ({
      date: new Date(l.recordedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
      mood: l.mood === 'growing' ? 3 : l.mood === 'stable' ? 2 : 1,
      rating: l.rating ?? null,
    }));
  }, [filteredLogs]);

  const trendIcon = (trend: SoulInsightSummary['overallTrend']) => {
    if (trend === 'improving') return <TrendingUp className="h-4 w-4 text-growth" />;
    if (trend === 'declining') return <TrendingDown className="h-4 w-4 text-danger" />;
    return <Minus className="h-4 w-4 text-warning" />;
  };

  const trendColor = (trend: SoulInsightSummary['overallTrend']) => {
    if (trend === 'improving') return 'text-growth';
    if (trend === 'declining') return 'text-danger';
    return 'text-warning';
  };

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

      {!hasData && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            선택한 기간에 데이터가 없습니다. 목회 일지를 작성하거나 활동을 등록해주세요.
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
                <p className="text-2xl font-bold">{totalActivities > 0 ? totalActivities : '-'}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {totalActivities > 0 ? `${filteredPlans.filter(p => p.status === 'completed').length}개 완료` : '데이터 없음'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">평균 효과성</p>
                <p className="text-2xl font-bold">
                  {averageRating != null ? averageRating.toFixed(1) : '-'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-growth-light flex items-center justify-center">
                <Target className="h-6 w-6 text-growth" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {averageRating != null ? '5점 만점 기준' : '평가 데이터 없음'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">돌파 횟수</p>
                <p className="text-2xl font-bold">{breakthroughCount > 0 ? breakthroughCount : '-'}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-violet-light flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {filteredLogs.length > 0 ? `${filteredLogs.length}개 기록 중` : '기록 없음'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">관심 필요</p>
                <p className="text-2xl font-bold">{attentionCount > 0 ? attentionCount : '-'}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-warning-light flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-warning" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {souls.length > 0 ? `전체 ${souls.length}명 중` : '영혼 없음'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Effectiveness Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <CardTitle>무드 추이</CardTitle>
          </div>
          <CardDescription>
            시간에 따른 영적 무드 변화 (3=성장, 2=정체, 1=어려움)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis domain={[1, 3]} ticks={[1, 2, 3]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) =>
                      value === 3 ? '성장중' : value === 2 ? '정체기' : '어려움'
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="무드"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
              <div className="text-center space-y-2">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">데이터를 수집하는 중입니다</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Summary + Soul Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <CardTitle>주간 요약</CardTitle>
            </div>
            <CardDescription>최근 7일간 활동 요약</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">총 활동</span>
                <span className="font-medium">{weeklySummary.totalActivities}개</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">목회 일지</span>
                <span className="font-medium">{weeklySummary.totalLogs}개</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">영적 돌파</span>
                <span className="font-medium text-accent">{weeklySummary.breakthroughs}회</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">평균 무드</span>
                <span className="font-medium">
                  {weeklySummary.averageMood >= 2.5
                    ? '😊 성장중'
                    : weeklySummary.averageMood >= 1.5
                    ? '😐 정체기'
                    : '😟 어려움'}
                </span>
              </div>
              <div className="pt-2 border-t space-y-1">
                {weeklySummary.highlights.map((h, i) => (
                  <p key={i} className="text-sm text-muted-foreground">• {h}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Soul Insights needing attention */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <CardTitle>관심 필요 영혼</CardTitle>
            </div>
            <CardDescription>즉각적인 케어가 필요한 영혼</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {soulInsights.filter(s => s.attentionNeeded).length > 0 ? (
                soulInsights
                  .filter(s => s.attentionNeeded)
                  .map(insight => (
                    <div
                      key={insight.soulId}
                      className="flex items-start gap-3 p-3 border rounded-lg bg-warning-light border-warning/20"
                    >
                      <AlertCircle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{insight.soulName}</p>
                        <p className="text-xs text-muted-foreground">{insight.attentionReason}</p>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  관심이 필요한 영혼이 없습니다
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Soul Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            <CardTitle>영혼별 인사이트</CardTitle>
          </div>
          <CardDescription>각 영혼의 성장 추이와 현황</CardDescription>
        </CardHeader>
        <CardContent>
          {soulInsights.length > 0 ? (
            <div className="space-y-3">
              {soulInsights.map(insight => (
                <div
                  key={insight.soulId}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{insight.soulName}</p>
                      <p className="text-xs text-muted-foreground">{insight.moodTrend}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">활동</p>
                      <p className="font-medium">{insight.activityCount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">돌파</p>
                      <p className="font-medium text-accent">{insight.breakthroughCount}</p>
                    </div>
                    <div className={`flex items-center gap-1 ${trendColor(insight.overallTrend)}`}>
                      {trendIcon(insight.overallTrend)}
                      <span className="text-xs font-medium">
                        {insight.overallTrend === 'improving'
                          ? '성장'
                          : insight.overallTrend === 'declining'
                          ? '하락'
                          : '정체'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                영혼을 추가하고 목회 일지를 작성하면
                <br />
                인사이트가 표시됩니다
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
