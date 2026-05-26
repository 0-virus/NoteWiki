---
type: concept
tags: [spring, web, api, rest, pattern]
updated: 2026-05-26
sources: ["raw/notes/study-notes.md"]
---

# API Response Wrapper (공통 응답 래퍼)

## 한 줄 정의

**모든 API 응답을 `{ success, message, data, ... }` 같은 공통 구조로 한 번 더 감싸는 패턴.**
이름은 보통 `ApiResponse`·`CommonResponse`·`ResultDto`.

## 감싸기 전 vs 감싼 후

**감싸기 전** — body에 데이터만:

```json
{ "id": 1, "userId": "hong", "username": "홍길동" }
```

**감싼 후** — 메타 정보 + 데이터:

```json
{
  "success": true,
  "message": "조회 성공",
  "data": { "id": 1, "userId": "hong", "username": "홍길동" }
}
```

에러도 똑같은 모양:

```json
{
  "success": false,
  "message": "사용자를 찾을 수 없습니다",
  "data": null,
  "errorCode": "USER_NOT_FOUND"
}
```

## 왜 필요한가

[[restful-api]]의 [[http-status-codes]]만으로 정보를 다 표현하면 부족할 때가 있다.

1. **클라이언트의 코드가 단순해진다.** 성공/실패를 매번 status code로 분기할 필요 없이
   `if (res.success)` 한 줄로 끝.
2. **에러도 같은 스키마**. "성공이면 데이터, 실패면 메시지" 같은 두 갈래 처리가 사라진다.
3. **메타 정보 추가 자리.** 페이지네이션(`totalCount`·`page`·`hasNext`), 서버 시간,
   요청 추적 ID 같은 걸 같은 자리에 끼울 수 있다.
4. **버저닝 친화적.** 응답 구조가 바뀌어도 `data` 안쪽만 바뀌고 껍데기는 그대로.

## ⚠️ 트레이드오프 — 도입 시점 판단

| 장점 | 단점 |
| --- | --- |
| 일관된 응답 스키마 | 본문 1 depth 깊어짐 (`res.data.field`) |
| 에러/성공 처리 통일 | HTTP 표준과 일부 중복 (status code와 success가 따로 놂) |
| 메타 정보 자리 확보 | 모든 컨트롤러가 래핑해야 함 (`@ControllerAdvice`로 자동화 가능) |

> 영균 메모: **실습 단계에선 필수가 아니다.** MyBatis+Spring 연동 학습 수준에선 오히려 노이즈.
> 팀 프로젝트·실무에서 클라이언트 개발자와 응답 스키마를 합의할 때 자연스럽게 도입.

## DTO와의 관계 — [[dto-vs-entity]] 가지의 한 층

[[dto-vs-entity]]가 "도메인을 클라이언트로부터 격리"하는 1단계라면,
래퍼는 **그 위에 메타 정보 한 겹을 더 씌우는** 2단계.

```
Entity ──(Service)──▶ DTO ──(ApiResponse.success)──▶ JSON
                       │                    │
                       │                    └ success/message/data
                       └ 도메인을 격리한 운반체
```

> DTO는 "**무엇**(데이터)"을, Wrapper는 "**메타**(이 응답의 상태)"를 담당한다.

## Spring 구현 골격

```java
// Java record로 간단하게
public record ApiResponse<T>(
    boolean success,
    String message,
    T data
) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "ok", data);
    }
    public static <T> ApiResponse<T> fail(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
```

```java
@GetMapping("/users/{id}")
public ApiResponse<UserResponseDto> getUser(@PathVariable int id) {
    return ApiResponse.success(userService.getUserById(id));
}
```

### HTTP 상태 코드는 어떻게 되는가

래퍼는 **본문**의 일이고, HTTP 상태 코드는 **헤더**의 일이다. 같이 써야 한다.

```java
// 404와 함께 ApiResponse.fail()을 내려보내는 방식
@ExceptionHandler(ResponseStatusException.class)
public ResponseEntity<ApiResponse<Void>> handle(ResponseStatusException e) {
    return ResponseEntity
        .status(e.getStatusCode())
        .body(ApiResponse.fail(e.getReason()));
}
```

> ⚠️ 래퍼를 도입했다고 모든 응답을 `200 OK`로 통일하지 말 것. 그러면 HTTP의 의미를 깨뜨려
> 캐시·재시도·로깅 인프라가 다 망가진다. [[http-status-codes]]는 그대로 유지하고,
> 본문만 래핑한다.

## 영균 학습 트리에서

- MyBatis 실습 중 "DTO를 entity로 한 번 더 감싸야 한다"는 말에서 출발한 페이지.
  → 정확한 명칭은 **API Response Wrapper**, 감싸는 대상은 Entity가 아니라 **DTO**.
- 부트캠프 실습 단계에선 보류, 본 프로젝트의 클라이언트 합의 단계에서 다시 본다.

## 관련 페이지

- [[dto-vs-entity]] — 래퍼가 감싸는 대상 (Entity 아닌 DTO)
- [[restful-api]] — REST 응답 설계의 일부로 도입
- [[http-status-codes]] — 래퍼와 함께 가야 하는 다른 축
- [[content-negotiation]] — JSON 직렬화 기반
- 출처: [[mybatis-practice-debugging]]
