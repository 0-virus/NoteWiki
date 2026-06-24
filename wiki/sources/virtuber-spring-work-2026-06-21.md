---
type: source
tags: [spring, jwt, refresh-token, spring-security, jpa, n-plus-1, swagger, docker]
updated: 2026-06-21
sources: ["raw/dialogues/2026-06-21 Spring 프로젝트 작업 내용과 알게 된 사실.md"]
---

# Virtuber Spring 프로젝트 작업 (2026-06-21)

> 원본: `raw/dialogues/2026-06-21 Spring 프로젝트 작업 내용과 알게 된 사실.md`
> Codex와의 작업 대화에서 발췌한 작업 기록 및 개념 정리.

## 맥락 (인터뷰 답변)

- **저장 이유**: 작업 기록 + 이후 개념 복습
- **현재 연결**: JWT 인증 완료 + 계좌 관련 기능 구현이 이번 스프린트 목표
- **위키 활용 방향**: JWT·Refresh Token 보완, N+1 문제 실사례 등록, 관련 개념 가볍게 등록해 두고 나중에 강화

## 오늘의 작업 (커밋 기록)

| 커밋 | 내용 |
|---|---|
| `004b490` | feat: implement JWT auth setup |
| `0c7aba5` | feat: add refresh token flow |
| `0e1eab1` | Merge PR #6: refresh-token |
| `60712b4` | feat: 내 계좌 조회 API 구현 |

### 구현 요약

1. **JWT 인증 (PR #5)** — AuthController, JwtAuthenticationFilter, JwtTokenProvider, SecurityConfig JWT 필터 등록, Swagger bearer auth
2. **Refresh Token (PR #6)** — RefreshToken 엔티티, reissue/signout 엔드포인트, 로그아웃 시 DB 토큰 삭제
3. **계좌 조회 API (PR #7)** — `/api/v1/accounts/me`, JWT principal에서 userId 추출, 보유 종목 N+1 → fetch join 해결

## 핵심 takeaway 정리

### @GeneratedValue와 @Id

`@GeneratedValue`는 JPA/DB가 id를 자동 생성하게 한다. `GenerationType.IDENTITY`면 DB의 auto increment 값이 저장 후 엔티티에 반영된다. **새 엔티티 save 시 id를 직접 넣으면 안 된다** — JPA가 새 엔티티 여부를 id==null로 판단하기 때문에 임의 값을 넣으면 merge로 오동작할 수 있다.

→ [[jpa-entity-mapping]]

### JWT 필터에서 filterChain.doFilter 누락

`doFilterInternal()` 안에서 `filterChain.doFilter(request, response)`를 호출하지 않으면 다음 필터/컨트롤러/정적 리소스로 요청이 전달되지 않는다. Swagger HTML·JS가 응답되지 않아 빈 화면이 되는 현상의 원인이었다.

→ [[once-per-request-filter]]

### JWT token subject와 조회 방식

`JwtTokenProvider`에서 토큰 subject에 `user.id(Long)`를 넣었는데, 필터에서 `findByUserId(subject)`(loginId처럼)로 조회하면 조회 실패 → 403. `findById(Long.valueOf(subject))`로 조회해야 한다.

→ [[jwt]]

### Swagger + Spring Security 설정

- 경로 허용: `.requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()`
- JWT Authorize 버튼: `OpenAPI` 빈에 `SecurityScheme` (bearer auth) 등록
- Swagger Authorize에는 access token만 넣음 (refresh token은 해당 없음)

→ [[swagger-oas]]

### Refresh Token 구현 포인트

- DB(`refresh_tokens` 테이블)에 저장 → 재발급·로그아웃 모두 여기서 처리
- `signout`에서 `deleteByToken()` 호출 시 `@Transactional` 필수 (없으면 500)
- `/api/v1/auth/signout`, `/api/v1/auth/reissue`는 공개 API라면 `shouldNotFilter()`에도 추가
- 프론트는 로그아웃 성공 시 로컬 access token + refresh token **둘 다** 삭제해야 함
- Refresh token이 DB에 있다고 반드시 로그인 상태가 아님 (만료·secret 변경·DB 삭제 가능)

→ [[refresh-token]]

### N+1 문제 — Virtuber Holding.stock 사례

`Holding.stock`이 LAZY이므로 계좌 조회 시 보유 종목 수만큼 Stock 추가 SELECT 발생. 해결: `HoldingRepository`에 fetch join 쿼리 추가.

```java
@Query("select h from Holding h join fetch h.stock where h.account.id = :accountId")
List<Holding> findAllByAccountIdWithStock(@Param("accountId") Long accountId);
```

→ [[n-plus-1-problem]] · [[jpql]]

### @Query와 파생 메서드 규칙

- `@Query`가 붙으면 메서드명은 무시, `@Query` 내용이 쿼리를 결정
- `@Query` 없으면 Spring Data JPA가 메서드명으로 쿼리 파생 (`findAllByAccount_Id`의 `_`는 중첩 속성 구분)
- 메서드명이 엔티티 구조와 안 맞으면 **애플리케이션 시작 시** `No property ... found` 오류 발생

→ [[spring-data-jpa]]

### JWT principal 추출

`UsernamePasswordAuthenticationToken(user.getId(), null, List.of())`로 principal에 userId(Long)를 넣으면, 컨트롤러에서 `(Long) authentication.getPrincipal()`로 꺼낼 수 있다. 클라이언트가 userId를 직접 보내면 안 된다.

→ [[security-context]] · [[spring-security]]

### 인증 실패 응답 처리 (미구현 — 설계 방향)

인증 실패는 컨트롤러 전 Security Filter Chain에서 발생 → `GlobalExceptionHandler`로 잡히지 않음. 처리 위치:
- **인증 실패(401)**: `AuthenticationEntryPoint`
- **권한 부족(403)**: `AccessDeniedHandler`
- **잘못된 JWT**: `JwtAuthenticationFilter` 내부에서 catch → JSON 응답 직접 작성

MVP에서는 짧은 access token 수명 + 프론트 토큰 삭제로 대응. 즉시 무효화는 blacklist/token version 추가 설계 필요.

→ [[spring-security]]

### Docker MySQL 트러블슈팅 메모

| 증상 | 원인 | 해결 |
|---|---|---|
| `Access denied for user 'root'@'localhost'` | application.yaml 계정/PW != 실제 MySQL | 포트·계정 일치 확인 |
| Docker `ports are not available` | 3306을 로컬 mysqld가 선점 | `Stop-Service mysqld` 후 `docker compose up -d` |
| 컨테이너 이름 충돌 | 같은 이름 컨테이너 이미 존재 | `docker start <name>` 재사용 or `docker rm` 후 재생성 |

## 갱신된 위키 페이지

- [[n-plus-1-problem]] — Virtuber Holding.stock 실사례 추가
- [[refresh-token]] — DB 저장·@Transactional·로그아웃 구현 세부 추가
- [[jpql]] — @Query fetch join 예시 추가
- [[spring-data-jpa]] — @Query vs 파생 메서드 구분 추가
- [[once-per-request-filter]] — doFilter 누락 함정 추가
- [[swagger-oas]] — Spring Security + Bearer auth 설정 추가
- [[spring-security]] — AuthenticationEntryPoint/AccessDeniedHandler 섹션 추가
