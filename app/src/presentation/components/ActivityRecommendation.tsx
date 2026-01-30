/**
 * Activity Recommendation Component
 * 활동 추천 카드 컴포넌트
 */

import type { ActivityRecommendation } from '../../domain/entities/recommendation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { BookOpen, CheckCircle2, Lightbulb, Target } from 'lucide-react';

interface ActivityRecommendationProps {
  recommendation: ActivityRecommendation;
  onCreateActivity?: (recommendation: ActivityRecommendation) => void;
  compact?: boolean;
}

export function ActivityRecommendationCard({
  recommendation,
  onCreateActivity,
  compact = false
}: ActivityRecommendationProps) {
  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base">{recommendation.title}</CardTitle>
              <CardDescription className="text-sm mt-1">
                {recommendation.description}
              </CardDescription>
            </div>
            <Badge variant="outline" className="ml-2">
              {recommendation.week}주차
            </Badge>
          </div>
        </CardHeader>
        {onCreateActivity && (
          <CardContent className="pt-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCreateActivity(recommendation)}
              className="w-full"
            >
              활동 계획 추가
            </Button>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{recommendation.title}</CardTitle>
            <CardDescription className="mt-2">
              {recommendation.description}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="ml-3">
            {recommendation.week}주차
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 성경 구절 */}
        {recommendation.bibleVerse && (
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  {recommendation.bibleVerse.reference}
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200 italic">
                  "{recommendation.bibleVerse.text}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 목표 */}
        {recommendation.goals && recommendation.goals.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-green-600" />
              <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                이번 주 목표
              </h4>
            </div>
            <ul className="space-y-2">
              {recommendation.goals.map((goal, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 활동 목록 */}
        {recommendation.activities && recommendation.activities.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">
              추천 활동
            </h4>
            <ul className="space-y-2">
              {recommendation.activities.map((activity, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{activity}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 팁 */}
        {recommendation.tips && recommendation.tips.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm text-yellow-900 dark:text-yellow-100 mb-2">
                  양육자 팁
                </h4>
                <ul className="space-y-1.5">
                  {recommendation.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-yellow-800 dark:text-yellow-200">
                      • {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 활동 계획 추가 버튼 */}
        {onCreateActivity && (
          <Button
            onClick={() => onCreateActivity(recommendation)}
            className="w-full"
          >
            이 활동을 계획에 추가하기
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 추천 활동 목록 컴포넌트
 */
interface ActivityRecommendationListProps {
  recommendations: ActivityRecommendation[];
  onCreateActivity?: (recommendation: ActivityRecommendation) => void;
  compact?: boolean;
  emptyMessage?: string;
}

export function ActivityRecommendationList({
  recommendations,
  onCreateActivity,
  compact = false,
  emptyMessage = '이 주차에 추천 활동이 없습니다.'
}: ActivityRecommendationListProps) {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={compact ? 'space-y-3' : 'space-y-6'}>
      {recommendations.map((recommendation) => (
        <ActivityRecommendationCard
          key={recommendation.id}
          recommendation={recommendation}
          onCreateActivity={onCreateActivity}
          compact={compact}
        />
      ))}
    </div>
  );
}
