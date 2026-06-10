---
source_type: "claude-conversation"
title: "ZeroVerse Spring Security JWT 로그인 인증 실습"
url: ""
clipped: 2026-06-10
description: "ZeroVerse Spring Boot 프로젝트에서 회원가입, 로그인 검증, JWT Access Token 발급, JwtAuthenticationFilter, SecurityContext, OncePerRequestFilter를 실습하며 학습한 대화."
status: "raw"
tags:
  - "clippings/claude"
---
> [!info] 원본 저장
> Claude Code 세션 내 공유 URL 없음

## 압축 컨텍스트
ZeroVerse 블로그 서버 프로젝트에서 Spring Security와 JWT 인증을 처음 학습하며 직접 구현 흐름을 잡은 대화다. 시작점은 REQUIREMENTS.md와 프로젝트 구조 점검이었고, 이후 회원가입 API, 로그인 검증, Access Token 발급, JWT 검증 필터, 필터 체인 개념까지 단계적으로 질문하고 답했다.

## 대화 본문

**You**

먼저 REQUIREMENTS.md를 읽고 프로젝트 구조를 살펴봐. 그리고 현재 진행 상황에 대해 보고해줘.

---

**Claude**

프로젝트는 Spring Boot 골격, JPA 엔티티, 공통 응답/예외 처리까지 완료된 초기 기반 단계로 정리했다. `controller`, `service`, `repository`, `dto` 패키지는 있으나 실질 구현은 비어 있고, Security/JWT/API 계층도 아직 구현 전이라고 보고했다.

---

**You**

spring security를 활용한 jwt 인증을 구현해야 하는데, 아무것도 몰라. 학습과 함께 해야 할 것 같은데, 실습 형식으로 어디부터 어떻게 시작해야 할 지 알려줘.

---

**Claude**

JWT부터 바로 들어가지 말고 Spring Security의 로그인 인증 구조를 먼저 이해한 뒤, 그 결과물을 JWT로 바꾸는 순서를 제안했다.

```text
회원가입: 비밀번호 해시 저장
로그인: email/password 검증 후 JWT 발급
인증 요청: JWT 검증 후 SecurityContext에 사용자 저장
권한 확인: SecurityContext의 Authentication을 보고 판단
```

---

**You**

1단계 실습부터 가이드를 줄 수 있을까? 직접 타이핑하면서 배울 수 있게 부탁해.

---

**Claude**

1단계 목표를 회원가입 API 구현과 BCrypt 해시 저장 확인으로 잡았다. `UserRepository`, `RegisterRequest`, `AuthResponse`, `AuthService`, `AuthController`, `SecurityConfig`를 만들도록 안내했다. 핵심은 `passwordEncoder.encode(request.password())`로 비밀번호를 해시 저장하는 것이다.

---

**You**

@NotBlank와 @NotNull은 다른 거야? SecurityConfig.java도 line by line으로 설명해줘.

---

**Claude**

`@NotNull`은 null만 막고, `@NotBlank`는 null, 빈 문자열, 공백 문자열까지 막는다고 설명했다. `SecurityConfig`는 `SecurityFilterChain`을 Bean으로 등록해 HTTP 요청이 Controller에 도달하기 전에 적용할 보안 규칙을 정하는 파일이라고 설명했다.

---

**You**

로그인 api 단계로 넘어가면 되겠지 이제?

---

**Claude**

로그인 API 단계로 넘어가되 아직 JWT 발급이 아니라 email/password를 Spring Security 방식으로 검증하는 것을 목표로 잡았다. `AuthenticationManager`, `CustomUserDetailsService`, `UserRepository.findByEmail`, `LoginRequest`, `AuthService.login` 흐름을 안내했다.

---

**You**

지금 500 에러가 뜨는데 원인 파악 좀 해줄래?

---

**Claude**

`CustomUserDetailsService`의 `UserRepository` 필드가 `final`이 아니라 Lombok `@RequiredArgsConstructor`가 생성자 주입을 만들지 못했고, 로그인 시 `userRepository`가 null이 되어 500이 발생할 가능성이 크다고 파악했다.

```java
// 수정 전
private UserRepository userRepository;

// 수정 후
private final UserRepository userRepository;
```

또한 `AuthenticationException`을 `GlobalExceptionHandler`에서 잡아 잘못된 로그인 정보가 500이 아니라 401 `AUTH_003`으로 내려가도록 수정했다.

---

**You**

그럼 지금 상태는 로그인 요청 시 성공 여부만 응답하고 토큰을 발급하는 절차는 아직 구현이 안 되어 있으니까 로그인 유지는 안 되는 건가?

---

**Claude**

맞다고 답했다. 현재는 email/password 검증만 하고 다음 요청에서 사용자를 인증된 상태로 인정할 증표를 발급하지 않으므로 로그인 유지는 안 된다고 설명했다.

```text
POST /api/v1/auth/login
-> email/password 검증
-> Access Token 발급
-> 클라이언트가 토큰 저장
-> 다음 요청마다 Authorization 헤더에 토큰 첨부
-> 서버가 토큰 검증
-> 인증된 사용자로 처리
```

---

**You**

로그인 성공 시 jwt access token 발급하는 로직과 검증하는 필터 추가 가이드 부탁해.

---

**Claude**

`jjwt` 의존성 추가, `jwt.secret`, `jwt.access-token-expiration-ms` 설정, `LoginResponse`, `JwtTokenProvider`, `JwtAuthenticationFilter`, `SecurityConfig.addFilterBefore(...)` 추가 흐름을 안내했다. `JwtTokenProvider`는 JWT 생성, 검증, Claims 추출을 담당하고, `JwtAuthenticationFilter`는 Bearer 토큰을 검증해 `SecurityContextHolder`에 인증 정보를 넣는다.

---

**You**

JwtTokenProvider 너무 어렵다. 메서드 단위로 설명해줘. Claims가 뭔지 특히 모르겠어.

---

**Claude**

JWT는 `Header.Payload.Signature` 구조이며, Claims는 Payload 안에 들어있는 key-value 정보 묶음이라고 설명했다. `createAccessToken()`은 토큰을 만들고, `validateToken()`은 서명을 검증하며, `getClaims()`는 검증된 Payload를 `Claims` 객체로 반환한다.

---

**You**

doFilterInternal은 무슨 필터 종류인거지. 다른 필터 종류도 있는 건가. 그냥 이 필터 클래스 전체를 리뷰해줘.

---

**Claude**

`doFilterInternal()`은 필터 종류가 아니라 `OncePerRequestFilter`가 제공하는 실제 요청 처리 메서드라고 설명했다. `JwtAuthenticationFilter`는 토큰 추출, 검증, Claims 읽기, Authentication 생성, SecurityContext 저장, 다음 필터 전달을 수행한다.

---

**You**

doFilterInternal은 현재 필터에서 할 일을 정하고 doFilter는 다음 필터로 넘기는 역할인 거야?

---

**Claude**

맞다고 답했다. `doFilterInternal()`은 이 필터가 이번 요청에서 해야 할 일을 작성하는 메서드이고, `filterChain.doFilter(request, response)`는 다음 필터 또는 Controller로 요청을 넘기는 호출이라고 설명했다.

---

**You**

UsernamePasswordAuthenticationFilter, BasicAuthenticationFilter, BearerTokenAuthenticationFilter, LogoutFilter, ExceptionTranslationFilter, AuthorizationFilter도 이런 필터야?

---

**Claude**

Spring Security가 미리 만들어둔 필터 클래스들이고, 각 필터 안에는 `doFilter`, `doFilterInternal`, `attemptAuthentication` 같은 요청 처리 메서드가 자기 역할에 맞게 구현되어 있다고 정리했다. 핵심 관계는 다음과 같다.

```text
JwtAuthenticationFilter는 인증 정보를 만들어 SecurityContext에 넣는다.
AuthorizationFilter는 SecurityContext를 보고 요청을 허용할지 판단한다.
```

## 관련 노트
[[spring-security]] [[jwt]] [[jwt-claims]] [[security-context]] [[once-per-request-filter]] [[spring-security-jwt-auth-flow]]