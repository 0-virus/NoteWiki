---
type: concept
tags: [jpa, auditing, spring, annotation, entity, timestamp, base-entity]
updated: 2026-06-09
sources: ["raw/notes/zeroverse_note_2026-06-09.md"]
---

# JPA Auditing

## 한 줄 정의

**엔티티의 생성/수정 시각을 Spring이 자동으로 채워주는 기능.**
`@CreatedDate`, `@LastModifiedDate`를 선언하면 `save()`/`merge()` 시점에 자동 주입된다.

## 왜 필요한가

모든 엔티티에 `createdAt`, `updatedAt`이 반복된다.

```java
// Auditing 없을 때 — 매번 직접 세팅
user.setCreatedAt(LocalDateTime.now());
user.setUpdatedAt(LocalDateTime.now());
userRepository.save(user);
```

- **누락 위험**: 한 곳이라도 빠뜨리면 null
- **중복 코드**: 모든 save 지점에 반복
- **테스트 불일치**: 시각을 직접 넣으면 단위 테스트에서 시간 제어가 어려움

Auditing은 이걸 **프레임워크 레벨에서 자동화**한다.

## 설정 3단계

### Step 1 — Application 클래스에서 활성화

```java
@SpringBootApplication
@EnableJpaAuditing          // JPA Auditing 기능 ON
public class ZeroverseServerApplication { ... }
```

`@EnableJpaAuditing`이 없으면 `@CreatedDate`/`@LastModifiedDate`가 동작하지 않는다.

### Step 2 — BaseEntity 작성 (공통 필드 분리)

```java
@MappedSuperclass                                        // DB 테이블 없이 상속만 허용
@EntityListeners(AuditingEntityListener.class)           // Auditing 이벤트 리스너 연결
public abstract class BaseEntity {

    @CreatedDate
    @Column(nullable = false, updatable = false)         // insert 시 한 번만 세팅
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
```

### Step 3 — 엔티티에서 상속

```java
@Entity @Table(name = "users")
public class User extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // createdAt, updatedAt은 BaseEntity에서 자동 관리
}
```

## 핵심 어노테이션

| 어노테이션 | 위치 | 역할 |
|---|---|---|
| `@EnableJpaAuditing` | Application 클래스 | 전체 JPA Auditing 활성화 |
| `@MappedSuperclass` | BaseEntity 클래스 | 테이블 없이 상속용 슈퍼클래스 선언 |
| `@EntityListeners(AuditingEntityListener.class)` | BaseEntity 클래스 | 엔티티 생명주기에 Auditing 이벤트 연결 |
| `@CreatedDate` | `createdAt` 필드 | insert 시 자동 주입, `updatable = false`로 고정 |
| `@LastModifiedDate` | `updatedAt` 필드 | insert + update 시 자동 갱신 |

## @MappedSuperclass vs @Entity 상속 비교

| | `@MappedSuperclass` | `@Entity` 상속 |
|---|---|---|
| DB 테이블 생성 | ❌ 자식 테이블에 필드가 합쳐짐 | ✅ 별도 테이블 (JOIN or SINGLE_TABLE) |
| 직접 조회 가능 | ❌ | ✅ |
| 설정 복잡도 | 낮음 | 높음 (상속 전략 선택 필요) |
| 용도 | **공통 필드 추출** (BaseEntity) | 도메인 객체 간 다형성 모델링 |

> BaseEntity처럼 "공통 필드만 묶는 추상 클래스"엔 `@MappedSuperclass`가 정답이다.
> `@Entity` 상속은 JOINED / SINGLE_TABLE 전략 결정이 필요해 복잡해진다.

## ZeroVerse 적용

- `BaseEntity`: `C:\Users\PC\Desktop\zeroverse-server\src\main\java\com\zeroverse\common\entity\BaseEntity.java`
- `User extends BaseEntity`, `Blog extends BaseEntity` 등 도메인 엔티티에서 상속

요구사항(NFR-07) 기준: `Blog`, `Universe` 등 수정 시각이 필요한 엔티티도 `BaseEntity` 상속으로 통일.

## 관련 페이지

- [[jpa-entity-mapping]] — @Entity·@Column 등 기본 매핑 어노테이션
- [[jpa]] — JPA 전체 개요, 영속성 개념
- [[spring-annotations]] — @EnableJpaAuditing이 속한 어노테이션 인덱스
- 출처: [[zeroverse-spring-practice]]
