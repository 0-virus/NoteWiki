---
type: concept
tags: [spring, security, authentication, authorization, filter, jwt, bcrypt]
updated: 2026-06-09
sources: ["raw/notes/zeroverse_note_2026-06-09.md"]
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

## JWT 필터 추가 (다음 단계 — 미완료)

현재 ZeroVerse는 회원가입/로그인까지 완성. JWT 토큰 연동 시 아래 설정 추가:

```java
// SecurityFilterChain에 JWT 필터 삽입
http.addFilterBefore(
    jwtAuthenticationFilter,
    UsernamePasswordAuthenticationFilter.class
);
```

[[jwt]]가 완성되면 이 필터가 토큰 검증 → `SecurityContext`에 인증 정보를 주입한다.

## ZeroVerse 파일 위치

- `SecurityConfig`: `C:\Users\PC\Desktop\zeroverse-server\src\main\java\com\zeroverse\config\SecurityConfig\SecurityConfig.java`
- `AuthService`: `C:\Users\PC\Desktop\zeroverse-server\src\main\java\com\zeroverse\domain\auth\service\AuthService.java`
- `AuthController`: `C:\Users\PC\Desktop\zeroverse-server\src\main\java\com\zeroverse\domain\auth\controller\AuthController.java`

## 관련 페이지

- [[jwt]] — JWT 구조·서명 검증 원리, Spring 구현 위치
- [[refresh-token]] — Access Token 재발급 + Rotation 메커니즘
- [[filter]] — Spring Security가 위치하는 Filter 체인
- [[bean-validation]] — @Valid, @NotBlank/@NotNull (DTO 입력 검증)
- [[session-auth]] — JWT가 대체하는 Stateful 세션 방식
- [[cookie-session-jwt]] — 인증 방식 발전 흐름
- [[spring-security-register-flow]] — SecurityConfig를 포함한 회원가입 전체 흐름
- 출처: [[zeroverse-spring-practice]]
