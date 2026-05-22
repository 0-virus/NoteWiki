---
type: concept
tags: [spring, architecture, dto, entity]
updated: 2026-05-21
sources: ["raw/notes/Spring Framework.md"]
---

# DTO vs Entity

## 한 줄 정의

**Entity**는 비즈니스 [[domain]]의 **본체** — 상태와 행위를 가진다.
**DTO**(Data Transfer Object)는 계층·시스템 사이를 오가는 **운반체** — 데이터만 있고 행위는 없다.
두 개념을 섞으면 도메인 변경이 클라이언트까지 줄줄이 흘러간다.

## 각자의 정체

### Entity

- 비즈니스 도메인의 일부 — **행위(메서드)를 가진다.
- 상태 + 식별자 + 비즈니스 로직.
- Spring에서 `@Entity` 어노테이션이 붙는 클래스.

```java
public class Order {
    private Long id;
    private OrderStatus status;

    public void cancel() {  // ← 행위
        if (status == OrderStatus.SHIPPED) {
            throw new IllegalStateException("배송 완료된 주문은 취소할 수 없습니다.");
        }
        this.status = OrderStatus.CANCELED;
    }
}
```

`Order.cancel()`이 "주문 취소"라는 도메인 규칙을 알고 있다. 이게 Entity의 본질.

### DTO

- 한 처리 컨텍스트에서 다른 곳으로 **데이터만 전달**.
- 기본적인 저장·조회 외에 행위 없음.
- 보통 [[java-record]]나 Lombok `@Data` 클래스로 짧게 작성.

```java
public record OrderResponseDto(
    Long orderId,
    String status,
    int totalPrice
) { }
```

## 왜 둘을 분리하는가

**Entity를 그대로 API 응답으로 내보내면 — 도메인 변경이 클라이언트로 새어 나간다.**

```
Entity ─────그대로 응답─────▶ Client
  │
  │ "주문에 결제 정보 필드를 추가하자" (도메인 변경)
  ▼
변경된 Entity ─────그대로 응답─────▶ Client (의도하지 않은 필드 노출, API 깨짐)
```

DTO를 끼우면 두 흐름이 분리된다.

```
Entity ──[변환]──▶ DTO ─────응답─────▶ Client
  │                  ▲
  │ "결제 정보 추가" │
  ▼                  │ DTO를 안 바꾸면 클라이언트 영향 0
변경된 Entity ──────┘
```

이득:
1. **API 안정성** — 도메인이 변해도 응답 스키마는 그대로 유지 가능.
2. **민감 필드 차단** — 비밀번호·내부 ID 같은 걸 자동으로 가려준다.
3. **응답 최적화** — 화면에 필요한 필드만 골라 보낸다.
4. **여러 응답 형태** — `PostAllResponseDto`(목록용)와 `PostDetailResponseDto`(상세용)를 따로.

> **필드 결정의 기준은 엔티티가 아니라 유스케이스다.** 같은 `Post` 엔티티라도 "목록 화면이 뭘 필요로 하나"가 `PostAllResponseDto`의 필드를 정하고, "상세 화면이 뭘 필요로 하나"가 `PostDetailResponseDto`의 필드를 정한다. DTO를 엔티티의 부속물처럼 다루기 시작하면 분리의 의미가 무너진다.

## 실제 사용 — 강의 실습 명세

미니 SNS 앱의 DTO 분리 (강의 §3 실습):

| DTO 클래스                | 필드                             | 용도                  |
| ------------------------- | -------------------------------- | --------------------- |
| `PostCreateRequestDto`    | title, body                      | 글 등록 요청 입력     |
| `PostAllResponseDto`      | postId, title, likes             | 목록 응답 (가벼움)    |
| `PostDetailResponseDto`   | postId, title, body, likes       | 상세 응답 (전부)      |
| `PostUpdateRequestDto`    | postId, body                     | 수정 요청 입력        |

목록 응답엔 본문(body)을 안 담는 게 핵심 — 목록 화면은 본문이 필요 없고, 트래픽도 줄어든다.

## 변환은 어디서

보통 **Service Layer**에서 Entity ↔ DTO 변환을 한다 ([[three-tier-architecture]] 참조).

```java
// DTO 안에 정적 팩토리를 두는 패턴 (강의 예시)
public static PostAllResponseDto of(Post post) {
    return new PostAllResponseDto(post.getPostId(), post.getTitle(), post.getLikes());
}
```

영균 메모: MapStruct·ModelMapper 같은 자동 매퍼도 있지만, **처음엔 손으로 짜보고 패턴이 익숙해진 다음** 도입하는 게 원리 학습에 좋다.

## DTO · DAO · Entity · DO — 4종 한 표로

이름이 비슷해서 가장 잘 섞이는 4개. 결론부터:

> **DAO만 "행동", 나머지 셋은 "객체"다.**
> 그 중에서 **Entity**는 "id로 식별되는 도메인 본체",
> **DO** ([[domain]])는 "도메인 모델에 속하는 객체 모두 (Entity의 부모 카테고리)",
> **DTO**는 "계층/시스템 경계를 건너는 운반체".

| 구분 | DTO | DAO | Entity | DO |
| --- | --- | --- | --- | --- |
| **본질** | 객체 (운반체) | **행동** (접근자) | 객체 (도메인 본체) | 객체 (도메인 모델 일반) |
| **행위(메서드)** | 없음 | findAll / save / ... | 있음 (규칙 실행) | 있을 수 있음 |
| **식별자(id)** | 있어도 의미 약함 | 해당 없음 | **핵심** | 경우에 따라 (VO는 없음) |
| **DB 매핑** | 아님 | 매핑을 *수행*함 | 대개 매핑됨 | 의무 없음 |
| **위치** | 계층 경계 | Data Layer | Business/Data Layer | Business Layer |
| **Spring 어노테이션** | 일반 클래스/record | `@Repository` | `@Entity` | 특정 어노테이션 없음 |

### 한 요청에서 네 객체가 만나는 자리

```
[Controller/Service] ── postDao.findById(42) ──▶ [ DAO ]   ← "행동"
                                                    │
                                                    │ SELECT * FROM posts WHERE id = 42
                                                    ▼
                                                 [  DB  ]
                                                    │ ResultSet
                                                    ▼
                                                 [ Entity ]   ← DB 한 행을 채운 도메인 본체
                                                    │
                                                    │ Service에서 변환
                                                    ▼
                                                 [  DTO  ]   ← 응답으로 보낼 운반체
```

- **DAO**: 객체이긴 하지만 본질이 "DB 접근이라는 행동". → [[dao-pattern]]
- **Entity**: DB 한 행을 채운 도메인 본체. 식별자(id) + 규칙(행위).
- **DTO**: Controller가 클라이언트에 줄 운반체. 행위 없음.
- **DO**: Entity의 상위 카테고리. 실무에선 Entity와 동의어로 쓰이는 일이 많음. → [[domain]]

### "객체 vs 행동" — 가장 큰 오해 풀기

영균이 처음 보면 "DTO/DAO/Entity가 다 같은 종류인 줄" 알기 쉽다. 핵심:

- **DTO, Entity, DO**는 모두 **"데이터를 담은 객체"** (명사).
- **DAO**는 **"데이터에 접근하는 동작"을 캡슐화한 객체** (사실상 동사).

이 차이를 외워두면 `PostDto.create()`처럼 DTO에 메서드를 잔뜩 박는 실수를 안 한다.

## JSON 직렬화와의 관계

Spring MVC는 **Jackson**을 써서 DTO ↔ JSON을 자동 변환한다.

```
"JSON 문자열"  ──Deserialize(역직렬화)──▶  Java DTO
Java DTO       ──Serialize(직렬화)─────▶  "JSON 문자열"
```

이 자동 변환을 처리하는 게 `HttpMessageConverter` ([[content-negotiation]] 참조).

## 관련 페이지

- [[domain]] — "도메인"·"DO/VO/Entity 위계"의 본문
- [[dao-pattern]] — 4종 중 유일한 "행동" 객체
- [[three-tier-architecture]] — DTO가 계층 사이를 오가는 무대
- [[java-record]] — DTO를 가장 짧게 쓰는 도구
- [[content-negotiation]] — DTO와 JSON/XML 직렬화의 연결
- 흐름: [[spring-mvc-request-flow]] — DTO·Entity가 한 요청에서 등장하는 자리
- 출처: [[spring-framework-1-note]]
