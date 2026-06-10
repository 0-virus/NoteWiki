---
type: concept
tags: [spring, security, authentication, context]
updated: 2026-06-10
sources: ["raw/dialogues/2026-06-10-zeroverse-spring-security-jwt-auth-practice.md"]
---

# SecurityContext

## 한 줄 정의
**SecurityContext는 Spring Security가 현재 요청의 인증 정보를 보관하는 자리다.**

Controller나 인가 필터가 "지금 요청한 사용자가 누구인가"를 판단할 때 기준으로 삼는 정보가 이곳에 들어간다. 실제 접근은 보통 `SecurityContextHolder`를 통해 한다.

## JWT 필터에서 하는 일
```java
UsernamePasswordAuthenticationToken authentication =
        new UsernamePasswordAuthenticationToken(
                userId,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_" + role))
        );

SecurityContextHolder.getContext().setAuthentication(authentication);
```

이 코드는 "이번 요청은 userId 사용자의 인증된 요청이며, 권한은 ROLE_USER다"라는 정보를 현재 요청 컨텍스트에 저장한다.

## 왜 필터 순서가 중요한가
[[spring-security]]의 `AuthorizationFilter`는 `.authenticated()` 같은 규칙을 적용할 때 `SecurityContext`를 본다.

```text
JWT 필터가 먼저 실행됨
-> SecurityContext에 Authentication 저장
-> AuthorizationFilter가 인증됨으로 판단
-> Controller 진입
```

반대로 JWT 필터가 너무 늦게 실행되면 `AuthorizationFilter`가 먼저 "인증 정보 없음"으로 판단해서 401/403이 될 수 있다.

## 관련 페이지
- [[spring-security]] - 인증/인가 필터 체인
- [[jwt]] - 토큰 기반 stateless 인증
- [[once-per-request-filter]] - JWT 필터 구현 기반
- [[spring-security-jwt-auth-flow]] - 로그인 후 요청 인증 흐름