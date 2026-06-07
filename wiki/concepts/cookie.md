---
type: concept
tags: [authentication, http, cookie, security]
updated: 2026-06-07
sources: ["raw/notes/인증.md"]
---

# Cookie (쿠키)

## 쿠키란

HTTP는 기본적으로 **무상태(Stateless)** 프로토콜이다 — 요청마다 서버는 누가 보냈는지 모른다.
쿠키는 이 문제를 해결하는 가장 오래된 메커니즘: **브라우저에 저장되는 Key-Value 문자열**.

## 쿠키 인증 흐름

```
1. 클라이언트 → 서버: 로그인 요청
2. 서버 → 클라이언트: 응답 헤더에 Set-Cookie: user_id=42 삽입
3. 브라우저: 쿠키 저장
4. 이후 요청마다 → Cookie: user_id=42 를 헤더에 자동 첨부
```

서버는 헤더에서 쿠키를 읽어 "이 사람 누구인지" 파악.

## 단점

| 문제 | 내용 |
|------|------|
| **보안 취약** | `document.cookie`로 JS에서 접근 가능 → XSS 공격 시 탈취 |
| **조작 가능** | 값 자체를 클라이언트가 보유 → 위변조 위험 |
| **용량 제한** | 총 300개, 도메인당 20개, 쿠키당 4KB |
| **네트워크 부하** | 모든 요청에 자동 첨부 → 쿠키가 클수록 부하 증가 |
| **브라우저 호환성** | 브라우저마다 지원 형태가 다름 |

## 보안 옵션

```http
Set-Cookie: session_id=abc123; HttpOnly; Secure; SameSite=Strict
```

| 옵션 | 효과 | 왜 필요한가 |
|------|------|-------------|
| `HttpOnly` | JS에서 쿠키 접근 불가 | XSS 공격으로 `document.cookie` 탈취 차단 |
| `Secure` | HTTPS에서만 전송 | 평문(HTTP) 전송 중 도청 차단 |
| `SameSite` | 다른 도메인 요청에 쿠키 미첨부 | CSRF 공격 차단 |

## 관련 페이지

[[session-auth]] — 쿠키를 세션 ID 전송에 활용하는 방식
[[jwt]] — 쿠키 대신 Authorization 헤더에 토큰을 담는 방식
[[filter]] — Spring에서 쿠키/헤더 파싱 처리 위치
[[cookie-session-jwt]] — 쿠키 → 세션 → JWT 인증 발전 흐름
