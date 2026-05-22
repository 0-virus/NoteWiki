---
type: source
tags: [java, immutable, mutable, string]
updated: 2026-05-19
sources: ["raw/notes/가변 객체 vs 불변 객체.md"]
---

# 소스: 가변 객체 vs 불변 객체

> 원본: `raw/notes/가변 객체 vs 불변 객체.md` — 직접 작성 필기(노션 이전분).
> 8개 절에 걸쳐 가변/불변, String Pool, 메모리 양면성, 설계 철학까지 깊게 정리한 노트.

## 맥락 (왜 기록했나)

부트캠프 Java 학습 중 정리한 **실무 대비 자산**. `String` 연결 성능 문제와
`StringBuilder`의 존재 이유를 메모리 그림으로 추적한, 8개 노트 중 가장 상세한 필기.

## 핵심 요약

- **가변/불변**(내용 변경 가능 여부)은 **참조형**(접근 방식)과 독립 개념.
- 불변(`String`, `Integer`)은 값 변경 시 새 객체 생성 + 참조 교체. 가변
  (`StringBuilder`, `ArrayList`)은 같은 주소에서 내부 수정.
- String Pool: 같은 리터럴을 하나의 객체로 공유(Hash Table, O(1) 탐색).
- 불변의 4대 이점: Pool 최적화 · 멀티스레드 안전 · hashCode 안정성 · 보안.
- 양면성: 읽기·공유엔 효율, **반복 수정엔 중간 객체 폭발 → GC 부담**.
- Java 철학: "기본은 불변, 수정 많으면 가변" — 그래서 가변 짝(`StringBuilder`)도 제공.

## 위키 반영

- [[mutable-immutable]] — 가변/불변 비교, 불변의 이점과 비용
- [[string-pool]] — 불변이라서 가능한 문자열 공유 메커니즘
