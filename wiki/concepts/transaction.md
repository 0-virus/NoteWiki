---
type: concept
tags: [spring, database, transaction, jdbc]
updated: 2026-05-27
sources: ["raw/notes/Spring Framework.md", "raw/notes/study-notes.md"]
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

## 주요 속성

```java
@Transactional(
    propagation = Propagation.REQUIRED,    // 기본값: 이미 트랜잭션 있으면 참여, 없으면 새로 시작
    isolation   = Isolation.READ_COMMITTED, // 격리 수준
    readOnly    = true,                    // 읽기 전용 (최적화 힌트)
    rollbackFor = Exception.class          // 어떤 예외에서 롤백할지
)
```

`propagation = REQUIRED`가 기본값이라 서비스 메서드가 다른 서비스를 호출해도 같은 트랜잭션 안에서 움직인다.

## MyBatis에서의 트랜잭션

[[mybatis]]에서 `SqlSession`이 트랜잭션 단위다. Spring과 함께 쓰면 `@Transactional`이 SqlSession을 관리해준다 — 직접 `session.commit()`을 쓸 필요가 없다.

## 관련 페이지

- [[aop]] — `@Transactional`의 구현 방식, AOP Proxy
- [[concurrency-problem]] — 격리 수준과 동시성 이슈
- [[jdbc]] — Connection 수준 트랜잭션의 기반
- [[connection-pool]] · [[hikaricp]] — Connection = 트랜잭션 단위
- [[mybatis]] — Spring 통합 시 트랜잭션 위임
- [[dao-pattern]] — 트랜잭션 경계는 보통 Service 레이어에서 (@Transactional이 @Service에 붙는 이유)
- [[three-tier-architecture]] — Service 레이어가 트랜잭션을 책임지는 구조
- [[spring-bean]] — Proxy 교체로 @Transactional이 가능한 이유
