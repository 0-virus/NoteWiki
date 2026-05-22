---
type: source
tags: [java, equals, hashcode, collection]
updated: 2026-05-19
sources: ["raw/notes/hashCode와 equals.md"]
---

# 소스: hashCode와 equals

> 원본: `raw/notes/hashCode와 equals.md` — 직접 작성 필기(노션 이전분).

## 맥락 (왜 기록했나)

부트캠프 Java 학습 중 정리한 **실무 대비 자산**. `equals`만 오버라이딩했을 때
`HashSet` 중복 제거가 깨지는 버그를 직접 추적하며 "왜 둘을 같이 해야 하나"를
원리로 정리한 노트.

## 핵심 요약

- 참조형의 기본 비교는 **주소 비교** — `Object.equals()`도 기본은 `==`와 동일.
- `equals()` 오버라이딩 = 주소 대신 **필드 값** 기준 비교. `String.equals()`가 값
  비교를 하는 것도 같은 원리.
- `hashCode()`는 객체의 지문(정수). 기본은 주소 기반 native 메서드.
- **Java 규약**: `equals()`가 `true`면 `hashCode()`도 같아야 한다.
- Hash 컬렉션은 `hashCode` → `equals` 순으로 중복 판정. `equals`만 고치면 해시가
  달라 `equals`가 호출조차 안 돼 **중복 제거 실패** (조용한 논리 버그).

## 위키 반영

- [[equals-hashcode]] — 두 메서드의 관계, 함께 오버라이딩해야 하는 이유
