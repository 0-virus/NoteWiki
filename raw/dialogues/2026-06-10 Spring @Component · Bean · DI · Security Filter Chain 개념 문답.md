---
source_type: "claude-conversation"
title: "Spring @Component · Bean · DI · Security Filter Chain 개념 문답"
url: ""
clipped: 2026-06-10
description: "ZeroVerse 프로젝트 개발 중 Spring 핵심 어노테이션(@Component·@Autowired·Lombok)과 Security 필터 체인(addFilterBefore·STATELESS) 원리를 탐구한 학습 대화"
status: "raw"
tags:
  - "clippings/claude"
---
> [!info] 원본 대화
> Claude Code 세션 — 공유 URL 없음

## 🗂 컨텍스트
ZeroVerse Spring 백엔드 프로젝트 개발 중, Spring 핵심 개념(@Component·Bean·DI·Lombok·Security 필터 체인)의 원리를 처음부터 탐구한 학습 대화.

## 💬 대화 본문

**You**

spring @Component 어노테이션 의미

---

**Claude**

`@Component`는 Spring이 해당 클래스를 **Bean으로 자동 등록**하도록 지시하는 어노테이션입니다.

## 동작 원리

Spring 애플리케이션이 시작될 때 `@ComponentScan`이 지정된 패키지를 탐색하여 `@Component`가 붙은 클래스를 찾아 **Spring IoC 컨테이너**에 Bean으로 등록합니다.

```java
@Component
public class MyService {
    // Spring이 이 클래스의 인스턴스를 자동으로 생성하고 관리
}
```

## 파생 어노테이션

`@Component`를 기반으로 역할에 따라 더 구체적인 어노테이션이 있습니다.

| 어노테이션 | 용도 |
|---|---|
| `@Component` | 일반 컴포넌트 (범용) |
| `@Service` | 비즈니스 로직 레이어 |
| `@Repository` | 데이터 접근 레이어 (DAO) |
| `@Controller` | Web MVC 컨트롤러 |

기능적으로는 모두 `@Component`와 동일하게 Bean 등록을 하지만, **코드의 역할을 명확히 표현**하고 일부는 추가 기능(예: `@Repository`는 예외 변환)을 제공합니다.

## Bean 등록 방식 비교

```java
// 자동 등록 (@Component 계열)
@Service
public class AuthService { ... }

// 수동 등록 (@Bean)
@Configuration
public class AppConfig {
    @Bean
    public AuthService authService() {
        return new AuthService();
    }
}
```

---

**You**

자동 등록이랑 수동 등록이 차이가 뭔지 잘 모르겠어. 수동 등록은 메서드 하나하나 직접 Bean으로 등록한다는 거야?

---

**Claude**

맞습니다. 핵심 차이는 **누가 인스턴스 생성을 제어하느냐**입니다.

## 자동 등록 (`@Component` 계열)

Spring이 클래스를 스캔해서 알아서 인스턴스 생성.

```java
@Service
public class AuthService {
    // Spring이 "AuthService 있네, 내가 만들어서 관리할게"
}
```

## 수동 등록 (`@Bean`)

개발자가 직접 인스턴스를 만드는 코드를 작성하고, Spring은 그 결과물만 가져다 관리.

```java
@Configuration
public class AppConfig {

    @Bean
    public AuthService authService() {
        return new AuthService();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // 외부 라이브러리 클래스
    }
}
```

## 언제 수동 등록을 쓰나?

**외부 라이브러리 클래스**를 Bean으로 등록할 때 주로 씁니다. `BCryptPasswordEncoder`는 라이브러리 코드라서 소스를 수정할 수 없어 `@Component`를 붙일 수 없으니 `@Bean`으로 직접 등록합니다.

| | 자동 (`@Component`) | 수동 (`@Bean`) |
|---|---|---|
| 대상 | 내가 만든 클래스 | 외부 라이브러리 클래스 |
| 제어권 | Spring | 개발자 |
| 코드량 | 적음 | 많음 |

---

**You**

bean이라는 게 정확히 뭘 의미하는 건데?

---

**Claude**

**Bean = Spring이 관리하는 객체**입니다.

Java에서 객체를 쓰려면 원래 이렇게 직접 만들어야 합니다.

```java
// 일반 Java - 개발자가 직접 생성/관리
AuthService authService = new AuthService();
```

Spring Bean으로 등록하면 Spring이 대신 만들고 관리합니다.

```java
// Spring Bean - Spring이 생성/관리
@Autowired
private AuthService authService;
```

## Spring이 "관리한다"는 게 구체적으로 뭔가?

**1. 싱글톤 보장** — 앱 전체에서 인스턴스를 하나만 만들어 공유 (A 클래스와 B 클래스에서 쓰는 AuthService가 같은 객체)

**2. 의존성 자동 주입 (DI)** — Bean끼리 연결을 Spring이 처리

```java
@Service
public class AuthService {
    private final UserRepository userRepository; // 이것도 Bean

    // Spring이 알아서 UserRepository Bean을 여기에 꽂아줌
    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

**3. 생명주기 관리** — 앱 시작 시 생성, 종료 시 소멸

> Bean = "new 하지 않아도 Spring이 만들어서 필요한 곳에 알아서 넣어주는 객체"

---

**You**

@autowired가 의존성 주입 관련이야? 생략은 언제 가능한거야?

---

**Claude**

맞습니다. `@Autowired`는 "이 필드/생성자에 맞는 Bean을 찾아서 주입해줘"라고 Spring에게 요청하는 어노테이션입니다.

## 주입 방식 3가지

**1. 필드 주입** (비권장)
```java
@Autowired
private UserRepository userRepository;
```

**2. 생성자 주입** (권장)
```java
private final UserRepository userRepository;

@Autowired
public AuthService(UserRepository userRepository) {
    this.userRepository = userRepository;
}
```

**3. Setter 주입** (거의 안 씀)
```java
@Autowired
public void setUserRepository(UserRepository userRepository) { ... }
```

## `@Autowired` 생략 가능한 경우

**생성자가 딱 하나일 때** Spring 4.3부터 자동 인식해서 생략 가능합니다. 실무에서는 `@Autowired` 없이 생성자 주입을 쓰는 게 현재 표준입니다.

## 왜 생성자 주입이 권장되나?

| | 필드 주입 | 생성자 주입 |
|---|---|---|
| `final` 선언 | 불가 | 가능 (불변 보장) |
| 테스트 | 어려움 | 쉬움 (직접 new 가능) |
| 순환 의존성 감지 | 런타임 에러 | 앱 시작 시 즉시 에러 |

---

**You**

Lombok @RequiredArgsConstructor 쓰면 생성자 생략 가능해?

---

**Claude**

네, `@RequiredArgsConstructor`가 생성자 코드 자체를 자동 생성해줍니다.

## 동작 방식

`final` 필드를 모아서 생성자를 자동으로 만들어 줍니다.

```java
// 이렇게 쓰면
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
}

// 컴파일 시 이 코드가 자동 생성됨
public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
}
```

생성자가 하나이므로 `@Autowired`도 생략됩니다.

ZeroVerse `AuthService.java`에서 이미 그 패턴을 쓰고 있습니다. 21번째 줄 `@RequiredArgsConstructor`가 23~26번째 줄 `final` 필드 4개(`JwtTokenProvider`, `UserRepository`, `PasswordEncoder`, `AuthenticationManager`)를 생성자 파라미터로 자동 변환합니다.

---

**You**

@AllArgsConstructor랑 @RequiredArgsConstructor 차이

---

**Claude**

`@RequiredArgsConstructor`는 `final` 필드만, `@AllArgsConstructor`는 모든 필드를 생성자에 포함합니다.

```java
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository; // 포함
    private final PasswordEncoder passwordEncoder; // 포함
    private String tempValue; // 제외 (final 아님)
}

@AllArgsConstructor
public class AuthService {
    private final UserRepository userRepository; // 포함
    private final PasswordEncoder passwordEncoder; // 포함
    private String tempValue; // 포함 (final 아니어도)
}
```

## 왜 DI에는 `@RequiredArgsConstructor`를 쓰나?

의존성 주입용 필드는 항상 `final`로 선언해야 합니다. `@AllArgsConstructor`는 `final`이 아닌 일반 필드까지 생성자에 포함시켜서, 필드 순서가 바뀌면 조용히 버그가 생길 수 있습니다.

| | `@RequiredArgsConstructor` | `@AllArgsConstructor` |
|---|---|---|
| 대상 | `final` + `@NonNull` 필드만 | 모든 필드 |
| DI 용도 | 적합 | 부적합 |
| 주 사용처 | Service, Repository 등 | DTO, 테스트 데이터 생성 |

---

**You**

addFilterBefore 파라미터 설명

---

**Claude**

`SecurityConfig.java` 33번째 줄 기준으로 설명합니다.

```java
.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
```

| 파라미터 | 값 | 의미 |
|---|---|---|
| 1번째 | `jwtAuthenticationFilter` | 추가할 필터 (내가 만든 JWT 검증 필터) |
| 2번째 | `UsernamePasswordAuthenticationFilter.class` | 기준점이 되는 필터 |

**"기준 필터 앞에 내 필터를 끼워 넣어라"** 는 뜻입니다.

## 왜 앞에 넣어야 하나?

JWT를 먼저 검증해서 `SecurityContext`에 인증 정보를 세팅해 놓아야, 이후 필터들이 "이미 인증된 사용자"로 인식합니다.

```
요청 → [JwtAuthenticationFilter] → [UsernamePasswordAuthenticationFilter] → Controller
           ↑ JWT 토큰 검증               ↑ ID/PW 로그인 처리 (JWT 방식이라 패스)
```

---

**You**

filterChain에 저 필터가 있는지 어떻게 알고 기준 필터로 지정하는거임? 기본으로 filterChain에 등록되어 있는 필터들이 있어?

---

**Claude**

네, Spring Security가 `HttpSecurity`를 구성할 때 **기본 필터들을 자동으로 등록**합니다.

## 기본으로 등록되는 주요 필터들 (순서대로)

```
DisableEncodeUrlFilter
WebAsyncManagerIntegrationFilter
SecurityContextHolderFilter
HeaderWriterFilter
CsrfFilter                              ← csrf().disable() 하면 제거됨
LogoutFilter
UsernamePasswordAuthenticationFilter    ← 이게 기준점
DefaultLoginPageGeneratingFilter
DefaultLogoutPageGeneratingFilter
BasicAuthenticationFilter
RequestCacheAwareFilter
SecurityContextHolderAwareRequestFilter
AnonymousAuthenticationFilter
SessionManagementFilter
ExceptionTranslationFilter
AuthorizationFilter
```

`UsernamePasswordAuthenticationFilter`는 Spring Security가 항상 기본으로 넣어두는 필터라서 "저게 있다"는 걸 이미 알고 기준으로 쓸 수 있습니다.

## 현재 ZeroVerse 프로젝트에서 필터 동작

```
요청
 ↓
CsrfFilter                    (disable 했으니 건너뜀)
 ↓
[JwtAuthenticationFilter]     ← addFilterBefore로 삽입됨
 ↓
UsernamePasswordAuthenticationFilter  (JWT 방식이라 패스)
 ↓
AnonymousAuthenticationFilter
 ↓
AuthorizationFilter           ← authenticated() 검사 여기서 함
 ↓
Controller
```

실제 등록된 필터 목록은 `filterChain.getFilters().forEach(...)` 또는 `logging.level.org.springframework.security: DEBUG`로 확인 가능합니다.

---

**You**

SessionCreationPolicy.STATELESS 이게 뭔데

---

**Claude**

JWT 방식에서는 서버가 세션을 저장하지 않겠다는 설정입니다.

## 세션 기반 vs JWT 기반

**세션 방식**: 로그인 → 서버가 세션 저장 → 쿠키에 세션ID → 다음 요청 시 서버에서 조회

**JWT 방식 (STATELESS)**: 로그인 → JWT 발급 (서버 저장 X) → 클라이언트 보관 → 다음 요청 시 Authorization 헤더로 전송 → 서버가 서명만 검증

## STATELESS로 설정하면 달라지는 것

서버가 세션을 생성하지 않고 저장하지 않습니다. 요청마다 JWT로만 인증합니다.

STATELESS 설정 안 하면 Spring Security가 인증 후 세션을 만들어버려 JWT를 쓰는 의미가 없어집니다.

| | 세션 방식 | JWT + STATELESS |
|---|---|---|
| 서버 부담 | 세션 저장소 필요 | 없음 |
| 수평 확장 | 어려움 (세션 공유 문제) | 쉬움 |
| 토큰 만료 제어 | 서버에서 즉시 가능 | 토큰 만료시까지 대기 |

---

## 💭 내 메모
- **왜 저장했나**: ZeroVerse 프로젝트 개발 중 모르는 Spring 기능을 찾아보며 기록해두기 위해
- **현재 일과 연결**: 다음 프로젝트 때도 참고할 수 있는 레퍼런스로 남기기 위해
- **해보고 싶은 것**: 직접 JWT 필터 구현할 때 참고 자료로 활용

## 🔗 관련 노트
<!-- 연결되는 프로젝트·TIL·문서 링크 -->