---
type: source
tags: [jpa, hibernate, orm, spring-data-jpa, lecture]
updated: 2026-05-27
sources: ["raw/lectures/JPA.md"]
---

# 소스: JPA 강의 노트 (MyBatis to JPA)

- **원본**: `raw/lectures/JPA.md`
- **종류**: 부트캠프 강의 자료 (NHN Forward 계열 — 패키지명 `com.nhnent.forward.mybatistojpa`)
- **주제**: JPA를 왜·어떻게 쓰는가 + MyBatis에서 JPA로의 전환

## 맥락 (영균)

- **저장 동기**: 곧 진행할 Spring 프로젝트에 JPA를 **실제로 적용**하기 위한 레퍼런스.
- **현재 위치**: [[mybatis]] 실습을 끝내고 **JPA로 넘어가는 단계** — 강의 자체가 "MyBatis → JPA" 전환 시나리오다.
- **원하는 결과물**: ① MyBatis→JPA **비교 흐름**([[mybatis-to-jpa]]), ② JPA 개념 트리 확장.

## 핵심 주장 (Key Claims)

1. JPA는 **반복적인 CRUD SQL 작성을 없애** 생산성을 올리고, 칼럼 변경 시 Entity 클래스만 고치면 되게 해 유지보수성을 높인다.
2. JPA의 본질은 **객체-관계 패러다임 불일치 해결** — 상속·연관관계·객체 그래프 탐색을 SQL 중심이 아닌 객체 중심으로 다룬다.
3. JPA는 **표준 명세(JSR 338)**, Hibernate는 **사실상의 표준 구현체**다. 둘을 구분해야 한다.
4. Spring Data JPA는 **Repository 인터페이스 선언만으로** 구현 없이 CRUD/페이징/메서드 이름 쿼리를 제공한다.
5. JPA의 단점(학습 곡선·JPQL 한계)은 Spring Data JPA·QueryDSL·Native SQL·CQRS로 보완 가능하다.

## 다루는 개념 (Concepts)

- ORM 표준으로서의 [[jpa]], 구현체 [[hibernate]], 추상화 계층 [[spring-data-jpa]]
- [[entity-manager]] / EntityManagerFactory — 엔티티 생명주기 관리자
- [[jpa-entity-mapping]] — `@Entity`·`@Table`·`@Id`·`@GeneratedValue`·`@Column`·`@Temporal`·`@EmbeddedId`, 기본 키 생성 전략
- [[jpa-association]] — `@OneToMany`/`@ManyToOne`, `mappedBy`/연관관계 주인, `FetchType`, `CascadeType`
- [[jpql]] — JPQL·Criteria API·QueryDSL, 메서드 이름 쿼리
- 빈 설정: `EntityManagerFactoryBean`, `JpaTransactionManager` → [[transaction]]

## 언급된 엔티티 (사람·도구·조직)

- **도구/명세**: JPA(JSR 338), Hibernate, EclipseLink, DataNucleus, Spring Data, Spring Data JPA, QueryDSL, jOOQ
- **예제 도메인**: Order / Item / OrderItem (주문-상품 다대다 + 복합 키)

## 위키 반영 결과

- 신설 개념: [[jpa]] · [[hibernate]] · [[spring-data-jpa]] · [[entity-manager]] · [[jpa-entity-mapping]] · [[jpa-association]] · [[jpql]]
- 신설 흐름: [[mybatis-to-jpa]]
- 갱신: [[orm]] · [[mybatis]] · [[n-plus-1-problem]] · [[transaction]] · [[dao-pattern]] · [[spring-framework]]
