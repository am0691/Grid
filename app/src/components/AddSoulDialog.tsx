import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon, User, BookOpen } from 'lucide-react';
import type { TrainingType } from '@/types';
import type { SoulProfile } from '@/domain/entities/soul';
import { useSoulStore } from '@/store/soulStore';
import { cn } from '@/lib/utils';

interface AddSoulDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddSoulDialog({ open, onOpenChange }: AddSoulDialogProps) {
  // Basic Info State
  const [name, setName] = useState('');
  const [trainingType, setTrainingType] = useState<TrainingType>('convert');
  const [date, setDate] = useState<Date>(new Date());
  const [ageGroup, setAgeGroup] = useState<SoulProfile['ageGroup']>();
  const [occupation, setOccupation] = useState('');

  // Faith Background State
  const [faithBackground, setFaithBackground] = useState<SoulProfile['faithBackground']>();
  const [hasSalvationAssurance, setHasSalvationAssurance] = useState<boolean>();
  const [previousChurchExperience, setPreviousChurchExperience] = useState('');

  // Personality/Learning State
  const [mbti, setMbti] = useState('');
  const [personalityType, setPersonalityType] = useState<SoulProfile['personalityType']>();
  const [learningStyle, setLearningStyle] = useState<SoulProfile['learningStyle']>();
  const [preferredMeetingType, setPreferredMeetingType] = useState<SoulProfile['preferredMeetingType']>();

  // Interests State
  const [interestsInput, setInterestsInput] = useState('');
  const [spiritualGoals, setSpiritualGoals] = useState('');
  const [challenges, setChallenges] = useState('');

  const { addSoul } = useSoulStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const dateStr = format(date, 'yyyy-MM-dd');

    // Build profile object (only include fields that have values)
    const profile: SoulProfile = {};

    if (ageGroup) profile.ageGroup = ageGroup;
    if (occupation.trim()) profile.occupation = occupation.trim();
    if (mbti.trim()) profile.mbti = mbti.trim();
    if (faithBackground) profile.faithBackground = faithBackground;
    if (hasSalvationAssurance !== undefined) profile.hasSalvationAssurance = hasSalvationAssurance;
    if (previousChurchExperience.trim()) profile.previousChurchExperience = previousChurchExperience.trim();
    if (personalityType) profile.personalityType = personalityType;
    if (learningStyle) profile.learningStyle = learningStyle;
    if (preferredMeetingType) profile.preferredMeetingType = preferredMeetingType;
    if (interestsInput.trim()) {
      profile.interests = interestsInput.split(',').map(s => s.trim()).filter(s => s);
    }
    if (spiritualGoals.trim()) profile.spiritualGoals = spiritualGoals.trim();
    if (challenges.trim()) profile.challenges = challenges.trim();

    try {
      await addSoul({
        name: name.trim(),
        trainingType,
        startDate: dateStr,
        profile: Object.keys(profile).length > 0 ? profile : undefined,
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add soul:', error);
      toast.error('영혼 추가에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setTrainingType('convert');
    setDate(new Date());
    setAgeGroup(undefined);
    setOccupation('');
    setFaithBackground(undefined);
    setHasSalvationAssurance(undefined);
    setPreviousChurchExperience('');
    setMbti('');
    setPersonalityType(undefined);
    setLearningStyle(undefined);
    setPreferredMeetingType(undefined);
    setInterestsInput('');
    setSpiritualGoals('');
    setChallenges('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            새 영혼 추가
          </DialogTitle>
          <DialogDescription>
            양육을 시작할 영혼의 정보를 입력하세요. 기본 정보만 필수이며, 나머지는 선택사항입니다.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">기본 정보</TabsTrigger>
            <TabsTrigger value="faith">신앙 배경</TabsTrigger>
            <TabsTrigger value="personality">성격/학습</TabsTrigger>
            <TabsTrigger value="interests">관심사</TabsTrigger>
          </TabsList>

          {/* Tab 1: Basic Info */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="영혼의 이름을 입력하세요"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>양육 유형 *</Label>
              <RadioGroup
                value={trainingType}
                onValueChange={(value) => setTrainingType(value as TrainingType)}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem value="convert" id="convert" className="peer sr-only" />
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
                  <RadioGroupItem value="disciple" id="disciple" className="peer sr-only" />
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

            <div className="space-y-2">
              <Label>시작일 *</Label>
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

            <div className="space-y-2">
              <Label htmlFor="ageGroup">연령대</Label>
              <Select value={ageGroup} onValueChange={(value) => setAgeGroup(value as SoulProfile['ageGroup'])}>
                <SelectTrigger id="ageGroup">
                  <SelectValue placeholder="선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teens">10대</SelectItem>
                  <SelectItem value="20s">20대</SelectItem>
                  <SelectItem value="30s">30대</SelectItem>
                  <SelectItem value="40s">40대</SelectItem>
                  <SelectItem value="50s">50대</SelectItem>
                  <SelectItem value="60s+">60대 이상</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation">직업</Label>
              <Input
                id="occupation"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="예: 대학생, 직장인, 주부"
              />
            </div>
          </TabsContent>

          {/* Tab 2: Faith Background */}
          <TabsContent value="faith" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="faithBackground">신앙 배경</Label>
              <Select value={faithBackground} onValueChange={(value) => setFaithBackground(value as SoulProfile['faithBackground'])}>
                <SelectTrigger id="faithBackground">
                  <SelectValue placeholder="선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">새신자</SelectItem>
                  <SelectItem value="returned">재등록</SelectItem>
                  <SelectItem value="transferred">타교회 출신</SelectItem>
                  <SelectItem value="seeker">구도자</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salvationAssurance">구원의 확신</Label>
              <Select
                value={hasSalvationAssurance === undefined ? undefined : hasSalvationAssurance ? 'yes' : 'no'}
                onValueChange={(value) => setHasSalvationAssurance(value === 'yes')}
              >
                <SelectTrigger id="salvationAssurance">
                  <SelectValue placeholder="선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">있음</SelectItem>
                  <SelectItem value="no">없음</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="previousChurch">이전 교회 경험</Label>
              <Textarea
                id="previousChurch"
                value={previousChurchExperience}
                onChange={(e) => setPreviousChurchExperience(e.target.value)}
                placeholder="이전에 다녔던 교회나 신앙 경험이 있다면 간단히 적어주세요"
                rows={3}
              />
            </div>
          </TabsContent>

          {/* Tab 3: Personality/Learning */}
          <TabsContent value="personality" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="mbti">MBTI</Label>
              <Input
                id="mbti"
                value={mbti}
                onChange={(e) => setMbti(e.target.value.toUpperCase())}
                placeholder="예: ENFP"
                maxLength={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="personalityType">성격 유형</Label>
              <Select value={personalityType} onValueChange={(value) => setPersonalityType(value as SoulProfile['personalityType'])}>
                <SelectTrigger id="personalityType">
                  <SelectValue placeholder="선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="analytical">분석형 (논리적, 체계적)</SelectItem>
                  <SelectItem value="relational">관계형 (감성적, 공감적)</SelectItem>
                  <SelectItem value="experiential">체험형 (실천적, 경험 중시)</SelectItem>
                  <SelectItem value="practical">실용형 (효율적, 결과 중심)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="learningStyle">학습 스타일</Label>
              <Select value={learningStyle} onValueChange={(value) => setLearningStyle(value as SoulProfile['learningStyle'])}>
                <SelectTrigger id="learningStyle">
                  <SelectValue placeholder="선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visual">시각형 (그림, 도표)</SelectItem>
                  <SelectItem value="auditory">청각형 (설명, 토론)</SelectItem>
                  <SelectItem value="reading">읽기형 (책, 글)</SelectItem>
                  <SelectItem value="kinesthetic">체험형 (실습, 활동)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meetingType">선호 만남 방식</Label>
              <Select value={preferredMeetingType} onValueChange={(value) => setPreferredMeetingType(value as SoulProfile['preferredMeetingType'])}>
                <SelectTrigger id="meetingType">
                  <SelectValue placeholder="선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-person">대면</SelectItem>
                  <SelectItem value="online">온라인</SelectItem>
                  <SelectItem value="both">혼합</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Tab 4: Interests */}
          <TabsContent value="interests" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="interests">관심사</Label>
              <Input
                id="interests"
                value={interestsInput}
                onChange={(e) => setInterestsInput(e.target.value)}
                placeholder="쉼표로 구분하여 입력 (예: 음악, 독서, 봉사)"
              />
              <p className="text-xs text-muted-foreground">
                여러 개를 입력할 때는 쉼표(,)로 구분해주세요
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="spiritualGoals">영적 목표</Label>
              <Textarea
                id="spiritualGoals"
                value={spiritualGoals}
                onChange={(e) => setSpiritualGoals(e.target.value)}
                placeholder="이 영혼이 양육을 통해 이루고 싶은 영적 목표가 있다면 적어주세요"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="challenges">어려움/과제</Label>
              <Textarea
                id="challenges"
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
                placeholder="현재 겪고 있는 영적 어려움이나 극복해야 할 과제가 있다면 적어주세요"
                rows={3}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Submit buttons */}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
          >
            취소
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={!name.trim() || isSubmitting}
          >
            {isSubmitting ? '추가 중...' : '추가'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
