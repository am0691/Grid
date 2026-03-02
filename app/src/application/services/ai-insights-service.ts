/**
 * AI Insights Service
 * Gemini-powered analysis with Korean prompts
 */

import { GeminiClient } from '../../infrastructure/services/ai/gemini-client';
import type { ActivityEvaluation, ActivityPlan } from '../../domain/entities/activity-plan';
import type { Soul, SoulProfile } from '../../domain/entities/soul';
import type { PastoralLog } from '../../domain/entities/pastoral-log';

export interface EvaluationAnalysis {
  commonChallenges: string[];
  successFactors: string[];
  summary: string;
}

export interface PersonalizedRecommendation {
  recommendedActivities: string[];
  reasoning: string;
  tips: string[];
}

export interface MBTIAdvice {
  strengths: string[];
  challenges: string[];
  communicationTips: string[];
  activityPreferences: string[];
}

export interface SoulInsightSummary {
  soulId: string;
  soulName: string;
  overallTrend: 'improving' | 'stable' | 'declining';
  moodTrend: string;
  activityCount: number;
  breakthroughCount: number;
  lastLogDate?: string;
  attentionNeeded: boolean;
  attentionReason?: string;
}

export interface WeeklySummary {
  weekStart: string;
  totalActivities: number;
  totalLogs: number;
  breakthroughs: number;
  averageMood: number;
  highlights: string[];
}

export class AIInsightsService {
  private client: GeminiClient;

  constructor(client: GeminiClient) {
    this.client = client;
  }

  /**
   * Analyze evaluation text to extract insights.
   * Optionally accepts PastoralLog[] for mood/breakthrough analysis.
   */
  async analyzeEvaluationText(
    evaluations: ActivityEvaluation[],
    logs?: PastoralLog[]
  ): Promise<EvaluationAnalysis | null> {
    if (evaluations.length === 0 && (!logs || logs.length === 0)) {
      return null;
    }

    const evaluationSummary = evaluations.map((e, i) => `
평가 ${i + 1}:
- 평점: ${e.rating}/5
- 평가 내용: ${e.evaluationNotes || '없음'}
- 실제 결과: ${e.actualOutcome || '없음'}
- 어려움: ${e.challengesFaced || '없음'}
`).join('\n');

    const logSummary = logs && logs.length > 0
      ? logs.map((l, i) => `
목회일지 ${i + 1}:
- 무드: ${l.mood}
- 돌파: ${l.hasBreakthrough ? '있음' : '없음'}
- 관찰: ${l.observations || '없음'}
`).join('\n')
      : '';

    const prompt = `당신은 기독교 제자훈련 전문 상담사입니다.

## 평가 데이터
${evaluationSummary || '없음'}

${logSummary ? `## 목회 일지 데이터\n${logSummary}` : ''}

## 분석 요청
위 평가들을 분석하여 다음 JSON 형식으로 응답해주세요:
{
  "commonChallenges": ["자주 언급된 어려움 1", "어려움 2"],
  "successFactors": ["성공 요인 1", "성공 요인 2"],
  "summary": "전체 평가에 대한 2-3문장 요약"
}

한국어로 응답해주세요.`;

    return this.client.generateJSON<EvaluationAnalysis>(prompt);
  }

  /**
   * Compute soul insight summary using AI
   */
  async computeSoulInsight(
    soul: Soul,
    logs: PastoralLog[],
    activities: ActivityPlan[]
  ): Promise<SoulInsightSummary | null> {
    const recentLogs = logs.slice(0, 5);
    const moodHistory = recentLogs.map(l => l.mood).join(', ');
    const breakthroughCount = logs.filter(l => l.hasBreakthrough).length;
    const lastLogDate = logs[0]?.recordedAt;

    const prompt = `당신은 기독교 제자훈련 전문 상담사입니다.

## 영혼 정보
- 이름: ${soul.name}
- 최근 무드 히스토리: ${moodHistory || '없음'}
- 돌파 횟수: ${breakthroughCount}
- 총 활동 수: ${activities.length}

다음 JSON 형식으로 인사이트를 제공해주세요:
{
  "overallTrend": "improving" | "stable" | "declining",
  "moodTrend": "최근 무드 변화를 한줄로 설명",
  "attentionNeeded": true | false,
  "attentionReason": "관심 필요한 이유 (있을 경우)"
}

한국어로 응답해주세요.`;

    const result = await this.client.generateJSON<{
      overallTrend: 'improving' | 'stable' | 'declining';
      moodTrend: string;
      attentionNeeded: boolean;
      attentionReason?: string;
    }>(prompt);

    if (!result) return null;

    return {
      soulId: soul.id,
      soulName: soul.name,
      overallTrend: result.overallTrend,
      moodTrend: result.moodTrend,
      activityCount: activities.length,
      breakthroughCount,
      lastLogDate,
      attentionNeeded: result.attentionNeeded,
      attentionReason: result.attentionReason,
    };
  }

  /**
   * Compute weekly summary using AI
   */
  async computeWeeklySummary(
    logs: PastoralLog[],
    activities: ActivityPlan[],
    weekStart: Date
  ): Promise<WeeklySummary | null> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekLogs = logs.filter(l => {
      const d = new Date(l.recordedAt);
      return d >= weekStart && d < weekEnd;
    });
    const weekActivities = activities.filter(a => {
      const d = new Date(a.scheduledAt);
      return d >= weekStart && d < weekEnd;
    });

    const breakthroughs = weekLogs.filter(l => l.hasBreakthrough).length;
    const moodValues = weekLogs.map(l =>
      l.mood === 'growing' ? 3 : l.mood === 'stable' ? 2 : 1
    );
    const averageMood = moodValues.length > 0
      ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length
      : 2;

    if (weekLogs.length === 0 && weekActivities.length === 0) {
      return {
        weekStart: weekStart.toISOString(),
        totalActivities: 0,
        totalLogs: 0,
        breakthroughs: 0,
        averageMood: 2,
        highlights: ['이번 주 기록이 없습니다'],
      };
    }

    const prompt = `당신은 기독교 제자훈련 전문 상담사입니다.

## 주간 데이터 (${weekStart.toLocaleDateString('ko-KR')} ~ ${weekEnd.toLocaleDateString('ko-KR')})
- 총 활동: ${weekActivities.length}개
- 목회 일지: ${weekLogs.length}개
- 돌파 횟수: ${breakthroughs}개
- 평균 무드: ${averageMood.toFixed(1)}/3

다음 JSON 형식으로 주간 하이라이트를 제공해주세요:
{
  "highlights": ["주요 사항 1", "주요 사항 2"]
}

한국어로 응답해주세요.`;

    const result = await this.client.generateJSON<{ highlights: string[] }>(prompt);

    return {
      weekStart: weekStart.toISOString(),
      totalActivities: weekActivities.length,
      totalLogs: weekLogs.length,
      breakthroughs,
      averageMood,
      highlights: result?.highlights || [],
    };
  }

  /**
   * Generate personalized recommendations based on soul profile and history
   */
  async generatePersonalizedRecommendation(
    soul: Soul,
    activities: ActivityPlan[],
    evaluations: ActivityEvaluation[]
  ): Promise<PersonalizedRecommendation | null> {
    const profileContext = this.buildProfileContext(soul.profile);
    const avgRating = evaluations.length > 0
      ? (evaluations.reduce((sum, e) => sum + e.rating, 0) / evaluations.length).toFixed(1)
      : '없음';

    const recentActivities = activities.slice(0, 5).map(a => `- ${a.title} (${a.type})`).join('\n');

    const prompt = `당신은 기독교 제자훈련 전문 상담사입니다.

## 영혼 정보
- 이름: ${soul.name}
- 훈련 유형: ${soul.trainingType === 'convert' ? '새신자 (13주)' : '제자훈련 (12개월)'}
${profileContext}

## 평가 요약
- 평균 평점: ${avgRating}
- 총 활동 수: ${activities.length}개

## 최근 활동
${recentActivities || '없음'}

## 추천 요청
다음 JSON 형식으로 맞춤 추천을 제공해주세요:
{
  "recommendedActivities": ["구체적 활동 추천 1", "추천 2", "추천 3"],
  "reasoning": "이 활동들을 추천하는 이유 (2-3문장)",
  "tips": ["양육자를 위한 팁 1", "팁 2"]
}

한국어로 응답해주세요.`;

    return this.client.generateJSON<PersonalizedRecommendation>(prompt);
  }

  /**
   * Get MBTI-based discipleship advice
   */
  async getMBTIBasedAdvice(mbti: string): Promise<MBTIAdvice | null> {
    if (!mbti || mbti.length !== 4) {
      return null;
    }

    const prompt = `당신은 MBTI와 기독교 제자훈련을 연결하는 전문가입니다.

## MBTI 유형: ${mbti}

다음 JSON 형식으로 양육 조언을 제공해주세요:
{
  "strengths": ["신앙생활 강점 1", "강점 2", "강점 3"],
  "challenges": ["신앙생활 어려움 1", "어려움 2"],
  "communicationTips": ["소통 방법 1", "방법 2"],
  "activityPreferences": ["효과적 활동 1", "활동 2"]
}

한국어로 응답해주세요.`;

    return this.client.generateJSON<MBTIAdvice>(prompt);
  }

  /**
   * Build profile context string for prompts
   */
  private buildProfileContext(profile?: SoulProfile): string {
    if (!profile) return '- 프로필: 미입력';

    const parts: string[] = [];

    if (profile.ageGroup) parts.push(`- 연령대: ${profile.ageGroup}`);
    if (profile.gender) parts.push(`- 성별: ${profile.gender === 'male' ? '남' : '여'}`);
    if (profile.occupation) parts.push(`- 직업: ${profile.occupation}`);
    if (profile.mbti) parts.push(`- MBTI: ${profile.mbti}`);
    if (profile.faithBackground) {
      const bgMap = {
        new: '새신자',
        returned: '재헌신',
        transferred: '이적',
        seeker: '구도자'
      };
      parts.push(`- 신앙 배경: ${bgMap[profile.faithBackground]}`);
    }
    if (profile.personalityType) {
      const typeMap = {
        analytical: '분석형',
        relational: '관계형',
        experiential: '체험형',
        practical: '실천형'
      };
      parts.push(`- 성격 유형: ${typeMap[profile.personalityType]}`);
    }
    if (profile.learningStyle) {
      const styleMap = {
        visual: '시각형',
        auditory: '청각형',
        reading: '읽기/쓰기형',
        kinesthetic: '체험형'
      };
      parts.push(`- 학습 스타일: ${styleMap[profile.learningStyle]}`);
    }
    if (profile.preferredMeetingType) {
      const meetingMap = {
        'in-person': '대면',
        'online': '온라인',
        'both': '대면/온라인 모두'
      };
      parts.push(`- 선호 만남 방식: ${meetingMap[profile.preferredMeetingType]}`);
    }
    if (profile.interests && profile.interests.length > 0) {
      parts.push(`- 관심 분야: ${profile.interests.join(', ')}`);
    }
    if (profile.spiritualGoals) {
      parts.push(`- 영적 목표: ${profile.spiritualGoals}`);
    }
    if (profile.challenges) {
      parts.push(`- 어려움: ${profile.challenges}`);
    }

    return parts.length > 0 ? parts.join('\n') : '- 프로필: 미입력';
  }
}
