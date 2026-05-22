---
type: source
tags: [java, static, class-member]
updated: 2026-05-19
sources: ["raw/notes/static의 개념과 활용.md"]
---

# 소스: static의 개념과 활용

> 원본: `raw/notes/static의 개념과 활용.md` — 직접 작성 필기(노션 이전분).

## 맥락 (왜 기록했나)

부트캠프 Java 학습 중 정리한 **실무 대비 자산**. 독립된 Java 기본기로 다루며,
`static`을 "메모리 시점 + 설계 의도" 양면으로 이해하려 한 노트.

## 핵심 요약

- 클래스 = 설계도, 객체 = 찍어낸 실체. 인스턴스 멤버는 `new` 후, static 멤버는
  클래스명으로 바로 사용.
- static은 **클래스 로딩 시**(프로그램 시작) Method Area에 올라 종료까지 유지.
  인스턴스는 `new` 시 Heap에 생겨 GC가 수거.
- static을 두는 이유: "객체마다 다른 것"과 "모두가 공유하는 것"의 구분. 공유돼야
  할 값(전체 카운트 등)을 인스턴스로 두면 사본이 따로 놀아 의미가 없다.
- `main()`이 static·public인 이유: 객체가 하나도 없는 시작 시점에 JVM이 외부에서
  호출해야 하므로.

## 위키 반영

- [[static-keyword]] — 인스턴스 vs static 비교, main()이 static인 원리
- [[jvm-memory]] — static 변수가 사는 Method Area
