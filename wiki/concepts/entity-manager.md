---
type: concept
tags: [jpa, hibernate, persistence, entity-manager, spring]
updated: 2026-05-27
sources: ["raw/lectures/JPA.md"]
---

# EntityManager / EntityManagerFactory

## 한 줄 정의

**EntityManager** = 엔티티의 저장·조회·수정·삭제 등 **엔티티에 관한 모든 일을 처리하는
관리자**. **EntityManagerFactory** = 그 EntityManager를 찍어내는 공장.

```
EntityManagerFactory  →(생성)→  EntityManager(s)  →(관리)→  Entity(s)
   앱당 하나, 공유            작업(요청)마다 하나        매핑된 객체들
```

## 왜 둘로 나뉘나 — 비용의 차이

- **EntityManagerFactory**는 만드는 비용이 크다(매핑 메타데이터 분석, 커넥션 풀 연계 등).
  그래서 **애플리케이션 전체에서 하나만** 만들어 공유한다.
- **EntityManager**는 가볍고 **상태를 가진다**(아래 영속성 컨텍스트). 그래서 요청/트랜잭션
  단위로 짧게 만들고 버린다.

[[connection-pool]]의 발상과 같다: 비싼 자원(Factory)은 하나 두고 공유, 싸고 단명하는
작업 단위(Manager)는 그때그때 빌려 쓴다.

## 핵심 메서드

```java
public interface EntityManager {
    <T> T find(Class<T> entityClass, Object primaryKey); // 조회 (PK로)
    void persist(Object entity);                         // 저장 (INSERT)
    <T> T merge(T entity);                               // 병합 (수정/UPSERT)
    void remove(Object entity);                          // 삭제 (DELETE)
    // ...
}
```

```java
ItemEntity e = new ItemEntity();
e.setItemName("peach");  e.setPrice(135L);
entityManager.persist(e);                                  // INSERT

ItemEntity found = entityManager.find(ItemEntity.class, e.getItemId());
found.setPrice(235L);
entityManager.merge(found);                                // UPDATE
```

## "왜" — [[persistence-context|영속성 컨텍스트]]

EntityManager가 단순한 SQL 실행기가 아닌 이유. EntityManager는 자기가 관리하는 엔티티를
[[persistence-context|영속성 컨텍스트]]라는 작업대(1차 캐시)에 담아두고, 변경 감지·1차
캐시·쓰기 지연·지연 로딩을 가능하게 한다. 그래서 `find`로 가져온 엔티티의 필드만 바꿔도
(`merge` 없이) 커밋 시점에 UPDATE가 나간다 — [[mybatis]]에서 `UPDATE` SQL을 직접 호출하던
것과 가장 다른 지점이다.

> EntityManager가 가벼워서 요청/트랜잭션마다 새로 만든다고 한 이유가 이것 — **이 작업대를
> 들고 있기 때문**이다. 작업대의 수명·상태(영속/준영속)·flush·5대 기능의 상세는 별도 페이지
> [[persistence-context]]로 분리했다.

## Spring에서의 빈 설정

JPA를 Spring에 붙이려면 Factory와 트랜잭션 관리자를 빈으로 등록한다.

```java
@Bean
LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource dataSource) {
    var emf = new LocalContainerEntityManagerFactoryBean();
    emf.setDataSource(dataSource);                       // [[connection-pool]]에서 받은 DataSource
    emf.setPackagesToScan("com.nhnent.forward...entity"); // @Entity 스캔 범위
    emf.setJpaVendorAdapter(jpaVendorAdapters());        // Hibernate 어댑터
    emf.setJpaProperties(jpaProperties());
    return emf;
}
```

- `LocalContainerEntityManagerFactoryBean` ↔ [[mybatis]]의 `SqlSessionFactoryBean`에 대응.
- `JpaTransactionManager` ↔ [[mybatis]]/[[jdbc]]의 `DataSourceTransactionManager`에 대응 → [[transaction]].

> [[spring-data-jpa]]를 쓰면 이 빈 설정 대부분을 Spring Boot 자동 설정이 대신 해준다.
> 강의의 수동 설정은 "안에서 무슨 일이 일어나는지"를 보여주기 위한 것.

## 관련 페이지

- [[persistence-context]] — EntityManager가 들고 있는 작업대, 변경 감지의 정체
- [[jpa]] — EntityManager가 속한 표준
- [[hibernate]] — EntityManager의 실제 구현
- [[spring-data-jpa]] — Repository가 내부에서 EntityManager에 위임
- [[transaction]] — `JpaTransactionManager`, 변경 감지가 커밋 시점에 동작하는 이유
- [[connection-pool]] — Factory가 받아 쓰는 DataSource
- [[mybatis]] — `SqlSession`(작업 단위)·`SqlSessionFactory`(공장)와 1:1 대응
- 출처: [[jpa-lecture]]
