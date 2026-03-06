/**
 * Today's Focus Component
 * Shows what the trainer should focus on today
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, Clock, ArrowRight } from 'lucide-react';
import { useSoulStore } from '@/store/soulStore';
import type { CrisisAlert } from '@/domain/services/crisis-detection.service';

const CRISIS_STORAGE_KEY = 'grid_crisis_alerts';

function loadCrisisAlerts(): CrisisAlert[] {
  try {
    const stored = localStorage.getItem(CRISIS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

interface TodaysFocusProps {
  onNavigateToSoul?: (soulId: string) => void;
}

export function TodaysFocus({ onNavigateToSoul }: TodaysFocusProps) {
  const { souls } = useSoulStore();
  const [crisisAlerts, setCrisisAlerts] = useState<CrisisAlert[]>([]);

  // Load crisis alerts from localStorage
  useEffect(() => {
    const alerts = loadCrisisAlerts();
    setCrisisAlerts(alerts.filter(a => a.status === 'active' || a.status === 'acknowledged'));
  }, []);

  // Mock scheduled meetings for today (would come from activity plan store)
  const todaysMeetings: Array<{ id: string; soulId: string; title: string; scheduledAt: string }> = [];

  const urgentItems = crisisAlerts.slice(0, 3); // Show top 3 crisis alerts

  const handleSoulClick = (soulId: string) => {
    onNavigateToSoul?.(soulId);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          오늘의 집중
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Urgent Items Section */}
          {urgentItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-danger" />
                <h3 className="text-sm font-semibold text-danger">긴급 알림</h3>
                <Badge variant="destructive" className="ml-auto">
                  {crisisAlerts.length}
                </Badge>
              </div>

              {urgentItems.map((alert) => {
                const soul = souls.find(s => s.id === alert.soulId);
                return (
                  <div
                    key={alert.id}
                    className="p-3 rounded-lg border-2 border-danger/20 bg-danger-light hover:bg-danger/20 transition-colors cursor-pointer"
                    onClick={() => handleSoulClick(alert.soulId)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-danger">
                          {soul?.name || '알 수 없음'}
                        </p>
                        <p className="text-xs text-danger mt-1">
                          {alert.title}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-danger flex-shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Scheduled Meetings Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">오늘 일정</h3>
            </div>

            {todaysMeetings.length > 0 ? (
              todaysMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleSoulClick(meeting.soulId)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{meeting.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(meeting.scheduledAt).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground rounded-lg border border-dashed">
                오늘 예정된 일정이 없습니다
              </div>
            )}
          </div>

          {/* No urgent items and no meetings */}
          {urgentItems.length === 0 && todaysMeetings.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                오늘은 긴급한 일정이 없습니다
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                양육 대상자들과 연락해보세요
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
