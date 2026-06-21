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

## Spring 구현 세부 (Virtuber 실습)

### DB 저장 방식

```java
// RefreshToken 엔티티 (DB 저장)
@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private String token;
    private LocalDateTime expiresAt;
}
```

- **Access Token**: 서버 저장 없음, 매 요청 헤더에서 서명 검증만
- **Refresh Token**: DB에 저장 → 재발급(`/reissue`) · 로그아웃(`/signout`) 시 DB 조회·삭제

### 로그인 흐름

```
POST /api/v1/auth/signin
→ Access Token + Refresh Token 동시 발급
→ Refresh Token은 refresh_tokens 테이블에 저장
→ 응답 바디에 둘 다 포함
```

### 로그아웃 흐름

```
POST /api/v1/auth/signout (Refresh Token을 body/header로 전달)
→ refreshTokenRepository.deleteByToken(token)
→ DB에서 삭제 완료

프론트: 로컬에 저장된 Access Token + Refresh Token 모두 삭제
```

**중요**: 이미 발급된 Access Token은 만료 전까지 이론상 유효 → MVP에서는 Access Token 수명을 짧게 두는 것이 현실적. 즉시 무효화가 필요하면 **Blacklist** 또는 **Token Version** 설계 추가.

### 구현 함정

| 상황 | 원인 | 해결 |
|---|---|---|
| `signout` 500 오류 | `deleteByToken()`에 `@Transactional` 누락 | 서비스 메서드에 `@Transactional` 추가 |
| `/reissue`, `/signout`이 401 | JWT 필터 `shouldNotFilter()`에서 제외 안 됨 | 해당 경로를 `shouldNotFilter()` 목록에 추가 |
| Refresh Token 있어도 인증 실패 | 만료됐거나 DB에서 삭제됐거나 secret 변경 | Refresh token 존재 ≠ 로그인 상태, 재발급 결과로 판단 |

### Principal에서 userId 추출

`JwtAuthenticationFilter`에서 `UsernamePasswordAuthenticationToken(user.getId(), null, List.of())`로 principal에 userId를 넣으면, 컨트롤러에서:

```java
@GetMapping("/me")
public ResponseEntity<?> getMe(Authentication authentication) {
    Long userId = (Long) authentication.getPrincipal();
    // ...
}
```

클라이언트가 userId를 직접 보내면 안 됨 — 인증된 principal에서 꺼내야 함. → [[security-context]]

## 관련 페이지

- [[jwt]] — Access Token 구조와 검증
- [[cookie-session-jwt]] — 인증 방식 발전 흐름과 JWT 선택 이유
- [[spring-security]] — SecurityFilterChain, `shouldNotFilter()`, `@Transactional`
- [[security-context]] — principal 추출
- [[once-per-request-filter]] — JWT 필터 구현 기반
- 출처: [[virtuber-spring-work-2026-06-21]]
