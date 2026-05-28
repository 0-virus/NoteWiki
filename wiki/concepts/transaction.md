---
type: concept
tags: [spring, database, transaction, jdbc]
updated: 2026-05-28
sources: ["raw/notes/Spring Framework.md", "raw/notes/study-notes.md", "raw/lectures/JPA.md", "raw/dialogues/2026-05-28 Spring 도메인 구조와 @Transactional — 프록시 vs 컨테이너.md"]
---

# 트랜잭션 (Transaction)

## 한 줄 정의

**"전부 성공하거나, 전부 실패하거나" — DB 작업의 원자적 단위.**
중간에 오류가 나면 이전 상태로 되돌린다(롤백).

## ACID

| 속성 | 이름 | 의미 |
|---|---|---|
| **A** | Atomicity (원자성) | 트랜잭션 내 모든 작업은 전부 성공 or 전부 실패 |
| **C** | Consistency (일관성) | 트랜잭션 전후 DB는 정의된 규칙(제약조건)을 만족 |
| **I** | Isolation (격리성) | 동시에 실행 중인 트랜잭션끼리 서로 영향을 주지 않음 |
| **D** | Durability (지속성) | 커밋된 데이터는 장애가 나도 유지됨 |

> 격리(I)가 완벽하면 성능이 떨어진다. 현실에서는 **격리 수준**을 조절해 트레이드오프를 선택한다.
> → [[concurrency-problem]] — 격리 수준(READ UNCOMMITTED ~ SERIALIZABLE)과 Dirty Read/Phantom Read 문제

## JDBC 수준의 트랜잭션

```java
Connection conn = dataSource.getConnection();
conn.setAutoCommit(false);   // 트랜잭션 시작
try {
    // 작업 1, 2, 3 ...
    conn.commit();           // 전부 성공 → 확정
} catch (Exception e) {
    conn.rollback();         // 실패 → 되돌리기
} finally {
    conn.close();
}
```

`setAutoCommit(false)` 한 줄이 핵심 — 이게 없으면 쿼리 하나하나가 자동 커밋된다.
[[jdbc]]·[[connection-pool]]·[[hikaricp]] 맥락에서 Connection 하나가 트랜잭션 하나를 대표한다.

## Spring `@Transactional` — 선언적 트랜잭션

매번 try-catch-rollback을 직접 짜는 건 번거롭다. Spring은 [[aop|AOP Proxy]]로 이걸 자동화한다.
직접 `begin/commit/rollback`을 호출하는 방식을 **프로그래밍 방식(programmatic)**, 어노테이션
하나로 위임하는 방식을 **선언적(declarative)** 트랜잭션 관리라고 부른다. `@Transactional`은 후자다.

```java
@Service
public class OrderService {

    @Transactional          // 이 어노테이션 하나로 트랜잭션 관리 위임
    public void placeOrder(OrderDto dto) {
        orderRepository.save(dto.toEntity());
        paymentService.charge(dto.getPayment());   // 실패하면 save도 롤백
    }
}
```

**동작 원리 (Proxy):**
```
클라이언트
    │ orderService.placeOrder() 호출
    ▼
[Spring AOP Proxy]
    1. 트랜잭션 시작 (Connection.setAutoCommit(false))
    2. placeOrder() 실행 위임
    3-a. 정상 종료 → commit()
    3-b. 예외 발생 → rollback()
```

`@Transactional`이 붙은 메서드를 호출하는 `orderService`는 실제론 **Proxy 객체**다 — [[spring-bean]]이 컨테이너에 의해 관리되기 때문.

> ⚠️ **자기호출(self-invocation) 함정.** 프록시는 *바깥에서 들어오는* 호출만 가로챈다.
> 같은 클래스 안에서 `this.다른메서드()`로 부르면 프록시를 안 거쳐 `@Transactional`이
> **안 먹는다**. 호출 주체/시점의 자세한 그림은 [[aop]]의 "컨테이너 vs 프록시" 절 참고.

## 바닐라 JPA와의 대응 — 프록시가 대신 짜주는 코드

[[entity-manager|EntityManager]]로 직접 트랜잭션을 짜본 적이 있다면, `@Transactional`이
무엇을 자동화하는지 한눈에 보인다. 아래 두 코드는 **같은 일**을 한다.

```java
// 프로그래밍 방식 — 직접 짠 코드 (바닐라 JPA)
EntityManager em = emf.createEntityManager();
EntityTransaction tx = em.getTransaction();
try {
    tx.begin();          // ← @Transactional 진입 시
    // ... 비즈니스 로직 ...
    tx.commit();         // ← 메서드 정상 종료 시
} catch (Exception e) {
    tx.rollback();       // ← 예외 발생 시
    throw e;
} finally {
    em.close();          // ← 메서드 종료 시
}
```

```java
// 선언적 방식 — Spring
@Transactional
public void doSomething() {
    // ... 비즈니스 로직만 ...   ← begin/commit/rollback/close 전부 프록시가 대신함
}
```

> `em`을 직접 만들지 않는 이유, 즉 "컨테이너가 EntityManager를 관리한다"의 2단계 도식은
> [[entity-manager]] 참고 (앱당 1개 Factory → 호출마다 EM 생성·바인딩·정리).

## 주요 속성

```java
@Transactional(
    propagation = Propagation.REQUIRED,    // 기본값: 이미 트랜잭션 있으면 참여, 없으면 새로 시작
    isolation   = Isolation.READ_COMMITTED, // 격리 수준
    readOnly    = true,                    // 읽기 전용 (변경 감지 스냅샷 생략)
    rollbackFor = Exception.class          // 어떤 예외에서 롤백할지
)
```

### `readOnly = true`의 "왜"

단순 힌트 이상이다. JPA는 "이 트랜잭션은 안 바뀐다"는 걸 알면 [[persistence-context|변경
감지(dirty checking)]]를 위한 **스냅샷을 만들지 않는다** → 조회 엔티티가 많을수록 메모리·속도
이득. 동시에 실수로 수정해도 flush가 일어나지 않아 **"여긴 조회만"이라는 의도를 코드로 못 박는**
안전장치가 된다. 그래서 조회 메서드엔 `readOnly = true`, 변경 메서드엔 기본 `@Transactional`을 쓰는 게 정석.

### ⚠️ 기본 롤백 규칙 — unchecked 예외만

바닐라 `catch(Exception)`과 가장 다른 함정: `@Transactional`은 기본적으로 **`RuntimeException`
(unchecked)과 `Error`에서만 롤백**한다. **checked 예외(`IOException` 등)는 기본적으로 롤백하지
않고 그대로 commit** 된다. checked 예외에도 롤백하려면 `rollbackFor = Exception.class`를 명시해야 한다.

### 전파(propagation) — 합칠까 새로 열까

`propagation = REQUIRED`가 기본값이라 서비스 메서드가 다른 서비스를 호출해도 같은 트랜잭션
안에서 움직인다 (트랜잭션이 1개로 합쳐짐). 안쪽 예외가 바깥까지 롤백시키는 이유, try-catch로
잡아도 `UnexpectedRollbackException`이 나는 함정, 그리고 진짜 분리(`REQUIRES_NEW`)는
**→ [[transaction-propagation]]** 에서 도식과 함께 다룬다.

## MyBatis에서의 트랜잭션

[[mybatis]]에서 `SqlSession`이 트랜잭션 단위다. Spring과 함께 쓰면 `@Transactional`이 SqlSession을 관리해준다 — 직접 `session.commit()`을 쓸 필요가 없다.

## JPA에서의 트랜잭션 — TransactionManager가 바뀐다

`@Transactional`을 쓰는 코드는 그대로지만, **뒤에서 트랜잭션을 관리하는 빈이 기술마다 다르다.**

| 영속성 기술 | TransactionManager 구현 |
| --- | --- |
| [[jdbc]] · [[mybatis]] | `DataSourceTransactionManager` |
| [[jpa]] | `JpaTransactionManager` (EntityManager를 관리) |

```java
@Bean
PlatformTransactionManager transactionManager(EntityManagerFactory emf) {
    JpaTransactionManager tm = new JpaTransactionManager();
    tm.setEntityManagerFactory(emf);
    return tm;
}
```

> JPA에서 트랜잭션이 특히 중요한 이유: [[persistence-context|영속성 컨텍스트]]의 **변경
> 감지가 커밋 시점에 동작**한다. 조회한 엔티티의 필드를 바꾸면 `@Transactional` 메서드가
> 끝날 때(커밋 → flush) JPA가 UPDATE를 내보낸다 — 트랜잭션 경계가 곧 작업대의 수명이자
> 영속성 반영 시점이다. → [[persistence-context]] · [[mybatis-to-jpa]]

## 관련 페이지

- [[transaction-propagation]] — `REQUIRED` vs `REQUIRES_NEW`, rollback-only, `UnexpectedRollbackException`
- [[spring-annotations]] — `@Transactional`·`readOnly`가 속한 어노테이션 인덱스
- [[aop]] — `@Transactional`의 구현 방식, AOP Proxy
- [[concurrency-problem]] — 격리 수준과 동시성 이슈
- [[jdbc]] — Connection 수준 트랜잭션의 기반
- [[connection-pool]] · [[hikaricp]] — Connection = 트랜잭션 단위
- [[mybatis]] — Spring 통합 시 트랜잭션 위임
- [[jpa]] · [[entity-manager]] — `JpaTransactionManager`, 커밋 시점의 변경 감지
- [[dao-pattern]] — 트랜잭션 경계는 보통 Service 레이어에서 (@Transactional이 @Service에 붙는 이유)
- [[three-tier-architecture]] — Service 레이어가 트랜잭션을 책임지는 구조
- [[spring-bean]] — Proxy 교체로 @Transactional이 가능한 이유
