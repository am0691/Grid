/**
 * SoulTimelinePage
 * 영혼 활동 타임라인 페이지 - 활동 계획 및 목양 일지 통합 뷰
 */

import { useSoulDetailContext } from '@/presentation/layouts/SoulDetailLayout';
import { ActivityTimeline } from '@/presentation/components/ActivityTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History } from 'lucide-react';

export function SoulTimelinePage() {
  const { soul, soulId } = useSoulDetailContext();

  return (
    <div className="space-y-6">
      {/* 페이지 설명 */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-500" />
            활동 타임라인
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {soul.name}님과 함께한 활동 계획과 목양 일지를 시간 순으로 확인합니다.
            만남, 성경공부, 기도, 전화 등 다양한 활동 기록과
            목양 일지를 통합하여 양육 여정 전체를 한눈에 볼 수 있습니다.
          </p>
        </CardContent>
      </Card>

      {/* 타임라인 컴포넌트 */}
      <ActivityTimeline soulId={soulId} soulName={soul.name} />

      {/* 타임라인 안내 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <History className="w-4 h-4" />
            타임라인 항목 안내
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div>
              <strong className="text-foreground">활동 계획:</strong>
              <ul className="mt-2 ml-4 space-y-1 list-disc">
                <li>만남/양육 - 직접 만나는 양육 활동</li>
                <li>전화 - 전화 통화 기록</li>
                <li>성경공부 - 성경 공부 및 교육 활동</li>
                <li>행사 - 교회 행사 참여</li>
                <li>기도 - 중보기도 및 기도 모임</li>
                <li>기타 - 그 외 활동</li>
              </ul>
            </div>
            <div className="pt-2 border-t">
              <strong className="text-foreground">목양 일지:</strong>
              <p className="mt-1">
                활동 후 작성된 목양 일지는 영적 상태와 관찰 내용을 기록합니다.
                돌파(✨)가 있는 일지는 특별히 강조 표시됩니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
