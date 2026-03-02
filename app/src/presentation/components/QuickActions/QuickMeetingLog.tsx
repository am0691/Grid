/**
 * QuickMeetingLog - Quick meeting logging dialog
 * Allows fast recording of meetings with souls
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
import { Calendar, Loader2 } from 'lucide-react';
import type { Soul } from '@/types';

const meetingLogSchema = z.object({
  soulId: z.string().min(1, '영혼을 선택해주세요'),
  meetingType: z.enum(['one-on-one', 'group', 'phone', 'video', 'other'], {
    message: '미팅 유형을 선택해주세요',
  }),
  notes: z.string().optional(),
  date: z.string().min(1, '날짜를 입력해주세요'),
  time: z.string().optional(),
});

type MeetingLogFormValues = z.infer<typeof meetingLogSchema>;

interface QuickMeetingLogProps {
  souls: Soul[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MeetingLogFormValues) => Promise<void>;
}

const MEETING_TYPES = [
  { value: 'one-on-one', label: '1:1 미팅' },
  { value: 'group', label: '그룹 미팅' },
  { value: 'phone', label: '전화 상담' },
  { value: 'video', label: '화상 미팅' },
  { value: 'other', label: '기타' },
] as const;

export function QuickMeetingLog({
  souls,
  open,
  onOpenChange,
  onSubmit,
}: QuickMeetingLogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default to current date and time
  const now = new Date();
  const defaultDate = now.toISOString().split('T')[0];
  const defaultTime = now.toTimeString().slice(0, 5);

  const form = useForm<MeetingLogFormValues>({
    resolver: zodResolver(meetingLogSchema),
    defaultValues: {
      soulId: '',
      meetingType: 'one-on-one',
      notes: '',
      date: defaultDate,
      time: defaultTime,
    },
  });

  const handleSubmit = async (data: MeetingLogFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset({
        soulId: '',
        meetingType: 'one-on-one',
        notes: '',
        date: defaultDate,
        time: defaultTime,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to log meeting:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSoulId = form.watch('soulId');
  const selectedSoul = souls.find((s) => s.id === selectedSoulId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            미팅 기록
          </DialogTitle>
          <DialogDescription>
            영혼과의 만남을 빠르게 기록하세요
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* 영혼 선택 */}
            <FormField
              control={form.control}
              name="soulId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>영혼</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="영혼을 선택하세요">
                          {selectedSoul?.name}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {souls.map((soul) => (
                        <SelectItem key={soul.id} value={soul.id}>
                          <div className="flex items-center gap-2">
                            <span>{soul.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({soul.trainingType === 'convert' ? '새신자' : '제자'})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 미팅 유형 */}
            <FormField
              control={form.control}
              name="meetingType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>미팅 유형</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="유형을 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MEETING_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 날짜 및 시간 */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>날짜</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>시간 (선택)</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 메모 */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>메모 (선택)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="만남의 주요 내용을 간단히 기록하세요..."
                      rows={4}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
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
              <Button type="submit" disabled={isSubmitting}>
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
