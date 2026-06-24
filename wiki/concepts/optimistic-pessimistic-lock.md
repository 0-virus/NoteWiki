---
type: concept
tags: [database, concurrency, jpa, spring, lock]
updated: 2026-06-24
sources: []
---

# 낙관적 락 vs 비관적 락

## 왜 필요한가

[[concurrency-problem]]이 정리한 것처럼, 같은 row에 여러 트랜잭션이 동시에 접근하면
"읽기 → 수정 → 쓰기" 사이에 다른 트랜잭션이 끼어들어 값이 꼬인다.

```
트랜잭션 A: 재고 읽음 (10)
트랜잭션 B: 재고 읽음 (10)   ← A가 아직 저장 전인데 B도 읽어버림
트랜잭션 A: 10 - 1 = 9 저장
트랜잭션 B: 10 - 1 = 9 저장  ← 재고가 8이어야 하는데 9
```

이를 해결하는 전략이 둘이다: **충돌을 막을 것이냐(비관적)** vs **충돌을 감지할 것이냐(낙관적)**.

---

## 비관적 락 (Pessimistic Lock)

**"어차피 누군가 끼어든다 — 미리 막는다"**

DB에 `SELECT ... FOR UPDATE`를 날려 **row 전체를 물리적으로 잠근다**.
락을 건 트랜잭션이 커밋 또는 롤백할 때까지 다른 트랜잭션은 그 row에 손댈 수 없다.

> **락은 row 단위다.** 필드(컬럼) 단위 락은 DB 레벨에서 지원하지 않는다.

```sql
-- DB 직접
SELECT * FROM product WHERE id = 1 FOR UPDATE;
```

```java
// JPA + Spring Data JPA
@Lock(LockModeType.PESSIMISTIC_WRITE)
Optional<Product> findById(Long id);
```

### InnoDB 주의사항 — 인덱스 없으면 테이블 락

InnoDB는 **인덱스를 통해서만 row 락**을 건다.
락을 거는 컬럼에 인덱스가 없으면 full scan → **테이블 전체에 락**이 걸려버린다.
`SELECT FOR UPDATE`를 쓰는 컬럼엔 반드시 인덱스가 있어야 한다. → [[database-index]]

### 장단점

| 장점 | 단점 |
|------|------|
| 충돌 자체를 원천 차단 | 락 대기 시 다른 트랜잭션 블로킹 → 처리량↓ |
| 데이터 정합성 보장이 확실 | 데드락(교착 상태) 위험 |

**언제 쓰나:** 충돌 빈도가 높고, 충돌 시 재시도 비용이 큰 경우.
예: 재고 차감, 결제, 좌석 예약.

---

## 낙관적 락 (Optimistic Lock)

**"충돌이 드물다 — 일단 작업하고, 저장 전에 확인한다"**

DB 락 없이 **버전 컬럼**(`version`)으로 충돌을 감지한다.
내가 읽었을 때 version이 5였으면, 저장 시점에도 5여야 한다.
중간에 다른 트랜잭션이 수정해 6이 됐다면 `UPDATE`가 0 rows → 예외.

```java
@Entity
public class Product {
    @Id Long id;
    int stock;

    @Version   // 이 필드 하나가 낙관적 락의 전부
    int version;
}
```

JPA가 내부적으로 이렇게 동작한다:

```sql
-- 저장 시 JPA가 자동 생성
UPDATE product
SET stock = 9, version = 6
WHERE id = 1 AND version = 5;  -- 충돌 시 0 rows → OptimisticLockException
```

충돌 발생 시 `OptimisticLockException` → 애플리케이션에서 **재시도** 처리 필요.

### 장단점

| 장점 | 단점 |
|------|------|
| DB 락 없음 → 처리량↑ | 충돌 시 재시도 로직 직접 구현 필요 |
| 읽기 위주 시나리오에 유리 | 충돌이 잦으면 재시도 폭발 |

**언제 쓰나:** 충돌 빈도가 낮고 읽기 위주인 경우.
예: 게시글 수정, 사용자 프로필 업데이트.

---

## 비관적 락의 데드락 해결

데드락은 두 트랜잭션이 서로 상대방의 락을 기다리는 순환 대기에서 발생한다.

```
트랜잭션 A: Product(id=1) 락 획득 → Order(id=5) 락 대기
트랜잭션 B: Order(id=5) 락 획득 → Product(id=1) 락 대기
              ↑ 서로가 서로를 기다림 → 무한 블로킹
```

### 해결법 1 — 락 획득 순서 통일 (근본 해결)

모든 트랜잭션이 **같은 순서**로 락을 잡으면 순환 자체가 불가능해진다.

```java
// 항상 id 오름차순(row 단위)으로 락 순서를 고정
List<Long> ids = Arrays.asList(productId, orderId);
Collections.sort(ids);
for (Long id : ids) {
    repository.lockById(id);  // 각각 SELECT FOR UPDATE → row 전체에 락
}
```

"항상 테이블 A → 테이블 B", "항상 id 오름차순" 같은 규칙을 팀 컨벤션으로 고정한다.

### 해결법 2 — 타임아웃 설정 (현실적 안전망)

데드락이 생겨도 무한 대기 대신 일정 시간 후 포기하고 예외를 던진다.

```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@QueryHints(@QueryHint(
    name = "javax.persistence.lock.timeout",
    value = "3000"  // 3초
))
Optional<Product> findById(Long id);
```

MySQL InnoDB는 데드락을 자동 감지해 트랜잭션 하나를 롤백(victim 선택)시키고 나머지를 진행시킨다.
`innodb_lock_wait_timeout`(기본 50초)을 5~10초로 줄이는 게 일반적이다.

### 해결법 3 — 락 범위 축소

락을 넓게 잡고 오래 들고 있을수록 데드락 확률이 높아진다.

- `@Transactional` 메서드를 최대한 짧게 유지
- 락이 필요한 시점을 가능한 늦게, 락을 쥐는 시간은 최대한 짧게
- 조회는 `@Transactional(readOnly = true)`로 분리 → 락 미발생

### 해결법 4 — 낙관적 락으로 전환

데드락이 자주 터진다면 충돌 빈도가 높다는 신호이자 락 설계를 재검토하라는 신호.
일부 시나리오는 `@Version` + 재시도로 바꾸면 데드락 자체가 사라진다.

### 실무 조합

```
타임아웃 깔아두기 + 락 순서 컨벤션으로 고정
→ 데드락 로그가 자주 보이면 낙관적 락 전환 검토
```

---

## HTTP 수준의 낙관적 락 — ETag

[[etag]]에 정리된 것처럼, ETag + `If-Match`는 클라이언트-서버 사이의 낙관적 락이다.

```
클라이언트: GET /post/1  →  ETag: "abc"
클라이언트: PUT /post/1 (If-Match: "abc")  →  버전이 바뀌었으면 409 Conflict
```

DB의 `@Version`이 서버-DB 사이라면, ETag는 클라이언트-서버 사이.

---

## 선택 기준

```
충돌이 잦다 (재고·좌석·결제)     → 비관적 락 (@Lock PESSIMISTIC_WRITE)
충돌이 드물다 (게시글·프로필)    → 낙관적 락 (@Version)
HTTP 레벨 동시 편집 방지         → ETag + If-Match
```

## 관련 페이지

- [[concurrency-problem]] — Race Condition의 근본 원인, DB vs 애플리케이션 레벨 비교
- [[transaction]] — ACID 격리성, `@Transactional` 동작 원리
- [[etag]] — HTTP 수준 낙관적 락
- [[database-index]] — InnoDB row 락과 인덱스의 관계
- [[jpa]] — `@Version`, `@Lock` 어노테이션 기반
