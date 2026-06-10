---
type: concept
tags: [spring, servlet, filter, security]
updated: 2026-06-10
sources: ["raw/dialogues/2026-06-10-zeroverse-spring-security-jwt-auth-practice.md"]
---

# OncePerRequestFilter

## 한 줄 정의
**OncePerRequestFilter는 Spring Web이 제공하는, 한 HTTP 요청당 한 번만 실행되도록 보장하는 Filter 기반 클래스다.**

직접 `Filter`의 `doFilter`를 구현하는 대신, 하위 클래스는 `doFilterInternal()`에 "이 필터가 할 일"을 작성한다.

## doFilterInternal과 doFilter의 관계
```text
doFilterInternal()
= 현재 필터가 이번 요청에서 해야 할 일을 작성하는 메서드

filterChain.doFilter(request, response)
= 내 필터 처리를 끝내고 다음 필터 또는 Controller로 넘기는 호출
```

JWT 필터에서는 보통 토큰 추출, JWT 검증, Claims 읽기, Authentication 객체 생성, [[security-context]] 저장, 다음 필터 전달을 수행한다.

## Spring Security 내장 필터와의 차이
Spring Security에는 `UsernamePasswordAuthenticationFilter`, `BasicAuthenticationFilter`, `BearerTokenAuthenticationFilter`, `LogoutFilter`, `ExceptionTranslationFilter`, `AuthorizationFilter` 같은 필터가 있다. 모든 내장 필터가 `doFilterInternal()`만 쓰는 것은 아니다. 어떤 필터는 `doFilter`, 어떤 필터는 `attemptAuthentication` 같은 메서드 중심으로 구현되어 있다.

## 관련 페이지
- [[filter]] - Servlet Filter 기본 구조
- [[spring-security]] - SecurityFilterChain과 내장 필터
- [[security-context]] - 필터가 인증 정보를 저장하는 위치
- [[spring-security-jwt-auth-flow]] - ZeroVerse JWT 필터 적용 흐름