---
type: source
tags: [authentication, cookie, session, jwt, refresh-token, security]
updated: 2026-06-07
sources: ["raw/notes/인증.md"]
---

# 인증 방식 필기

> 원본: `raw/notes/인증.md`
> 저장 이유: 사이드 프로젝트 보안 파트(JWT) 구현 전, 직접 쓸 기술의 원리를 정확히 파악하기 위해

## 컨텍스트

사이드 프로젝트에서 JWT를 사용한 인증 구현 예정. Cookie/Session 방식과의 차이, JWT 구조와 신뢰성 근거, Refresh Token 메커니즘까지 한 번에 정리한 필기.

## Key Claims

- 쿠키: 클라이언트에 저장, JS로 접근 가능 → HttpOnly로 방어
- 세션: 서버 메모리에 저장 → Stateful, 서버 부하 문제
- JWT: 토큰 자체에 정보 포함 → Stateless, 서버 확장 용이
- JWT 신뢰성: Signature를 통한 위변조 감지 (Payload 조작 시 서명 불일치)
- Refresh Token: 짧은 수명의 Access Token 재발급 목적

## 대화에서 보완된 내용

원본에 없던 내용이 이 대화에서 추가됨:
- 세션 IP 바인딩의 원리와 한계 (모바일/NAT/기업 내부망 문제)
- Stateless의 정확한 의미 (서버 메모리에 상태를 저장하지 않음)
- 직렬화(Serialization)의 의미 (객체 → 전송 가능한 문자열)
- Refresh Token Rotation (재사용 감지로 탈취 탐지)

## 관련 개념

[[cookie]] · [[session-auth]] · [[jwt]] · [[refresh-token]] · [[serialization]] · [[cookie-session-jwt]]
