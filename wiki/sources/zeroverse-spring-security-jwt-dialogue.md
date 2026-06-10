---
type: source
tags: [spring, security, jwt, filter, authentication, dialogue, zeroverse]
updated: 2026-06-10
sources: ["raw/dialogues/2026-06-10-zeroverse-spring-security-jwt-auth-practice.md"]
---

# ZeroVerse Spring Security JWT 로그인 인증 실습 대화

> 원본: `raw/dialogues/2026-06-10-zeroverse-spring-security-jwt-auth-practice.md`
> Claude Code 세션, 2026-06-10

## 압축 컨텍스트
ZeroVerse Spring Boot 서버에서 JWT 인증을 학습하며 구현한 대화. 회원가입 API에서 시작해 로그인 검증, `AuthenticationManager`, `UserDetailsService`, BCrypt, Access Token 발급, `JwtTokenProvider`, `JwtAuthenticationFilter`, `SecurityContextHolder`, `OncePerRequestFilter`, Spring Security 기본 필터들의 역할까지 이어졌다.

## 핵심 주장
1. 로그인 성공 여부만 응답하는 단계에서는 로그인 유지가 되지 않는다. 서버가 다음 요청에서 사용자를 식별할 Access Token을 발급해야 한다.
2. JWT 로그인 유지의 핵심 흐름은 로그인 검증 -> Access Token 발급 -> 클라이언트가 `Authorization: Bearer` 헤더로 전송 -> 서버 필터가 검증 -> `SecurityContext`에 인증 저장이다.
3. `JwtTokenProvider`는 JWT 생성, 검증, Claims 추출을 담당하는 도구 클래스다. Claims는 JWT Payload 안의 key-value 정보 묶음이다.
4. `JwtAuthenticationFilter`는 로그인하는 필터가 아니라 이미 발급된 JWT를 읽어서 이번 요청의 인증 상태를 복원하는 필터다.
5. `doFilterInternal()`은 `OncePerRequestFilter` 기반 커스텀 필터에서 이번 요청에 대해 수행할 일을 작성하는 메서드다. `filterChain.doFilter()`는 다음 필터 또는 Controller로 넘기는 호출이다.
6. Spring Security의 내장 필터들은 모두 같은 방식으로 동작하지 않는다. 어떤 필터는 `doFilterInternal`, 어떤 필터는 `doFilter`, 어떤 필터는 `attemptAuthentication` 중심으로 구현되어 있다.
7. `AuthorizationFilter`는 `SecurityContext`를 보고 `.authenticated()` 같은 인가 규칙을 실제로 판단한다. 따라서 JWT 필터는 그 전에 인증 정보를 넣어야 한다.
8. Lombok `@RequiredArgsConstructor`는 `final` 필드만 생성자 주입에 포함한다. `final` 누락은 DI 실패와 500 에러로 이어질 수 있다.

## 관련 페이지
- [[spring-security]] - SecurityFilterChain, 인증/인가 필터 체인
- [[jwt]] - JWT 구조와 서명 검증
- [[jwt-claims]] - Payload 안의 Claims 개념
- [[security-context]] - 현재 요청의 인증 정보를 저장하는 위치
- [[once-per-request-filter]] - 요청당 한 번 실행되는 Spring Web 필터 기반 클래스
- [[spring-security-jwt-auth-flow]] - ZeroVerse JWT 로그인/요청 인증 흐름
- [[filter]] - Servlet Filter 계층의 기본 개념
- [[bean-validation]] - DTO 입력 검증
- [[lombok]] - `@RequiredArgsConstructor`와 final 필드 주입