## 노트 요약

블로그 프로젝트 "ZeroVerse"를 수행하는 중 Spring 실습 노트를 적은 자료. 인제스트 시 "C:\Users\PC\Desktop\zeroverse-server\"의 요구사항 분석과 기본적인 폴더 구조를 읽고 진행할 것.

#### [2026-06-01] 요구사항 명세 작성 및 수정

#### [2026-06-02] 프로젝트 기본 세팅

#### [2026-06-04] 엔티티 설계

##### jpa 엔티티에서는 기본형 타입 x 래퍼 클래스를 써야 함

Why? 기본형은 null이 불가능하기 때문!

##### CreatedAt, UpdatedAt 설정하기

1. Application 클래스에 @EnableJpaAuditing 추가
   ```java
   @SpringBootApplication
   @EnableJpaAuditing
   public class ExampleApplication { ... }
   ```
2. 엔티티 필드에 어노테이션 추가

   ```java
   @EntityListeners(AuditingEntityListener.class)
   @Entity
   public class User {
       @CreatedDate
       @Column(nullable = false, updatable = false)
       private LocalDateTime CreatedAt;

       @LastModifiedDate
       @Column(nullable = false)
       private LocalDateTime updatedAt;
   }
   ```

   cf. 여러 엔티티에 반복되는 필드는 다른 엔티티로 분리해서 상속하면 편함!

#### [2026-06-07] 엔티티 설계 완료

#### [2026-06-07] 공통 응답 / 예외 작성

#### [2026-06-09] Spring Security 구현 시작

- domain/user/repository/UserRepository.java
  JpaRepository<User, Long> -> User 엔티티를 저장/조회하는 리포지토리, PK의 타입은 Long이다!

- domain/auth/dto/RegisterRequest.java
  - @Vaild가 붙은 Controller의 파라미터로 해당 DTO가 들어오면, Spring이 자동으로 규칙에 따라 검증한다.
  - @NotBlank랑 @NotNull이랑 다른 거임? -> 다르다!
    - String 같은 경우 빈 칸과 null이 다름! -> 빈 칸 자체를 막고 싶다: @NotBlank
    - LocalDate, Object 같은 경우 '빈 칸'이라는 개념이 없음 -> @NotNull을 사용!

- domain/auth/service/AuthService.java
  - user.setPassword(passwordEncoder.encode(request.password())); -> 비밀번호를 그대로 저장하지 않고 BCrypt 해시로 바꿔서 저장.

- config/SecurityConfig/SecurityConfig.java
  - @Bean -> "이 메서드가 반환하는 객체를 Spring 컨테이너에 등록한다"
    - Security Filter Chain을 http 보안 규칙으로 써라!
  - @EnableWebSecurity -> Spring Security의 웹 보안 기능을 활성화
  - HttpSecurity -> Spring Security의 HTTP 보안 설정 도구
    - Spring이 자동으로 넣어줌. 우리는 설정 추가
  - csrf(csrf -> csrf.disable()) -> CSRF 보호를 끔(세션 로그인에서 쓰는거니까)
  - sessionManagement(...) -> 세션을 사용하지 않음(STATELESS)
  - authorizeHttpRequests() -> 어떤 요청을 허용할지 정함
    - requestMatchers(...).permitAll() -> 해당 API는 누구나 호출 가능하게 열어둠
    - anyRequest().authenticated() -> 나머지는 전부 인증이 필요함
    - build() -> 설정 내용을 SecurityFilterChain 객체로 만듦

- 회원가입 로직
  - Controller는 요청을 받는다.
  - DTO는 요청값을 검증한다.
  - Service는 비즈니스 로직을 처리한다.
  - Repository는 DB와 대화한다.
  - PasswordEncoder는 비밀번호를 해시한다.
  - SecurityConfig는 어떤 API를 열고 막을지 정한다.
