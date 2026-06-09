---
type: concept
tags: [spring, validation, annotation, dto, jakarta, notblank, notnull]
updated: 2026-06-09
sources: ["raw/notes/zeroverse_note_2026-06-09.md"]
---

# Bean Validation (@Valid · @NotBlank · @NotNull)

## 한 줄 정의

**DTO 필드에 어노테이션을 붙여 Spring이 자동으로 입력값을 검증하게 하는 기능.**
Jakarta Bean Validation(Hibernate Validator 구현)을 Spring MVC와 연결한다.

## 동작 원리

```
Controller 파라미터에 @Valid 붙임
        ↓
요청이 도착하면 Spring이 DTO 필드 규칙을 자동 검사
        ↓
검증 실패 → MethodArgumentNotValidException → 400 Bad Request 자동 반환
검증 성공 → 비즈니스 로직 진행
```

`@Valid`가 트리거다. Controller 파라미터에 없으면 DTO 필드에 어노테이션이 있어도 검증하지 않는다.

## Controller에서 사용법

```java
@PostMapping("/register")
public ResponseEntity<ApiResponse> register(
        @RequestBody @Valid RegisterRequest request) {
    //             ^^^^^^ @Valid 없으면 아래 DTO 규칙이 동작하지 않음
    return ResponseEntity.ok(authService.register(request));
}
```

## DTO 필드 어노테이션

```java
public record RegisterRequest(
    @NotBlank @Email String email,                  // null·빈문자·공백 금지 + 이메일 형식
    @NotBlank @Size(min = 8) String password,       // 최소 8자
    @NotBlank @Size(min = 2, max = 20) String nickname,
    @NotBlank String name,
    @NotNull LocalDate birthDate                    // String이 아니므로 @NotBlank 불가
) {}
```

## @NotBlank vs @NotNull — 가장 헷갈리는 차이

| | `@NotNull` | `@NotBlank` |
|---|---|---|
| null 거부 | ✅ | ✅ |
| 빈 문자열 `""` 거부 | ❌ | ✅ |
| 공백만 `"   "` 거부 | ❌ | ✅ |
| 적용 가능 타입 | **모든 타입** | **String만** |

> **왜 다른가**: `@NotBlank`는 내부적으로 String의 `.isBlank()`를 함께 실행한다.
> `LocalDate`, `Long`, `Integer` 같은 타입엔 "빈 칸"이라는 개념이 없다.
> → String이면 `@NotBlank`, 그 외 타입이면 `@NotNull`.

## 자주 쓰는 검증 어노테이션

| 어노테이션 | 검증 내용 | 적용 타입 |
|---|---|---|
| `@NotNull` | null 아님 | 모든 타입 |
| `@NotBlank` | null + 빈 문자열 + 공백 아님 | String |
| `@NotEmpty` | null + 빈 컬렉션/문자열 아님 | String, Collection |
| `@Size(min, max)` | 길이/크기 범위 | String, Collection |
| `@Min(value)` / `@Max(value)` | 숫자 최솟값/최댓값 | 숫자형 |
| `@Email` | 이메일 형식 | String |
| `@Pattern(regexp)` | 정규식 패턴 일치 | String |
| `@Positive` | 양수 | 숫자형 |
| `@Future` / `@Past` | 미래/과거 날짜 | Date, LocalDate |

## 검증 실패 응답 커스터마이징

`@RestControllerAdvice`에서 `MethodArgumentNotValidException`을 잡아 공통 에러 형식으로 변환한다.

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse> handleValidation(
            MethodArgumentNotValidException ex) {
        List<ErrorDetail> details = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(e -> new ErrorDetail(e.getField(), e.getDefaultMessage()))
            .toList();
        // ZeroVerse 공통 응답 형식으로 반환
        return ResponseEntity.badRequest()
            .body(ApiResponse.error("VALID_001", "입력값이 올바르지 않습니다.", details));
    }
}
```

## ZeroVerse 파일 위치

- `RegisterRequest`: `C:\Users\PC\Desktop\zeroverse-server\src\main\java\com\zeroverse\domain\auth\dto\RegisterRequest.java`
- `GlobalExceptionHandler`: `C:\Users\PC\Desktop\zeroverse-server\src\main\java\com\zeroverse\common\exception\GlobalExceptionHandler.java`

## 관련 페이지

- [[dto-vs-entity]] — DTO가 입력 검증의 경계인 이유
- [[spring-security]] — SecurityConfig와 함께 쓰이는 보안 입력 검증
- [[spring-annotations]] — 어노테이션 인덱스
- [[three-tier-architecture]] — DTO 검증이 위치하는 계층 (Controller 진입 시)
- 출처: [[zeroverse-spring-practice]]
