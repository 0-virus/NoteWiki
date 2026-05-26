---
type: concept
tags: [web, http, rest, api, spring]
updated: 2026-05-26
sources: ["raw/notes/study-notes.md"]
---

# HTTP Status Codes (응답 상태 코드)

## 한 줄 정의

**"이 응답이 어떤 상황인지"를 숫자 세 자리로 약속한 표준.**
서버가 클라이언트에게 줄 수 있는 가장 빠른 메타 신호 — 본문을 읽기 전에 결정된다.

## 5개 카테고리

| 100번대 | Informational | "계속 진행해" (실무 거의 안 봄) |
| --- | --- | --- |
| **200번대** | **Success** | 요청이 정상 처리됨 |
| 300번대 | Redirection | "다른 곳으로 가" |
| **400번대** | **Client Error** | **클라이언트가** 잘못 보냄 |
| **500번대** | **Server Error** | **서버가** 처리하다 망함 |

> 핵심 갈림길: **4xx = "네 잘못이야"**, **5xx = "내 잘못이야"**. 이 둘을 헷갈리면
> 클라이언트가 잘못된 결정을 한다 (재시도 무한 루프 등).

## 판단 기준 — "이걸 던질 이유가 있나?"

> **"클라이언트가 이 에러를 받았을 때, 뭘 해야 할지 알 수 있나?"**
> 클라이언트가 다르게 반응해야 하는 상황이면 구분해서 던질 이유가 있다.

같은 "실패"라도:
- 404 받으면 → "없는 리소스다" 사용자에게 알림
- 401 받으면 → 로그인 페이지로 리다이렉트
- 403 받으면 → "권한 없음" 알림
- 500 받으면 → 재시도 또는 에러 화면

→ **클라이언트의 행동이 달라진다 = 코드를 구분할 가치가 있다.** 같은 행동이면 굳이 세분화 안 해도 됨.

## 개발자가 적극 던져야 하는 코드

| 코드 | 의미 | 언제 던지나 |
| --- | --- | --- |
| **200** OK | 성공 | GET / PUT / DELETE 성공 |
| **201** Created | 생성됨 | POST로 새 리소스 생성 성공 |
| **204** No Content | 성공, 본문 없음 | DELETE 성공 (보낼 데이터 없음) |
| **400** Bad Request | 입력 오류 | 필수 필드 누락, 타입 불일치 |
| **401** Unauthorized | 인증 안 됨 | 로그인 안 한 상태로 접근 |
| **403** Forbidden | 권한 없음 | 인증은 됐지만 다른 사람 리소스 |
| **404** Not Found | 리소스 없음 | 존재하지 않는 `id`로 조회 |
| **409** Conflict | 중복 충돌 | 이미 존재하는 `userId`로 가입 |
| **500** Internal Server Error | 서버 오류 | 처리되지 않은 모든 예외 |

### 401 vs 403 — 가장 헷갈리는 짝

- **401** = "너 **누구**야?" (인증 미완료, 로그인 안 한 상태)
- **403** = "넌 누군진 알겠는데, 여기 들어올 **권한**이 없어"

> 토큰 만료 = 401(다시 로그인), 일반 유저가 관리자 페이지 접근 = 403.

## Spring에서 던지는 법

### 방법 1 — `ResponseStatusException` (가장 간단)

```java
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

public UserResponseDto getUserById(int id) {
    User user = repository.findById(id);
    if (user == null) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }
    return UserResponseDto.of(user);
}
```

> ⚠️ 흔한 함정: 그냥 `throw new RuntimeException()`을 던지면 **Spring이 500으로 처리**한다.
> 404를 내려면 반드시 `ResponseStatusException` 또는 커스텀 예외 + `@ResponseStatus`.

### 방법 2 — 커스텀 예외 + `@ResponseStatus`

```java
@ResponseStatus(HttpStatus.NOT_FOUND)
public class UserNotFoundException extends RuntimeException { }

// 서비스에서
throw new UserNotFoundException();
```

### 방법 3 — `@ControllerAdvice`로 전역 매핑

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<String> handle(UserNotFoundException e) {
        return ResponseEntity.status(404).body("사용자 없음");
    }
}
```

각 컨트롤러를 깨끗하게 유지하면서 응답 형태를 일관되게 잡는 실무 정석.

## ⚠️ [[filter]]에서 던진 예외는 `@ControllerAdvice`가 못 잡는다

[[filter-vs-interceptor]]에서 본 차이가 여기서 실전 함정으로 돌아온다:

- **Filter 단계** 예외 → 톰캣 기본 에러 페이지 (지저분한 흰 화면)
- **Interceptor·Controller·Service** 예외 → `@ControllerAdvice`로 깔끔하게 잡힘

→ 인증/권한 검사를 Filter에 박으면 401/403의 응답 모양을 통제하기 어렵다.
이게 Spring Security의 `AuthenticationEntryPoint`·`AccessDeniedHandler`가 따로
존재하는 이유.

## REST 응답 설계와 함께 — [[restful-api]] 보강

| 동작 | 메서드 | 성공 | 실패 후보 |
| --- | --- | --- | --- |
| 조회 | GET | 200 | 404 |
| 생성 | POST | 201 | 400, 409 |
| 전체 교체 | PUT | 200 / 204 | 400, 404 |
| 부분 수정 | PATCH | 200 | 400, 404 |
| 삭제 | DELETE | 204 | 404 |

## [[api-response-wrapper]]와의 분업

- HTTP 상태 코드 = **헤더**의 일 (캐시·재시도·로깅 인프라가 본다)
- 응답 래퍼 = **본문**의 일 (클라이언트 코드가 본다)

> 둘 다 써야 한다. 래퍼 도입한다고 모두 200으로 통일하면 HTTP 인프라가 망가진다.

## 영균 학습 트리에서

- 부트캠프 MyBatis 실습 중 "없는 id 조회 시 500이 떠서 404로 바꾸려는데 안 됨"에서 출발.
  → `RuntimeException`은 Spring이 500으로 처리 / `ResponseStatusException`이 정답.
- 현재 진행 중인 프로젝트 우선순위: **404 → 409 → 400** (401/403은 인증 도입 시).

## 관련 페이지

- [[restful-api]] — 상태 코드가 REST의 핵심 한 축
- [[api-response-wrapper]] — 본문 래퍼, 상태 코드와 분업
- [[filter-vs-interceptor]] — Filter 예외가 `@ControllerAdvice`에 안 잡히는 함정
- [[dispatcher-servlet]] — 예외가 디스패처를 거쳐야 `@ControllerAdvice`로 감
- 출처: [[mybatis-practice-debugging]]
