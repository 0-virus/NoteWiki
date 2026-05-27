---
type: concept
tags: [jpa, hibernate, association, relationship, fetch, cascade, database]
updated: 2026-05-27
sources: ["raw/lectures/JPA.md"]
---

# JPA 연관 관계 (Association)

## 한 줄 정의

**테이블 간의 관계(FK + JOIN)를 엔티티의 객체 참조(attribute)로 모델링하는 것.**
DB는 외래 키로 관계를 맺고, 객체는 참조로 관계를 맺는다 — JPA가 이 둘을 잇는다.

## 핵심 — FK ↔ 참조의 방향 차이

```
[ 테이블 세계 ]  OrderItems.item_id (FK)  ──JOIN──▶  Items
[ 객체 세계  ]  orderItem.getItem()       ──참조──▶  Item 객체
```

테이블은 FK 하나로 **양쪽에서 JOIN**할 수 있다(방향이 없다). 하지만 객체 참조는
**한 방향**이다 — `orderItem.getItem()`은 되지만 그 반대는 따로 필드를 둬야 한다.
이 **방향성의 불일치**가 연관 관계 매핑이 까다로운 근본 이유다. → [[jpa]]의 패러다임 불일치.

## 다중성(Multiplicity) — 어느 어노테이션?

"한쪽에서 봤을 때 상대가 몇 개인가"로 고른다.

| 어노테이션 | 의미 | 예 |
| --- | --- | --- |
| `@ManyToOne` | 다(多) → 일(一) | OrderItem 여러 개 → Item 하나 |
| `@OneToMany` | 일 → 다 | Order 하나 → OrderItem 여러 개 |
| `@OneToOne` | 일 → 일 | User ↔ Profile |
| `@ManyToMany` | 다 → 다 | (보통 중간 테이블로 풀어 씀) |

```java
public class OrderItemEntity {
    @ManyToOne                      // 여러 OrderItem이 한 Item을 가리킴
    @JoinColumn(name = "item_id")   // FK 칼럼 지정
    private ItemEntity item;
}
```

`@JoinColumn`이 **FK 칼럼이 어디인지**를 가리킨다.

## 방향성과 "연관 관계의 주인(owner)" — 가장 헷갈리는 지점

- **단방향**: 한쪽만 상대를 참조.
- **양방향**: 양쪽이 서로 참조. 이때 문제가 생긴다 — **객체엔 참조가 둘인데 테이블엔 FK가
  하나**다. JPA는 "그럼 어느 쪽 참조를 보고 FK를 갱신하지?"를 알 수 없다.

그래서 **주인(owner)을 정한다.**

> **규칙: 연관 관계의 주인 = 외래 키(FK)가 있는 쪽.**
> 주인이 FK를 관리(INSERT/UPDATE)하고, 주인이 아닌 쪽은 `mappedBy`로 "나는 주인이 아니라
> 저쪽 필드에 매핑됐을 뿐"이라고 선언한다 (읽기 전용).

```java
public class OrderEntity {                         // FK 없음 → 주인 아님
    @OneToMany(mappedBy = "order",                 // OrderItemEntity의 'order' 필드가 주인
               cascade = CascadeType.ALL)
    private List<OrderItemEntity> orderItems = new ArrayList<>();
}

public class OrderItemEntity {                     // FK(order_id) 있음 → 주인
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private OrderEntity order;
}
```

`mappedBy = "order"`는 "주인은 상대편의 `order` 필드"라는 뜻. **`mappedBy`가 붙은 쪽은
FK를 못 건드린다** — 양방향에서 데이터가 안 들어가는 흔한 버그가 주인을 헷갈려서 생긴다.

## 페치 전략(Fetch Strategy) — 언제 가져오나

연관 객체를 **즉시** 가져올지, **쓸 때** 가져올지.

| 전략 | 동작 | 비고 |
| --- | --- | --- |
| `FetchType.EAGER` | 엔티티 조회 시 연관 객체도 **즉시** JOIN/조회 | `@ManyToOne` 기본값 |
| `FetchType.LAZY` | 연관 객체를 **실제 접근할 때** 조회 | `@OneToMany` 기본값 |

> ⚠️ **여기가 [[n-plus-1-problem]]의 진원지다.** 목록을 가져온 뒤 루프에서 각 항목의 LAZY
> 연관을 건드리면 항목마다 추가 SELECT가 나간다(1 + N). [[mybatis]]는 SQL이 눈에 보여
> 잡기 쉽지만, JPA는 **추상화 뒤에 숨어** 무섭다. 실무에선 보통 LAZY를 기본으로 두고,
> 필요할 때 fetch join/`@EntityGraph`로 한 번에 가져온다.

### LAZY 연관 객체의 정체 = 프록시(proxy)

LAZY일 때 `orderItem.getOrder()`로 꺼낸 객체는 **진짜 엔티티가 아니라 [[hibernate]]가
만든 프록시(가짜 대역)**다.

```java
OrderItem item = em.find(OrderItem.class, 1L);  // OrderItem만 SELECT
Order order = item.getOrder();                   // 프록시 껍데기 반환 (id만 있음, DB 안 침)
order.getOrderDate();                            // ← 진짜 필드 접근 순간 SELECT 발생 (프록시 초기화)
```

- 프록시는 처음엔 **ID만 든 빈 껍데기**. 실제 필드를 건드리는 순간 작업대
  ([[persistence-context]])가 그제서야 SELECT를 날려 속을 채운다("프록시 초기화").
- **왜**: 안 쓸 수도 있는 연관을 미리 JOIN하면 낭비 → "쓸 때만 쿼리"를 가능케 하는 장치.

> ⚠️ **`LazyInitializationException`** — 가장 흔한 함정. 작업대는 트랜잭션이 끝나면 닫힌다.
> 트랜잭션이 끝난 뒤(예: 컨트롤러·뷰) 미초기화 프록시를 처음 건드리면, SELECT를 날릴 작업대가
> 없어 예외가 터진다. → 트랜잭션 안에서 미리 초기화하거나(fetch join·접근), DTO로 변환해
> 내보낸다. [[transaction]]의 경계가 곧 프록시 초기화 가능 구간이다.

## 영속성 전이(Cascade) — 함께 움직이기

주인 엔티티에 한 작업을 연관 엔티티에도 전파.

```java
@OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
private List<OrderItemEntity> orderItems = ...;
```

`CascadeType` = `ALL`·`PERSIST`·`MERGE`·`REMOVE`·`REFRESH`·`DETACH`. 예: Order를 저장하면
딸린 OrderItem들도 함께 INSERT(`PERSIST`). 강의 예제의 `createOrder`가 OrderItem을
따로 저장하지 않고 Order만 save해도 되는 이유다.

## 관련 페이지

- [[jpa]] — 연관 관계가 푸는 패러다임 불일치의 핵심
- [[jpa-entity-mapping]] — 단일 엔티티/키 매핑 (관계 전 단계)
- [[n-plus-1-problem]] — LAZY 페치(프록시 초기화)가 부르는 대표 함정
- [[persistence-context]] — 프록시 초기화·LazyInitializationException이 작업대 수명에 묶이는 이유
- [[entity-manager]] — cascade가 커밋 시점에 동작하는 맥락
- [[mybatis]] — 관계를 직접 JOIN으로 푸는 비교 대상
- 출처: [[jpa-lecture]]
