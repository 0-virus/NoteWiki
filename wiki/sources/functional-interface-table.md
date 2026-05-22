---
type: source
tags: [java, functional-interface]
updated: 2026-05-19
sources: ["raw/notes/Functional Interface.md"]
---

# 소스: Functional Interface

> 원본: `raw/notes/Functional Interface.md` — 직접 작성 필기(노션 이전분).
> 표준 함수형 인터페이스 5종을 표 하나로 압축한 짧은 참조 노트.

## 맥락 (왜 기록했나)

부트캠프 Java 학습 중 정리한 **실무 대비 자산**. 람다를 받을 표준 타입을 헷갈리지
않게 한눈에 보려고 만든 치트시트성 노트.

## 핵심 요약

`java.util.function`의 대표 함수형 인터페이스:

| 인터페이스   | 타입 파라미터            | 메서드     | 반환        |
| ------------ | ------------------------ | ---------- | ----------- |
| `Runnable`   | 없음                     | `run()`    | 없음        |
| `Supplier`   | `T`(반환)                | `get()`    | O           |
| `Consumer`   | `T`(파라미터)            | `accept()` | 없음        |
| `Function`   | `T`(파라미터), `R`(반환) | `apply()`  | O           |
| `Predicate`  | `T`(파라미터)            | `test()`   | O (boolean) |

## 위키 반영

- [[functional-interface]] — 표준 5종 표 + 함수형 인터페이스의 원리
- [[anonymous-class-to-lambda]] — 함수형 인터페이스가 람다와 맞물리는 흐름
