/**
 * PastoralLogList - 목회 일지 목록 컴포넌트
 * Soul의 모든 목회 일지를 필터링과 함께 표시
 */

import { useEffect, useState } from 'react';
import type { PastoralLog } from '@/domain/entities/pastoral-log';
import type { SpiritualMood } from '@/domain/entities/pastoral-log';
import { usePastoralLogStore } from '@/store/pastoralLogStore';
import { PastoralLogCard } from './PastoralLogCard';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, Loader2 } from 'lucide-react';


interface PastoralLogListProps {
  soulId: string;
  onCreateNew: () => void;
  onEdit: (log: PastoralLog) => void;
}

type MoodFilter = 'all' | SpiritualMood;
type BreakthroughFilter = 'all' | 'has_breakthrough';

const MOOD_FILTER_OPTIONS: { value: MoodFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'growing', label: '성장중' },
  { value: 'stable', label: '정체기' },
  { value: 'struggling', label: '위기' },
];

export function PastoralLogList({ soulId, onCreateNew, onEdit }: PastoralLogListProps) {
  const { fetchLogs, deleteLog, isLoading } = usePastoralLogStore();
  const soulLogs = usePastoralLogStore((state) => state.getSoulLogs(soulId));

  const [moodFilter, setMoodFilter] = useState<MoodFilter>('all');
  const [breakthroughFilter, setBreakthroughFilter] = useState<BreakthroughFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchLogs(soulId);
  }, [soulId, fetchLogs]);

  // 클라이언트 사이드 필터링
  const filteredLogs = soulLogs.filter((log) => {
    if (moodFilter !== 'all' && log.mood !== moodFilter) return false;
    if (breakthroughFilter === 'has_breakthrough' && !log.hasBreakthrough) return false;
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('이 목양 일지를 삭제하시겠습니까?')) return;
    try {
      await deleteLog(id);
    } catch {
      // 에러는 store에서 처리됨
    }
  };

  const hasActiveFilters = moodFilter !== 'all' || breakthroughFilter !== 'all';

  // 빈 상태
  if (!isLoading && soulLogs.length === 0) {
    return (
      <div className="space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-muted-foreground" />
            목양 일지
          </h3>
        </div>

        {/* 빈 상태 */}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            아직 목양 일지가 없습니다.
            <br />
            첫 번째 기록을 작성해보세요!
          </p>
          <Button onClick={onCreateNew} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            새 기록 작성
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-muted-foreground" />
          목양 일지
          {soulLogs.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({soulLogs.length})
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => setShowFilters((prev) => !prev)}
          >
            {showFilters ? '필터 닫기' : '필터'}
            {hasActiveFilters && (
              <span className="ml-1 w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            )}
          </Button>
          <Button onClick={onCreateNew} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            새 기록
          </Button>
        </div>
      </div>

      {/* 필터 바 */}
      {showFilters && (
        <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
          {/* 무드 필터 */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">상태:</span>
            {MOOD_FILTER_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={moodFilter === opt.value ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setMoodFilter(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>

          {/* 돌파 필터 */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">돌파:</span>
            <Button
              variant={breakthroughFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setBreakthroughFilter('all')}
            >
              전체
            </Button>
            <Button
              variant={breakthroughFilter === 'has_breakthrough' ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setBreakthroughFilter('has_breakthrough')}
            >
              돌파 있음
            </Button>
          </div>
        </div>
      )}

      {/* 로딩 */}
      {isLoading && soulLogs.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* 카드 목록 */}
      <div className="space-y-3">
        {filteredLogs.map((log) => (
          <PastoralLogCard
            key={log.id}
            log={log}
            onEdit={onEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* 필터 결과 없음 */}
      {!isLoading && filteredLogs.length === 0 && soulLogs.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            필터 조건에 맞는 일지가 없습니다.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-xs"
            onClick={() => {
              setMoodFilter('all');
              setBreakthroughFilter('all');
            }}
          >
            필터 초기화
          </Button>
        </div>
      )}
    </div>
  );
}
