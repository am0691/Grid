/**
 * Recommendation System Usage Examples
 * 추천 시스템 사용 예시
 */

import React, { useState } from 'react';
import {
  useActivityRecommendations,
  useSoulRecommendations,
  useNextRecommendedActivity
} from '../hooks/useActivityRecommendations';
import {
  ActivityRecommendationCard,
  ActivityRecommendationList
} from '../components/ActivityRecommendation';
import type { ActivityRecommendation } from '../../domain/entities/recommendation';
import type { CreateActivityPlanDto } from '../../domain/entities/activity-plan';

/**
 * 예시 1: 주차별 추천 보기
 */
export function WeeklyRecommendationsExample() {
  const { recommendations, loading, error } = useActivityRecommendations(
    'convert',
    'salvation',
    1
  );

  const handleCreateActivity = (recommendation: ActivityRecommendation) => {
    // CreateActivityPlanUseCase를 사용하여 활동 계획 생성
    const activityPlan: Partial<CreateActivityPlanDto> = {
      soulId: 'current-soul-id',
      title: recommendation.title,
      type: 'meeting',
      scheduledAt: new Date().toISOString(),
      areaId: recommendation.areaId,
      week: recommendation.week,
      description: recommendation.description
    };

    console.log('Creating activity plan:', activityPlan);
    // TODO: 실제 CreateActivityPlanUseCase 호출
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>오류: {error.message}</div>;

  return (
    <div>
      <h2>CONVERT - 구원의 확신 1주차 추천</h2>
      <ActivityRecommendationList
        recommendations={recommendations}
        onCreateActivity={handleCreateActivity}
      />
    </div>
  );
}

/**
 * 예시 2: Soul의 현재 진행에 맞는 모든 추천 보기
 */
export function SoulRecommendationsExample({ soulId }: { soulId: string }) {
  const { recommendations, loading, error } = useSoulRecommendations(soulId);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>오류: {error.message}</div>;

  return (
    <div className="space-y-8">
      <h2>현재 진행 중인 모든 영역의 추천 활동</h2>
      {recommendations.map(({ areaId, currentWeek, recommendations: areaRecs }) => (
        <div key={areaId} className="border-t pt-6">
          <h3 className="text-xl font-semibold mb-4">
            {areaId} - {currentWeek}주차
          </h3>
          <ActivityRecommendationList
            recommendations={areaRecs}
            compact={true}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * 예시 3: 다음 추천 활동만 보기 (빠른 액션)
 */
export function NextRecommendationExample({
  soulId,
  areaId
}: {
  soulId: string;
  areaId: string;
}) {
  const { recommendation, loading, error } = useNextRecommendedActivity(
    soulId,
    areaId as any
  );

  const handleQuickAdd = () => {
    if (recommendation) {
      // 빠르게 활동 계획 추가
      console.log('Quick adding:', recommendation.title);
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>오류: {error.message}</div>;
  if (!recommendation) return <div>추천 활동이 없습니다.</div>;

  return (
    <div>
      <h3>다음 추천 활동</h3>
      <ActivityRecommendationCard
        recommendation={recommendation}
        onCreateActivity={handleQuickAdd}
        compact={true}
      />
    </div>
  );
}

/**
 * 예시 4: 완전한 추천 대시보드
 */
export function RecommendationDashboard({ soulId }: { soulId: string }) {
  const [selectedArea, setSelectedArea] = useState<string>('salvation');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  const { recommendations: soulRecs } = useSoulRecommendations(soulId);
  const { recommendations: weeklyRecs } = useActivityRecommendations(
    'convert',
    selectedArea as any,
    selectedWeek
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 왼쪽: 현재 진행 중인 추천 */}
      <div>
        <h2 className="text-2xl font-bold mb-4">현재 진행 중</h2>
        <div className="space-y-6">
          {soulRecs.map(({ areaId, currentWeek, recommendations }) => (
            <div key={areaId}>
              <h3 className="font-semibold mb-2">
                {areaId} (Week {currentWeek})
              </h3>
              {recommendations[0] && (
                <ActivityRecommendationCard
                  recommendation={recommendations[0]}
                  compact={true}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 오른쪽: 선택한 주차 상세 */}
      <div>
        <h2 className="text-2xl font-bold mb-4">상세 보기</h2>
        <div className="mb-4">
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="mr-2 px-3 py-2 border rounded"
          >
            <option value="salvation">구원의 확신</option>
            <option value="word">말씀</option>
            <option value="fellowship">교제</option>
            <option value="sin">죄에서 떠남</option>
          </select>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(Number(e.target.value))}
            className="px-3 py-2 border rounded"
          >
            {Array.from({ length: 13 }, (_, i) => i + 1).map((week) => (
              <option key={week} value={week}>
                {week}주차
              </option>
            ))}
          </select>
        </div>
        <ActivityRecommendationList
          recommendations={weeklyRecs}
        />
      </div>
    </div>
  );
}

/**
 * 예시 5: 추천 활동 검색 및 필터링
 */
export function RecommendationSearchExample() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'convert' | 'disciple'>('convert');

  // RecommendationService를 직접 사용하여 검색
  const filteredRecommendations = React.useMemo(() => {
    // 실제로는 service.getAllRecommendations()를 사용
    // 여기서는 예시로 빈 배열 반환
    return [] as ActivityRecommendation[];
  }, [searchTerm, selectedType]);

  return (
    <div>
      <div className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="추천 활동 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        <div>
          <label className="mr-4">
            <input
              type="radio"
              value="convert"
              checked={selectedType === 'convert'}
              onChange={() => setSelectedType('convert')}
            />
            {' '}CONVERT
          </label>
          <label>
            <input
              type="radio"
              value="disciple"
              checked={selectedType === 'disciple'}
              onChange={() => setSelectedType('disciple')}
            />
            {' '}DISCIPLE
          </label>
        </div>
      </div>
      <ActivityRecommendationList
        recommendations={filteredRecommendations}
        emptyMessage="검색 결과가 없습니다."
      />
    </div>
  );
}

/**
 * 예시 6: Compact 모드로 사이드바에 표시
 */
export function RecommendationSidebar({ soulId }: { soulId: string }) {
  const { recommendations } = useSoulRecommendations(soulId);

  return (
    <aside className="w-64 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold mb-3">오늘의 추천</h3>
      <div className="space-y-3">
        {recommendations.slice(0, 3).map(({ areaId, recommendations: recs }) => (
          <div key={areaId}>
            {recs[0] && (
              <ActivityRecommendationCard
                recommendation={recs[0]}
                compact={true}
              />
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}

// 전체 예시를 보여주는 컴포넌트
export function AllExamples() {
  const sampleSoulId = 'soul-123';

  return (
    <div className="container mx-auto p-6 space-y-12">
      <section>
        <h1 className="text-3xl font-bold mb-2">추천 시스템 사용 예시</h1>
        <p className="text-gray-600 mb-8">
          다양한 상황에서 추천 시스템을 사용하는 방법을 보여줍니다.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">1. 주차별 추천</h2>
        <WeeklyRecommendationsExample />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">2. Soul별 추천</h2>
        <SoulRecommendationsExample soulId={sampleSoulId} />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">3. 다음 추천 활동</h2>
        <NextRecommendationExample
          soulId={sampleSoulId}
          areaId="salvation"
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">4. 추천 대시보드</h2>
        <RecommendationDashboard soulId={sampleSoulId} />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">5. 추천 검색</h2>
        <RecommendationSearchExample />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">6. 사이드바 추천</h2>
        <RecommendationSidebar soulId={sampleSoulId} />
      </section>
    </div>
  );
}
