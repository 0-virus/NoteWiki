---
type: concept
tags: [java, thread, concurrency]
updated: 2026-07-28
sources: ["raw/notes/스레드_개념_기초부터_실무까지.md"]
---

# 스레드 안전성 (Thread Safety)

## 한 줄 정의

**여러 스레드가 동시에 접근해도 프로그램이 올바르게 동작하는 성질.**
[[concurrency-problem|Race Condition]]이 "무엇이 일어나는가"라면, 이 페이지는
"왜 일어나고, 무엇으로 막는가"를 다룬다.

## 세 가지 관점 — 원자성·가시성·순서성

멀티 스레드 문제는 보통 세 축으로 쪼개서 이해한다. `synchronized`·`volatile`·원자
클래스가 서로 다른 조합을 보장하기 때문에, 이 구분이 없으면 "왜 volatile을 썼는데도
안전하지 않지?" 같은 혼동이 생긴다.

| 속성 | 의미 | 깨지는 예 |
| --- | --- | --- |
| **원자성(Atomicity)** | 하나의 작업이 중간 상태 없이 전부 실행되거나 전혀 실행되지 않음 | `count++`는 "읽기→더하기→쓰기" 3단계 복합 연산 → 원자적이지 않음 |
| **가시성(Visibility)** | 한 스레드가 바꾼 값을 다른 스레드가 적절한 시점에 볼 수 있음 | CPU 캐시에만 반영되고 메인 메모리에 아직 안 보일 수 있음 |
| **순서성(Ordering)** | 작성된 연산 순서와 관찰되는 순서가 일관됨 | 컴파일러/CPU가 결과가 같다고 판단하면 명령을 재배치할 수 있음 |

[[concurrency-problem]]에서 다룬 `count++` 예시는 정확히는 **원자성 부재**가 원인이다.

## 도구별 보장 범위

```java
// synchronized — 상호 배제 + 락 경계에서 가시성까지 보장
public synchronized void increment() { count++; }

// volatile — 가시성만 보장, 복합 연산은 여전히 원자적이지 않음
private volatile int count = 0;
count++;  // 여전히 안전하지 않다!

// 원자 클래스 — 락 없이 원자 연산 제공
AtomicInteger count = new AtomicInteger();
count.incrementAndGet();
```

| 도구 | 주된 용도 |
| --- | --- |
| `synchronized` | 임계 구역의 상호 배제 + 가시성 |
| `volatile` | 단일 변수의 가시성 (복합 연산 원자성은 X) |
| 원자 클래스(`AtomicInteger` 등) | 락 없이 쓸 수 있는 원자 연산 |
| 명시적 `Lock` | 타임아웃·조건 변수 등 세밀한 락 제어 |

> ⚠️ **흔한 함정**: `volatile`이 "동시성 문제를 해결해준다"고 오해하기 쉽다. `volatile`은
> **가시성**만 준다. `count++`처럼 여러 단계로 이뤄진 연산은 volatile을 붙여도 여전히
> Race Condition이 난다 — 원자 클래스나 `synchronized`가 필요하다.

## 데드락과 기아

### 데드락(Deadlock)

두 스레드가 서로 상대가 가진 자원을 기다리며 영원히 멈추는 상태.

```
Thread A: Lock 1 보유 → Lock 2 대기
Thread B: Lock 2 보유 → Lock 1 대기   ← 서로가 서로를 기다림
```

예방: 락 획득 순서 통일, 불필요한 중첩 락 제거, 타임아웃 있는 락 사용.
→ DB 레벨의 데드락 예방(락 순서 고정, 타임아웃)은 [[optimistic-pessimistic-lock]]에서
같은 원리를 다룬다 — **애플리케이션 레벨 락과 DB 레벨 락이 같은 해법을 공유**한다.

### 기아(Starvation)

특정 스레드가 계속 실행 기회를 못 얻는 상태. 불공정한 락 경쟁이나 특정 작업의 자원
독점 때문에 발생. 데드락과 달리 시스템 전체가 멈추진 않지만, 특정 요청만 계속 밀린다.

## 스레드 안전한 설계 원칙

- 지역 변수는 각 스레드의 Stack에 독립적으로 존재하므로 원래 안전하다.
- **공유되는 변경 가능 상태(mutable shared state)를 최소화**하는 것이 가장 근본적인 해법.
- 불변 객체는 애초에 바뀌지 않으므로 스레드 안전하다 — [[mutable-immutable]] 참고.

```java
// 위험: currentValue는 인스턴스 필드 → 여러 스레드가 덮어씀
public class Processor {
    private String currentValue;
    public void process(String value) { currentValue = value; use(currentValue); }
}
```

→ [[servlet-lifecycle]]의 "Servlet 인스턴스 변수에 상태를 두지 마라" 원칙이 정확히
이 문제의 실제 사례다.

## 관련 페이지

- [[concurrency-problem]] — Race Condition의 현상과 DB/애플리케이션 레벨 비교
- [[thread]] — 스레드가 무엇을 공유하는지(원자성 문제가 왜 생기는지)의 기반
- [[optimistic-pessimistic-lock]] — 같은 락 순서·타임아웃 원리를 DB 레벨에서 다룸
- [[mutable-immutable]] — 불변 객체가 스레드 안전한 이유
- [[servlet-lifecycle]] — 공유 가능한 변경 상태를 인스턴스 변수에 두면 안 되는 실제 사례
- 출처: [[thread-basics-note]]
