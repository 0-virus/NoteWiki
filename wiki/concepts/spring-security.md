---
type: concept
tags: [spring, security, authentication, authorization, filter, jwt, bcrypt]
updated: 2026-06-10
sources: ["raw/notes/zeroverse_note_2026-06-09.md", "raw/dialogues/2026-06-10-zeroverse-spring-security-jwt-auth-practice.md"]
---

# Spring Security

## 한 줄 정의

**Spring 애플리케이션에 인증(Authentication)·인가(Authorization) 보안을 추가하는 프레임워크.**
HTTP 요청이 Controller에 도달하기 전 Filter 체인에서 보안 검사를 처리한다.

## 큰 그림 — 어디서 동작하나

```
HTTP 요청
  ↓
[Security Filter Chain]   ← Spring Security가 여기서 처리
  ↓  (인증 통과한 요청만)
DispatcherServlet
  ↓
Controller
```

Spring Security는 [[filter]] 기반이다. Servlet Container(Tomcat) 레벨 Filter이므로 [[dispatcher-servlet]]보다 앞에 위치한다. → [[filter-vs-interceptor]]

## SecurityConfig 기본 구조

```java
@Configuration
@EnableWebSecurity                    // Spring Security 웹 보안 기능 활성화
public class SecurityConfig {

    @Bean                             // SecurityFilterChain을 Spring 컨테이너에 등록
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .anyRequest().authenticated()
            );
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

## 각 설정의 의미

### @EnableWebSecurity
Spring Security의 웹 보안 기능을 활성화한다. `@Configuration` 클래스에 함께 붙인다.

### @Bean SecurityFilterChain
"이 메서드가 반환하는 `SecurityFilterChain` 객체를 Spring 컨테이너에 등록한다."
→ Spring Security가 이 빈을 읽어 HTTP 보안 규칙을 적용한다.

### HttpSecurity
Spring이 자동으로 주입하는 HTTP 보안 설정 도구. 설정만 추가하고 `http.build()`로 조립한다.

| 설정 | 코드 | 이유 |
|---|---|---|
| CSRF 비활성화 | `csrf.disable()` | JWT는 Authorization 헤더로 전달 → 브라우저 자동 첨부 없음 → CSRF 대상 아님 |
| 세션 STATELESS | `SessionCreationPolicy.STATELESS` | JWT 인증이므로 서버에 세션을 만들지 않음 |
| 공개 API 허용 | `.requestMatchers(...).permitAll()` | 로그인·회원가입 등 인증 전 접근 가능 엔드포인트 |
| 나머지 인증 필요 | `.anyRequest().authenticated()` | permitAll 외 모든 요청은 인증 필수 |
| `.build()` | `http.build()` | 설정을 `SecurityFilterChain` 객체로 조립 |

> **왜 CSRF를 끄는가**: CSRF 공격은 브라우저가 쿠키를 자동으로 첨부하는 특성을 악용한다.
> JWT는 `Authorization: Bearer <token>` 헤더로 전달하기 때문에 브라우저가 자동으로 붙이지 않는다.
> → CSRF 보호는 세션 기반 인증에서만 필요하다. [[session-auth]] 참고.

## BCryptPasswordEncoder — 비밀번호 해싱

```java
// SecurityConfig에 빈으로 등록
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();   // strength 기본값 10 (ZeroVerse는 12 권장)
}

// AuthService에서 주입받아 사용
@RequiredArgsConstructor
public class AuthService {
    private final PasswordEncoder passwordEncoder;

    public void register(RegisterRequest request) {
        // 비밀번호를 BCrypt 해시로 변환해서 저장
        user.setPassword(passwordEncoder.encode(request.password()));
        userRepository.save(user);
    }

    public boolean login(String rawPassword, String hashedPassword) {
        return passwordEncoder.matches(rawPassword, hashedPassword);
    }
}
```

**BCrypt 특징**:
- **단방향 해시** — 해시에서 원본 비밀번호를 복원할 수 없음
- **솔트(salt) 자동 추가** — 같은 비밀번호도 매번 다른 해시값 생성
- `encode()` 시 솔트가 해시에 포함되어, `matches()`로 원본과 비교 가능
- 비밀번호를 평문으로 DB에 절대 저장하지 않는 이유: 유출 시 즉시 노출

## JWT 필터 추가

ZeroVerse에서는 아래 설정으로 JWT 인증 필터를 삽입한다:

```java
// SecurityFilterChain에 JWT 필터 삽입
http.addFilterBefore(
    jwtAuthenticationFilter,
    UsernamePasswordAuthenticationFilter.class
);
```

`addFilterBefore(내 필터, 기준 필터.class)` = 기준 필터 앞에 삽입. Spring Security는 기본 16개 내장 필터를 등록하는데, `UsernamePasswordAuthenticationFilter`가 항상 존재하므로 기준 필터로 사용한다.

이 필터가 토큰 검증 → `SecurityContext`에 인증 정보를 주입하는 역할을 한다. 자세한 흐름은 [[spring-security-jwt-auth-flow]] 참고.

## ZeroVerse 파일 위치

- `SecurityConfig`: `C:\Users\PC\Desktop\zeroverse-server\src\main\java\com\zeroverse\config\SecurityConfig\SecurityConfig.java`
- `AuthService`: `C:\Users\PC\Desktop\zeroverse-server\src\main\java\com\zeroverse\domain\auth\service\AuthService.java`
- `AuthController`: `C:\Users\PC\Desktop\zeroverse-server\src\main\java\com\zeroverse\domain\auth\controller\AuthController.java`

## 인증·인가 실패 응답 처리

컨트롤러 예외는 `GlobalExceptionHandler`로 잡히지만, **인증·인가 실패는 Security Filter Chain에서 발생** → `@ControllerAdvice`가 닿지 않는다. 처리 인터페이스가 별도로 존재한다.

| 실패 종류 | 위치 | 처리 인터페이스 |
|---|---|---|
| 미인증 (401) — 토큰 없음/만료 | `ExceptionTranslationFilter` | `AuthenticationEntryPoint` |
| 권한 부족 (403) | `ExceptionTranslationFilter` | `AccessDeniedHandler` |
| 잘못된 JWT | `JwtAuthenticationFilter` 내부 | `catch` 블록에서 직접 JSON 응답 작성 |

```java
// SecurityConfig에 등록
http
    .exceptionHandling(ex -> ex
        .authenticationEntryPoint((request, response, authException) -> {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"message\":\"인증이 필요합니다.\"}");
        })
        .accessDeniedHandler((request, response, accessDeniedException) -> {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"message\":\"권한이 없습니다.\"}");
        })
    );
```

> MVP에서는 일단 응답 바디 없이 두고, 나중에 `AuthenticationEntryPoint`·`AccessDeniedHandler`를 별도 클래스로 분리해 등록한다.

## 관련 페이지

- [[jwt]] — JWT 구조·서명 검증 원리, Spring 구현 위치
- [[refresh-token]] — Access Token 재발급 + Rotation 메커니즘, DB 저장 구현
- [[filter]] — Spring Security가 위치하는 Filter 체인
- [[once-per-request-filter]] — JWT 필터 구현 기반, doFilter 누락 함정
- [[bean-validation]] — @Valid, @NotBlank/@NotNull (DTO 입력 검증)
- [[session-auth]] — JWT가 대체하는 Stateful 세션 방식
- [[cookie-session-jwt]] — 인증 방식 발전 흐름
- [[swagger-oas]] — Swagger + Security 경로 허용 설정
- [[spring-security-register-flow]] — SecurityConfig를 포함한 회원가입 전체 흐름
- 출처: [[zeroverse-spring-practice]] · [[virtuber-spring-work-2026-06-21]]

## JWT 요청 인증에서 SecurityContext의 역할

JWT 방식에서 로그인 성공은 Access Token 발급으로 끝나지 않는다. 이후 요청마다 `Authorization: Bearer <token>`을 보내면 커스텀 JWT 필터가 토큰을 검증하고 [[security-context]]에 `Authentication`을 저장해야 한다.

```text
JwtAuthenticationFilter
-> JWT 검증
-> Claims에서 userId, role 추출
-> SecurityContextHolder.getContext().setAuthentication(...)
-> AuthorizationFilter가 authenticated 여부 판단
```

따라서 `JwtAuthenticationFilter`는 로그인 필터가 아니라 **토큰으로 현재 요청의 인증 정보를 복원하는 필터**다. 자세한 흐름은 [[spring-security-jwt-auth-flow]] 참고.
