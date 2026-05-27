---
type: concept
tags: [spring-data-jpa, jpa, spring, repository, persistence]
updated: 2026-05-27
sources: ["raw/lectures/JPA.md"]
---

# Spring Data JPA

## 한 줄 정의

**[[jpa]] 위에 한 겹 더 얹은 Spring의 추상화** — `JpaRepository`를 상속한 **인터페이스
선언만으로** CRUD·페이징·정렬 구현을 자동으로 만들어준다. 구현 클래스는 영균이 안 짠다.

## Spring Data — 더 큰 우산

Spring Data JPA는 **Spring Data** 프로젝트의 한 갈래다.

```
Spring Data  (다양한 저장소 접근을 통일된 Repository로 추상화)
├── Spring Data JPA        ← JPA/관계형 DB    ← 이 페이지
├── Spring Data JDBC
├── Spring Data Redis
├── Spring Data MongoDB
└── Spring Data Elasticsearch …
```

저장소가 무엇이든 **"Repository 인터페이스를 선언하면 구현이 생긴다"**는 같은 경험을
제공하는 게 Spring Data의 목표다.

## 왜 쓰는가 — [[dao-pattern]]의 종착점

[[jdbc]]로 [[dao-pattern]]을 손으로 짤 때: `findAll()` 안에서 Connection 열고,
`ResultSet`을 `while`로 돌려 객체에 꽂고, 자원을 닫는다. [[mybatis]]는 SQL은 직접 짜되
이 반복을 없앴다. **Spring Data JPA는 SQL도, 구현도 안 짠다** — 인터페이스만 선언한다.

```java
public interface ItemRepository extends JpaRepository<ItemEntity, Long> {
}
```

이 한 줄로 `save`·`findById`·`findAll`·`count`·`deleteById` … 가 전부 생긴다.
**구현체는 Spring이 런타임에 동적 프록시로 끼워준다** — [[mybatis]]가 `@Mapper`
인터페이스에 구현을 끼워주던 것과 똑같은 원리. 자동화의 정도만 한 단계 더 높다.

## JpaRepository 계층 구조

제공 메서드는 상속 계층을 따라 쌓인다.

```
Repository<T,ID>                      (마커)
 └ CrudRepository<T,ID>               save / findById / findAll / count / deleteById …
    └ PagingAndSortingRepository<T,ID>  findAll(Sort) / findAll(Pageable)
       └ JpaRepository<T,ID>           findAll():List / flush / saveAndFlush / deleteAllInBatch …
```

- `CrudRepository`: 기본 CRUD.
- `PagingAndSortingRepository`: 페이징·정렬.
- `JpaRepository`: JPA 전용 편의(반환 타입을 `List`로, 배치 삭제, flush 등).

## 메서드 이름으로 쿼리 생성 — 핵심 마법

**메서드 이름을 규칙대로 지으면 Spring이 쿼리를 만들어준다.** SQL도 JPQL도 안 쓴다.

```java
public interface ItemRepository extends JpaRepository<ItemEntity, Long> {
    // SELECT * FROM Items WHERE item_name LIKE '%?%'
    ItemEntity findByItemNameLike(String itemName);

    // SELECT ... WHERE item_name = ? AND price = ? LIMIT 1
    boolean existsByItemNameAndPrice(String itemName, Long price);

    // SELECT count(*) FROM Items WHERE item_name LIKE '%?%'
    int countByItemNameLike(String itemName);

    // DELETE FROM Items WHERE price BETWEEN ? AND ?
    void deleteByPriceBetween(long price1, long price2);
}
```

`findBy`·`existsBy`·`countBy`·`deleteBy` + 필드명 + 조건 키워드(`Like`·`Between`·`And` …)를
조합한다. 이름이 곧 쿼리라 **선언과 의도가 일치**한다 — 복잡한 쿼리는 이름이 비대해지므로
그때는 [[jpql]]이나 QueryDSL로 넘어간다.

## Web Support — Pageable

페이징을 컨트롤러 파라미터로 바로 받는다.

```java
@GetMapping("")                                   // GET /items?page=0&size=30
public List<Item> getItems(Pageable pageable) {   // page·size를 Spring이 Pageable로 변환
    return itemService.getItems(pageable);
}

// 서비스
Page<ItemEntity> page = itemRepository.findAll(pageable);
```

`Pageable`은 페이징 정보(페이지 번호·크기·정렬)를 추상화한 인터페이스. 쿼리 파라미터
`page`·`size`가 자동으로 주입된다.

## 영균 학습 트리에서

- [[dao-pattern]] 페이지에서 예고한 그 "DAO를 인터페이스 선언만으로 자동 구현"의 정체.
- [[mybatis]]가 **SQL은 짜되 구현은 자동**이었다면, Spring Data JPA는 **SQL도 구현도 자동**.
  통제권을 더 넘기는 대신 코드가 더 준다 — [[mybatis-to-jpa]]에서 비교.
- 프로젝트 적용 시 영균이 실제로 손대는 건 대부분 이 인터페이스 한 겹이다.

## 관련 페이지

- [[jpa]] — Spring Data JPA가 올라타는 표준
- [[hibernate]] — 그 아래에서 실제 SQL을 만드는 구현체
- [[dao-pattern]] — Repository가 자동화한 패턴
- [[mybatis]] — 자동화 한 단계 전(SQL Mapper)
- [[jpql]] — 메서드 이름으로 부족할 때의 다음 카드
- [[entity-manager]] — Repository 내부가 위임하는 실제 영속성 관리자
- 출처: [[jpa-lecture]]
