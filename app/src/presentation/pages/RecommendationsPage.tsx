/**
 * Recommendations Page
 * 활동 추천 페이지 예시
 */

import { useState } from 'react';
import { useActivityRecommendations } from '../hooks/useActivityRecommendations';
import { ActivityRecommendationList } from '../components/ActivityRecommendation';
import type { Area } from '../../domain/value-objects/area';
import type { TrainingType } from '../../domain/value-objects/training-type';
import type { ActivityRecommendation } from '../../domain/entities/recommendation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Spinner } from '../../components/ui/spinner';
import { Alert, AlertDescription } from '../../components/ui/alert';

export function RecommendationsPage() {
  const [trainingType, setTrainingType] = useState<TrainingType>('convert');
  const [selectedArea, setSelectedArea] = useState<Area>('salvation');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  const { recommendations, loading, error } = useActivityRecommendations(
    trainingType,
    selectedArea,
    selectedWeek
  );

  const handleCreateActivity = (recommendation: ActivityRecommendation) => {
    // 활동 계획 생성 로직
    console.log('Creating activity plan from recommendation:', recommendation);
    // TODO: CreateActivityPlanUseCase 호출
  };

  const convertAreas: Area[] = ['salvation', 'word', 'fellowship', 'sin'];
  const discipleAreas: Area[] = [
    'memorization',
    'bibleStudy',
    'salvation',
    'devotion',
    'word',
    'prayer',
    'fellowship',
    'witness',
    'lordship',
    'vision',
    'discipleship',
    'character'
  ];

  const areas = trainingType === 'convert' ? convertAreas : discipleAreas;
  const maxWeeks = trainingType === 'convert' ? 13 : 12;
  const weekLabel = trainingType === 'convert' ? '주차' : '월차';

  const areaLabels: Record<Area, string> = {
    salvation: '구원의 확신',
    word: '말씀',
    fellowship: '교제',
    sin: '죄에서 떠남',
    notes: '참고사항',
    memorization: '암송',
    bibleStudy: '성경공부',
    devotion: '경건의 시간',
    prayer: '기도',
    witness: '증거',
    lordship: '주재권',
    vision: '세계비전',
    discipleship: '양육',
    character: '성품',
    events: '전체행사'
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">주차별 활동 추천</h1>
        <p className="text-gray-600 dark:text-gray-400">
          각 주차/월차에 맞는 의미 있는 활동들을 추천받아 양육 계획에 활용하세요.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>필터 설정</CardTitle>
          <CardDescription>
            훈련 타입, 영역, {weekLabel}를 선택하여 추천 활동을 확인하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 훈련 타입 선택 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                훈련 타입
              </label>
              <Tabs
                value={trainingType}
                onValueChange={(value) => {
                  setTrainingType(value as TrainingType);
                  setSelectedArea(value === 'convert' ? 'salvation' : 'memorization');
                  setSelectedWeek(1);
                }}
              >
                <TabsList className="w-full">
                  <TabsTrigger value="convert" className="flex-1">
                    CONVERT (13주)
                  </TabsTrigger>
                  <TabsTrigger value="disciple" className="flex-1">
                    DISCIPLE (12개월)
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* 영역 선택 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                영역
              </label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value as Area)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {areas.map((area) => (
                  <option key={area} value={area}>
                    {areaLabels[area]}
                  </option>
                ))}
              </select>
            </div>

            {/* 주차/월차 선택 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {weekLabel}
              </label>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: maxWeeks }, (_, i) => i + 1).map((week) => (
                  <option key={week} value={week}>
                    {week}{weekLabel}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 추천 활동 목록 */}
      <div>
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Spinner className="size-8" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              추천 활동을 불러오는 중 오류가 발생했습니다: {error.message}
            </AlertDescription>
          </Alert>
        )}

        {!loading && !error && (
          <ActivityRecommendationList
            recommendations={recommendations}
            onCreateActivity={handleCreateActivity}
          />
        )}
      </div>
    </div>
  );
}

export default RecommendationsPage;
