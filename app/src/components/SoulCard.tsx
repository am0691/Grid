import type { Soul, AreaProgress } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import { CONVERT_AREAS, DISCIPLE_AREAS, CONVERT_WEEKS, DISCIPLE_MONTHS } from '@/types';

interface SoulCardProps {
  soul: Soul;
  progress: AreaProgress[];
  overallProgress: number;
  onClick: () => void;
  temperatureMood?: 'growing' | 'stable' | 'struggling';
  hasCrisisAlert?: boolean;
  needsAttention?: boolean;
}

export function SoulCard({
  soul,
  progress,
  overallProgress,
  onClick,
  temperatureMood,
  hasCrisisAlert,
  needsAttention
}: SoulCardProps) {
  const areas = soul.trainingType === 'convert' ? CONVERT_AREAS : DISCIPLE_AREAS;
  const maxWeek = soul.trainingType === 'convert' ? CONVERT_WEEKS : DISCIPLE_MONTHS;

  const getTempColor = () => {
    switch (temperatureMood) {
      case 'growing': return 'hsl(var(--growth))';
      case 'stable': return 'hsl(var(--warning))';
      case 'struggling': return 'hsl(var(--danger))';
      default: return null;
    }
  };

  const tempColor = getTempColor();

  const getAreaSummary = () => {
    return progress.map(p => {
      const areaMeta = areas.find(a => a.id === p.areaId);
      const completedCount = p.items.filter(i => i.status === 'completed').length;
      return {
        color: areaMeta?.color || '#6b7280',
        completed: completedCount,
        total: maxWeek,
        isCurrent: p.items.some(i => i.status === 'current')
      };
    });
  };

  const areaSummary = getAreaSummary();
  const currentWeekStr = soul.trainingType === 'convert' ? '주차' : '개월차';

  const avgWeek = progress.length > 0
    ? Math.round(progress.reduce((sum, p) => sum + p.currentWeek, 0) / progress.length)
    : 1;

  return (
    <Card
      className={`cursor-pointer card-hover border transition-all duration-200 ${
        needsAttention
          ? 'border-warning/60 bg-warning-light'
          : 'border-border/50 hover:border-primary/30'
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/8 flex items-center justify-center relative">
              <User className="w-5 h-5 text-primary" />
              {tempColor && (
                <div
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-card"
                  style={{ backgroundColor: tempColor }}
                  title={`영적 상태: ${temperatureMood === 'growing' ? '성장' : temperatureMood === 'stable' ? '안정' : '어려움'}`}
                />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{soul.name}</h3>
                {hasCrisisAlert && (
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-danger" title="위기 경보">
                    <AlertTriangle className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>시작: {soul.startDate}</span>
              </div>
            </div>
          </div>
          <Badge
            variant={soul.trainingType === 'convert' ? 'default' : 'violet'}
            className="text-xs"
          >
            {soul.trainingType === 'convert' ? 'Convert' : 'Disciple'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              전체 진도
            </span>
            <span className="font-semibold">{overallProgress}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Average progress */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">평균 진행</span>
          <span className="font-medium">{avgWeek}{currentWeekStr}</span>
        </div>

        {/* Area color summary */}
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">영역별 진도</span>
          <div className="flex gap-1.5 flex-wrap">
            {areaSummary.map((area, idx) => (
              <div
                key={idx}
                className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-semibold text-white relative overflow-hidden transition-transform hover:scale-110"
                style={{ backgroundColor: area.color }}
                title={`${areas[idx]?.name}: ${area.completed}/${area.total}`}
              >
                {area.isCurrent && (
                  <div className="absolute inset-0 border-2 border-white/60 rounded-md" />
                )}
                {area.completed > 0 ? area.completed : '-'}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
