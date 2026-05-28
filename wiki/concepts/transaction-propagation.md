---
type: concept
tags: [spring, transaction, propagation, jpa]
updated: 2026-05-28
sources: ["raw/dialogues/2026-05-28 Spring 도메인 구조와 @Transactional — 프록시 vs 컨테이너.md"]
---

# 트랜잭션 전파 (Propagation)

## 한 줄 정의

**`@Transactional` 메서드가 다른 `@Transactional` 메서드를 호출할 때, 트랜잭션을
"합칠지 / 새로 열지"를 정하는 규칙.** [[transaction]]의 `propagation` 속성으로 지정한다.

## 핵심부터 — 기본값은 "새로 안 만들고 합친다"

흔한 오해: "안쪽 메서드가 호출되면 그 안에 **새 트랜잭션이 생긴다**."
기본값 `Propagation.REQUIRED`에서는 **아니다.** 안쪽은 바깥 트랜잭션에 *참여(합류)*할 뿐이라,
물리적으로 트랜잭션은 **딱 1개**다.

```
@Transactional outer() {
    작업 A;        // 변경 1
    inner();       // ← 새 트랜잭션 X. 같은 트랜잭션 T에서 그대로 실행
    작업 C;        // 변경 3
}

@Transactional inner() {
    작업 B;        // 변경 2  ← 여전히 트랜잭션 T 안
}
```

이것이 [[transaction]]에서 "서비스가 다른 서비스를 호출해도 같은 트랜잭션 안에서 움직인다"고
한 말의 메커니즘이다.

## 그래서 안쪽 예외 → 바깥까지 전부 롤백

트랜잭션이 1개뿐이므로, 안쪽에서 예외가 전파되면 **전체가 롤백**된다.

```
@Transactional outer() {
    작업 A;
    inner();   ──┐
    작업 C;      │
}               │
@Transactional inner() {
    작업 B;      │
    throw ...;  💥  → 예외 전파 → 트랜잭션 T 전체 rollback
}               │
                ▼
   A · B 모두 롤백 (C는 실행조차 안 됨)
```

## 진짜 함정 — try-catch로 잡아도 못 살린다

"바깥에서 안쪽 예외를 잡으면 트랜잭션을 살릴 수 있지 않나?" → **안 된다.**

```
@Transactional outer() {
    작업 A;
    try { inner(); } catch (Exception e) { /* 무시하고 계속 */ }
    작업 C;
    // 메서드 끝 → commit 시도
    // 하지만 inner의 예외가 inner 프록시 경계를 넘는 순간
    // 트랜잭션 T에 "rollback-only" 도장이 찍힘
    // → commit 하려는 순간 UnexpectedRollbackException 발생, 전체 롤백
}
```

안쪽 `@Transactional` 메서드의 예외가 그 [[aop|프록시]] 경계를 넘으면서 공유 트랜잭션을
**rollback-only** 상태로 마킹한다. 바깥은 같은 트랜잭션을 공유하므로, 예외를 삼켜도 최종
커밋 시점에 Spring이 `UnexpectedRollbackException`을 던지며 강제 롤백한다.

> 교훈: "안쪽 실패는 무시하고 바깥은 커밋"이 의도라면, 그냥 try-catch로는 안 되고
> **전파 수준을 바꿔야 한다**(아래 `REQUIRES_NEW`).

## "새 트랜잭션이 들어가는" 경우 — REQUIRES_NEW

진짜로 별도 트랜잭션을 열려면 안쪽 메서드의 전파를 바꾼다.

```java
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void inner() { ... }
```

그러면 바깥 트랜잭션을 **잠시 멈추고(suspend)** 안쪽이 독립된 물리 트랜잭션을 연다.
이때는 서로 영향을 주지 않는다(바깥이 안쪽 예외를 잡아줄 때).

## 자주 쓰는 전파 옵션

| 전파 | 의미 | 안쪽 예외 시 |
|---|---|---|
| **`REQUIRED`** (기본) | 있으면 참여, 없으면 새로 시작 | 트랜잭션 1개 → 바깥까지 전부 롤백 |
| **`REQUIRES_NEW`** | 항상 새 트랜잭션 (바깥은 멈춤) | 안쪽만 롤백 (바깥이 잡으면) |
| `SUPPORTS` | 있으면 참여, 없으면 트랜잭션 없이 | — |
| `MANDATORY` | 반드시 기존 트랜잭션 있어야 (없으면 예외) | — |
| `NEVER` | 트랜잭션 있으면 예외 | — |
| `NESTED` | savepoint 기반 중첩 (부분 롤백 가능, DB 의존) | savepoint까지만 롤백 |

> `REQUIRES_NEW`는 흔히 **"실패해도 남겨야 하는 로그·이력"**에 쓴다. 예: 본 작업이 롤백돼도
> 감사 로그(audit)는 남기고 싶을 때 로그 기록 메서드만 `REQUIRES_NEW`.

## 관련 페이지

- [[transaction]] — `@Transactional`의 기본 동작·ACID·readOnly·기본 롤백 규칙
- [[aop]] — 전파/rollback-only가 작동하는 프록시 경계, 자기호출 함정
- [[persistence-context]] — 트랜잭션 경계 = 작업대 수명 (전파가 작업대 공유 여부를 가름)
- [[jpa]] · [[entity-manager]] — `JpaTransactionManager`가 전파를 실제로 처리
- 출처: [[spring-transaction-proxy-dialogue]]