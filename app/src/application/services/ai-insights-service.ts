/**
 * AI Insights Service
 * Gemini-powered analysis with Korean prompts
 */

import { GeminiClient } from '../../infrastructure/services/ai/gemini-client';
import type { ActivityEvaluation, ActivityPlan } from '../../domain/entities/activity-plan';
import type { Soul, SoulProfile } from '../../domain/entities/soul';

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

export class AIInsightsService {
  private client: GeminiClient;

  constructor(client: GeminiClient) {
    this.client = client;
  }

  /**
   * Analyze evaluation text to extract insights
   */
  async analyzeEvaluationText(evaluations: ActivityEvaluation[]): Promise<EvaluationAnalysis | null> {
    if (evaluations.length === 0) {
      return null;
    }

    const evaluationSummary = evaluations.map((e, i) => `
평가 ${i + 1}:
- 평점: ${e.rating}/5
- 평가 내용: ${e.evaluationNotes || '없음'}
- 실제 결과: ${e.actualOutcome || '없음'}
- 어려움: ${e.challengesFaced || '없음'}
`).join('\n');

    const prompt = `당신은 기독교 제자훈련 전문 상담사입니다.

## 평가 데이터
${evaluationSummary}

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
