/**
 * PastoralLogForm - 통합 목회 일지 작성 폼
 * ActivityEvaluation + SpiritualState + Breakthrough를 하나의 폼으로 통합
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Star,
  Heart,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  AlertCircle,
  Sparkles,
  Target,
  ArrowRight,
} from 'lucide-react';
import type { SpiritualMood, BreakthroughCategory } from '@/domain/entities/pastoral-log';
import { MOOD_LABELS, MOOD_COLORS, BREAKTHROUGH_CATEGORIES } from '@/domain/entities/pastoral-log';
import type { CreatePastoralLogDto } from '@/domain/entities/pastoral-log';

// ─── Props ──────────────────────────────────────────────

interface PastoralLogFormProps {
  soulId: string;
  activityPlanId?: string;
  initialData?: Partial<CreatePastoralLogDto>;
  onSubmit: (data: CreatePastoralLogDto) => Promise<void>;
  onCancel: () => void;
  availablePlans?: Array<{ id: string; title: string; type: string }>;
}

// ─── Constants ──────────────────────────────────────────

const RATING_LABELS: Record<number, string> = {
  1: '많이 아쉬움',
  2: '조금 아쉬움',
  3: '보통',
  4: '좋았음',
  5: '매우 좋았음',
};

const NO_PLAN = '__none__';

// ─── Component ──────────────────────────────────────────

export function PastoralLogForm({
  soulId,
  activityPlanId,
  initialData,
  onSubmit,
  onCancel,
  availablePlans,
}: PastoralLogFormProps) {
  // --- Section 1: 활동 연결 ---
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(
    initialData?.activityPlanId ?? activityPlanId
  );

  // --- Section 2: 영적 상태 (필수) ---
  const [mood, setMood] = useState<SpiritualMood>(
    initialData?.mood ?? 'stable'
  );
  const [hungerLevel, setHungerLevel] = useState<1 | 2 | 3 | 4 | 5>(
    initialData?.hungerLevel ?? 3
  );
  const [closenessLevel, setClosenessLevel] = useState<1 | 2 | 3 | 4 | 5>(
    initialData?.closenessLevel ?? 3
  );
  const [observations, setObservations] = useState(
    initialData?.observations ?? ''
  );
  const [concerns, setConcerns] = useState(initialData?.concerns ?? '');
  const [praises, setPraises] = useState(initialData?.praises ?? '');
  const [prayerNeeds, setPrayerNeeds] = useState(
    initialData?.prayerNeeds ?? ''
  );

  // --- Section 3: 활동 평가 (선택) ---
  const [evalOpen, setEvalOpen] = useState(
    initialData?.rating != null
  );
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(
    initialData?.rating ?? 3
  );
  const [evaluationNotes, setEvaluationNotes] = useState(
    initialData?.evaluationNotes ?? ''
  );

  // --- Section 4: 영적 돌파 (선택) ---
  const [hasBreakthrough, setHasBreakthrough] = useState(
    initialData?.hasBreakthrough ?? false
  );
  const [breakthroughCategory, setBreakthroughCategory] =
    useState<BreakthroughCategory>(
      initialData?.breakthroughCategory ?? 'insight'
    );
  const [breakthroughTitle, setBreakthroughTitle] = useState(
    initialData?.breakthroughTitle ?? ''
  );
  const [breakthroughDescription, setBreakthroughDescription] = useState(
    initialData?.breakthroughDescription ?? ''
  );
  const [bibleReferences, setBibleReferences] = useState(
    initialData?.bibleReferences?.map((r) => r.book).join(', ') ?? ''
  );

  // --- Section 5: 다음 단계 (선택) ---
  const [nextStepsOpen, setNextStepsOpen] = useState(
    !!(initialData?.nextSteps || initialData?.followUpActions?.length)
  );
  const [nextSteps, setNextSteps] = useState(initialData?.nextSteps ?? '');
  const [followUpActions, setFollowUpActions] = useState(
    initialData?.followUpActions?.join('\n') ?? ''
  );

  // --- Submission state ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Validation ─────────────────────────────────────────

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!mood) {
      newErrors.mood = '영적 상태를 선택해주세요';
    }
    if (!hungerLevel) {
      newErrors.hungerLevel = '영적 갈급함을 선택해주세요';
    }
    if (!closenessLevel) {
      newErrors.closenessLevel = '관계 친밀도를 선택해주세요';
    }
    if (hasBreakthrough && !breakthroughCategory) {
      newErrors.breakthroughCategory = '돌파 카테고리를 선택해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Submit Handler ─────────────────────────────────────

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const parsedBibleRefs = bibleReferences.trim()
        ? bibleReferences
            .split(',')
            .map((ref) => ref.trim())
            .filter(Boolean)
            .map((ref) => ({ book: ref, chapter: 1, verse: '1' }))
        : undefined;

      const dto: CreatePastoralLogDto = {
        soulId,
        activityPlanId: selectedPlanId,

        // 영적 상태 (필수)
        mood,
        hungerLevel,
        closenessLevel,
        observations: observations || undefined,
        concerns: concerns || undefined,
        praises: praises || undefined,
        prayerNeeds: prayerNeeds || undefined,

        // 활동 평가 (선택)
        rating: evalOpen ? rating : undefined,
        evaluationNotes: evalOpen && evaluationNotes ? evaluationNotes : undefined,

        // 영적 돌파 (선택)
        hasBreakthrough,
        breakthroughCategory: hasBreakthrough ? breakthroughCategory : undefined,
        breakthroughTitle:
          hasBreakthrough && breakthroughTitle ? breakthroughTitle : undefined,
        breakthroughDescription:
          hasBreakthrough && breakthroughDescription
            ? breakthroughDescription
            : undefined,
        bibleReferences:
          hasBreakthrough && parsedBibleRefs?.length
            ? parsedBibleRefs
            : undefined,

        // 다음 단계 (선택)
        nextSteps: nextStepsOpen && nextSteps ? nextSteps : undefined,
        followUpActions:
          nextStepsOpen && followUpActions
            ? followUpActions
                .split('\n')
                .map((a) => a.trim())
                .filter(Boolean)
            : undefined,
      };

      await onSubmit(dto);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Shared: Star Rating ────────────────────────────────

  const StarRating = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (v: 1 | 2 | 3 | 4 | 5) => void;
    label?: string;
  }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n as 1 | 2 | 3 | 4 | 5)}
          className={`p-0.5 rounded transition-all hover:scale-110 ${
            n <= value
              ? 'text-warning'
              : 'text-muted-foreground/30'
          }`}
        >
          <Star
            className="h-6 w-6"
            fill={n <= value ? 'currentColor' : 'none'}
          />
        </button>
      ))}
      {label && (
        <span className="ml-2 text-sm text-muted-foreground">{label}</span>
      )}
    </div>
  );

  // ─── Inline Error ───────────────────────────────────────

  const FieldError = ({ field }: { field: string }) =>
    errors[field] ? (
      <p className="flex items-center gap-1 text-sm text-destructive mt-1">
        <AlertCircle className="h-3 w-3" />
        {errors[field]}
      </p>
    ) : null;

  // ─── Render ─────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* ── Section 1: 활동 연결 (선택) ── */}
      {availablePlans && availablePlans.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-primary" />
              활동 연결
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedPlanId ?? NO_PLAN}
              onValueChange={(v) =>
                setSelectedPlanId(v === NO_PLAN ? undefined : v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="활동 계획 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_PLAN}>
                  연결 없이 독립 기록
                </SelectItem>
                {availablePlans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    <span className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        [{plan.type}]
                      </span>
                      <span>{plan.title}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* ── Section 2: 영적 상태 (필수) ── */}
      <Card className="border-2 border-warning/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="h-4 w-4 text-warning" />
            영적 상태
            <span className="text-xs font-normal text-muted-foreground">
              (필수)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 영적 상태 (mood) */}
          <div className="space-y-2">
            <Label>현재 상태</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['growing', 'stable', 'struggling'] as SpiritualMood[]).map(
                (m) => (
                  <Button
                    key={m}
                    type="button"
                    variant={mood === m ? 'default' : 'outline'}
                    className="flex flex-col h-auto py-3"
                    onClick={() => {
                      setMood(m);
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.mood;
                        return next;
                      });
                    }}
                    style={mood === m ? { backgroundColor: MOOD_COLORS[m] } : {}}
                  >
                    <span className="text-lg">
                      {MOOD_LABELS[m].split(' ')[0]}
                    </span>
                    <span className="text-xs">
                      {MOOD_LABELS[m].split(' ')[1]}
                    </span>
                  </Button>
                )
              )}
            </div>
            <FieldError field="mood" />
          </div>

          {/* 영적 갈급함 */}
          <div className="space-y-2">
            <Label>영적 갈급함</Label>
            <StarRating
              value={hungerLevel}
              onChange={(v) => {
                setHungerLevel(v);
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.hungerLevel;
                  return next;
                });
              }}
              label={`${hungerLevel}/5`}
            />
            <p className="text-xs text-muted-foreground">
              1: 낮음 ~ 5: 매우 높음
            </p>
            <FieldError field="hungerLevel" />
          </div>

          {/* 관계 친밀도 */}
          <div className="space-y-2">
            <Label>관계 친밀도</Label>
            <StarRating
              value={closenessLevel}
              onChange={(v) => {
                setClosenessLevel(v);
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.closenessLevel;
                  return next;
                });
              }}
              label={`${closenessLevel}/5`}
            />
            <p className="text-xs text-muted-foreground">
              1: 거리감 ~ 5: 매우 친밀
            </p>
            <FieldError field="closenessLevel" />
          </div>

          {/* 관찰 내용 */}
          <div className="space-y-2">
            <Label>관찰 내용 (선택)</Label>
            <Textarea
              placeholder="오늘 만남에서 관찰한 점..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={2}
            />
          </div>

          {/* 우려 사항 */}
          <div className="space-y-2">
            <Label>우려 사항 (선택)</Label>
            <Textarea
              placeholder="걱정되는 부분..."
              value={concerns}
              onChange={(e) => setConcerns(e.target.value)}
              rows={2}
            />
          </div>

          {/* 칭찬/감사 */}
          <div className="space-y-2">
            <Label>칭찬/감사할 점 (선택)</Label>
            <Textarea
              placeholder="성장한 부분, 감사한 점..."
              value={praises}
              onChange={(e) => setPraises(e.target.value)}
              rows={2}
            />
          </div>

          {/* 기도 필요 */}
          <div className="space-y-2">
            <Label>기도 필요 (선택)</Label>
            <Textarea
              placeholder="기도가 필요한 부분..."
              value={prayerNeeds}
              onChange={(e) => setPrayerNeeds(e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Section 3: 활동 평가 (선택, Collapsible) ── */}
      <Collapsible open={evalOpen} onOpenChange={setEvalOpen}>
        <Card>
          <CardHeader className="pb-3">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex items-center justify-between w-full text-left"
              >
                <CardTitle className="flex items-center gap-2 text-base">
                  <Star className="h-4 w-4 text-warning" />
                  활동 평가
                  <span className="text-xs font-normal text-muted-foreground">
                    (선택)
                  </span>
                </CardTitle>
                {evalOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              {/* 별점 평가 */}
              <div className="space-y-2">
                <Label>전체 평가</Label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n as 1 | 2 | 3 | 4 | 5)}
                      className={`p-1 rounded-md transition-all hover:scale-110 ${
                        n <= rating
                          ? 'text-warning'
                          : 'text-muted-foreground/30'
                      }`}
                    >
                      <Star
                        className="h-8 w-8"
                        fill={n <= rating ? 'currentColor' : 'none'}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {RATING_LABELS[rating]}
                </p>
              </div>

              {/* 평가 메모 */}
              <div className="space-y-2">
                <Label>평가 메모 (선택)</Label>
                <Textarea
                  placeholder="활동에 대한 평가와 소감..."
                  value={evaluationNotes}
                  onChange={(e) => setEvaluationNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* ── Section 4: 영적 돌파 (선택, Toggle) ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-accent" />
              영적 돌파
              <span className="text-xs font-normal text-muted-foreground">
                (선택)
              </span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="breakthrough-switch" className="text-sm">
                {hasBreakthrough ? '있음' : '없음'}
              </Label>
              <Switch
                id="breakthrough-switch"
                checked={hasBreakthrough}
                onCheckedChange={setHasBreakthrough}
              />
            </div>
          </div>
        </CardHeader>

        {hasBreakthrough && (
          <CardContent className="space-y-4 pt-0">
            {/* 카테고리 */}
            <div className="space-y-2">
              <Label>카테고리</Label>
              <Select
                value={breakthroughCategory}
                onValueChange={(v) => {
                  setBreakthroughCategory(v as BreakthroughCategory);
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.breakthroughCategory;
                    return next;
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BREAKTHROUGH_CATEGORIES).map(
                    ([key, info]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <span>{info.emoji}</span>
                          <span>{info.name}</span>
                        </span>
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <FieldError field="breakthroughCategory" />
            </div>

            {/* 제목 */}
            <div className="space-y-2">
              <Label>제목 (한줄 요약)</Label>
              <Input
                placeholder="예: 처음으로 죄를 고백함"
                value={breakthroughTitle}
                onChange={(e) =>
                  setBreakthroughTitle(e.target.value.slice(0, 200))
                }
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground text-right">
                {breakthroughTitle.length}/200
              </p>
            </div>

            {/* 상세 내용 */}
            <div className="space-y-2">
              <Label>상세 내용</Label>
              <Textarea
                placeholder="어떤 일이 있었는지 자세히 기록해주세요..."
                value={breakthroughDescription}
                onChange={(e) =>
                  setBreakthroughDescription(e.target.value.slice(0, 5000))
                }
                rows={4}
                maxLength={5000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {breakthroughDescription.length}/5000
              </p>
            </div>

            {/* 말씀 연결 */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                연결된 말씀 (선택)
              </Label>
              <Input
                placeholder="예: 요한복음 3:16, 로마서 8:28"
                value={bibleReferences}
                onChange={(e) => setBibleReferences(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                쉼표(,)로 구분하여 입력
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* ── Section 5: 다음 단계 (선택, Collapsible) ── */}
      <Collapsible open={nextStepsOpen} onOpenChange={setNextStepsOpen}>
        <Card>
          <CardHeader className="pb-3">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex items-center justify-between w-full text-left"
              >
                <CardTitle className="flex items-center gap-2 text-base">
                  <ArrowRight className="h-4 w-4 text-growth" />
                  다음 단계
                  <span className="text-xs font-normal text-muted-foreground">
                    (선택)
                  </span>
                </CardTitle>
                {nextStepsOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2">
                <Label>다음 단계</Label>
                <Textarea
                  placeholder="다음에 해야 할 일이나 방향..."
                  value={nextSteps}
                  onChange={(e) => setNextSteps(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>실천 사항 (줄바꿈으로 구분)</Label>
                <Textarea
                  placeholder={"매일 말씀 묵상하기\n주 1회 소그룹 참석\n..."}
                  value={followUpActions}
                  onChange={(e) => setFollowUpActions(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-1" />
          취소
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          <Save className="h-4 w-4 mr-1" />
          {isSubmitting ? '저장 중...' : '저장'}
        </Button>
      </div>
    </div>
  );
}
