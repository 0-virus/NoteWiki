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

## 관련 페이지

- [[orm]] — N+1은 ORM 추상화의 대표적 함정
- [[prisma]] — `include`로 회피
- [[jpa]] · [[jpa-association]] — LAZY 페치가 부르는 N+1과 fetch join 해결
- [[mybatis]] — SQL이 보여 잡기 쉬운 쪽
- 출처: [[prisma-orm]] · [[jpa-lecture]]
