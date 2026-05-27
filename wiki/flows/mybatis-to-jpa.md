---
type: flow
tags: [jpa, mybatis, orm, persistence, migration, spring]
updated: 2026-05-27
sources: ["raw/lectures/JPA.md", "raw/notes/study-notes.md"]
---

# 흐름: MyBatis → JPA

> 영균이 [[mybatis]] 실습을 끝내고 [[jpa]]로 넘어가는 단계의 지도.
> 강의 제목 그대로 "MyBatis to JPA" — **무엇이 어디로 옮겨가는가**를 추적한다.

## 한 줄 요약

**SQL 통제권을 개발자가 쥔 채 매핑만 자동화**한 게 [[mybatis]](SQL Mapper)라면,
**SQL 작성까지 프레임워크에 넘긴** 게 [[jpa]](ORM)다. 전환은 "통제권을 한 칸 더
넘기고, 코드를 더 줄이는" 이동이다.

## 큰 그림 — 추상화 사다리

```
손 JDBC          : Connection·PreparedStatement·ResultSet·자원해제 전부 수동   ([[jdbc]])
   │ 반복 코드 제거
MyBatis          : SQL은 직접, 매핑·자원관리는 자동                            ([[mybatis]])
   │ SQL 작성까지 위임
JPA              : 객체만 다루면 SQL은 JPA가 생성 (ORM)                        ([[jpa]])
   │ 구현(Repository)까지 위임
Spring Data JPA  : 인터페이스 선언만, 구현·페이징·메서드 쿼리 자동            ([[spring-data-jpa]])
```

영균은 [[jdbc]] → [[mybatis]]까지 손으로 겪었다. 이 흐름은 그 위 두 칸이다.

## 1:1 대응표 — "이게 저걸로 바뀐다"

| 관심사 | MyBatis | JPA / Spring Data JPA |
| --- | --- | --- |
| SQL 작성 | 개발자가 XML/`@Select`에 직접 | JPA가 자동 생성 (CRUD), 복잡 쿼리만 [[jpql]] |
| 객체↔테이블 매핑 | `resultType`/`map-underscore-to-camel-case` | `@Entity`·`@Column` 어노테이션 → [[jpa-entity-mapping]] |
| 관계(FK) | JOIN을 직접 SQL로 | `@OneToMany`/`@ManyToOne` 객체 참조 → [[jpa-association]] |
| 작업 단위 | `SqlSession` | `EntityManager` → [[entity-manager]] |
| 공장 빈 | `SqlSessionFactoryBean` | `LocalContainerEntityManagerFactoryBean` |
| 트랜잭션 빈 | `DataSourceTransactionManager` | `JpaTransactionManager` → [[transaction]] |
| 데이터 접근 계층 | `@Mapper` 인터페이스 + XML | `JpaRepository` 상속 인터페이스 → [[spring-data-jpa]] |
| 수정(UPDATE) | `UPDATE` SQL 직접 호출 | 조회한 엔티티 필드 변경 → 변경 감지로 자동 |
| `DataSource` | 공유 (내부 [[hikaricp]]) | **동일하게 공유** — 이 층은 안 바뀜 |

> 가장 사고방식이 바뀌는 칸은 **수정**이다. MyBatis는 "UPDATE 문을 호출"하지만, JPA는
> "조회한 객체의 값을 바꾸면 커밋 때 알아서 UPDATE"한다([[entity-manager]]의 변경 감지).

## 전환 절차 (강의 요약)

1. **의존성 추가** — `spring-data-jpa`, `hibernate-entitymanager`. (구현체는 [[hibernate]])
2. **빈 설정** — `EntityManagerFactoryBean` + `JpaTransactionManager` 등록.
   ([[spring-data-jpa]]+Spring Boot면 자동 설정이 대부분 대신함)
3. **Entity 설정** — 테이블을 `@Entity` 클래스로. `@Id`·`@GeneratedValue`·`@Column`·`@Temporal`·`@EmbeddedId` → [[jpa-entity-mapping]]
4. **연관 관계 설정** — `@JoinColumn`·`@OneToMany`·`@ManyToOne`·`mappedBy`·`FetchType.LAZY` → [[jpa-association]]
5. **Repository 생성** — `JpaRepository<Entity, ID>` 상속 인터페이스. (MyBatis의 `@Mapper`+XML 자리)
6. **애플리케이션 사용** — Service에서 `@Transactional` + Repository 호출, `Pageable`로 페이징.

## ⚠️ 전환은 "전부 갈아엎기"가 아니다

JPA의 단점(JPQL 한계)을 [[jpql]]에서 봤듯, 복잡한 조회까지 JPA로 억지로 옮길 필요는 없다.

- 단순 CRUD·연관 저장 → JPA로 이동 (생산성↑)
- 복잡한 통계·튜닝 쿼리 → MyBatis/Native SQL로 잔류
- 둘을 **CQRS(쓰기는 JPA / 읽기는 MyBatis)로 공존**시키는 게 현실적 실무 패턴

→ 그래서 [[mybatis]]를 배운 게 낭비가 아니다. JPA 시대에도 복잡 쿼리의 안전판으로 남는다.

## 새로 짊어지는 부담

통제권을 넘긴 대가로 **새로 알아야 할 것**이 생긴다 — 공짜 추상화는 없다.

- **영속성 컨텍스트/변경 감지** — UPDATE가 "안 보이게" 일어난다 → [[entity-manager]]
- **연관 관계 주인** — 양방향에서 `mappedBy`를 헷갈리면 데이터가 안 들어간다 → [[jpa-association]]
- **[[n-plus-1-problem]]** — LAZY 페치가 부르는 숨은 쿼리 폭증. MyBatis보다 잡기 어렵다.

## 관련 페이지

- [[mybatis]] · [[jpa]] — 전환의 두 끝점
- [[jdbc]] — 사다리의 맨 아래(영균이 손으로 겪은 출발점)
- [[spring-data-jpa]] — 전환의 종착 추상화
- [[jpa-entity-mapping]] · [[jpa-association]] · [[entity-manager]] · [[jpql]] — 각 절차의 상세
- [[orm]] — MyBatis(SQL Mapper)와 JPA(ORM)의 카테고리 차이
- [[n-plus-1-problem]] · [[transaction]] — 전환 시 주의 지점
- 출처: [[jpa-lecture]] · [[mybatis-practice-debugging]]
