/**
 * Add Activity Plan Dialog
 * Modal for creating new personal activity plans
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { Soul } from '@/types';
import type { Area } from '@/domain/value-objects/area';
import { getAreaMeta, CONVERT_WEEKS, DISCIPLE_MONTHS } from '@/types';
import { PlusCircle, Loader2 } from 'lucide-react';

const activityPlanSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해주세요')
    .max(100, '제목은 100자 이내로 입력해주세요'),
  areaId: z.string().min(1, '영역을 선택해주세요'),
  week: z.number().min(1, '주차/월차를 선택해주세요'),
  description: z.string().optional(),
});

type ActivityPlanFormValues = z.infer<typeof activityPlanSchema>;

interface AddActivityPlanDialogProps {
  soul: Soul;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ActivityPlanFormValues) => Promise<void>;
  defaultAreaId?: Area;
  defaultWeek?: number;
}

export function AddActivityPlanDialog({
  soul,
  open,
  onOpenChange,
  onSubmit,
  defaultAreaId,
  defaultWeek,
}: AddActivityPlanDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const areas =
    soul.trainingType === 'convert'
      ? ['salvation', 'word', 'fellowship', 'sin', 'notes']
      : [
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
          'character',
          'notes',
          'events',
        ];

  const maxWeek = soul.trainingType === 'convert' ? CONVERT_WEEKS : DISCIPLE_MONTHS;
  const weekLabel = soul.trainingType === 'convert' ? '주차' : '월차';

  const form = useForm<ActivityPlanFormValues>({
    resolver: zodResolver(activityPlanSchema),
    defaultValues: {
      title: '',
      areaId: defaultAreaId || '',
      week: defaultWeek || 1,
      description: '',
    },
  });

  const handleSubmit = async (data: ActivityPlanFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create activity plan:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAreaId = form.watch('areaId');
  const areaMeta = selectedAreaId
    ? getAreaMeta(selectedAreaId as Area, soul.trainingType)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            활동 계획 추가
          </DialogTitle>
          <DialogDescription>
            {soul.name}님과의 활동 계획을 작성하세요
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* 영역 선택 */}
            <FormField
              control={form.control}
              name="areaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>영역</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="영역을 선택하세요">
                          {areaMeta && (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: areaMeta.color }}
                              />
                              <span>{areaMeta.name}</span>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {areas.map((areaId) => {
                        const meta = getAreaMeta(areaId as Area, soul.trainingType);
                        return (
                          <SelectItem key={areaId} value={areaId}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: meta.color }}
                              />
                              <span>{meta.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    이 활동이 속하는 훈련 영역을 선택하세요
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 주차/월차 선택 */}
            <FormField
              control={form.control}
              name="week"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{weekLabel}</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={`${weekLabel}를 선택하세요`} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from({ length: maxWeek }, (_, i) => i + 1).map((week) => (
                        <SelectItem key={week} value={week.toString()}>
                          {week}
                          {weekLabel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>활동 예정 {weekLabel}를 선택하세요</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 제목 입력 */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="예: 구원의 확신 나눔"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>활동의 제목을 입력하세요</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 설명 입력 */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명 (선택)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="활동에 대한 상세 설명을 입력하세요..."
                      rows={4}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    활동 내용, 준비사항 등을 자유롭게 작성하세요
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                style={
                  areaMeta
                    ? {
                        backgroundColor: areaMeta.color,
                        borderColor: areaMeta.color,
                      }
                    : undefined
                }
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isSubmitting ? '저장 중...' : '저장'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
