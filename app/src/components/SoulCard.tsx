import type { Soul, AreaProgress } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User, Calendar, TrendingUp } from 'lucide-react';
import { CONVERT_AREAS, DISCIPLE_AREAS, CONVERT_WEEKS, DISCIPLE_MONTHS } from '@/types';

interface SoulCardProps {
  soul: Soul;
  progress: AreaProgress[];
  overallProgress: number;
  onClick: () => void;
}

export function SoulCard({ soul, progress, overallProgress, onClick }: SoulCardProps) {
  const areas = soul.trainingType === 'convert' ? CONVERT_AREAS : DISCIPLE_AREAS;
  const maxWeek = soul.trainingType === 'convert' ? CONVERT_WEEKS : DISCIPLE_MONTHS;
  
  // 영역별 진도 요약
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
  
  // 평균 진도 계산
  const avgWeek = progress.length > 0 
    ? Math.round(progress.reduce((sum, p) => sum + p.currentWeek, 0) / progress.length)
    : 1;

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{soul.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>시작: {soul.startDate}</span>
              </div>
            </div>
          </div>
          <Badge 
            variant={soul.trainingType === 'convert' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {soul.trainingType === 'convert' ? 'Convert' : 'Disciple'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 진도율 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              전체 진도
            </span>
            <span className="font-medium">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* 평균 진도 */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">평균 진행</span>
          <span className="font-medium">{avgWeek}{currentWeekStr}</span>
        </div>

        {/* 영역별 색상 요약 */}
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">영역별 진도</span>
          <div className="flex gap-1 flex-wrap">
            {areaSummary.map((area, idx) => (
              <div
                key={idx}
                className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-medium text-white relative overflow-hidden"
                style={{ backgroundColor: area.color }}
                title={`${areas[idx]?.name}: ${area.completed}/${area.total}`}
              >
                {area.isCurrent && (
                  <div className="absolute inset-0 border-2 border-white rounded-md" />
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
