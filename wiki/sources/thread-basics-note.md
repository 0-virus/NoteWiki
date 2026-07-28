---
type: source
tags: [java, thread, concurrency]
updated: 2026-07-28
sources:
  - raw/notes/스레드_개념_기초부터_실무까지.md
---

# 스레드(Thread): 기초부터 실무까지

- **원본**: `raw/notes/스레드_개념_기초부터_실무까지.md`

## 맥락

영균이 **동시성 문제를 재점검**하려고 캡처한 노트. 기존 [[concurrency-problem]] 페이지는
Race Condition 현상 자체("읽기→더하기→쓰기가 꼬인다")는 다뤘지만, **왜 그런 현상이
생기는지**(스레드가 무엇을 공유하고 무엇을 독립적으로 갖는지, 원자성/가시성/순서성의
차이)는 다루지 않았다. 이 노트로 그 원리 층을 보강한다.

## 핵심 주장

1. 프로그램(디스크의 코드) → 프로세스(실행 중, 자원 할당) → 스레드(프로세스 안의 실행 흐름) 3단계 구분.
2. 같은 프로세스의 스레드들은 **Heap·static 변수·코드**는 공유하고, **Stack·실행 위치·지역 변수**는 독립적으로 가진다.
3. 동시성(번갈아 진행)과 병렬성(실제 동시 실행)은 다른 개념 — 멀티 스레딩은 동시성 구현 방법 중 하나.
4. `start()`는 새 스레드를 만들어 `run()`을 실행시키고, `run()`을 직접 부르면 현재 스레드에서 그냥 메서드 호출이 된다.
5. 스레드 생명주기: NEW → RUNNABLE → (BLOCKED/WAITING/TIMED_WAITING) → RUNNABLE → TERMINATED.
6. Race Condition의 근본 원인은 **원자성(Atomicity)** 부재. `count++`는 읽기→더하기→쓰기 3단계 복합 연산.
7. 원자성 외에 **가시성(Visibility)**·**순서성(Ordering)**도 별도 문제 — `synchronized`/`volatile`/원자 클래스가 각각 다른 조합을 보장.
8. 데드락은 순환 대기, 기아는 특정 스레드가 계속 실행 기회를 못 얻는 것 — 서로 다른 문제.
9. 스레드 풀은 스레드 생성 비용을 줄이고 수를 제한하는 재사용 장치 (`ExecutorService`).
10. 트랜잭션 문맥은 스레드에 바인딩된다 — 새 스레드를 만든다고 기존 트랜잭션이 자동으로 이어지지 않는다.
11. 새 스레드에서 발생한 예외는 호출자에게 자동 전달되지 않는다 — `Future`/`CompletableFuture`로 명시적으로 받아야 한다.

## 다루는 개념

- [[thread]]
- [[thread-safety]]
- [[thread-pool]]

## 관련 페이지

- [[concurrency-problem]] — 이 노트가 원리를 보강하는 기존 페이지 (Race Condition 현상)
- [[transaction]] — "트랜잭션과 스레드" 섹션이 직접 연결
- [[javascript-async]] — JS의 싱글 스레드 비동기와의 대비
