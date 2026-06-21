---
type: concept
tags: [database, orm, performance]
updated: 2026-05-27
sources: ["raw/notes/Prisma 필기.md", "raw/lectures/JPA.md"]
---

# N+1 문제

## 한 줄 정의

한 번의 쿼리로 끝낼 수 있는 작업을, **1번 + N번** 으로 쪼개 쿼리하게 되는 비효율.

## 왜 발생하는가

[[orm]]에서 목록을 조회한 뒤 각 항목의 관계 데이터를 반복 접근할 때 생긴다.

```python
posts = Post.objects.all()      # 쿼리 1번: 게시글 전체
for post in posts:
    print(post.author.name)     # 쿼리 N번: 게시글마다 작성자 조회
```

게시글 100개면 `SELECT`가 1 + 100 = 101번 나간다.

## 해결

JOIN(또는 ORM의 eager loading)으로 관계 데이터를 **한 번에** 가져온다.
Prisma에서는 `include`가 그 역할을 한다:

```ts
const posts = await prisma.post.findMany({ include: { author: true } });
```

## JPA에서 — 페치 전략이 방아쇠

[[jpa]]에선 연관 관계의 `FetchType.LAZY`가 N+1의 진원지다. 목록을 조회한 뒤 루프에서
각 엔티티의 LAZY 연관을 건드리면 항목마다 SELECT가 추가로 나간다(1 + N).

```java
List<Order> orders = orderRepository.findAll();   // 쿼리 1번
for (Order o : orders)
    o.getOrderItems().size();                      // LAZY 접근 → 주문마다 쿼리 N번
```

회피: **fetch join**(`select o from Order o join fetch o.orderItems`) 또는 `@EntityGraph`로
한 번에 가져온다 — [[prisma]]의 `include`와 같은 역할. → [[jpa-association]]

> [[mybatis]]는 SQL이 코드에 보여 N+1을 눈으로 잡지만, JPA는 추상화 뒤에 숨어 무섭다.
> 같은 함정이 통제권 위치에 따라 다른 얼굴을 한다 → [[mybatis-to-jpa]].

## 실전 사례 — Virtuber 계좌 조회 API

Virtuber 모의투자 프로젝트에서 `/api/v1/accounts/me` 구현 중 발생한 사례.

**엔티티 관계**: `Account → Holding → Stock` (`Holding.stock`은 기본 LAZY)

**문제**: `holdingRepository.findAllByAccountId(accountId)`로 보유 종목 목록을 가져온 뒤, 루프에서 `holding.getStock().getCurrentPrice()` 등 Stock 필드에 접근 → 보유 종목 수(N)만큼 Stock SELECT 추가 발생.

**해결**: `HoldingRepository`에 fetch join 쿼리 추가.

```java
@Query("select h from Holding h join fetch h.stock where h.account.id = :accountId")
List<Holding> findAllByAccountIdWithStock(@Param("accountId") Long accountId);
```

- `join fetch h.stock`: Holding을 조회할 때 연관된 Stock을 **한 번의 JOIN SELECT**로 즉시 로딩
- `@Param("accountId")`: 메서드 파라미터와 JPQL `:accountId`를 연결
- 엔티티의 기본 LAZY 설정은 유지 — 이 메서드에서만 fetch join이 적용됨
- 일반 원칙: **기본은 LAZY, 필요한 조회에서만 fetch join** → [[jpql]]

## 관련 페이지

- [[orm]] — N+1은 ORM 추상화의 대표적 함정
- [[prisma]] — `include`로 회피
- [[jpa]] · [[jpa-association]] — LAZY 페치가 부르는 N+1과 fetch join 해결
- [[jpql]] — fetch join 문법 (`join fetch`)
- [[mybatis]] — SQL이 보여 잡기 쉬운 쪽
- 출처: [[prisma-orm]] · [[jpa-lecture]] · [[virtuber-spring-work-2026-06-21]]
