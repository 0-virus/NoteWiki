---
type: concept
tags: [javascript, async]
updated: 2026-05-18
sources: ["raw/notes/비동기의 모든 것.md"]
---

# 동기 vs 비동기 (JavaScript)

## 한 줄 정의

- **동기(Synchronous)**: 앞 작업이 끝나야 다음으로 넘어감.
- **비동기(Asynchronous)**: 작업을 시작만 해두고, 기다리는 동안 다른 일을 함.

## 왜 JS에서 비동기가 중요한가

JavaScript는 **싱글 스레드** 언어다. 스레드가 하나뿐이라,
네트워크 요청·파일 읽기 같은 오래 걸리는 I/O를 동기로 처리하면
그동안 **그 스레드가 통째로 멈춘다(블로킹)** — UI가 얼어붙는다.

비동기는 "작업을 걸어두고 결과는 나중에 받는" 방식으로 이 멈춤을 피한다.

## 비동기 구현 3방식

JS의 비동기는 역사적으로 세 단계로 발전했다:

- [[callback]] — 가장 오래된 방식
- [[promise]] — ES6에서 등장, 콜백 지옥 해결
- [[async-await]] — ES2017, Promise를 동기 코드처럼 작성

→ 발전 과정 전체는 [[js-async-evolution]] 참고.

## 관련 페이지

- 출처: [[js-async]]
