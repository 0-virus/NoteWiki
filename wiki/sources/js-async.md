---
type: source
tags: [javascript, async]
updated: 2026-05-18
sources: ["raw/notes/비동기의 모든 것.md"]
---

# 소스: 비동기의 모든 것

> 원본: `raw/notes/비동기의 모든 것.md` — 직접 작성 필기(노션 이전분).

## 핵심 요약

- 동기는 앞 작업이 끝나야 다음으로 진행(블로킹). 비동기는 기다리는 동안 다른 일 수행.
- JS는 **싱글 스레드**라 I/O를 동기로 처리하면 UI가 멈춤 → 비동기가 핵심.
- 비동기 구현 3방식: **Callback → Promise → async/await** 순으로 발전.
- Callback: 가장 오래된 방식, 중첩 시 **콜백 지옥**.
- Promise: `pending/fulfilled/rejected` 3상태, 상태 불변. 정적 메서드 `all/allSettled/race/any`.
- async/await: Promise의 문법 설탕. `async`는 항상 Promise 반환, `await`로 동기처럼 작성.

## 위키 반영

- [[javascript-async]] — 동기 vs 비동기, 싱글 스레드
- [[callback]] · [[promise]] · [[async-await]] — 3가지 구현 방식
- [[js-async-evolution]] — 세 방식의 발전 흐름
