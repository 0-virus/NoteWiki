---
type: concept
tags: [jpa, querydsl, database, query, dynamic-query, spring-data-jpa, type-safety]
updated: 2026-06-02
sources: ["raw/articles/Querydsl Reference Guide.md"]
---

# QueryDSL

## 한 줄 정의

**QueryDSL** = [[jpql]]을 **자바 코드(타입 세이프)**로 조립하는 서드파티 쿼리 빌더.
`@Entity` 클래스에서 `Q{클래스명}` 객체를 자동 생성하고, 그 객체의 필드를 **문자열 대신
자바 코드**로 참조해 쿼리를 만든다.

---

## 왜 QueryDSL이 필요한가

[[jpql]]의 문제점:

```java
// 필드명 "firstName"을 문자열로 쓴다 → 오타가 있어도 컴파일 통과
String jpql = "select c from Customer c where c.firstName = :name";
```

- 오타·필드 삭제를 **컴파일 시점에 잡지 못한다**
- 조건이 동적으로 바뀌면(검색 필터 여러 개) if문으로 쿼리 문자열을 이어붙여야 해서 코드가 지저분해진다

[[jpa]]의 Criteria API가 이를 타입 세이프하게 해결하려 했지만, 코드가 너무 장황하다:

```java
// Criteria API — 타입 세이프하지만 읽기 어렵다
CriteriaBuilder cb = em.getCriteriaBuilder();
CriteriaQuery<Customer> cq = cb.createQuery(Customer.class);
Root<Customer> c = cq.from(Customer.class);
cq.select(c).where(cb.equal(c.get("firstName"), "Bob"));
```

**QueryDSL = Criteria API의 가독성 문제를 해결한 대안**. 실무에서 동적 쿼리의 사실상 표준.

---

## 핵심 구조 — 어떻게 동작하는가

```
@Entity 클래스
    ↓  (컴파일 시 APT 자동 실행)
QCustomer, QOrder … (QType)
    ↓  (JPAQueryFactory에 주입)
타입 세이프 쿼리 빌더
```

### QType이란

`@Entity` 어노테이션이 붙은 클래스를 APT(Annotation Processing Tool)가 읽고
`Q{클래스명}` 클래스를 **자동 생성**한다. `target/generated-sources/java/`에 만들어진다.

```java
// 원본 엔티티
@Entity
public class Customer {
    private String firstName;
    private String lastName;
}

// APT가 자동 생성
// QCustomer.java
public class QCustomer extends EntityPathBase<Customer> {
    public final StringPath firstName = createString("firstName");
    public final StringPath lastName  = createString("lastName");
    // ...
    public static final QCustomer customer = new QCustomer("customer");
}
```

필드를 **문자열이 아닌 `StringPath` 객체**로 가지기 때문에 오타가 있으면 컴파일 에러가 난다.

---

## 설정 (Spring Boot + Gradle)

```groovy
// build.gradle
dependencies {
    implementation 'com.querydsl:querydsl-jpa:5.0.0:jakarta'
    annotationProcessor 'com.querydsl:querydsl-apt:5.0.0:jakarta'
    annotationProcessor 'jakarta.persistence:jakarta.persistence-api'
}
```

> `annotationProcessor`가 APT 역할 — 빌드할 때 QType을 생성한다.

```java
// QueryDSL 설정 Bean (Configuration 클래스에 등록)
@Bean
public JPAQueryFactory jpaQueryFactory(EntityManager em) {
    return new JPAQueryFactory(em);
}
```

---

## 기본 사용법

### QType 가져오기

```java
QCustomer customer = QCustomer.customer;       // 기본 인스턴스 (권장)
QCustomer c2 = new QCustomer("c2");           // 별칭 지정 (셀프 조인 시)
```

### 단건 조회 (fetchOne)

```java
Customer bob = queryFactory
    .selectFrom(customer)
    .where(customer.firstName.eq("Bob"))
    .fetchOne();   // 결과 없으면 null, 2개 이상이면 예외
```

### 목록 조회 (fetch)

```java
List<Customer> list = queryFactory
    .selectFrom(customer)
    .where(customer.age.gt(18))
    .fetch();
```

### 자주 쓰는 조건 메서드

| 메서드 | 의미 | 예 |
|--------|------|----|
| `eq("Bob")` | = | `customer.name.eq("Bob")` |
| `ne("Bob")` | != | `customer.name.ne("Bob")` |
| `lt(18)`, `loe(18)` | <, ≤ | `customer.age.lt(18)` |
| `gt(18)`, `goe(18)` | >, ≥ | `customer.age.gt(18)` |
| `like("%Bob%")` | LIKE | `customer.name.like("%Bob%")` |
| `contains("Bob")` | LIKE %…% 자동 | `customer.name.contains("Bob")` |
| `startsWith("B")` | LIKE B% | `customer.name.startsWith("B")` |
| `in(list)` | IN (...) | `customer.id.in(1, 2, 3)` |
| `isNull()` / `isNotNull()` | IS NULL | `customer.email.isNull()` |
| `between(a, b)` | BETWEEN | `customer.age.between(20, 30)` |

### 복수 조건 조합

```java
// AND — 쉼표 또는 .and()
queryFactory.selectFrom(customer)
    .where(customer.firstName.eq("Bob"),
           customer.lastName.eq("Wilson"))
    .fetch();

// OR
queryFactory.selectFrom(customer)
    .where(customer.firstName.eq("Bob")
           .or(customer.lastName.eq("Wilson")))
    .fetch();
```

---

## 동적 쿼리 — BooleanBuilder

검색 필터처럼 **조건이 있을 수도 없을 수도 있을 때** 쓰는 도구.
`BooleanBuilder`는 조건을 누적하는 가변 객체다 — 처음엔 null, `and`/`or` 호출 때마다 결과가 쌓인다.

```java
public List<Customer> search(String name, Integer minAge) {
    QCustomer customer = QCustomer.customer;
    BooleanBuilder builder = new BooleanBuilder();

    if (name != null) {
        builder.and(customer.firstName.contains(name));
    }
    if (minAge != null) {
        builder.and(customer.age.goe(minAge));
    }

    return queryFactory
        .selectFrom(customer)
        .where(builder)        // 조건이 없으면 builder = null → 전체 조회
        .fetch();
}
```

> `BooleanBuilder` 대신 `where(condition1, condition2)`에 `null`을 전달해도 무시된다.
> 메서드로 조건을 분리하는 패턴이 가독성이 좋다:
>
> ```java
> .where(nameContains(name), ageGoe(minAge))
>
> private BooleanExpression nameContains(String name) {
>     return name != null ? customer.firstName.contains(name) : null;
> }
> ```

---

## 정렬 / 페이징 / 그룹바이

```java
// 정렬
queryFactory.selectFrom(customer)
    .orderBy(customer.lastName.asc(), customer.firstName.desc())
    .fetch();

// 페이징
queryFactory.selectFrom(customer)
    .offset(0)     // 시작 위치 (0-based)
    .limit(10)     // 최대 개수
    .fetch();

// 그룹바이
queryFactory.select(customer.lastName)
    .from(customer)
    .groupBy(customer.lastName)
    .fetch();
```

---

## 조인

```java
QOrder order = QOrder.order;
QCustomer customer = QCustomer.customer;

// Inner Join
queryFactory.selectFrom(order)
    .innerJoin(order.customer, customer)
    .fetch();

// Left Join + ON 조건
queryFactory.selectFrom(order)
    .leftJoin(order.customer, customer)
    .on(customer.age.gt(18))
    .fetch();
```

---

## Projections — DTO로 바로 받기

엔티티 전체가 아닌 일부 필드만 DTO에 담아 반환할 때.

### 방법 1: Projections.constructor (가장 흔한 방식)

```java
List<CustomerDTO> result = queryFactory
    .select(Projections.constructor(CustomerDTO.class,
            customer.firstName, customer.lastName))
    .from(customer)
    .fetch();
// CustomerDTO에 (String firstName, String lastName) 생성자가 있어야 함
```

### 방법 2: Projections.bean (setter 방식)

```java
List<CustomerDTO> result = queryFactory
    .select(Projections.bean(CustomerDTO.class,
            customer.firstName, customer.lastName))
    .from(customer)
    .fetch();
// CustomerDTO에 setter가 있어야 함
```

### 방법 3: @QueryProjection (가장 타입 세이프)

```java
// DTO에 어노테이션 추가 — APT가 QCustomerDTO를 생성
class CustomerDTO {
    @QueryProjection
    public CustomerDTO(String firstName, String lastName) { ... }
}

// 쿼리에서 사용
List<CustomerDTO> result = queryFactory
    .select(new QCustomerDTO(customer.firstName, customer.lastName))
    .from(customer)
    .fetch();
```

> 단점: DTO가 QueryDSL에 의존하게 된다. 레이어 경계를 엄격히 지킨다면 `Projections.constructor`가 낫다.

---

## 서브쿼리

```java
QDepartment dept = QDepartment.department;
QDepartment d = new QDepartment("d");  // 별칭

queryFactory.selectFrom(dept)
    .where(dept.size.eq(
        JPAExpressions.select(d.size.max()).from(d)
    ))
    .fetch();
```

---

## 수정 / 삭제 (Bulk)

> 주의: JPA 레벨 cascade 규칙, 2차 캐시와 상호작용하지 않는다.
> 벌크 연산 후에는 영속성 컨텍스트를 직접 `flush` + `clear`해야 한다.

```java
// 수정
queryFactory.update(customer)
    .where(customer.name.eq("Bob"))
    .set(customer.name, "Bobby")
    .execute();

// 삭제
queryFactory.delete(customer)
    .where(customer.level.lt(3))
    .execute();
```

---

## Spring Data JPA 통합

### 방법 1: 커스텀 리포지토리 (권장)

```java
// 커스텀 인터페이스 + 구현체
public interface CustomerRepositoryCustom {
    List<Customer> search(String name, Integer minAge);
}

public class CustomerRepositoryImpl implements CustomerRepositoryCustom {
    private final JPAQueryFactory queryFactory;
    // ... BooleanBuilder 패턴 그대로 사용
}

// JpaRepository와 합치기
public interface CustomerRepository
    extends JpaRepository<Customer, Long>, CustomerRepositoryCustom { }
```

### 방법 2: QuerydslPredicateExecutor

```java
public interface CustomerRepository
    extends JpaRepository<Customer, Long>,
            QuerydslPredicateExecutor<Customer> { }

// 사용 — Predicate를 그대로 넘긴다
Predicate predicate = customer.firstName.eq("Bob");
repository.findAll(predicate);
```

> 간단한 조건엔 편리하지만, 복잡한 동적 쿼리는 커스텀 리포지토리가 더 유연하다.

---

## JPQL vs Criteria API vs QueryDSL 비교

| 항목 | JPQL | Criteria API | QueryDSL |
|------|------|-------------|---------|
| 타입 안전 | ❌ (문자열) | ✅ | ✅ |
| 가독성 | ✅ | ❌ 장황 | ✅ |
| 동적 쿼리 | 어려움 | 가능 | ✅ BooleanBuilder |
| 서드파티 의존 | 없음 | 없음 | 있음 |
| 실무 채택 | 중간 | 드묾 | 높음 |

---

## 영균 학습 트리에서의 위치

```
JDBC (raw SQL)
  → MyBatis (SQL + Java 반쪽 자동화)
    → JPA + JPQL (객체 중심, 벤더 독립)
      → Spring Data JPA (메서드 이름 쿼리)
        → QueryDSL (복잡/동적 쿼리의 타입 세이프 해법)  ← 지금 여기
```

단순 CRUD는 [[spring-data-jpa]] 메서드 이름 쿼리 → 조건이 복잡해지면 [[jpql]] → 동적이거나 타입 안전이 필요하면 **QueryDSL**.

---

## 관련 페이지

- [[jpql]] — QueryDSL이 대체·보완하는 쿼리 레이어
- [[jpa]] — QueryDSL이 올라타는 ORM 표준
- [[spring-data-jpa]] — `JpaRepository` + QueryDSL 통합 포인트
- [[persistence-context]] — 벌크 연산 후 `clear()` 필요한 이유
- [[jpa-association]] — 조인 쿼리에서 연관 관계가 쓰이는 방식
- 출처: [[querydsl-reference-guide]]
