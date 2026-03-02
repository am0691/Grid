/**
 * Spiritual Prescription Panel (맞춤형 영적 처방 패널)
 * 초기 설문 및 맞춤 양육 방향 설정
 * Phase 3: localStorage 기반 로컬 state로 전환
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Stethoscope, ClipboardList, Lightbulb, Heart } from 'lucide-react';
import type {
  FaithBackground,
  PersonalityType,
  LearningStyle,
  SpiritualWoundType,
  SpiritualProfileSurvey,
  SpiritualPrescription,
} from '@/domain/entities/spiritual-prescription';
import {
  FAITH_BACKGROUNDS,
  PERSONALITY_TYPES,
  SPIRITUAL_WOUNDS,
} from '@/domain/entities/spiritual-prescription';

const PRESCRIPTIONS_STORAGE_KEY = 'grid_prescriptions';

function loadPrescriptions(): Record<string, SpiritualPrescription> {
  try {
    const stored = localStorage.getItem(PRESCRIPTIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function savePrescriptions(prescriptions: Record<string, SpiritualPrescription>): void {
  try {
    localStorage.setItem(PRESCRIPTIONS_STORAGE_KEY, JSON.stringify(prescriptions));
  } catch {
    // Ignore storage errors
  }
}

interface SpiritualPrescriptionPanelProps {
  soulId: string;
  soulName: string;
}

export function SpiritualPrescriptionPanel({ soulId, soulName }: SpiritualPrescriptionPanelProps) {
  const [prescriptions, setPrescriptions] = useState<Record<string, SpiritualPrescription>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [faithBackground, setFaithBackground] = useState<FaithBackground>('new_believer');
  const [personalityType, setPersonalityType] = useState<PersonalityType>('relational');
  const [learningStyle, setLearningStyle] = useState<LearningStyle>('auditory');
  const [wounds, setWounds] = useState<SpiritualWoundType[]>([]);
  const [woundNotes, setWoundNotes] = useState('');
  const [expectations, setExpectations] = useState('');
  const [concerns, setConcerns] = useState('');

  // Initialize from localStorage
  useEffect(() => {
    setPrescriptions(loadPrescriptions());
  }, []);

  const prescription = prescriptions[soulId] || null;

  const handleWoundToggle = (wound: SpiritualWoundType) => {
    if (wound === 'none') {
      setWounds(['none']);
    } else {
      setWounds((prev) => {
        const filtered = prev.filter((w) => w !== 'none');
        if (filtered.includes(wound)) {
          return filtered.filter((w) => w !== wound);
        }
        return [...filtered, wound];
      });
    }
  };

  const handleSubmit = () => {
    const profile: SpiritualProfileSurvey = {
      faithBackground,
      personalityType,
      learningStyle,
      wounds: wounds.length > 0 ? wounds : undefined,
      woundNotes: woundNotes || undefined,
      expectations: expectations || undefined,
      concerns: concerns || undefined,
    };

    const newPrescription: SpiritualPrescription = {
      id: `prescription-${soulId}`,
      soulId,
      profile,
      diagnosis: {
        strengths: [],
        challenges: [],
        primaryFocus: '',
        secondaryFocus: '',
      },
      prescriptions: [],
      trainingApproach: {
        style: profile.personalityType,
        emphases: [],
        avoidances: [],
        communicationTips: [],
      },
      cautions: [],
      suggestedPaceAdjustment: 'normal',
      assessedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPrescriptions((prev) => {
      const updated = { ...prev, [soulId]: newPrescription };
      savePrescriptions(updated);
      return updated;
    });
    setIsDialogOpen(false);
  };

  const personalityInfo = prescription ? PERSONALITY_TYPES[prescription.profile.personalityType] : null;

  return (
    <>
      <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-background">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Stethoscope className="h-5 w-5 text-teal-500" />
              맞춤 양육 처방
            </CardTitle>
            <Button size="sm" onClick={() => setIsDialogOpen(true)}>
              {prescription ? '수정' : '설문'}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {prescription ? (
            <div className="space-y-4">
              {/* 프로필 요약 */}
              <div className="p-3 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">
                    {FAITH_BACKGROUNDS[prescription.profile.faithBackground].name}
                  </Badge>
                  <Badge variant="secondary">
                    {personalityInfo?.name} 유형
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {personalityInfo?.description}
                </p>
              </div>

              {/* 양육 방향 */}
              <div className="space-y-3">
                {/* 강점 */}
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">강점 영역</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {personalityInfo?.strengths.map((strength, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-green-300">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 양육 팁 */}
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardList className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">양육 팁</span>
                  </div>
                  <ul className="text-xs text-blue-600 space-y-1">
                    {personalityInfo?.trainingTips.map((tip, i) => (
                      <li key={i}>• {tip}</li>
                    ))}
                  </ul>
                </div>

                {/* 상처 주의 */}
                {prescription.profile.wounds && prescription.profile.wounds.length > 0 && !prescription.profile.wounds.includes('none') && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-700">주의 필요</span>
                    </div>
                    <ul className="text-xs text-amber-600 space-y-1">
                      {prescription.profile.wounds.map((wound) => {
                        const woundInfo = SPIRITUAL_WOUNDS[wound];
                        return (
                          <li key={wound}>
                            <span className="font-medium">{woundInfo.name}:</span>{' '}
                            {woundInfo.healingApproach[0]}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>

              {/* 기대/우려 */}
              {(prescription.profile.expectations || prescription.profile.concerns) && (
                <div className="p-3 rounded-lg bg-muted/50">
                  {prescription.profile.expectations && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">기대:</span> {prescription.profile.expectations}
                    </p>
                  )}
                  {prescription.profile.concerns && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">우려:</span> {prescription.profile.concerns}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Stethoscope className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">아직 진단이 없습니다</p>
              <p className="text-xs">설문을 통해 맞춤 양육 방향을 설정하세요</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 설문 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{soulName}님 영적 프로필 설문</DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-6 py-4">
              {/* 신앙 배경 */}
              <div className="space-y-2">
                <Label>신앙 배경</Label>
                <Select value={faithBackground} onValueChange={(v) => setFaithBackground(v as FaithBackground)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FAITH_BACKGROUNDS).map(([key, info]) => (
                      <SelectItem key={key} value={key}>
                        {info.name} - {info.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 성격 유형 */}
              <div className="space-y-2">
                <Label>성격 유형</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(PERSONALITY_TYPES) as [PersonalityType, typeof PERSONALITY_TYPES[PersonalityType]][]).map(
                    ([key, info]) => (
                      <Button
                        key={key}
                        type="button"
                        variant={personalityType === key ? 'default' : 'outline'}
                        className="h-auto py-3 flex flex-col items-start text-left"
                        onClick={() => setPersonalityType(key)}
                      >
                        <span className="font-medium">{info.name}</span>
                        <span className="text-xs font-normal opacity-80">{info.description}</span>
                      </Button>
                    )
                  )}
                </div>
              </div>

              {/* 학습 스타일 */}
              <div className="space-y-2">
                <Label>학습 스타일</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(['visual', 'auditory', 'reading', 'kinesthetic'] as LearningStyle[]).map((style) => (
                    <Button
                      key={style}
                      type="button"
                      variant={learningStyle === style ? 'default' : 'outline'}
                      className="text-xs"
                      onClick={() => setLearningStyle(style)}
                    >
                      {style === 'visual' && '시각적'}
                      {style === 'auditory' && '청각적'}
                      {style === 'reading' && '독서형'}
                      {style === 'kinesthetic' && '체험형'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 영적 상처 */}
              <div className="space-y-2">
                <Label>영적 상처 (해당 항목 선택)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(SPIRITUAL_WOUNDS) as [SpiritualWoundType, typeof SPIRITUAL_WOUNDS[SpiritualWoundType]][]).map(
                    ([key, info]) => (
                      <Button
                        key={key}
                        type="button"
                        variant={wounds.includes(key) ? 'default' : 'outline'}
                        className="text-xs justify-start"
                        onClick={() => handleWoundToggle(key)}
                      >
                        {info.name}
                      </Button>
                    )
                  )}
                </div>
                <Textarea
                  placeholder="추가 설명 (선택)"
                  value={woundNotes}
                  onChange={(e) => setWoundNotes(e.target.value)}
                  rows={2}
                  className="mt-2"
                />
              </div>

              {/* 기대 */}
              <div className="space-y-2">
                <Label>양육에 대한 기대 (선택)</Label>
                <Textarea
                  placeholder="이 양육을 통해 기대하는 것..."
                  value={expectations}
                  onChange={(e) => setExpectations(e.target.value)}
                  rows={2}
                />
              </div>

              {/* 우려 */}
              <div className="space-y-2">
                <Label>우려 사항 (선택)</Label>
                <Textarea
                  placeholder="걱정되는 부분이나 어려움..."
                  value={concerns}
                  onChange={(e) => setConcerns(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSubmit}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
