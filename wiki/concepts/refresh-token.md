---
type: concept
tags: [authentication, jwt, refresh-token, security, rotation]
updated: 2026-06-07
sources: ["raw/notes/인증.md"]
---

# Refresh Token

## 왜 필요한가

[[jwt]] Access Token 탈취 시 만료 전까지 막을 방법이 없다.
→ 해결책: **Access Token 수명을 짧게** 만들고, **Refresh Token으로 재발급**.

하지만 수명이 짧으면 사용자가 자꾸 로그인해야 함.
→ Refresh Token이 그 불편함을 대신 처리.

## 이중 토큰 구조

```
로그인 성공 시 두 토큰 동시 발급:
- Access Token:  짧은 수명 (5~15분), API 요청마다 사용
- Refresh Token: 긴 수명 (수일~수주), 오직 Access Token 재발급에만 사용
```

**핵심**: Refresh Token은 적게 전송할수록 탈취 기회 감소.
Access Token은 매 요청마다 전송되지만, Refresh Token은 Access Token이 만료될 때만 전송.

## Access Token 만료 흐름

```
1. 클라이언트: 만료된 Access Token으로 요청
2. 서버: 401 Unauthorized 반환
3. 클라이언트: Refresh Token을 서버에 전송
4. 서버: DB에 저장된 Refresh Token과 비교 → 일치 시 새 Access Token 발급
5. 클라이언트: 새 Access Token으로 재요청
```

## Refresh Token Rotation (탈취 감지)

Refresh Token을 **한 번 쓰면 폐기하고 새로 발급**하는 메커니즘.

```
정상 흐름:
  클라이언트 → Refresh Token A 사용
  서버: A 폐기 → 새 Refresh Token B 발급

공격자가 A를 탈취했다면:
  공격자 → 이미 사용된 A로 요청
  서버: "A는 이미 사용됨 → 재사용 감지!"
       → A, B 전부 무효화 → 강제 로그아웃
```

이미 사용된 토큰이 다시 들어오면 **탈취 의심** → 전체 세션 무효화.

## 보안 현실

| 상황 | 결과 |
|------|------|
| Access Token만 탈취 | 만료(5~15분)까지만 위험 |
| Refresh Token 탈취, 아직 미사용 | Rotation으로 감지 → 정상 사용자 로그아웃 |
| Refresh Token 탈취 후 공격자가 먼저 사용 | 정상 사용자가 재사용 시도 → Rotation이 전체 무효화 |
| Rotation 없이 탈취 | 긴 수명 동안 공격자가 계속 사용 가능 |

JWT는 탈취를 **원천 차단하는 것이 아니라 피해 범위를 최소화**하는 설계.

## 관련 페이지

[[jwt]] — Access Token 구조와 검증
[[cookie-session-jwt]] — 인증 방식 발전 흐름과 JWT 선택 이유
