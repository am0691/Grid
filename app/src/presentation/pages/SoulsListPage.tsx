/**
 * SoulsListPage
 * 영혼 목록 페이지 - 필터링 및 검색 기능 포함
 */

import { useState, useMemo } from 'react';
import { useSoulStore, useProgressStore } from '@/store';
import { SoulCard } from '@/components/SoulCard';
import { AddSoulDialog } from '@/components/AddSoulDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Users, Filter, SortAsc } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type FilterType = 'all' | 'convert' | 'disciple';
type SortType = 'name' | 'startDate' | 'progress';

export function SoulsListPage() {
  const navigate = useNavigate();
  const { souls } = useSoulStore();
  const { getSoulProgress, getOverallProgress } = useProgressStore();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('name');

  // 필터링 및 검색
  const filteredAndSortedSouls = useMemo(() => {
    let result = souls.filter(soul => {
      // 필터 적용
      if (filter !== 'all' && soul.trainingType !== filter) {
        return false;
      }

      // 검색 적용
      if (searchQuery.trim()) {
        return soul.name.toLowerCase().includes(searchQuery.toLowerCase());
      }

      return true;
    });

    // 정렬
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'ko-KR');
        case 'startDate':
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime(); // 최신순
        case 'progress':
          const progressA = getOverallProgress(a.id);
          const progressB = getOverallProgress(b.id);
          return progressB - progressA; // 높은 순
        default:
          return 0;
      }
    });

    return result;
  }, [souls, filter, searchQuery, sortBy, getOverallProgress]);

  // 통계
  const stats = {
    total: souls.length,
    convert: souls.filter(s => s.trainingType === 'convert').length,
    disciple: souls.filter(s => s.trainingType === 'disciple').length,
  };

  const handleSoulClick = (soulId: string) => {
    navigate(`/souls/${soulId}`);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">영혼 목록</h1>
          <p className="text-muted-foreground mt-1">
            양육 중인 모든 영혼을 확인하고 관리하세요
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          새 영혼
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              전체 영혼
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              Convert
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                13주
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.convert}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              Disciple
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                12개월
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.disciple}</div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 검색 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="영혼 이름으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 필터 */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
                <TabsList>
                  <TabsTrigger value="all">전체</TabsTrigger>
                  <TabsTrigger value="convert">Convert</TabsTrigger>
                  <TabsTrigger value="disciple">Disciple</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* 정렬 */}
            <div className="flex items-center gap-2">
              <SortAsc className="w-4 h-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortType)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">이름순</SelectItem>
                  <SelectItem value="startDate">시작일순</SelectItem>
                  <SelectItem value="progress">진도순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 영혼 목록 */}
      {filteredAndSortedSouls.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                {searchQuery || filter !== 'all'
                  ? '검색 결과가 없습니다'
                  : '아직 등록된 영혼이 없습니다'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filter !== 'all'
                  ? '다른 검색어나 필터를 시도해보세요'
                  : '새로운 영혼을 추가하여 양육을 시작하세요'}
              </p>
              {!searchQuery && filter === 'all' && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  새 영혼 추가
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedSouls.map(soul => (
            <SoulCard
              key={soul.id}
              soul={soul}
              progress={getSoulProgress(soul.id)}
              overallProgress={getOverallProgress(soul.id)}
              onClick={() => handleSoulClick(soul.id)}
            />
          ))}
        </div>
      )}

      {/* 새 영혼 추가 다이얼로그 */}
      <AddSoulDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </div>
  );
}
