---
type: concept
tags: [jpa, hibernate, entity, mapping, annotation, database]
updated: 2026-05-27
sources: ["raw/lectures/JPA.md"]
---

# JPA Entity 매핑

## 한 줄 정의

**자바 클래스를 DB 테이블에, 필드를 칼럼에 매핑하는 어노테이션 규칙.**
"이 클래스는 이 테이블이고, 이 필드는 이 칼럼이며, PK는 이것이다"를 어노테이션으로 선언한다.

## 왜 어노테이션인가

[[mybatis]]에선 매핑이 **XML(`resultType`·`<resultMap>`)이나 명명 규칙**에 흩어졌다.
JPA는 매핑 정보를 **클래스 바로 위 어노테이션**에 둔다 — 객체와 매핑이 한곳에 있어,
"필드 하나 추가 = 어노테이션 한 줄"로 끝난다. [[jpa]]가 말한 유지보수성의 실체.

## 클래스·키 매핑 어노테이션

```java
@Entity                                              // JPA가 관리할 객체임을 명시
@Table(name = "Items")                               // 매핑할 테이블 이름
public class ItemEntity {
    @Id                                              // 기본 키(PK)
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // PK 생성 전략
    @Column(name = "item_id")                        // 필드 ↔ 칼럼
    private Long itemId;

    @Column(name = "item_name")
    private String itemName;

    private Long price;                              // 어노테이션 생략 시 필드명=칼럼명
}
```

| 어노테이션 | 역할 |
| --- | --- |
| `@Entity` | JPA 관리 대상 객체 선언 (없으면 매핑 안 됨) |
| `@Table(name=…)` | 매핑할 테이블 이름. 생략 시 클래스명 |
| `@Id` | 기본 키 필드 지정 |
| `@GeneratedValue` | PK 값을 어떻게 만들지(전략) |
| `@Column(name=…)` | 필드 ↔ 칼럼 매핑. 생략 시 필드명 |

## 필드 타입 선택 — 기본형 vs 래퍼 클래스

JPA 엔티티 필드에는 **기본형(`int`, `long`, `boolean`) 대신 래퍼 클래스(`Integer`, `Long`, `Boolean`)를 써야 한다.**

```java
// 잘못된 예
@Column(nullable = true)
private int price;    // null 불가 → nullable 설정이 의미 없음

// 올바른 예
@Column(nullable = true)
private Integer price;  // null 가능
```

**왜**: 기본형은 Java 언어 레벨에서 null이 불가능하다. JPA가 DB에서 null을 읽어오면 기본형 필드에 담지 못해 `NullPointerException`이 발생한다. 래퍼 클래스는 null을 담을 수 있으므로 DB의 nullable 컬럼과 정확히 대응된다.

| 기본형 | 래퍼 클래스 | null 가능 여부 |
|---|---|---|
| `int` | `Integer` | ✅ |
| `long` | `Long` | ✅ |
| `boolean` | `Boolean` | ✅ |
| `double` | `Double` | ✅ |

> PK 필드(`@Id`)도 `Long`으로 선언한다. `long`이면 JPA가 새 엔티티인지 판단할 때(`isNew()`)
> null 체크가 불가능해 문제가 생긴다.

## 필드 타입 매핑

```java
@Temporal(TemporalType.TIMESTAMP)  // 날짜: DATE / TIME / TIMESTAMP 중 선택
@Column(name = "order_date")
private Date orderDate;

@Transient                          // 이 필드는 칼럼에 매핑하지 않음 (DB에 저장 안 함)
private int calculatedOnly;
```

- `@Temporal` — `java.util.Date`를 어느 날짜 타입으로 저장할지.
- `@Transient` — 계산용 임시 필드처럼 **DB에 두고 싶지 않은** 필드 제외.

## 기본 키 생성 전략 — `@GeneratedValue`

```java
public enum GenerationType { TABLE, SEQUENCE, IDENTITY, AUTO }
```

| 전략 | 누가 PK를 만드나 | 대표 DB |
| --- | --- | --- |
| **IDENTITY** | DB에 위임 (auto_increment) | MySQL |
| **SEQUENCE** | DB의 시퀀스 객체 사용 | Oracle |
| **TABLE** | 채번(採番) 전용 테이블 사용 | (DB 무관, 느림) |
| **AUTO** | **방언(dialect)을 보고 JPA가 자동 선택** | 기본값 |

> **왜 전략이 여러 개인가**: PK 생성 방식이 DB마다 다르기 때문(MySQL의 auto_increment vs
> Oracle의 sequence). `AUTO`가 이 차이를 흡수하는 게 [[jpa]]가 말한 **벤더 독립성**의 구체적 예다.
> 직접 식별자를 넣고 싶으면 `@GeneratedValue` 없이 **직접 할당**도 가능.

## 복합 키 — `@EmbeddedId` / `@Embeddable`

PK가 칼럼 하나가 아니라 여러 칼럼의 조합일 때(예: OrderItems의 `order_id + line_number`).

```java
@Entity @Table(name = "OrderItems")
public class OrderItemEntity {
    @EmbeddedId                       // 복합 키를 식별자로 지정
    private Pk pk;
    // ...

    @NoArgsConstructor @AllArgsConstructor
    @EqualsAndHashCode                // 식별자 비교용 — 반드시 필요
    @Embeddable                       // 복합 키 클래스임을 표시
    public static class Pk implements Serializable {   // 직렬화 필수
        @Column(name = "order_id")    private Long orderId;
        @Column(name = "line_number") private Integer lineNumber;
    }
}
```

- `@EmbeddedId` — 엔티티 쪽 식별자 필드에.
- `@Embeddable` — 복합 키를 담는 클래스에.
- **`@EqualsAndHashCode`가 필수인 이유**: JPA는 PK로 엔티티 동일성을 판단한다. 복합 키
  객체끼리 값 비교가 되려면 `equals`/`hashCode`를 함께 정의해야 한다 → [[equals-hashcode]].
  복합 키 객체는 직렬화 가능해야 하므로 `Serializable` 구현도 요구된다.

## 관련 페이지

- [[jpa]] — 이 매핑 규칙을 정의한 표준
- [[jpa-association]] — 테이블 간 관계(FK) 매핑은 별도 페이지로
- [[jpa-auditing]] — @MappedSuperclass 기반 BaseEntity, createdAt/updatedAt 자동화
- [[entity-manager]] — 매핑된 Entity를 실제로 다루는 관리자
- [[equals-hashcode]] — 복합 키 클래스가 `equals`/`hashCode`를 오버라이드해야 하는 이유
- [[dto-vs-entity]] — `@Entity`(도메인 본체) vs DTO(운반체)의 분리
- 출처: [[jpa-lecture]] · [[zeroverse-spring-practice]]
