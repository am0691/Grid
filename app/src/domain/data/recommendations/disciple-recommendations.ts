/**
 * DISCIPLE (12개월) 활동 추천 데이터
 */

import type { ActivityRecommendation } from '../../entities/recommendation';
import type { DiscipleArea } from '../../value-objects/area';

export const DISCIPLE_RECOMMENDATIONS: ActivityRecommendation[] = [
  // ============================================
  // 암송 (memorization) - 12개월
  // ============================================
  {
    id: 'disciple-memorization-1',
    trainingType: 'disciple',
    areaId: 'memorization',
    week: 1,
    title: '네비게이토 주제별 암송 시작',
    description: '체계적인 주제별 암송을 시작하여 말씀을 마음판에 새깁니다.',
    bibleVerse: {
      reference: '신명기 6:6',
      text: '오늘 내가 네게 명하는 이 말씀을 너는 마음에 새기고'
    },
    activities: [
      '암송 패킷 A - 그리스도와 함께 사는 삶 (5구절)',
      '매일 복습 시간 정하기',
      '암송 파트너와 주간 점검하기'
    ],
    tips: [
      '한 번에 많은 구절보다 확실하게 암송하는 것이 중요합니다',
      '생활 속에서 암송한 구절을 적용해보세요'
    ],
    goals: [
      '암송 패킷 A 완료 (5구절)',
      '매일 복습 습관 형성'
    ]
  },
  {
    id: 'disciple-memorization-2',
    trainingType: 'disciple',
    areaId: 'memorization',
    week: 2,
    title: '하나님의 말씀에 순종하기',
    description: '순종 관련 핵심 구절들을 암송하며 순종의 삶을 배웁니다.',
    bibleVerse: {
      reference: '요한복음 14:21',
      text: '나의 계명을 지키는 자라야 나를 사랑하는 자니'
    },
    activities: [
      '암송 패킷 B - 순종 (5구절)',
      '순종의 경험 나누기',
      '암송 구절을 삶에 적용하기'
    ],
    goals: [
      '암송 패킷 B 완료',
      '순종의 실제 경험'
    ]
  },
  {
    id: 'disciple-memorization-3',
    trainingType: 'disciple',
    areaId: 'memorization',
    week: 3,
    title: '하나님의 말씀',
    description: '말씀의 권위와 능력에 관한 구절들을 암송합니다.',
    bibleVerse: {
      reference: '디모데후서 3:16',
      text: '모든 성경은 하나님의 감동으로 된 것으로'
    },
    activities: [
      '암송 패킷 C - 하나님의 말씀 (5구절)',
      '말씀이 삶을 변화시킨 경험 나누기',
      '매일 묵상한 내용 기록하기'
    ],
    goals: [
      '암송 패킷 C 완료',
      '말씀의 능력 체험'
    ]
  },

  // ============================================
  // 성경공부 (bibleStudy) - 12개월
  // ============================================
  {
    id: 'disciple-biblestudy-1',
    trainingType: 'disciple',
    areaId: 'bibleStudy',
    week: 1,
    title: '귀납적 성경공부 방법 배우기',
    description: '관찰-해석-적용의 귀납적 성경공부 방법을 배우고 실습합니다.',
    bibleVerse: {
      reference: '디모데후서 2:15',
      text: '진리의 말씀을 옳게 분별하는 일꾼으로 인정된 자로 자신을 하나님 앞에 드리기를 힘쓰라'
    },
    activities: [
      '귀납적 성경공부 기본 원리 배우기',
      '마가복음 1장으로 실습하기',
      '관찰 질문 만들기 연습'
    ],
    tips: [
      '처음에는 짧은 본문으로 시작하세요',
      '많은 질문을 발견하는 것이 중요합니다'
    ],
    goals: [
      '귀납적 성경공부 방법 습득',
      '기본 관찰 능력 향상'
    ]
  },
  {
    id: 'disciple-biblestudy-2',
    trainingType: 'disciple',
    areaId: 'bibleStudy',
    week: 2,
    title: '복음서 집중 공부',
    description: '예수님의 생애와 가르침을 복음서를 통해 깊이 공부합니다.',
    bibleVerse: {
      reference: '요한복음 20:31',
      text: '오직 이것을 기록함은 너희로 예수께서 하나님의 아들 그리스도이심을 믿게 하려 함이요'
    },
    activities: [
      '마가복음 연속 공부 시작하기',
      '예수님의 제자훈련 방법 관찰하기',
      '주간 진도 나가며 깊이 토론하기'
    ],
    goals: [
      '복음서 한 권 완독',
      '예수님의 제자도 이해'
    ]
  },
  {
    id: 'disciple-biblestudy-3',
    trainingType: 'disciple',
    areaId: 'bibleStudy',
    week: 3,
    title: '서신서 교리 공부',
    description: '바울서신을 통해 기독교의 핵심 교리를 배웁니다.',
    bibleVerse: {
      reference: '로마서 12:2',
      text: '너희는 이 세대를 본받지 말고 오직 마음을 새롭게 함으로 변화를 받아'
    },
    activities: [
      '로마서 핵심 교리 공부',
      '칭의, 성화, 영화 개념 정리하기',
      '교리와 삶의 연결 토론하기'
    ],
    goals: [
      '기본 교리 확립',
      '교리의 실천적 적용'
    ]
  },

  // ============================================
  // 구원의 확신 (salvation) - 12개월
  // ============================================
  {
    id: 'disciple-salvation-1',
    trainingType: 'disciple',
    areaId: 'salvation',
    week: 1,
    title: '복음을 명확히 전하기',
    description: '자신의 언어로 복음을 명확하게 전할 수 있는 능력을 기릅니다.',
    bibleVerse: {
      reference: '로마서 1:16',
      text: '내가 복음을 부끄러워하지 아니하노니 이 복음은 모든 믿는 자에게 구원을 주시는 하나님의 능력이 됨이라'
    },
    activities: [
      '3분 복음 제시 연습하기',
      '다리 예화로 복음 설명 연습',
      '서로에게 복음 전하기 실습'
    ],
    tips: [
      '자연스럽고 진솔하게 전하는 것이 중요합니다',
      '암기된 대본이 아닌 자신의 언어로 표현하세요'
    ],
    goals: [
      '복음을 명확히 전하는 능력',
      '전도의 자신감 향상'
    ]
  },
  {
    id: 'disciple-salvation-2',
    trainingType: 'disciple',
    areaId: 'salvation',
    week: 2,
    title: '구원의 확신 점검하기',
    description: '자신과 타인의 구원의 확신을 점검하고 확증하는 방법을 배웁니다.',
    bibleVerse: {
      reference: '요한일서 5:13',
      text: '내가 하나님의 아들의 이름을 믿는 너희에게 이것을 쓰는 것은 너희로 하여금 너희에게 영생이 있음을 알게 하려 함이라'
    },
    activities: [
      '구원의 확신 체크리스트 활용하기',
      '구원의 의심이 생길 때 대처법 나누기',
      '확신의 증거들 정리하기'
    ],
    goals: [
      '확고한 구원의 확신',
      '타인을 도울 수 있는 능력'
    ]
  },

  // ============================================
  // 경건의 시간 (devotion) - 12개월
  // ============================================
  {
    id: 'disciple-devotion-1',
    trainingType: 'disciple',
    areaId: 'devotion',
    week: 1,
    title: '경건의 시간 정착하기',
    description: '매일 정해진 시간에 하나님과 교제하는 습관을 확고히 합니다.',
    bibleVerse: {
      reference: '시편 5:3',
      text: '여호와여 아침에 주께서 나의 소리를 들으시리니 아침에 내가 주께 기도하고 기다리리이다'
    },
    activities: [
      '자신에게 맞는 최적의 시간 찾기',
      '30일 경건의 시간 챌린지 시작',
      '큐티 나눔 파트너 정하기'
    ],
    tips: [
      '완벽한 시간보다 꾸준함이 중요합니다',
      '같은 시간, 같은 장소가 습관 형성에 도움됩니다'
    ],
    goals: [
      '매일 경건의 시간 정착',
      '30일 연속 도전 완료'
    ]
  },
  {
    id: 'disciple-devotion-2',
    trainingType: 'disciple',
    areaId: 'devotion',
    week: 2,
    title: '깊이 있는 묵상',
    description: '말씀을 깊이 묵상하고 하나님의 음성을 듣는 법을 배웁니다.',
    bibleVerse: {
      reference: '여호수아 1:8',
      text: '이 율법책을 네 입에서 떠나지 말게 하며 주야로 그것을 묵상하여'
    },
    activities: [
      '렉시오 디비나(거룩한 독서) 방법 배우기',
      '한 본문을 일주일 동안 묵상하기',
      '묵상 저널 작성하기'
    ],
    goals: [
      '깊이 있는 묵상 능력',
      '하나님의 음성 분별'
    ]
  },

  // ============================================
  // 말씀 (word) - 12개월
  // ============================================
  {
    id: 'disciple-word-1',
    trainingType: 'disciple',
    areaId: 'word',
    week: 1,
    title: '성경 통독 시작하기',
    description: '1년 성경 통독 계획을 세우고 실천을 시작합니다.',
    bibleVerse: {
      reference: '시편 119:11',
      text: '내가 주께 범죄하지 아니하려 하여 주의 말씀을 내 마음에 두었나이다'
    },
    activities: [
      '1년 통독 계획표 받기',
      '매일 읽을 분량 정하기',
      '통독 점검 파트너 정하기'
    ],
    tips: [
      '처음부터 욕심내지 말고 적절한 분량으로 시작하세요',
      '매일 체크하고 격려하는 파트너가 큰 도움이 됩니다'
    ],
    goals: [
      '통독 계획 수립',
      '첫 달 완주'
    ]
  },
  {
    id: 'disciple-word-2',
    trainingType: 'disciple',
    areaId: 'word',
    week: 2,
    title: '말씀 필사하기',
    description: '말씀을 손으로 쓰며 더 깊이 새기는 시간을 갖습니다.',
    bibleVerse: {
      reference: '시편 119:105',
      text: '주의 말씀은 내 발에 등이요 내 길에 빛이니이다'
    },
    activities: [
      '좋아하는 성경책 한 권 필사 시작하기',
      '매일 한 장씩 필사하기',
      '필사하며 받은 은혜 나누기'
    ],
    goals: [
      '성경책 한 권 필사 완료',
      '말씀 묵상의 깊이 더하기'
    ]
  },

  // ============================================
  // 기도 (prayer) - 12개월
  // ============================================
  {
    id: 'disciple-prayer-1',
    trainingType: 'disciple',
    areaId: 'prayer',
    week: 1,
    title: '주기도문으로 배우는 기도',
    description: '주기도문의 구조를 배우고 이를 토대로 기도하는 법을 익힙니다.',
    bibleVerse: {
      reference: '마태복음 6:9',
      text: '그러므로 너희는 이렇게 기도하라'
    },
    activities: [
      '주기도문 구조 분석하기',
      'ACTS 기도법 배우기 (Adoration, Confession, Thanksgiving, Supplication)',
      '매일 주기도문 틀로 기도하기'
    ],
    tips: [
      '형식에 얽매이지 말고 자유롭게 응용하세요',
      '각 부분에서 충분한 시간을 가지세요'
    ],
    goals: [
      '구조적인 기도 능력 향상',
      '균형잡힌 기도 생활'
    ]
  },
  {
    id: 'disciple-prayer-2',
    trainingType: 'disciple',
    areaId: 'prayer',
    week: 2,
    title: '중보기도 훈련',
    description: '타인을 위해 깊이 중보하는 기도 사역자가 됩니다.',
    bibleVerse: {
      reference: '야고보서 5:16',
      text: '의인의 간구는 역사하는 힘이 큼이니라'
    },
    activities: [
      '중보기도 목록 작성하기',
      '매일 5명씩 중보기도하기',
      '응답된 기도 기록하기'
    ],
    goals: [
      '중보기도자로서의 헌신',
      '기도 응답 체험'
    ]
  },
  {
    id: 'disciple-prayer-3',
    trainingType: 'disciple',
    areaId: 'prayer',
    week: 3,
    title: '새벽기도 도전',
    description: '이른 시간 하나님과 만나는 새벽기도의 은혜를 경험합니다.',
    bibleVerse: {
      reference: '마가복음 1:35',
      text: '새벽 아직도 밝기 전에 예수께서 일어나 나가 한적한 곳으로 가사 거기서 기도하시더니'
    },
    activities: [
      '21일 새벽기도 챌린지',
      '교회 새벽기도회 참석하기',
      '새벽기도 파트너와 함께하기'
    ],
    goals: [
      '새벽기도 습관 형성',
      '예수님의 기도 생활 본받기'
    ]
  },

  // ============================================
  // 교제 (fellowship) - 12개월
  // ============================================
  {
    id: 'disciple-fellowship-1',
    trainingType: 'disciple',
    areaId: 'fellowship',
    week: 1,
    title: '소그룹 리더십 개발',
    description: '소그룹을 섬기고 인도하는 리더십을 개발합니다.',
    bibleVerse: {
      reference: '히브리서 10:24',
      text: '서로 돌아보아 사랑과 선행을 격려하며'
    },
    activities: [
      '소그룹 리더 훈련 참여하기',
      '소그룹 모임 인도 실습하기',
      '멤버 케어 방법 배우기'
    ],
    goals: [
      '소그룹 리더 역량 개발',
      '섬기는 리더십 배양'
    ]
  },
  {
    id: 'disciple-fellowship-2',
    trainingType: 'disciple',
    areaId: 'fellowship',
    week: 2,
    title: '일대일 양육 시작',
    description: '한 사람을 깊이 있게 양육하는 일대일 관계를 시작합니다.',
    bibleVerse: {
      reference: '디모데후서 2:2',
      text: '네가 많은 증인 앞에서 내게 들은 바를 충성된 사람들에게 부탁하라 그들이 또 다른 사람들을 가르칠 수 있으리라'
    },
    activities: [
      '양육할 사람 기도로 찾기',
      '일대일 양육 커리큘럼 준비하기',
      '주 1회 정기 만남 약속하기'
    ],
    goals: [
      '일대일 양육 관계 시작',
      '영적 재생산의 첫 걸음'
    ]
  },

  // ============================================
  // 증거 (witness) - 12개월
  // ============================================
  {
    id: 'disciple-witness-1',
    trainingType: 'disciple',
    areaId: 'witness',
    week: 1,
    title: '전도 훈련 받기',
    description: '효과적으로 복음을 전하는 전도 훈련을 받습니다.',
    bibleVerse: {
      reference: '마태복음 28:19',
      text: '그러므로 너희는 가서 모든 민족을 제자로 삼아'
    },
    activities: [
      'EE(Evangelism Explosion) 또는 전도폭발 훈련',
      '복음 제시 연습하기',
      '전도 현장 동행하기'
    ],
    tips: [
      '이론보다 현장 경험이 중요합니다',
      '처음에는 관찰만 해도 큰 배움이 됩니다'
    ],
    goals: [
      '전도 훈련 과정 이수',
      '복음 제시 자신감 얻기'
    ]
  },
  {
    id: 'disciple-witness-2',
    trainingType: 'disciple',
    areaId: 'witness',
    week: 2,
    title: '관계 전도 실천하기',
    description: '일상의 관계 속에서 자연스럽게 복음을 나눕니다.',
    bibleVerse: {
      reference: '베드로전서 3:15',
      text: '너희 마음에 그리스도를 주로 삼아 거룩하게 하고 너희 속에 있는 소망에 관한 이유를 묻는 자에게는 대답할 것을 항상 준비하되'
    },
    activities: [
      '전도 대상자 3명 명단 작성하기',
      '매일 전도 대상자를 위해 기도하기',
      '한 달에 1명과 복음 나누기'
    ],
    goals: [
      '정기적인 관계 전도',
      '전도 대상자 명단 관리'
    ]
  },
  {
    id: 'disciple-witness-3',
    trainingType: 'disciple',
    areaId: 'witness',
    week: 3,
    title: '간증 준비하기',
    description: '자신의 구원 간증을 3분, 10분 버전으로 준비합니다.',
    bibleVerse: {
      reference: '요한일서 1:3',
      text: '우리가 보고 들은 바를 너희에게도 전함은'
    },
    activities: [
      '3분 간증문 작성하기',
      '10분 간증문 작성하기',
      '소그룹에서 간증 발표하기'
    ],
    goals: [
      '간증문 준비 완료',
      '간증 발표 경험'
    ]
  },

  // ============================================
  // 주재권 (lordship) - 12개월
  // ============================================
  {
    id: 'disciple-lordship-1',
    trainingType: 'disciple',
    areaId: 'lordship',
    week: 1,
    title: '주님께 주권 드리기',
    description: '삶의 모든 영역에서 그리스도의 주되심을 인정합니다.',
    bibleVerse: {
      reference: '빌립보서 1:21',
      text: '이는 내게 사는 것이 그리스도니 죽는 것도 유익함이라'
    },
    activities: [
      '삶의 영역별 주권 점검하기',
      '주님께 드릴 영역 결단하기',
      '헌신서약서 작성하기'
    ],
    tips: [
      '강요가 아닌 자발적인 헌신이 중요합니다',
      '구체적인 영역을 하나씩 드리도록 격려하세요'
    ],
    goals: [
      '그리스도의 주권 인정',
      '삶의 헌신 결단'
    ]
  },
  {
    id: 'disciple-lordship-2',
    trainingType: 'disciple',
    areaId: 'lordship',
    week: 2,
    title: '시간 관리와 우선순위',
    description: '하나님의 관점에서 시간을 관리하고 우선순위를 정립합니다.',
    bibleVerse: {
      reference: '에베소서 5:15-16',
      text: '그런즉 너희가 어떻게 행할지를 자세히 주의하여 지혜 없는 자 같이 하지 말고 오직 지혜 있는 자 같이 하여 세월을 아끼라'
    },
    activities: [
      '일주일 시간 사용 점검하기',
      '영적 우선순위 재정립하기',
      '주간 일정표 하나님 중심으로 재구성하기'
    ],
    goals: [
      '하나님 중심 시간 관리',
      '영적 우선순위 확립'
    ]
  },

  // ============================================
  // 세계비전 (vision) - 12개월
  // ============================================
  {
    id: 'disciple-vision-1',
    trainingType: 'disciple',
    areaId: 'vision',
    week: 1,
    title: '세계 선교 비전 갖기',
    description: '하나님의 세계 선교에 대한 마음을 이해하고 동참합니다.',
    bibleVerse: {
      reference: '사도행전 1:8',
      text: '오직 성령이 너희에게 임하시면 너희가 권능을 받고 예루살렘과 온 유대와 사마리아와 땅 끝까지 이르러 내 증인이 되리라'
    },
    activities: [
      '선교 다큐멘터리 시청하기',
      '선교사 편지 읽고 기도하기',
      '선교 헌금 시작하기'
    ],
    tips: [
      '구체적인 선교지와 선교사를 정해서 기도하세요',
      '선교는 멀리 있는 것이 아닌 삶의 현장에서 시작됩니다'
    ],
    goals: [
      '세계 선교 비전 형성',
      '선교 동역자로 헌신'
    ]
  },
  {
    id: 'disciple-vision-2',
    trainingType: 'disciple',
    areaId: 'vision',
    week: 2,
    title: '단기 선교 준비하기',
    description: '단기 선교 여행을 통해 선교 현장을 직접 경험합니다.',
    bibleVerse: {
      reference: '이사야 6:8',
      text: '내가 또 주의 목소리를 들으니 주께서 이르시되 내가 누구를 보내며 누가 우리를 위하여 갈까 하시니 그 때에 내가 이르되 내가 여기 있나이다 나를 보내소서 하였더니'
    },
    activities: [
      '단기 선교 팀 지원하기',
      '선교지 연구하고 준비하기',
      '선교 훈련 참여하기'
    ],
    goals: [
      '단기 선교 참여',
      '선교 현장 체험'
    ]
  },

  // ============================================
  // 양육 (discipleship) - 12개월
  // ============================================
  {
    id: 'disciple-discipleship-1',
    trainingType: 'disciple',
    areaId: 'discipleship',
    week: 1,
    title: '제자 삼는 자가 되기',
    description: '예수님의 제자훈련 방법을 배우고 적용합니다.',
    bibleVerse: {
      reference: '디모데후서 2:2',
      text: '네가 많은 증인 앞에서 내게 들은 바를 충성된 사람들에게 부탁하라 그들이 또 다른 사람들을 가르칠 수 있으리라'
    },
    activities: [
      '제자훈련 원리 공부하기',
      '양육할 사람 기도하며 찾기',
      'Where is your man? 질문에 답하기'
    ],
    tips: [
      '완벽한 준비를 기다리지 말고 시작하세요',
      '자신이 받은 것을 나누는 것부터 시작하세요'
    ],
    goals: [
      '제자훈련 비전 확립',
      '양육 대상자 발견'
    ]
  },
  {
    id: 'disciple-discipleship-2',
    trainingType: 'disciple',
    areaId: 'discipleship',
    week: 2,
    title: '양육 계획 세우기',
    description: '체계적인 양육 계획을 수립하고 실행합니다.',
    bibleVerse: {
      reference: '잠언 29:18',
      text: '묵시가 없으면 백성이 방자히 행하거니와'
    },
    activities: [
      '12주 양육 커리큘럼 준비하기',
      '주간 만남 일정 정하기',
      '양육 일지 시작하기'
    ],
    goals: [
      '양육 계획 수립',
      '정기적 양육 시작'
    ]
  },

  // ============================================
  // 성품 (character) - 12개월
  // ============================================
  {
    id: 'disciple-character-1',
    trainingType: 'disciple',
    areaId: 'character',
    week: 1,
    title: '그리스도를 닮아가기',
    description: '그리스도의 성품을 배우고 실천합니다.',
    bibleVerse: {
      reference: '로마서 8:29',
      text: '하나님이 미리 아신 자들을 또한 그 아들의 형상을 본받게 하기 위하여 미리 정하셨으니'
    },
    activities: [
      '예수님의 성품 연구하기',
      '성령의 열매 점검하기',
      '한 가지 성품 집중 훈련하기'
    ],
    tips: [
      '한 번에 모든 것을 바꾸려 하지 마세요',
      '작은 승리들을 축하하며 격려하세요'
    ],
    goals: [
      '그리스도 닮기 위한 노력',
      '성령의 열매 맺기'
    ]
  },
  {
    id: 'disciple-character-2',
    trainingType: 'disciple',
    areaId: 'character',
    week: 2,
    title: '겸손과 섬김의 리더십',
    description: '예수님처럼 섬기는 리더십을 배우고 실천합니다.',
    bibleVerse: {
      reference: '마가복음 10:45',
      text: '인자가 온 것은 섬김을 받으려 함이 아니라 도리어 섬기려 하고'
    },
    activities: [
      '발씻김 예배 참여하기',
      '섬김의 기회 찾아 실천하기',
      '겸손 훈련 프로그램 참여하기'
    ],
    goals: [
      '섬기는 리더십 개발',
      '겸손의 실천'
    ]
  }
];

// 월차별 추천 활동 조회 헬퍼 함수
export function getDiscipleRecommendations(areaId: DiscipleArea, month: number): ActivityRecommendation[] {
  return DISCIPLE_RECOMMENDATIONS.filter(
    rec => rec.areaId === areaId && rec.week === month
  );
}

// 특정 영역의 모든 추천 활동 조회
export function getDiscipleAreaRecommendations(areaId: DiscipleArea): ActivityRecommendation[] {
  return DISCIPLE_RECOMMENDATIONS.filter(rec => rec.areaId === areaId);
}
