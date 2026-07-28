---
type: concept
tags: [java, thread, concurrency, performance]
updated: 2026-07-28
sources: ["raw/notes/스레드_개념_기초부터_실무까지.md"]
---

# 스레드 풀 (Thread Pool)

## 한 줄 정의

**일정 수의 스레드를 미리 만들어 두고 재사용하는 장치.** 작업이 올 때마다 새 스레드를
만들지 않음으로써 생성 비용과 무제한 증가를 막는다.

## 왜 필요한가 — [[connection-pool]]과 같은 패턴

이 발상은 [[connection-pool]]과 정확히 같은 구조다 — **비싼 자원(스레드 생성 = OS 콜
+ 스택 메모리 할당)을 미리 만들어 두고 빌려주고 반납받는다.**

| | Connection Pool | Thread Pool |
| --- | --- | --- |
| 재사용 대상 | DB Connection | 스레드 |
| 비싼 이유 | TCP+TLS+인증+세션 초기화 | OS 스레드 생성, 스택 메모리 할당, 문맥 교환 대상 증가 |
| 없으면 | 요청마다 연결 비용 | 요청마다 스레드 생성 비용 + 무제한 증가 |
| 핵심 설정 | `maximumPoolSize` | 코어/최대 스레드 수 |

```
작업 대기열                  스레드 풀
├── 작업 1                  ├── Worker A
├── 작업 2        ──────▶   ├── Worker B
├── 작업 3                  └── Worker C
└── 작업 4
```

## Java에서 사용 — `ExecutorService`

```java
ExecutorService executor = Executors.newFixedThreadPool(10);
executor.submit(() -> doWork());
executor.shutdown();
```

## 실무 설정 — 스레드 수만으로는 부족하다

[[connection-pool]]에 `maximumPoolSize`·`connectionTimeout` 등 여러 설정이 있듯,
Thread Pool도 스레드 수 하나만으로 끝나지 않는다.

- 핵심 스레드 수 / 최대 스레드 수
- 작업 대기열 크기 — 무제한이면 메모리 문제, 너무 작으면 작업 거부 빈번
- 대기열이 가득 찼을 때의 거부 정책
- 종료 시 대기 작업 처리 방법
- 작업별 제한 시간

## 결과와 예외 받기 — `Future`

새 스레드(또는 풀의 워커)에서 발생한 예외는 호출자에게 **자동으로 전달되지 않는다**.

```java
new Thread(() -> { throw new RuntimeException("실패"); }).start();
// 이 예외는 아무도 못 본다 — 스레드 안에서 조용히 사라짐
```

`ExecutorService.submit()`이 반환하는 `Future`로 결과나 예외를 받아야 한다.

```java
Future<String> future = executor.submit(() -> performTask());
String result = future.get();  // 준비될 때까지 현재 스레드를 기다림
```

조합 가능한 비동기 흐름에는 `CompletableFuture`도 쓴다.

## 관련 페이지

- [[connection-pool]] — 같은 "재사용 자원 캐시" 패턴의 DB Connection 버전
- [[thread]] — 스레드 생성 비용·생명주기의 기반
- [[thread-safety]] — 풀의 워커들이 공유 자원을 다룰 때 필요한 안전 장치
- 출처: [[thread-basics-note]]
