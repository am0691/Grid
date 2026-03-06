/**
 * PastoralLogCard - 목회 일지 카드 컴포넌트
 * 단일 PastoralLog 엔트리를 요약 형태로 표시
 */

import type { PastoralLog } from '@/domain/entities/pastoral-log';
import { MOOD_LABELS, MOOD_COLORS } from '@/domain/entities/pastoral-log';
import { BREAKTHROUGH_CATEGORIES } from '@/domain/entities/pastoral-log';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Sparkles, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PastoralLogCardProps {
  log: PastoralLog;
  onEdit?: (log: PastoralLog) => void;
  onDelete?: (id: string) => void;
}

// 날짜 포맷: "3월 2일 (일)" 스타일
function formatRecordedDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayName = dayNames[date.getDay()];
  return `${month}월 ${day}일 (${dayName})`;
}

// 별 표시 렌더링
function StarRating({ level, max = 5 }: { level: number; max?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'w-3 h-3',
            i < level
              ? 'fill-warning text-warning'
              : 'fill-none text-muted-foreground/30'
          )}
        />
      ))}
    </span>
  );
}

export function PastoralLogCard({ log, onEdit, onDelete }: PastoralLogCardProps) {
  const moodLabel = MOOD_LABELS[log.mood];
  const moodColor = MOOD_COLORS[log.mood];

  const breakthroughMeta = log.breakthroughCategory
    ? BREAKTHROUGH_CATEGORIES[log.breakthroughCategory]
    : null;

  const observationsText = log.observations || log.concerns || '';
  const truncatedText =
    observationsText.length > 100
      ? `${observationsText.slice(0, 100)}...`
      : observationsText;

  return (
    <Card className="transition-all duration-200 hover:shadow-sm">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between gap-2">
          {/* 날짜 + 무드 뱃지 */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium text-foreground whitespace-nowrap">
              {formatRecordedDate(log.recordedAt)}
            </span>
            <Badge
              variant="secondary"
              className="text-xs whitespace-nowrap"
              style={{
                backgroundColor: `${moodColor}18`,
                color: moodColor,
                borderColor: `${moodColor}40`,
                borderWidth: '1px',
              }}
            >
              {moodLabel}
            </Badge>
          </div>

          {/* 활동 연결 뱃지 */}
          {log.activityPlanId && (
            <Badge variant="outline" className="text-[10px] text-muted-foreground whitespace-nowrap">
              활동 연결
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-3 pt-0 space-y-2.5">
        {/* 레벨 지표: 갈급함 + 친밀도 */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            영적 갈급함 <StarRating level={log.hungerLevel} />
          </span>
          <span className="inline-flex items-center gap-1">
            친밀도 <StarRating level={log.closenessLevel} />
          </span>
        </div>

        {/* 평가 점수 */}
        {log.rating && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <span>평가:</span>
            <StarRating level={log.rating} />
          </div>
        )}

        {/* 관찰/우려 요약 텍스트 */}
        {truncatedText && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {truncatedText}
          </p>
        )}

        {/* 돌파 섹션 */}
        {log.hasBreakthrough && breakthroughMeta && (
          <div
            className="flex items-start gap-2 p-2 rounded-md"
            style={{ backgroundColor: `${breakthroughMeta.color}10` }}
          >
            <Sparkles
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              style={{ color: breakthroughMeta.color }}
            />
            <div className="min-w-0">
              <span className="text-xs font-medium" style={{ color: breakthroughMeta.color }}>
                {breakthroughMeta.emoji} {breakthroughMeta.name}
              </span>
              {log.breakthroughTitle && (
                <p className="text-sm text-foreground mt-0.5 truncate">
                  {log.breakthroughTitle}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 다음 단계 */}
        {log.nextSteps && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">다음 단계: </span>
            {log.nextSteps.length > 80 ? `${log.nextSteps.slice(0, 80)}...` : log.nextSteps}
          </div>
        )}

        {/* 편집/삭제 버튼 */}
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1 pt-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => onEdit(log)}
              >
                <Pencil className="w-3 h-3 mr-1" />
                수정
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(log.id)}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                삭제
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
