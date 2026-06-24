---
type: concept
tags: [jpa, jpql, query, criteria, querydsl, database]
updated: 2026-05-27
sources: ["raw/lectures/JPA.md"]
---

# JPQL과 복잡한 쿼리

## 한 줄 정의

**JPQL(Java Persistence Query Language)** = 테이블이 아니라 **엔티티 객체를 대상으로
하는 객체 지향 쿼리**. SQL과 문법은 닮았지만 **대상이 테이블이 아니라 클래스/필드**다.

## 왜 별도 쿼리 언어가 필요한가

[[spring-data-jpa]]의 메서드 이름 쿼리(`findByItemNameLike`)는 단순 조건엔 좋지만,
조건이 복잡해지면 메서드 이름이 감당 못 한다. 그렇다고 SQL을 직접 쓰면 [[jpa]]가 추구한
**객체 중심·벤더 독립**이 깨진다. JPQL은 그 사이 — **객체 문법으로 쓰되 JPA가 각 DB의
SQL로 번역**한다.

```java
// 'item'은 테이블 Items가 아니라 엔티티 ItemEntity, 'itemName'은 칼럼이 아니라 필드
String jpql = "select item from ItemEntity item where item.itemName like '%peach%'";
List<ItemEntity> result = entityManager
        .createQuery(jpql, ItemEntity.class)
        .getResultList();
```

> 핵심 차이: SQL은 `FROM Items`(테이블), JPQL은 `from ItemEntity`(엔티티 클래스).
> JPQL은 **객체를 조회**하고, 실제 SQL 변환은 [[hibernate]]가 DB 방언에 맞춰 한다.

## 복잡한 쿼리를 푸는 4단계 카드

조건이 복잡해질수록 위에서 아래로 내려간다.

| 도구 | 성격 | 언제 |
| --- | --- | --- |
| 메서드 이름 쿼리 | 선언만 | 단순 조건 → [[spring-data-jpa]] |
| **JPQL** | 문자열 쿼리 | 중간 복잡도, 객체 지향 유지 |
| **Criteria API** | JPQL을 만드는 **빌더 클래스(자바 코드)** | 동적 쿼리, 타입 안전. 단 장황함 |
| **QueryDSL / jOOQ** | 서드파티 빌더 | 실무에서 Criteria 대신 선호 (가독성·타입 안전) |
| Native SQL | 그냥 SQL | JPQL로 안 되는 DB 전용 기능 |

- **Criteria API**: JPQL을 문자열이 아닌 자바 코드로 조립 → 컴파일 타임 타입 체크가 되지만
  코드가 길고 읽기 어렵다.
- **QueryDSL**: 그 단점을 해결한 서드파티. 실무에서 동적 쿼리의 사실상 표준. → [[querydsl]]

## JPA의 한계와 그 보완 — 영균 맥락

[[jpa]] 단점 중 "JPQL엔 한계가 있다"가 여기로 연결된다. 보완책:

- **Native SQL**: 복잡한 통계/DB 전용 기능은 그냥 SQL로.
- **[[mybatis]]와 혼용**: 조회가 까다로운 화면은 MyBatis로 빼고 나머지는 JPA — CQRS(쓰기/읽기 분리)로 둘을 공존시킨다.

> 그래서 [[mybatis-to-jpa]]는 "전부 갈아엎기"가 아니다. 단순 CRUD는 JPA로 옮기고, 복잡한
> 조회 쿼리는 MyBatis/Native로 남기는 **점진적 공존**이 현실적이다.

## @Query — Repository에서 JPQL 직접 쓰기

[[spring-data-jpa]]의 파생 메서드 이름으로 표현 안 되는 조건(fetch join 포함)은 `@Query` 어노테이션으로 JPQL을 직접 작성한다.

```java
// fetch join: Holding 조회 시 Stock을 한 번에 같이 가져옴
@Query("select h from Holding h join fetch h.stock where h.account.id = :accountId")
List<Holding> findAllByAccountIdWithStock(@Param("accountId") Long accountId);
```

- `join fetch h.stock`: LAZY인 `stock` 연관을 즉시 로딩. N+1 방지 → [[n-plus-1-problem]]
- `where h.account.id = :accountId`: 엔티티 필드 경로로 작성 (테이블 컬럼 아님)
- `@Param("accountId")`: 메서드 파라미터와 JPQL `:accountId`를 연결

**`@Query`가 있으면 메서드명은 무시된다** — 이름은 사람이 읽기 좋게 붙인 설명용. 실제 쿼리는 `@Query` 내용이 결정. → [[spring-data-jpa]]

## 관련 페이지

- [[jpa]] — JPQL이 봉사하는 표준, "단점과 보완"의 연장
- [[spring-data-jpa]] — 메서드 이름 쿼리로 부족할 때 JPQL로 / @Query 어노테이션
- [[hibernate]] — JPQL을 실제 SQL로 번역하는 구현체
- [[n-plus-1-problem]] — fetch join으로 해결하는 N+1 패턴
- [[mybatis]] — 복잡 쿼리에서 JPA와 공존/혼용
- [[mybatis-to-jpa]] — 점진적 전환에서 JPQL 한계가 갖는 의미
- [[querydsl]] — JPQL의 한계(문자열·동적 쿼리)를 타입 세이프하게 해결한 서드파티
- 출처: [[jpa-lecture]] · [[virtuber-spring-work-2026-06-21]]
