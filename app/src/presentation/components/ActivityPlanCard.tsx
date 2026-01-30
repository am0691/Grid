/**
 * Activity Plan Card Component
 * Displays individual activity plan with visual distinction for source type
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { ActivityPlan } from '@/domain/entities/activity-plan';
import type { ActivityRecommendation } from '@/domain/entities/recommendation';
import type { Soul } from '@/types';
import { getAreaMeta } from '@/types';
import type { Area } from '@/domain/value-objects/area';
import {
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  Sparkles,
  User,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ActivityPlanCardProps {
  plan: ActivityPlan;
  soul: Soul;
  isRecommended?: boolean;
  recommendation?: ActivityRecommendation;
  onToggleComplete?: (planId: string) => void;
  onEdit?: (plan: ActivityPlan) => void;
  onDelete?: (planId: string) => void;
  compact?: boolean;
}

export function ActivityPlanCard({
  plan,
  soul,
  isRecommended = false,
  recommendation,
  onToggleComplete,
  onEdit,
  onDelete,
  compact = false,
}: ActivityPlanCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const areaMeta = plan.areaId
    ? getAreaMeta(plan.areaId as Area, soul.trainingType)
    : null;

  const isCompleted = plan.status === 'completed';
  const canEdit = !isRecommended && onEdit;
  const canDelete = !isRecommended && onDelete;
  const weekLabel = soul.trainingType === 'convert' ? '주차' : '월차';

  const handleToggleComplete = () => {
    if (onToggleComplete) {
      onToggleComplete(plan.id);
    }
  };

  // Card background styling based on source and state
  const getCardStyle = () => {
    if (isRecommended) {
      return {
        background: areaMeta
          ? `linear-gradient(135deg, ${areaMeta.lightBgColor}00 0%, ${areaMeta.lightBgColor}40 100%)`
          : 'transparent',
        borderColor: areaMeta?.color,
        borderWidth: '1px',
        borderStyle: 'solid',
      };
    }

    return {
      backgroundColor: isCompleted ? '#f9fafb' : 'white',
      borderColor: isCompleted ? '#e5e7eb' : areaMeta?.color || '#e5e7eb',
      borderWidth: '2px',
      borderStyle: 'solid',
    };
  };

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg transition-all duration-200',
          isCompleted && 'opacity-60'
        )}
        style={getCardStyle()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Checkbox */}
        {onToggleComplete && (
          <Checkbox
            checked={isCompleted}
            onCheckedChange={handleToggleComplete}
            className="mt-1"
            aria-label={`${plan.title} 완료 표시`}
          />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {areaMeta && (
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: areaMeta.color }}
              />
            )}
            <h4
              className={cn(
                'text-sm font-medium truncate',
                isCompleted && 'line-through'
              )}
            >
              {plan.title}
            </h4>
          </div>

          {plan.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {plan.description}
            </p>
          )}
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {isRecommended && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="w-3 h-3" />
              추천
            </Badge>
          )}
          {plan.week && (
            <Badge variant="outline" className="text-xs">
              {plan.week}
              {weekLabel}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        'transition-all duration-300 hover:shadow-md',
        isCompleted && 'opacity-75'
      )}
      style={getCardStyle()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Checkbox */}
            {onToggleComplete && (
              <Checkbox
                checked={isCompleted}
                onCheckedChange={handleToggleComplete}
                className="mt-1"
                aria-label={`${plan.title} 완료 표시`}
              />
            )}

            {/* Title and description */}
            <div className="flex-1 min-w-0">
              <CardTitle
                className={cn(
                  'text-lg flex items-center gap-2 mb-2',
                  isCompleted && 'line-through opacity-70'
                )}
              >
                {areaMeta && (
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: areaMeta.color }}
                  />
                )}
                <span className="truncate">{plan.title}</span>
              </CardTitle>

              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {isRecommended ? (
                  <Badge
                    variant="secondary"
                    className="gap-1"
                    style={
                      areaMeta
                        ? {
                            backgroundColor: areaMeta.lightBgColor,
                            color: areaMeta.color,
                            borderColor: areaMeta.color,
                          }
                        : undefined
                    }
                  >
                    <Sparkles className="w-3 h-3" />
                    추천 활동
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <User className="w-3 h-3" />
                    개인 활동
                  </Badge>
                )}

                {areaMeta && (
                  <Badge
                    variant="outline"
                    style={{
                      backgroundColor: areaMeta.lightBgColor,
                      color: areaMeta.color,
                      borderColor: areaMeta.color,
                    }}
                  >
                    {areaMeta.name}
                  </Badge>
                )}

                {plan.week && (
                  <Badge variant="outline">
                    {plan.week}
                    {weekLabel}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          {(canEdit || canDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className={cn(
                    'flex-shrink-0 transition-opacity',
                    !isHovered && 'opacity-0'
                  )}
                  aria-label="활동 메뉴"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit && (
                  <DropdownMenuItem onClick={() => onEdit(plan)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    수정
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(plan.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    삭제
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      {(plan.description || plan.notes || isCompleted) && (
        <CardContent className="pt-0 space-y-3">
          {/* Description */}
          {plan.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {plan.description}
            </p>
          )}

          {/* Recommendation details */}
          {recommendation && recommendation.activities && (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                추천 활동
              </h5>
              <ul className="space-y-1">
                {recommendation.activities.slice(0, 3).map((activity, index) => (
                  <li
                    key={index}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-xs mt-0.5">•</span>
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Notes */}
          {plan.notes && (
            <div className="p-3 bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground">{plan.notes}</p>
            </div>
          )}

          {/* Completion info */}
          {isCompleted && plan.completedAt && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                완료: {new Date(plan.completedAt).toLocaleDateString('ko-KR')}
              </span>
            </div>
          )}

          {/* Scheduled info */}
          {!isCompleted && plan.scheduledAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                예정: {new Date(plan.scheduledAt).toLocaleDateString('ko-KR')}
              </span>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
