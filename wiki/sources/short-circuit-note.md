---
type: source
tags: [java, javascript, operator]
updated: 2026-05-19
sources: ["raw/notes/Java의 쇼트 서킷.md"]
---

# 소스: Java의 쇼트 서킷

> 원본: `raw/notes/Java의 쇼트 서킷.md` — 직접 작성 필기(노션 이전분).
> "쇼트 서킷으로 조건문을 간결하게" 시도하다 컴파일 에러를 만나 파고든 노트.

## 맥락 (왜 기록했나)

부트캠프 Java 학습 중 정리한 **실무 대비 자산**. `i != 0 && System.out.println(...)`이
JS에선 되는데 Java에선 컴파일 에러인 이유를 직접 실험하며 추적한 기록.

## 핵심 요약

- 쇼트 서킷: `&&`는 앞이 `false`면, `||`는 앞이 `true`면 뒤를 평가하지 않는다.
- `i != 0 && System.out.println(...)`은 Java에서 컴파일 에러 — `println`의 반환형이
  `void`인데 `&&`는 양쪽이 `boolean`이어야 하기 때문.
- JS는 같은 코드가 동작 — `console.log()`가 `undefined`를 반환하고, JS의 `&&`는
  truthy/falsy로 평가하기 때문.
- 교훈: 언어마다 "식(expression)"이 요구하는 타입 규칙이 다르다.

## 위키 반영

- [[short-circuit]] — 쇼트 서킷 원리, Java/JS 반환값 처리 차이
