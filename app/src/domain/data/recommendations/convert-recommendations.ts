/**
 * CONVERT (13주) 활동 추천 데이터
 */

import type { ActivityRecommendation } from '../../entities/recommendation';
import type { ConvertArea } from '../../value-objects/area';

export const CONVERT_RECOMMENDATIONS: ActivityRecommendation[] = [
  // ============================================
  // 구원의 확신 (salvation) - 13주
  // ============================================
  {
    id: 'convert-salvation-1',
    trainingType: 'convert',
    areaId: 'salvation',
    week: 1,
    title: '복음의 핵심 이해하기',
    description: '다리 예화를 통해 하나님과 인간 사이의 단절과 예수님의 십자가가 유일한 다리임을 깨닫습니다.',
    bibleVerse: {
      reference: '로마서 6:23',
      text: '죄의 삯은 사망이요 하나님의 은사는 그리스도 예수 우리 주 안에 있는 영생이니라'
    },
    activities: [
      '다리 예화 그림을 함께 그리며 설명하기',
      '인간의 죄와 하나님의 거룩하심에 대해 나누기',
      '예수님만이 유일한 길임을 확인하기'
    ],
    tips: [
      '그림을 직접 그리면서 설명하면 더 효과적입니다',
      '양육 대상자가 자신의 언어로 설명할 수 있도록 격려하세요',
      '질문에 대답하는 것보다 함께 발견해가는 태도가 중요합니다'
    ],
    goals: [
      '하나님과 인간 사이의 단절 이해',
      '예수님이 유일한 구원의 길임을 확신'
    ]
  },
  {
    id: 'convert-salvation-2',
    trainingType: 'convert',
    areaId: 'salvation',
    week: 2,
    title: '십자가의 의미 깊이 묵상하기',
    description: '십자가에서 이루신 대속의 은혜를 깊이 묵상하고 감사하는 시간을 가집니다.',
    bibleVerse: {
      reference: '베드로전서 2:24',
      text: '그가 친히 나무에 달려 그 몸으로 우리 죄를 담당하셨으니'
    },
    activities: [
      '십자가 고난의 의미에 대해 함께 나누기',
      '구원의 확신을 주는 성경 구절 3개 암송하기',
      '구원받은 간증 나누기'
    ],
    tips: [
      '감정적인 면과 논리적인 면의 균형을 유지하세요',
      '개인의 간증은 강력한 확신의 도구입니다'
    ],
    goals: [
      '십자가의 대속적 의미 깊이 이해',
      '구원의 확신 성경 구절 암송'
    ]
  },
  {
    id: 'convert-salvation-3',
    trainingType: 'convert',
    areaId: 'salvation',
    week: 3,
    title: '하나님의 자녀 된 신분',
    description: '구원받은 자의 새로운 신분과 정체성을 성경을 통해 확인합니다.',
    bibleVerse: {
      reference: '요한복음 1:12',
      text: '영접하는 자 곧 그 이름을 믿는 자들에게는 하나님의 자녀가 되는 권세를 주셨으니'
    },
    activities: [
      '요한복음 1:12 암송하고 의미 나누기',
      '하나님의 자녀로서의 특권들 목록 만들기',
      '봉헌의 의미와 중요성 나누기'
    ],
    tips: [
      '신분의 변화가 삶의 변화로 이어짐을 강조하세요',
      '자녀의 특권과 책임을 균형있게 다루세요'
    ],
    goals: [
      '하나님의 자녀 된 신분 확신',
      '봉헌의 의미 이해'
    ]
  },
  {
    id: 'convert-salvation-4',
    trainingType: 'convert',
    areaId: 'salvation',
    week: 4,
    title: '영원한 생명의 확신',
    description: '구원의 영원성과 안전성에 대한 성경적 확신을 갖습니다.',
    bibleVerse: {
      reference: '요한복음 10:28',
      text: '내가 그들에게 영생을 주노니 영원히 멸망하지 아니할 것이요'
    },
    activities: [
      '영생의 의미와 시작 시점 나누기',
      '구원의 영원한 안전성 관련 구절 찾아보기',
      '구원의 확신 간증 작성하기'
    ],
    goals: [
      '영생의 개념 명확히 이해',
      '구원의 영원성 확신'
    ]
  },
  {
    id: 'convert-salvation-5',
    trainingType: 'convert',
    areaId: 'salvation',
    week: 5,
    title: '은혜로 말미암은 구원',
    description: '행위가 아닌 은혜로 구원받았음을 명확히 이해합니다.',
    bibleVerse: {
      reference: '에베소서 2:8-9',
      text: '너희는 그 은혜에 의하여 믿음으로 말미암아 구원을 받았으니 이것은 너희에게서 난 것이 아니요 하나님의 선물이라'
    },
    activities: [
      '은혜와 행위의 차이점 토론하기',
      '에베소서 2:8-9 암송하기',
      '구원의 확신이 흔들렸던 경험 나누기'
    ],
    goals: [
      '은혜로 구원받음을 확신',
      '행위와 은혜의 관계 이해'
    ]
  },

  // ============================================
  // 말씀 (word) - 13주
  // ============================================
  {
    id: 'convert-word-1',
    trainingType: 'convert',
    areaId: 'word',
    week: 1,
    title: '성경 읽기 습관 형성',
    description: '매일 성경을 읽는 습관을 시작하고 성경이 하나님의 말씀임을 깨닫습니다.',
    bibleVerse: {
      reference: '디모데후서 3:16',
      text: '모든 성경은 하나님의 감동으로 된 것으로'
    },
    activities: [
      '성경 읽기 계획표 함께 세우기',
      '마가복음이나 요한복음부터 시작하기',
      '하루 한 장씩 읽기로 약속하기'
    ],
    tips: [
      '처음부터 너무 많은 분량을 정하지 마세요',
      '복음서부터 시작하는 것이 좋습니다',
      '같은 본문을 함께 읽고 나누세요'
    ],
    goals: [
      '매일 성경 읽기 습관 시작',
      '성경의 권위 인식'
    ]
  },
  {
    id: 'convert-word-2',
    trainingType: 'convert',
    areaId: 'word',
    week: 2,
    title: '큐티(경건의 시간) 방법 배우기',
    description: '관찰, 해석, 적용의 기본적인 큐티 방법을 배우고 실천합니다.',
    bibleVerse: {
      reference: '시편 119:105',
      text: '주의 말씀은 내 발에 등이요 내 길에 빛이니이다'
    },
    activities: [
      '간단한 큐티 방법 배우기 (관찰-해석-적용)',
      '함께 한 본문으로 큐티 실습하기',
      '큐티 노트 선물하기'
    ],
    tips: [
      '너무 학구적이지 않고 실제적으로 접근하세요',
      '적용을 구체적으로 할 수 있도록 도와주세요'
    ],
    goals: [
      '기본 큐티 방법 습득',
      '매일 큐티 시작하기'
    ]
  },
  {
    id: 'convert-word-3',
    trainingType: 'convert',
    areaId: 'word',
    week: 3,
    title: '말씀 암송의 능력',
    description: '말씀을 마음에 새기는 암송의 중요성을 배우고 실천합니다.',
    bibleVerse: {
      reference: '시편 119:11',
      text: '내가 주께 범죄하지 아니하려 하여 주의 말씀을 내 마음에 두었나이다'
    },
    activities: [
      '주요 구원의 구절 3개 암송하기',
      '암송 카드 만들기',
      '서로 암송 점검하기'
    ],
    goals: [
      '말씀 암송의 중요성 이해',
      '3개 구절 암송 완료'
    ]
  },
  {
    id: 'convert-word-4',
    trainingType: 'convert',
    areaId: 'word',
    week: 4,
    title: '말씀대로 사는 삶',
    description: '읽은 말씀을 실제 삶에 적용하는 방법을 배웁니다.',
    bibleVerse: {
      reference: '야고보서 1:22',
      text: '너희는 말씀을 행하는 자가 되고 듣기만 하여 자신을 속이는 자가 되지 말라'
    },
    activities: [
      '이번 주 말씀 적용 사례 나누기',
      '구체적인 순종의 영역 정하기',
      '말씀 적용 일지 작성하기'
    ],
    goals: [
      '말씀과 순종의 관계 이해',
      '구체적인 적용 실천'
    ]
  },
  {
    id: 'convert-word-5',
    trainingType: 'convert',
    areaId: 'word',
    week: 5,
    title: '성경 전체의 흐름 이해',
    description: '성경 66권의 전체 흐름과 구속사를 큰 그림으로 이해합니다.',
    bibleVerse: {
      reference: '누가복음 24:27',
      text: '모세와 모든 선지자의 글로 시작하여 모든 성경에 쓴 바 자기에 관한 것을 자세히 설명하시니라'
    },
    activities: [
      '구약과 신약의 관계 설명하기',
      '성경의 큰 흐름 도표 함께 보기',
      '성경 66권 이름 익히기'
    ],
    goals: [
      '성경 전체의 구속사 이해',
      '구약과 신약의 연결성 깨닫기'
    ]
  },

  // ============================================
  // 교제 (fellowship) - 13주
  // ============================================
  {
    id: 'convert-fellowship-1',
    trainingType: 'convert',
    areaId: 'fellowship',
    week: 1,
    title: '소그룹 참여하기',
    description: '교회 소그룹에 참여하여 성도들과의 교제를 시작합니다.',
    bibleVerse: {
      reference: '히브리서 10:25',
      text: '모이기를 폐하는 어떤 사람들의 습관과 같이 하지 말고 오직 권하여 그 날이 가까움을 볼수록 더욱 그리하자'
    },
    activities: [
      '소그룹 모임에 함께 참석하기',
      '소그룹 멤버들에게 소개하기',
      '찬송과 기도 교제 경험하기'
    ],
    tips: [
      '처음에는 양육자가 동행해 주세요',
      '자연스럽게 소그룹에 녹아들 수 있도록 도와주세요',
      '소그룹 리더와 미리 소통하세요'
    ],
    goals: [
      '소그룹 모임 정기 참석',
      '성도 교제의 중요성 인식'
    ]
  },
  {
    id: 'convert-fellowship-2',
    trainingType: 'convert',
    areaId: 'fellowship',
    week: 2,
    title: '식사 교제와 삶 나누기',
    description: '함께 식사하며 일상의 삶을 나누는 깊은 교제를 경험합니다.',
    bibleVerse: {
      reference: '사도행전 2:46',
      text: '날마다 마음을 같이하여 성전에 모이기를 힘쓰고 집에서 떡을 떼며 기쁨과 순전한 마음으로 음식을 먹고'
    },
    activities: [
      '함께 식사하며 일주일 나누기',
      '서로의 기도 제목 나누기',
      '일상에서의 하나님 경험 나누기'
    ],
    tips: [
      '편안한 분위기에서 진솔한 대화를 나누세요',
      '양육 시간만이 아닌 삶의 교제가 중요합니다'
    ],
    goals: [
      '진솔한 교제 경험',
      '일상에서의 신앙 나누기'
    ]
  },
  {
    id: 'convert-fellowship-3',
    trainingType: 'convert',
    areaId: 'fellowship',
    week: 3,
    title: '스포츠/취미 교제',
    description: '운동이나 취미 활동을 통해 자연스럽고 즐거운 교제를 합니다.',
    bibleVerse: {
      reference: '시편 133:1',
      text: '보라 형제가 연합하여 동거함이 어찌 그리 선하고 아름다운고'
    },
    activities: [
      '함께 운동하거나 취미 활동하기',
      '교회 스포츠 모임 참여하기',
      '다른 성도들과의 친교 시간 갖기'
    ],
    goals: [
      '다양한 형태의 교제 경험',
      '성도 간의 우정 형성'
    ]
  },
  {
    id: 'convert-fellowship-4',
    trainingType: 'convert',
    areaId: 'fellowship',
    week: 4,
    title: '섬김과 나눔의 교제',
    description: '함께 봉사하고 섬기는 교제를 통해 그리스도의 몸을 경험합니다.',
    bibleVerse: {
      reference: '갈라디아서 6:2',
      text: '너희가 짐을 서로 지라 그리하여 그리스도의 법을 성취하라'
    },
    activities: [
      '교회 봉사 활동 함께 하기',
      '어려운 이웃 돕기 프로젝트 참여',
      '서로의 필요를 채워주기'
    ],
    goals: [
      '섬김의 교제 실천',
      '그리스도의 몸 된 교회 경험'
    ]
  },
  {
    id: 'convert-fellowship-5',
    trainingType: 'convert',
    areaId: 'fellowship',
    week: 5,
    title: '예배 중의 교제',
    description: '함께 예배드리고 찬양하는 수직적 교제를 경험합니다.',
    bibleVerse: {
      reference: '시편 34:3',
      text: '나와 함께 여호와를 광대하시다 하며 함께 그의 이름을 높이세'
    },
    activities: [
      '주일예배 함께 참석하기',
      '예배 후 교제 시간 갖기',
      '찬양 집회나 특별 예배 함께 참석하기'
    ],
    goals: [
      '예배 중심의 신앙생활 정착',
      '예배 공동체 일원으로서의 정체성'
    ]
  },

  // ============================================
  // 죄에서 떠남 (sin) - 13주
  // ============================================
  {
    id: 'convert-sin-1',
    trainingType: 'convert',
    areaId: 'sin',
    week: 1,
    title: '구습 점검과 회개의 의미',
    description: '과거의 죄된 습관들을 돌아보고 진정한 회개의 의미를 배웁니다.',
    bibleVerse: {
      reference: '에베소서 4:22',
      text: '너희는 유혹의 욕심을 따라 썩어져 가는 구습을 따르는 옛 사람을 벗어 버리고'
    },
    activities: [
      '구습 목록 작성하고 나누기',
      '회개의 의미 함께 공부하기',
      '회개 기도 시간 갖기'
    ],
    tips: [
      '비난이 아닌 사랑으로 접근하세요',
      '자신의 약함도 솔직하게 나누세요',
      '은혜의 관점에서 회개를 이야기하세요'
    ],
    goals: [
      '구습을 인식하고 고백하기',
      '진정한 회개의 의미 이해'
    ]
  },
  {
    id: 'convert-sin-2',
    trainingType: 'convert',
    areaId: 'sin',
    week: 2,
    title: '성령 충만한 삶',
    description: '성령님의 능력으로 죄를 이기고 거룩한 삶을 사는 방법을 배웁니다.',
    bibleVerse: {
      reference: '에베소서 5:18',
      text: '술 취하지 말라 이는 방탕한 것이니 오직 성령으로 충만함을 받으라'
    },
    activities: [
      '성령 충만의 의미 나누기',
      '매일 성령 충만 기도하기',
      '성령의 열매 체크리스트 만들기'
    ],
    goals: [
      '성령 충만의 개념 이해',
      '매일 성령 충만 구하기'
    ]
  },
  {
    id: 'convert-sin-3',
    trainingType: 'convert',
    areaId: 'sin',
    week: 3,
    title: '새 사람 입기',
    description: '그리스도 안에서 새로운 피조물 된 정체성을 확인하고 새 생활 방식을 배웁니다.',
    bibleVerse: {
      reference: '에베소서 4:24',
      text: '하나님을 따라 의와 진리의 거룩함으로 지으심을 받은 새 사람을 입으라'
    },
    activities: [
      '새 사람의 특징 목록 만들기',
      '구체적인 변화 목표 3가지 정하기',
      '서로 책임지고 격려하기'
    ],
    goals: [
      '새 사람의 정체성 확립',
      '구체적인 변화 실천'
    ]
  },
  {
    id: 'convert-sin-4',
    trainingType: 'convert',
    areaId: 'sin',
    week: 4,
    title: '시험을 이기는 방법',
    description: '유혹이 올 때 대처하는 성경적인 방법을 배우고 실천합니다.',
    bibleVerse: {
      reference: '고린도전서 10:13',
      text: '시험당할 즈음에 피할 길을 내사 너희로 능히 감당하게 하시느니라'
    },
    activities: [
      '주요 유혹 영역 파악하기',
      '유혹 대처 전략 세우기',
      '책임 파트너 정하기'
    ],
    tips: [
      '구체적이고 실제적인 대처 방법을 함께 고민하세요',
      '실패해도 다시 일어설 수 있음을 격려하세요'
    ],
    goals: [
      '유혹 대처 방법 습득',
      '책임 관계 형성'
    ]
  },
  {
    id: 'convert-sin-5',
    trainingType: 'convert',
    areaId: 'sin',
    week: 5,
    title: '거룩한 습관 형성하기',
    description: '나쁜 습관을 끊고 좋은 영적 습관을 형성합니다.',
    bibleVerse: {
      reference: '로마서 12:2',
      text: '너희는 이 세대를 본받지 말고 오직 마음을 새롭게 함으로 변화를 받아'
    },
    activities: [
      '21일 거룩한 습관 챌린지 시작하기',
      '매일 체크리스트 점검하기',
      '주간 점검 모임 갖기'
    ],
    goals: [
      '거룩한 습관 형성 시작',
      '지속적인 변화 추구'
    ]
  }
];

// 주차별 추천 활동 조회 헬퍼 함수
export function getConvertRecommendations(areaId: ConvertArea, week: number): ActivityRecommendation[] {
  return CONVERT_RECOMMENDATIONS.filter(
    rec => rec.areaId === areaId && rec.week === week
  );
}

// 특정 영역의 모든 추천 활동 조회
export function getConvertAreaRecommendations(areaId: ConvertArea): ActivityRecommendation[] {
  return CONVERT_RECOMMENDATIONS.filter(rec => rec.areaId === areaId);
}
