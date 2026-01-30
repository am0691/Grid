/**
 * Area Value Object
 * 양육 영역 정의
 */

export type ConvertArea =
  | 'salvation'      // 구원의 확신
  | 'word'           // 말씀
  | 'fellowship'     // 교제
  | 'sin'            // 죄에서 떠남
  | 'notes';         // 참고사항

export type DiscipleArea =
  | 'memorization'   // 암송
  | 'bibleStudy'     // 성경공부
  | 'salvation'      // 구원의 확신
  | 'devotion'       // 경건의 시간
  | 'word'           // 말씀
  | 'prayer'         // 기도
  | 'fellowship'     // 교제
  | 'witness'        // 증거
  | 'lordship'       // 주재권
  | 'vision'         // 세계비전
  | 'discipleship'   // 양육
  | 'character'      // 성품
  | 'notes'          // 참고사항
  | 'events';        // 전체행사

export type Area = ConvertArea | DiscipleArea;

export interface AreaMeta {
  id: Area;
  name: string;
  color: string;
  bgColor: string;
  lightBgColor: string;
  description: string;
}

// Convert 영역 메타데이터
export const CONVERT_AREAS: AreaMeta[] = [
  {
    id: 'salvation',
    name: '구원의 확신',
    color: '#16a34a', // green-600
    bgColor: '#16a34a',
    lightBgColor: '#dcfce7', // green-100
    description: '예수님의 구원을 확신하고 기뻐하는 삶'
  },
  {
    id: 'word',
    name: '말씀',
    color: '#2563eb', // blue-600
    bgColor: '#2563eb',
    lightBgColor: '#dbeafe', // blue-100
    description: '하나님의 말씀의 권위를 인정하고 즐거워함'
  },
  {
    id: 'fellowship',
    name: '교제',
    color: '#ca8a04', // yellow-600
    bgColor: '#ca8a04',
    lightBgColor: '#fef9c3', // yellow-100
    description: '하나님의 가족의 일원이 됨과 교제의 특권을 즐거워함'
  },
  {
    id: 'sin',
    name: '죄에서 떠남',
    color: '#9333ea', // purple-600
    bgColor: '#9333ea',
    lightBgColor: '#f3e8ff', // purple-100
    description: '성령의 능력으로 구습을 벗어버리고 새 사람을 입기를 즐거워함'
  },
  {
    id: 'notes',
    name: '참고사항',
    color: '#6b7280', // gray-500
    bgColor: '#6b7280',
    lightBgColor: '#f3f4f6', // gray-100
    description: '양육 시 주의사항 및 참고 내용'
  }
];

// Disciple 영역 메타데이터
export const DISCIPLE_AREAS: AreaMeta[] = [
  {
    id: 'memorization',
    name: '암송',
    color: '#dc2626', // red-600
    bgColor: '#dc2626',
    lightBgColor: '#fee2e2', // red-100
    description: '마음판에 새기기 (신 6:6)'
  },
  {
    id: 'bibleStudy',
    name: '성경공부',
    color: '#ea580c', // orange-600
    bgColor: '#ea580c',
    lightBgColor: '#ffedd5', // orange-100
    description: '견고한 기초 다지기 (딤후 3:16,17)'
  },
  {
    id: 'salvation',
    name: '구원의 확신',
    color: '#16a34a', // green-600
    bgColor: '#16a34a',
    lightBgColor: '#dcfce7', // green-100
    description: '확신의 삶'
  },
  {
    id: 'devotion',
    name: '경건의 시간',
    color: '#0891b2', // cyan-600
    bgColor: '#0891b2',
    lightBgColor: '#cffafe', // cyan-100
    description: '주야로 묵상 (수 1:8)'
  },
  {
    id: 'word',
    name: '말씀',
    color: '#2563eb', // blue-600
    bgColor: '#2563eb',
    lightBgColor: '#dbeafe', // blue-100
    description: '말씀 중심의 삶'
  },
  {
    id: 'prayer',
    name: '기도',
    color: '#7c3aed', // violet-600
    bgColor: '#7c3aed',
    lightBgColor: '#ede9fe', // violet-100
    description: '쉬지말고 기도 (살전 5:17)'
  },
  {
    id: 'fellowship',
    name: '교제',
    color: '#ca8a04', // yellow-600
    bgColor: '#ca8a04',
    lightBgColor: '#fef9c3', // yellow-100
    description: '생명력 넘치는 교제 (시 133)'
  },
  {
    id: 'witness',
    name: '증거',
    color: '#db2777', // pink-600
    bgColor: '#db2777',
    lightBgColor: '#fce7f3', // pink-100
    description: '복음의 능력을 확신 (롬 1:16)'
  },
  {
    id: 'lordship',
    name: '주재권',
    color: '#4f46e5', // indigo-600
    bgColor: '#4f46e5',
    lightBgColor: '#e0e7ff', // indigo-100
    description: '결단의 기회 (빌 1:21)'
  },
  {
    id: 'vision',
    name: '세계비전',
    color: '#059669', // emerald-600
    bgColor: '#059669',
    lightBgColor: '#d1fae5', // emerald-100
    description: '땅끝까지 (행 1:8)'
  },
  {
    id: 'discipleship',
    name: '양육',
    color: '#b45309', // amber-600
    bgColor: '#b45309',
    lightBgColor: '#fef3c7', // amber-100
    description: 'Where is your man (딤후 2:2)'
  },
  {
    id: 'character',
    name: '성품',
    color: '#be185d', // rose-600
    bgColor: '#be185d',
    lightBgColor: '#ffe4e6', // rose-100
    description: 'Christlike Character (롬 8:29)'
  },
  {
    id: 'notes',
    name: '참고사항',
    color: '#6b7280', // gray-500
    bgColor: '#6b7280',
    lightBgColor: '#f3f4f6', // gray-100
    description: '양육 시 주의사항'
  },
  {
    id: 'events',
    name: '전체행사',
    color: '#475569', // slate-600
    bgColor: '#475569',
    lightBgColor: '#e2e8f0', // slate-100
    description: '공동체 행사 참여'
  }
];
