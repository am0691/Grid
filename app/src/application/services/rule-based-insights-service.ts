/**
 * Rule-Based Insights Service
 * Fallback service when AI API is unavailable
 */

import type { ActivityEvaluation, ActivityPlan } from '../../domain/entities/activity-plan';
import type { Soul } from '../../domain/entities/soul';
import type { EvaluationAnalysis, PersonalizedRecommendation, MBTIAdvice } from './ai-insights-service';

export class RuleBasedInsightsService {
  /**
   * Analyze evaluations using keyword extraction
   */
  analyzeEvaluationText(evaluations: ActivityEvaluation[]): EvaluationAnalysis {
    if (evaluations.length === 0) {
      return {
        commonChallenges: ['평가 데이터가 없습니다'],
        successFactors: ['평가 데이터가 없습니다'],
        summary: '분석할 평가 데이터가 없습니다.',
      };
    }

    const avgRating = evaluations.reduce((sum, e) => sum + e.rating, 0) / evaluations.length;
    const highRatedCount = evaluations.filter(e => e.rating >= 4).length;
    const lowRatedCount = evaluations.filter(e => e.rating <= 2).length;

    // Extract challenges from low-rated evaluations
    const challenges = this.extractKeywords(
      evaluations.filter(e => e.rating <= 3),
      'challengesFaced'
    );

    // Extract success factors from high-rated evaluations
    const successFactors = this.extractKeywords(
      evaluations.filter(e => e.rating >= 4),
      'actualOutcome'
    );

    const summary = `총 ${evaluations.length}개 평가 분석 완료. 평균 평점 ${avgRating.toFixed(1)}점. ` +
      `높은 평가(4-5점) ${highRatedCount}개, 낮은 평가(1-2점) ${lowRatedCount}개.`;

    return {
      commonChallenges: challenges.length > 0 ? challenges : ['특별한 어려움이 언급되지 않았습니다'],
      successFactors: successFactors.length > 0 ? successFactors : ['긍정적 결과가 보고되었습니다'],
      summary,
    };
  }

  /**
   * Generate personalized recommendations using profile rules
   */
  generatePersonalizedRecommendation(
    soul: Soul,
    _activities: ActivityPlan[],
    _evaluations: ActivityEvaluation[]
  ): PersonalizedRecommendation {
    const recommendations: string[] = [];
    const tips: string[] = [];
    const profile = soul.profile;

    // Learning style-based recommendations
    if (profile?.learningStyle === 'visual') {
      recommendations.push('바이블 프로젝트 영상 시청 및 토론');
      tips.push('시각 자료를 적극 활용하세요');
    } else if (profile?.learningStyle === 'auditory') {
      recommendations.push('성경 오디오북 청취 및 나눔');
      tips.push('대화와 토론 중심의 만남을 계획하세요');
    } else if (profile?.learningStyle === 'kinesthetic') {
      recommendations.push('봉사 활동과 실천 중심 활동');
      tips.push('체험형 활동을 우선적으로 배치하세요');
    }

    // Personality type-based recommendations
    if (profile?.personalityType === 'relational') {
      recommendations.push('소그룹 나눔 및 교제 시간');
      tips.push('관계 형성에 충분한 시간을 할애하세요');
    } else if (profile?.personalityType === 'analytical') {
      recommendations.push('심화 성경공부 및 신학 토론');
      tips.push('논리적 설명과 자료 제공을 준비하세요');
    } else if (profile?.personalityType === 'practical') {
      recommendations.push('실천 과제 및 구체적 액션 플랜');
      tips.push('명확한 실천 가이드를 제시하세요');
    }

    // Faith background-based recommendations
    if (profile?.faithBackground === 'new') {
      recommendations.push('기초 신앙 교육 및 정기적 만남');
      tips.push('기초부터 천천히 단계적으로 진행하세요');
    } else if (profile?.faithBackground === 'returned') {
      recommendations.push('재헌신 동기 강화 및 회복 프로그램');
      tips.push('과거 신앙 경험을 존중하며 접근하세요');
    }

    // Training type-based recommendations
    if (soul.trainingType === 'convert') {
      recommendations.push('정기적 1:1 만남 (주 1회)');
      recommendations.push('기도 훈련 및 말씀 묵상');
    } else if (soul.trainingType === 'disciple') {
      recommendations.push('전도 실습 및 리더십 개발');
      recommendations.push('섬김과 헌신 훈련');
    }

    // Default tips
    tips.push('일관된 만남 시간을 유지하세요');
    tips.push('경청을 우선시하고 영혼의 상태를 파악하세요');

    const reasoning = profile
      ? `${soul.name}님의 프로필(${profile.learningStyle || '미지정'} 학습 스타일, ${profile.personalityType || '미지정'} 성격)을 고려한 추천입니다.`
      : `${soul.name}님의 훈련 단계(${soul.trainingType})에 맞춘 기본 추천입니다.`;

    return {
      recommendedActivities: recommendations.length > 0
        ? recommendations.slice(0, 3)
        : ['정기 1:1 만남', '말씀 묵상 나눔', '기도 훈련'],
      reasoning,
      tips: tips.slice(0, 3),
    };
  }

  /**
   * Get MBTI-based advice using static mapping
   */
  getMBTIBasedAdvice(mbti: string): MBTIAdvice {
    const mbtiMap: Record<string, MBTIAdvice> = {
      'ENFP': {
        strengths: ['열정적이고 창의적인 신앙 표현', '사람들과의 교제를 통한 성장', '새로운 영적 경험에 대한 개방성'],
        challenges: ['일관성 유지의 어려움', '깊이 있는 묵상보다 활동 선호', '세부 사항 소홀 가능'],
        communicationTips: ['긍정적이고 격려적인 태도로 접근', '창의적 아이디어 존중', '구조화된 틀 제공'],
        activityPreferences: ['그룹 토론 및 나눔', '창의적 찬양 및 예배', '다양한 봉사 활동'],
      },
      'INFJ': {
        strengths: ['깊은 영적 통찰력', '타인에 대한 공감과 이해', '신앙의 본질 추구'],
        challenges: ['완벽주의로 인한 부담', '혼자만의 시간 필요', '비판에 민감'],
        communicationTips: ['진정성 있는 대화', '개인적 공간 존중', '깊이 있는 주제 다루기'],
        activityPreferences: ['1:1 심화 대화', '묵상 및 기도', '의미 있는 봉사'],
      },
      'ISTJ': {
        strengths: ['책임감 있는 신앙 실천', '체계적 성경 공부', '헌신과 충성'],
        challenges: ['변화 수용 어려움', '감정 표현 제한적', '융통성 부족'],
        communicationTips: ['명확하고 구조화된 계획', '실용적 접근', '신뢰 구축'],
        activityPreferences: ['체계적 성경 공부', '규칙적 예배 및 기도', '실천 가능한 과제'],
      },
      'ESTJ': {
        strengths: ['리더십과 조직력', '명확한 신앙 표준', '효율적 실행력'],
        challenges: ['타인 의견 경청 부족', '과도한 통제', '유연성 결여'],
        communicationTips: ['논리적 설명', '명확한 기대치 설정', '결과 중심 접근'],
        activityPreferences: ['리더십 훈련', '조직적 봉사', '목표 지향적 활동'],
      },
    };

    const upperMBTI = mbti.toUpperCase();

    if (mbtiMap[upperMBTI]) {
      return mbtiMap[upperMBTI];
    }

    // Default advice for unmapped MBTI types
    return {
      strengths: ['고유한 신앙 여정', '개인적 성장 가능성', '하나님의 특별한 계획'],
      challenges: ['자신만의 방식 발견 필요', '균형 잡힌 성장 추구'],
      communicationTips: ['개인의 특성 존중', '열린 대화 유지', '맞춤형 접근'],
      activityPreferences: ['다양한 활동 시도', '자신에게 맞는 방식 탐색'],
    };
  }

  /**
   * Extract keywords from evaluation field
   */
  private extractKeywords(evaluations: ActivityEvaluation[], field: keyof ActivityEvaluation): string[] {
    const texts = evaluations
      .map(e => e[field])
      .filter((text): text is string => typeof text === 'string' && text.length > 0);

    if (texts.length === 0) return [];

    // Simple keyword extraction: split by common delimiters and count frequency
    const words = texts
      .join(' ')
      .split(/[,.\s]+/)
      .filter(word => word.length > 2); // Filter out very short words

    const freq = new Map<string, number>();
    words.forEach(word => {
      const normalized = word.trim();
      if (normalized) {
        freq.set(normalized, (freq.get(normalized) || 0) + 1);
      }
    });

    // Return top 5 most frequent keywords
    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }
}
