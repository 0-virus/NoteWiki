---
type: flow
tags: [spring, security, jwt, authentication, zeroverse]
updated: 2026-06-10
sources: ["raw/dialogues/2026-06-10-zeroverse-spring-security-jwt-auth-practice.md"]
---

# Spring Security JWT 인증 흐름

## 한 줄 정의
**Spring Security JWT 인증 흐름은 로그인 시 Access Token을 발급하고, 이후 요청마다 JWT 필터가 토큰을 검증해 SecurityContext를 채우는 구조다.**

## 1. 회원가입
```text
POST /api/v1/auth/register
-> DTO 검증
-> email/nickname 중복 확인
-> PasswordEncoder로 BCrypt 해시
-> User 저장
```

## 2. 로그인 검증
```text
POST /api/v1/auth/login
-> AuthenticationManager.authenticate()
-> CustomUserDetailsService.loadUserByUsername(email)
-> PasswordEncoder.matches(raw, encoded)
-> 인증 성공
```

이 단계는 아직 로그인 유지가 아니다. email/password가 맞는지만 검증한다.

## 3. Access Token 발급
검증 성공 후 [[jwt]] Access Token을 만든다.

```text
subject = userId
email = 사용자 이메일
role = USER/ADMIN
iat = 발급 시간
exp = 만료 시간
signature = 서버 secretKey로 서명
```

이 Payload 정보 묶음이 [[jwt-claims]]다.

## 4. 클라이언트가 토큰 첨부
```http
Authorization: Bearer <access-token>
```

## 5. JWT 필터가 인증 복원
`JwtAuthenticationFilter`는 [[once-per-request-filter]] 기반 커스텀 필터다.

```text
요청
-> Authorization 헤더에서 Bearer 토큰 추출
-> JwtTokenProvider.validateToken()
-> Claims에서 userId, role 추출
-> UsernamePasswordAuthenticationToken 생성
-> [[security-context]]에 저장
-> filterChain.doFilter()
```

## 6. AuthorizationFilter가 인가 판단
[[spring-security]]의 `AuthorizationFilter`는 `SecurityContext`에 인증 정보가 있는지 확인한다.

```text
SecurityContext 있음 -> 인증된 요청으로 판단
SecurityContext 없음 -> 인증 실패
```

그래서 JWT 필터는 `AuthorizationFilter`보다 먼저 인증 정보를 세팅해야 한다.

```java
.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
```

## 관련 페이지
- [[spring-security]] - 보안 필터 체인과 설정
- [[jwt]] - 토큰 구조와 서명
- [[jwt-claims]] - Payload 정보 묶음
- [[security-context]] - 현재 요청 인증 저장소
- [[once-per-request-filter]] - JWT 인증 필터 기반 클래스
- [[session-auth]] - 세션 기반 로그인과 비교
- [[refresh-token]] - Access Token 만료 후 재발급 단계