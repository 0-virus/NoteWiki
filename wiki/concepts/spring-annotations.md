---
type: concept
tags: [spring, annotation, reference, index, jpa]
updated: 2026-05-28
sources: ["raw/dialogues/2026-05-28 Spring 도메인 구조와 @Transactional — 프록시 vs 컨테이너.md"]
---

# Spring 자주 쓰는 어노테이션 — 인덱스

> **용도: "이 어노테이션 뭐였지?"를 한곳에서 찾는 참조 허브.**
> 각 어노테이션은 *한 줄 의미*만 적고, **깊이("왜")는 해당 개념 페이지로 위임**한다.
> 이 페이지는 외워서 읽는 곳이 아니라 **빠르게 짚고 링크를 타고 들어가는 색인**이다.

## 큰 그림 — 어노테이션은 "프레임워크에게 거는 표시"

어노테이션 자체는 아무 일도 하지 않는다. **표시(marker)**일 뿐이다. 실제 동작은
그 표시를 읽는 쪽이 한다:

```
@Service / @Transactional / @Entity ...   ← 그냥 "표시"
        │ 스캔·해석
        ▼
[Spring 컨테이너 / Hibernate]   ← 표시를 읽고 실제 동작을 건다
   @Service     → 빈으로 등록 ([[spring-bean]])
   @Transactional → 프록시로 감싸 트랜잭션 ([[aop]]·[[transaction]])
   @Entity      → 테이블에 매핑 ([[jpa-entity-mapping]])
```

> 그래서 어노테이션을 이해한다는 건 "이 표시를 **누가 읽고 무슨 일을 하는가**"를 아는 것이다.
> 아래 표의 "깊이 보기" 링크가 바로 그 "누가·무슨 일"을 설명하는 페이지다.

## 1. 빈 등록 — 계층 스테레오타입

`@Component`의 특수화. 셋 다 "이 클래스를 [[spring-bean|빈]]으로 등록" + [[three-tier-architecture|3계층]] 의미 부여.

| 어노테이션 | 한 줄 의미 | 깊이 보기 |
|---|---|---|
| `@Component` | 범용 빈 등록 | [[spring-bean]] · [[inversion-of-control]] |
| `@Controller` | 웹 요청을 받는 빈 (View 반환) | [[mvc-pattern]] · [[dispatcher-servlet]] |
| `@RestController` | `@Controller` + `@ResponseBody` (JSON 반환) | [[restful-api]] · [[dispatcher-servlet]] |
| `@Service` | 비즈니스 로직 빈 (트랜잭션 경계) | [[three-tier-architecture]] · [[transaction]] |
| `@Repository` | 데이터 접근 빈 (예외 변환) | [[dao-pattern]] · [[spring-data-jpa]] |

## 2. 의존성 주입 (DI)

| 어노테이션 | 한 줄 의미 | 깊이 보기 |
|---|---|---|
| `@Autowired` | 빈을 주입 (생성자 주입이면 생략 가능) | [[dependency-injection]] |
| `@Qualifier` | 같은 타입 빈이 여럿일 때 이름으로 지정 | [[dependency-injection]] |
| `@Configuration` | 빈 정의를 담는 설정 클래스 | [[spring-bean]] · [[inversion-of-control]] |
| `@Bean` | 메서드 반환값을 빈으로 등록 (수동 등록) | [[spring-bean]] · [[entity-manager]] |

> Lombok의 `@RequiredArgsConstructor`는 Spring이 아니라 Lombok 어노테이션이지만, `final` 필드
> 생성자를 만들어 **생성자 주입**을 자동화하므로 실무에서 DI와 짝으로 늘 같이 보인다.

## 3. 웹 요청 매핑

| 어노테이션 | 한 줄 의미 | 깊이 보기 |
|---|---|---|
| `@RequestMapping` | URL ↔ 핸들러 메서드 매핑 (메서드 무관) | [[dispatcher-servlet]] · [[spring-mvc-request-flow]] |
| `@GetMapping`·`@PostMapping`·`@PutMapping`·`@DeleteMapping` | HTTP 메서드별 단축 매핑 | [[restful-api]] |
| `@PathVariable` | URL 경로의 일부를 파라미터로 (`/users/{id}`) | [[restful-api]] |
| `@RequestParam` | 쿼리스트링/폼 값을 파라미터로 (`?page=1`) | [[restful-api]] |
| `@RequestBody` | 요청 본문(JSON)을 객체로 역직렬화 | [[content-negotiation]] · [[dto-vs-entity]] |
| `@ResponseBody` | 반환 객체를 응답 본문(JSON)으로 직렬화 | [[content-negotiation]] |

## 4. 응답·예외 처리

| 어노테이션 | 한 줄 의미 | 깊이 보기 |
|---|---|---|
| `@ResponseStatus` | 응답 HTTP 상태 코드 지정 | [[http-status-codes]] |
| `@ControllerAdvice` | 전역 예외/응답 후처리 (controller 가로지름) | [[http-status-codes]] · [[filter-vs-interceptor]] |
| `@ExceptionHandler` | 특정 예외를 잡아 응답으로 변환 | [[http-status-codes]] |

> 함정: [[filter]]에서 터진 예외는 `@ControllerAdvice`에 **안 잡힌다** — 필터는 [[dispatcher-servlet]] 바깥이라서. → [[filter-vs-interceptor]]

## 5. 트랜잭션 · AOP

| 어노테이션 | 한 줄 의미 | 깊이 보기 |
|---|---|---|
| `@Transactional` | 메서드를 트랜잭션으로 감쌈 (프록시) | [[transaction]] · [[transaction-propagation]] |
| `@Transactional(readOnly = true)` | 읽기 전용 — [[persistence-context\|변경 감지]] 스냅샷 생략 | [[transaction]] |
| `@Aspect` | 공통 관심사 모듈(Aspect) 선언 | [[aop]] |
| `@Around`·`@Before`·`@After` | Advice 실행 시점 지정 | [[aop]] |

> `@Transactional`·`@Aspect`는 모두 **[[aop\|AOP 프록시]]**로 동작한다 → 같은 클래스 안
> `this.메서드()` 자기호출이면 프록시를 안 거쳐 **안 먹는다**. 호출 주체/시점은 [[aop]]의
> "컨테이너 vs 프록시" 절 참고.

## 6. JPA 엔티티 매핑

| 어노테이션 | 한 줄 의미 | 깊이 보기 |
|---|---|---|
| `@Entity` | 이 클래스를 DB 테이블에 매핑 | [[jpa-entity-mapping]] |
| `@Table` | 매핑할 테이블명·제약조건 지정 | [[jpa-entity-mapping]] |
| `@Id` | 기본 키(PK) 필드 | [[jpa-entity-mapping]] |
| `@GeneratedValue` | PK 생성 전략(IDENTITY/SEQUENCE/…) | [[jpa-entity-mapping]] |
| `@Column` | 컬럼명·길이·nullable 등 매핑 | [[jpa-entity-mapping]] |
| `@Enumerated` | enum을 컬럼에 저장하는 방식(STRING 권장) | [[jpa-entity-mapping]] |
| `@OneToMany`·`@ManyToOne`·`@OneToOne`·`@ManyToMany` | 연관 관계 다중성 | [[jpa-association]] |
| `@JoinColumn` | FK 컬럼 지정 (연관 관계 주인 쪽) | [[jpa-association]] |
| `mappedBy` | 연관 관계의 거울(주인 아님) 표시 | [[jpa-association]] |

> `@Entity`가 붙은 객체를 실제로 관리하는 건 [[entity-manager]]와 그 [[persistence-context|작업대]]다.
> 스키마를 누가 만드나(`ddl-auto`)는 [[jpa-entity-mapping]]의 키 생성 전략 절과 이어진다.

## 7. 설정 · 부트스트랩

| 어노테이션 | 한 줄 의미 | 깊이 보기 |
|---|---|---|
| `@SpringBootApplication` | 자동 설정 + 컴포넌트 스캔 + 설정의 진입점 | [[spring-boot]] |
| `@Value` | `application.yml` 값을 필드에 주입 | [[spring-boot]] |
| `@Mapper` (MyBatis) | 인터페이스를 MyBatis 매퍼 구현체로 | [[mybatis]] |

## 관련 페이지

- [[spring-framework]] — Spring 학습 트리 진입점 (이 인덱스의 상위 허브)
- [[spring-bean]] · [[dependency-injection]] · [[inversion-of-control]] — "빈 등록·주입" 어노테이션의 원리
- [[aop]] · [[transaction]] · [[transaction-propagation]] — "프록시로 동작하는" 어노테이션
- [[jpa-entity-mapping]] · [[jpa-association]] · [[entity-manager]] — JPA 매핑 어노테이션
- [[dispatcher-servlet]] · [[restful-api]] · [[http-status-codes]] — 웹 요청·응답 어노테이션
- 출처: [[spring-transaction-proxy-dialogue]]
