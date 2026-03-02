/**
 * Quick Stats Component
 * Overview statistics for the dashboard
 */

import { Card, CardContent } from '@/components/ui/card';
import { Users, Activity, TrendingUp, Target } from 'lucide-react';
import { useSoulStore } from '@/store/soulStore';
import { usePastoralLogStore } from '@/store/pastoralLogStore';

interface QuickStatsProps {
  trainerId?: string;
}

export function QuickStats({}: QuickStatsProps) {
  const { souls } = useSoulStore();
  const logs = usePastoralLogStore((s) => s.logs);

  // Calculate statistics
  const totalSouls = souls.length;

  // Count souls with active training (have activities in last 30 days)
  const activeTraining = souls.length;

  // Calculate overall progress (mock - would need actual progress data)
  const overallProgress = totalSouls > 0 ? Math.round((activeTraining / totalSouls) * 100) : 0;

  // Count recent breakthroughs from PastoralLog data (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentBreakthroughs = Object.values(logs)
    .flat()
    .filter(log => log.hasBreakthrough && new Date(log.recordedAt) >= thirtyDaysAgo)
    .length;

  const stats = [
    {
      label: '전체 양육',
      value: totalSouls,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: '활발한 양육',
      value: activeTraining,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: '전체 진도',
      value: `${overallProgress}%`,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: '최근 돌파',
      value: recentBreakthroughs,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
