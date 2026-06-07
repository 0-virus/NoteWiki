---
type: flow
tags: [authentication, cookie, session, jwt, security, spring]
updated: 2026-06-07
sources: ["raw/notes/인증.md"]
---

# 쿠키 → 세션 → JWT 인증 발전 흐름

각 방식이 **이전 방식의 어떤 문제를 해결하기 위해 등장했는지** 를 중심으로 이해하면 된다.

## 1단계: Cookie 인증

**문제**: HTTP는 무상태 → 서버가 사용자를 식별할 방법이 없음
**해결**: 쿠키에 사용자 정보를 직접 담아 매 요청에 첨부

```
Set-Cookie: user_id=42; role=admin
```

**새 문제**: 클라이언트에 정보 노출 → XSS로 탈취 가능, 직접 조작 가능
→ [[cookie]]

---

## 2단계: Session 인증

**문제**: 쿠키에 민감 정보 직접 노출
**해결**: 정보는 서버에, 클라이언트엔 열쇠(Session ID)만 발급

```
쿠키:        session_id=abc123   ← 의미 없는 랜덤 문자열
서버 메모리: abc123 → { user_id: 42, role: "admin" }
```

**새 문제**:
- Stateful → 서버 메모리 소비, 요청마다 조회 오버헤드
- 서버 확장 시 세션 공유 문제 (세션 서버 or Redis 필요)
- Session ID 탈취 시 무방비 (IP 바인딩으로 일부 방어, 모바일 환경 등 한계)

→ [[session-auth]]

---

## 3단계: Token (JWT) 인증

**문제**: 세션의 Stateful 특성 → 확장성 한계
**해결**: 정보를 서명된 토큰에 담아 클라이언트에게 → 서버는 아무것도 저장 안 함

```
Authorization: Bearer eyJhbGci...
서버: 서명 검증 → Payload에서 user_id, role 꺼내서 사용
```

**핵심 변화**: "서버가 기억" → "토큰이 증명"

→ [[jwt]]

---

## 남은 문제와 해결책

JWT도 탈취 취약점은 존재. 완화 전략:

| 문제 | 해결 |
|------|------|
| Access Token 탈취 | 짧은 만료 시간 (5~15분) |
| 계속 로그인해야 하는 불편 | Refresh Token |
| Refresh Token 탈취 | Refresh Token Rotation |
| Payload 노출 | 민감 정보 배제 (서명이 목적, 암호화 아님) |

→ [[refresh-token]]

---

## Spring 프로젝트에서 JWT 구현 위치

```
HTTP 요청
  ↓
[Filter]            ← JWT 토큰 추출 + 서명 검증 + SecurityContext 주입
  ↓
DispatcherServlet
  ↓
[Interceptor]       ← 역할(role) 기반 권한 검사
  ↓
Controller
  ↓
Service → Repository → DB
```

- [[filter]]: DispatcherServlet 진입 전 → 인증 실패 시 즉시 401 반환
- [[interceptor]]: Controller 진입 전 → 권한 없을 시 403 반환
- [[dispatcher-servlet]]: 그 사이를 이어주는 Front Controller

---

## 관련 페이지

[[cookie]] — 1단계: 쿠키 직접 인증
[[session-auth]] — 2단계: 세션 기반 Stateful 인증
[[jwt]] — 3단계: 토큰 기반 Stateless 인증
[[refresh-token]] — JWT의 보완 메커니즘
[[serialization]] — JWT 토큰 생성의 기반 개념
[[filter]] — Spring JWT 검증 위치
[[interceptor]] — Spring 권한 검사 위치
[[dispatcher-servlet]] — 요청 처리 파이프라인 중심
