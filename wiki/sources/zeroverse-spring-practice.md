---
type: source
tags: [spring, spring-security, jpa, project, zeroverse, authentication]
updated: 2026-06-09
sources: ["raw/notes/zeroverse_note_2026-06-09.md"]
---

# ZeroVerse Spring 실습 노트 (2026-06-01 ~ 06-09)

## 원본 정보

- **경로**: `raw/notes/zeroverse_note_2026-06-09.md`
- **프로젝트 소스코드**: `C:\Users\PC\Desktop\zeroverse-server`
- **기간**: 2026-06-01 (요구사항 작성) ~ 2026-06-09 (Spring Security 구현)

## 컨텍스트

ZeroVerse는 개인 블로그 플랫폼 프로젝트 ("유니버스" 이웃 관계 포함). AI를 **지시가 아닌 조언** 용도로 활용하며 학습하는 방식으로 진행 중. 나중에 다른 프로젝트 수행 시 참고할 만한 패턴과 개념을 남기기 위해 이 노트를 작성.

**현재 구현 상태 (2026-06-09)**:
- ✅ 요구사항 명세, 프로젝트 세팅
- ✅ JPA 엔티티 설계 완료
- ✅ 공통 응답 / 예외 작성
- ✅ Spring Security 회원가입/로그인 요청-응답 (테스트 완료)
- ⏳ JWT 토큰 연동 예정

## 프로젝트 기술 스택

Spring Boot 3.x · Java 21 · Spring Security + JWT · Spring Data JPA · QueryDSL · MySQL 8.x · SpringDoc OpenAPI

## 핵심 개념

### JPA 엔티티 설계

- **기본형 타입 금지 → 래퍼 클래스**: `int` 대신 `Integer`, `long` 대신 `Long` — null 불가 문제
- **BaseEntity 패턴**: `@MappedSuperclass` + `@EnableJpaAuditing` → `createdAt`/`updatedAt` 자동화

### Spring Security

- `SecurityFilterChain` 빈 등록으로 HTTP 보안 규칙 설정
- CSRF 비활성화 (JWT Stateless 방식에선 불필요)
- `SessionCreationPolicy.STATELESS` — 서버에 세션 없음
- `authorizeHttpRequests` — 공개 API vs 인증 필요 API 분리
- `BCryptPasswordEncoder` — 비밀번호 BCrypt 해시 저장

### Bean Validation

- `@Valid` 붙은 Controller 파라미터 → Spring이 DTO 규칙 자동 검증
- `@NotBlank` vs `@NotNull` 차이: String엔 `@NotBlank`, LocalDate/Object엔 `@NotNull`

## 회원가입 흐름 요약

```
SecurityConfig (permitAll 허용)
  → Controller (@Valid 트리거)
  → DTO (검증 규칙 선언)
  → Service (BCrypt 해싱)
  → Repository (DB 저장)
```

## 인제스트 산출물

- 신설 개념: [[jpa-auditing]], [[spring-security]], [[bean-validation]]
- 신설 흐름: [[spring-security-register-flow]]
- 갱신: [[jpa-entity-mapping]] (래퍼 클래스 섹션), [[spring-annotations]] (Security/Auditing 섹션)
