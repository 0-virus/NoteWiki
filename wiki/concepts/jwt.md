---
type: concept
tags: [authentication, jwt, token, stateless, security, spring]
updated: 2026-06-10
sources: ["raw/notes/인증.md", "raw/dialogues/2026-06-10-zeroverse-spring-security-jwt-auth-practice.md"]
---

# JWT (JSON Web Token)

## 한 줄 정의

**인증 정보를 서명된 JSON 토큰에 담아 주고받는 방식.** 서버가 상태를 저장하지 않아도 된다.

## 구조

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9      ← Header
.eyJ1c2VyX2lkIjo0Miwicm9sZSI6ImFkbWluIn0  ← Payload
.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV       ← Signature
```

| 부분 | 내용 | 비고 |
|------|------|------|
| **Header** | 타입(JWT) + 해시 알고리즘 종류(HS256 등) | |
| **Payload** | user_id, role, 만료 시간(exp) 등 | 암호화 X, Base64만 → 민감 정보 넣지 말 것 |
| **Signature** | Header + Payload를 개인키로 서명한 전자서명 | 위변조 감지용 |

## 직렬화 (Serialization)

객체를 토큰에 실으려면 **전송 가능한 문자열로 변환**해야 한다.

```
{ user_id: 42, role: "admin" }    ← 메모리 객체
→ JSON 직렬화
→ '{"user_id":42,"role":"admin"}'
→ Base64URL 인코딩
→ 'eyJ1c2VyX2lkIjo0Mn0'          ← 토큰에 삽입
```

Base64URL: 일반 Base64에서 `+`→`-`, `/`→`_` 치환해 URL에서 오류 없이 사용.
→ 자세히: [[serialization]]

## 왜 JWT는 신뢰할 수 있나

```
발급: A(Header) + B(Payload) + C(Signature)

공격자가 B를 B'로 조작 후 전송:
  A + B' + C

서버 검증:
  A + B' → 서버 키로 다시 서명 → C' 생성
  C ≠ C' → 위변조 감지!
```

**핵심**: Signature는 서버의 개인키로 만들어졌기 때문에, Payload를 바꾸면 서명이 맞지 않는다.
JWT는 **정보 보호(암호화)가 아니라 위변조 방지(서명)** 가 목적.

## 인증 흐름

```
1. 로그인 요청
2. 서버: Access Token + Refresh Token 발급 (서버엔 아무것도 저장 안 함)
3. 클라이언트: Local Storage 또는 쿠키에 토큰 저장
4. 이후 요청: Authorization: Bearer <access_token> 헤더에 첨부
5. 서버: 서명 검증 → Payload에서 user_id, role 꺼내서 사용
6. Access Token 만료 시: Refresh Token으로 재발급
```

## Stateless — 왜 중요한가

세션 방식과 달리 서버에 저장되는 것이 없다.

| | Session (Stateful) | JWT (Stateless) |
|-|---|---|
| 인증 근거 | 서버 메모리의 세션 테이블 | 토큰 자체 |
| 서버 재시작 | 세션 날아감 → 로그아웃 | 토큰은 클라이언트에 있음 |
| 서버 2대로 확장 | 세션 공유 문제 발생 | 어느 서버든 서명만 검증하면 됨 |

→ **수평 확장(Scale-out)** 에 유리한 이유가 바로 Stateless.

## 장단점

**장점**
- 별도 세션 저장소 불필요
- Stateless → 서버 확장 용이
- 모바일에서도 잘 동작 (쿠키 의존 안 함)

**단점**
- 토큰 길이가 길어 네트워크 부하 증가
- Payload는 암호화되지 않음 → 비밀번호 등 민감 정보 담지 말 것
- 토큰 탈취 시 만료까지 막을 방법이 없음 → [[refresh-token]]으로 피해 범위 축소

## Spring 프로젝트에서 JWT 구현 위치

```
HTTP 요청
  ↓
[Filter]          ← JWT 토큰 추출 + 서명 검증 + SecurityContext 주입
  ↓
DispatcherServlet
  ↓
[Interceptor]     ← 역할(role) 기반 권한 검사 (또는 Spring Security에서 처리)
  ↓
Controller
```

→ [[filter]] / [[interceptor]] / [[dispatcher-servlet]]

## 관련 페이지

[[refresh-token]] — Access Token 재발급 + Rotation 메커니즘
[[serialization]] — 객체를 토큰에 담기 위한 직렬화
[[session-auth]] — JWT가 해결하는 Stateful 방식의 문제
[[cookie]] — JWT 전달 방식 (쿠키 vs Authorization 헤더)
[[filter]] — Spring에서 JWT 검증 위치
[[interceptor]] — Spring에서 권한 검사 위치
[[cookie-session-jwt]] — 인증 방식 발전 흐름

## Spring Security 실습에서 Claims를 읽는 위치

ZeroVerse JWT 실습에서는 `JwtTokenProvider`가 Access Token을 만들고 검증하며, Payload를 [[jwt-claims]]로 읽는다.

```java
getClaims(token).getSubject();          // userId
getClaims(token).get("email", String.class);
getClaims(token).get("role", String.class);
```

Claims에서 꺼낸 `userId`, `role`은 [[security-context]]에 저장할 `Authentication` 객체를 만드는 데 쓰인다. 전체 요청 인증 흐름은 [[spring-security-jwt-auth-flow]]에 정리한다.
