import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon, User, BookOpen } from 'lucide-react';
import type { TrainingType } from '@/types';
import { useGridStore } from '@/store/gridStore';
import { cn } from '@/lib/utils';

interface AddSoulDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddSoulDialog({ open, onOpenChange }: AddSoulDialogProps) {
  const [name, setName] = useState('');
  const [trainingType, setTrainingType] = useState<TrainingType>('convert');
  const [date, setDate] = useState<Date>(new Date());
  
  const addSoul = useGridStore(state => state.addSoul);

  const handleSubmit = () => {
    if (!name.trim()) return;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    addSoul(name.trim(), trainingType, dateStr);
    
    // Reset form
    setName('');
    setTrainingType('convert');
    setDate(new Date());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            새 영혼 추가
          </DialogTitle>
          <DialogDescription>
            양육을 시작할 영혼의 정보를 입력하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 이름 입력 */}
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="영혼의 이름을 입력하세요"
              autoFocus
            />
          </div>

          {/* 양육 유형 선택 */}
          <div className="space-y-2">
            <Label>양육 유형</Label>
            <RadioGroup
              value={trainingType}
              onValueChange={(value) => setTrainingType(value as TrainingType)}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="convert"
                  id="convert"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="convert"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <BookOpen className="mb-3 h-6 w-6" />
                  <div className="text-center">
                    <p className="font-medium">Convert</p>
                    <p className="text-xs text-muted-foreground">13주 과정</p>
                  </div>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem
                  value="disciple"
                  id="disciple"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="disciple"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <BookOpen className="mb-3 h-6 w-6" />
                  <div className="text-center">
                    <p className="font-medium">Disciple</p>
                    <p className="text-xs text-muted-foreground">12개월 과정</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 시작일 선택 */}
          <div className="space-y-2">
            <Label>시작일</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'yyyy년 MM월 dd일', { locale: ko }) : '날짜 선택'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={!name.trim()}
            >
              추가
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
