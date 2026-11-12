import type { StudyPost } from '../../redux/slices/studySlice';

export const mockPosts = (): StudyPost[] => [
  {
    id: 101,
    title: 'JVM의 구조에 대해 설명해주세요.',
    category: 'CS',
    author: 'DADAP_Archive',
    date: '2026.01.01',
    views: 123,
    comments: 4,
    content: `### JVM 구조 요약\n\nJVM은 클래스 로더 영역, 메소드 영역, 힙, 스택, PC 레지스터 등으로 구성됩니다. 클래스 로더가 바이트코드를 로드하고, JIT 컴파일러가 런타임에 성능 최적화를 수행합니다.`,
  },
  {
    id: 102,
    title: 'GC의 동작 원리',
    category: 'CS',
    author: 'DADAP_Archive',
    date: '2026.01.02',
    views: 98,
    comments: 2,
    content: `### 가비지 컬렉션 개요\n\nGC는 사용되지 않는 객체를 탐지하고 회수하여 메모리를 반환합니다. 대표적인 알고리즘으로 Mark-and-Sweep, Generational GC 등이 있습니다.`,
  },
];

export const mockDetail = (id: number): Partial<StudyPost> | null => {
  const list = mockPosts();
  const found = list.find(p => p.id === id);
  return found || null;
};
