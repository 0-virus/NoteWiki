---
type: flow
tags: [spring-security, authentication, spring, flow, register, zeroverse]
updated: 2026-06-09
sources: ["raw/notes/zeroverse_note_2026-06-09.md"]
---

# Spring Security 회원가입 흐름

## 한 줄 정의

**HTTP 요청이 Security Filter 통과 → Controller → DTO 검증 → Service → DB 저장까지 이어지는 회원가입 파이프라인.**
각 부품이 딱 하나의 책임만 갖는다.

## 전체 흐름

```
POST /api/v1/auth/register  (JSON body: email, password, nickname, ...)
  ↓
[Security Filter Chain]
  └─ requestMatchers("/api/v1/auth/**").permitAll()
     → 인증 없이 통과 (로그인 전이라 당연히 토큰 없음)
  ↓
AuthController
  └─ @RequestBody @Valid RegisterRequest request
     → Spring이 DTO 필드 규칙 자동 검증
     → 실패 시 400 Bad Request 자동 반환, Service까지 안 감
  ↓
AuthService
  └─ 이메일 중복 검사 (userRepository.existsByEmail)
  └─ passwordEncoder.encode(request.password())  → BCrypt 해시로 변환
  └─ User 엔티티 생성 후 userRepository.save(user)
  └─ (선택) 기본 Blog 자동 생성
  ↓
UserRepository
  └─ JpaRepository<User, Long>.save() → INSERT 실행
  ↓
DB (users 테이블)
  └─ createdAt, updatedAt → BaseEntity @CreatedDate/@LastModifiedDate 자동 주입
```

## 각 부품의 역할

| 부품 | 파일 | 책임 |
|---|---|---|
| **SecurityConfig** | `config/SecurityConfig/SecurityConfig.java` | 이 엔드포인트를 허용/차단 결정 |
| **AuthController** | `domain/auth/controller/AuthController.java` | 요청 수신, @Valid 트리거 |
| **RegisterRequest** (DTO) | `domain/auth/dto/RegisterRequest.java` | 입력값 검증 규칙 선언 |
| **AuthService** | `domain/auth/service/AuthService.java` | 중복 검사, 해싱, 저장 비즈니스 로직 |
| **UserRepository** | `domain/user/repository/UserRepository.java` | DB 접근 (JpaRepository) |
| **PasswordEncoder** | SecurityConfig `@Bean` | BCrypt 해싱 도구 |
| **BaseEntity** | `common/entity/BaseEntity.java` | createdAt/updatedAt 자동 주입 |

> SecurityConfig는 "문지기", Controller는 "접수창구", DTO는 "서류 검토", Service는 "처리",
> Repository는 "저장소", PasswordEncoder는 "암호화 도구" 역할이다.

## 코드 연결 추적

```java
// 1. SecurityConfig — 회원가입 엔드포인트를 열어둠
.requestMatchers("/api/v1/auth/**").permitAll()

// 2. AuthController — 요청을 받고 @Valid로 검증 트리거
@PostMapping("/register")
public ResponseEntity<?> register(@RequestBody @Valid RegisterRequest request) {
    return ResponseEntity.ok(authService.register(request));
}

// 3. RegisterRequest DTO — 검증 규칙 선언
public record RegisterRequest(
    @NotBlank @Email String email,
    @NotBlank @Size(min = 8) String password,
    @NotBlank @Size(min = 2, max = 20) String nickname,
    @NotBlank String name,
    @NotNull LocalDate birthDate
) {}

// 4. AuthService — 비즈니스 로직
user.setPassword(passwordEncoder.encode(request.password()));
userRepository.save(user);
```

## 다음 단계 — JWT 연동 후 로그인 흐름

```
POST /api/v1/auth/login
  ↓
[Security Filter Chain] → permitAll() 통과
  ↓
AuthController → AuthService
  └─ userRepository.findByEmail 조회
  └─ passwordEncoder.matches(입력 비밀번호, DB 해시) 검증
  └─ JWT Access Token + Refresh Token 발급
  ↓
응답: { accessToken, refreshToken }
```

→ [[jwt]] · [[refresh-token]] 참고.

## 관련 페이지

- [[spring-security]] — SecurityFilterChain, CSRF, STATELESS 상세
- [[bean-validation]] — @Valid, @NotBlank/@NotNull 상세
- [[jpa-auditing]] — BaseEntity 패턴, createdAt/updatedAt 자동화
- [[three-tier-architecture]] — Controller/Service/Repository 계층 원칙
- [[jwt]] — 로그인 흐름 추가 시 연동
- [[refresh-token]] — JWT 연동 후 Refresh Token 패턴
- 출처: [[zeroverse-spring-practice]]
