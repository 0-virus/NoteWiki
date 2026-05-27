---
type: concept
tags: [jpa, orm, java, spring, persistence, database]
updated: 2026-05-27
sources: ["raw/lectures/JPA.md"]
---

# JPA (Java Persistence API)

## 한 줄 정의

**자바 진영의 ORM 기술 표준 명세.** 객체와 관계형 DB 사이의 매핑을 어떻게 할지를
정의한 **인터페이스 규약**이지, 그 자체가 동작하는 라이브러리는 아니다.
실제로 돌아가는 건 구현체 [[hibernate]]다.

> [[orm]]이 "객체↔테이블 자동 매핑"이라는 **개념**이라면, JPA는 그 개념을 자바에서
> **표준화한 명세**(JSR 338), [[hibernate]]는 그 명세의 **구현체**다. 세 단어가 자주
> 뒤섞이지만 층위가 다르다.

## 왜 쓰는가 — 4가지 동기

강의가 꼽는 JPA 채택 이유. 모두 [[mybatis]]·[[jdbc]]에서 영균이 직접 겪은 불편과 짝이 된다.

1. **생산성** — 지루하고 반복적인 CRUD SQL을 직접 짜지 않는다. [[jdbc]]에서 손으로
   짜던 `insert into … / update … set …`을 JPA가 자동 생성한다.
2. **유지보수** — 칼럼 추가/삭제 시 관련 SQL을 전부 고치는 대신 **Entity 클래스 필드
   하나만** 고친다. ([[mybatis]]는 `<sql>` 조각으로 일부 완화했지만, JPA는 SQL 자체를 안 짠다.)
3. **벤더 독립성** — DB 벤더마다 다른 타입·SQL 방언을 JPA가 흡수한다. Oracle → MySQL
   교체 시 코드 수정 최소화. (기본 키 전략 `AUTO`가 방언을 보고 알아서 고르는 게 대표 예 → [[jpa-entity-mapping]])
4. **객체 중심 개발** — SQL 중심에서 벗어나 **패러다임 불일치**를 해소한다(아래).

## 핵심 "왜" — 패러다임 불일치(impedance mismatch)

JPA가 존재하는 진짜 이유. **객체 모델과 관계형 모델은 사고방식이 다르다.**

| 객체 세계                   | 관계형 세계          | 불일치                     |
| ----------------------- | --------------- | ----------------------- |
| 상속 (`extends`)          | 테이블엔 상속 없음      | 상속 구조를 테이블로 어떻게?        |
| 참조 (`order.getItems()`) | 외래 키(FK) + JOIN | 참조 ↔ FK 변환              |
| 객체 그래프 탐색               | JOIN을 미리 짜야 함   | "어디까지 따라갈지"를 SQL이 미리 결정 |

[[mybatis]]/[[jdbc]]는 이 간극을 **개발자가 손으로** 메운다(결과 행을 객체에 꽂고, JOIN을
직접 쓴다). JPA는 그 변환을 **프레임워크가** 맡아 — 자바 코드에선 `order.getOrderItems()`
처럼 **객체 참조로** 연관 데이터를 탐색하고, JPA가 뒤에서 필요한 SQL을 만든다. → [[jpa-association]]

## 구성 — 명세가 정의하는 부품

```
EntityManagerFactory  →(생성)→  EntityManager  →(관리)→  Entity
   (앱당 하나, 공유)              (작업 단위)         (테이블과 매핑된 객체)
```

- [[entity-manager]] — 엔티티의 저장(`persist`)·조회(`find`)·수정(`merge`)·삭제(`remove`) 등 모든 일을 처리하는 관리자.
- [[persistence-context]] — EntityManager가 들고 있는 "작업대". 변경 감지·1차 캐시 등 JPA의 객체 중심성을 떠받치는 핵심.
- [[jpa-entity-mapping]] — `@Entity`·`@Id`·`@Column` 등으로 클래스를 테이블에 매핑.
- [[jpa-association]] — 테이블 간 관계(FK)를 객체 참조로 모델링.
- [[jpql]] — 복잡한 쿼리를 객체 지향 쿼리로.

## 단점 (그리고 반론)

| 단점 | 보완책 |
| --- | --- |
| 학습 곡선이 높다 ([[persistence-context|영속성 컨텍스트]]·지연 로딩 등) | [[spring-data-jpa]]·QueryDSL이 진입 장벽을 낮춤 |
| JPQL에는 한계가 있다 | Native SQL 사용 가능, [[mybatis]]와 혼용·CQRS 분리 가능 |

> 이 "혼용 가능"이 중요하다. JPA를 쓴다고 [[mybatis]]를 버려야 하는 게 아니라,
> 복잡한 조회는 MyBatis/Native SQL로 빼는 식의 **공존**이 실무 관습이다.

## 영균 학습 트리에서

- **[[mybatis]] 다음 단계.** SQL Mapper(통제권은 개발자)에서 ORM(통제권은 프레임워크)으로
  한 칸 올라가는 지점. 두 기술의 전환을 [[mybatis-to-jpa]] 흐름에서 추적한다.
- **곧 프로젝트에 적용 예정** — 그래서 단순 개념이 아니라 빈 설정·Entity·Repository까지
  실제 코드 단위로 정리해 둔다.
- [[prisma]]가 JS/TS 진영의 ORM이듯, JPA는 **자바 진영의 ORM 표준**. 언어는 달라도
  "객체↔테이블 매핑 + 마이그레이션 + 관계 자동 처리"라는 [[orm]]의 가치는 같다.

## 관련 페이지

- [[orm]] — JPA가 표준화한 상위 개념
- [[hibernate]] — JPA의 사실상 표준 구현체
- [[spring-data-jpa]] — JPA 위에 Repository 추상화를 한 겹 더 얹은 Spring 프로젝트
- [[entity-manager]] · [[jpa-entity-mapping]] · [[jpa-association]] · [[jpql]] — JPA의 4대 구성 요소
- [[mybatis]] — JPA로 넘어오기 전 단계 (SQL Mapper)
- [[transaction]] — `JpaTransactionManager`로 트랜잭션 관리
- [[mybatis-to-jpa]] — MyBatis에서 JPA로의 전환 흐름
- 출처: [[jpa-lecture]]
