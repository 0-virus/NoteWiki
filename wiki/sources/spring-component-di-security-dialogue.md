---
type: source
tags: [spring, di, security, lombok, dialogue, zeroverse]
updated: 2026-06-10
sources: ["raw/dialogues/2026-06-10 Spring @Component · Bean · DI · Security Filter Chain 개념 문답.md"]
---

# Spring @Component · Bean · DI · Security Filter Chain 개념 문답

> 원본: `raw/dialogues/2026-06-10 Spring @Component · Bean · DI · Security Filter Chain 개념 문답.md`
> Claude Code 세션, 2026-06-10

## 🗂 컨텍스트

ZeroVerse 프로젝트 개발 중 모르는 Spring 기능을 찾아보며 기록. 다음 프로젝트 때도 참고할 수 있는 레퍼런스로, 특히 JWT 필터 직접 구현 시 참고 자료로 활용 목적.

## 핵심 주장 (Key Claims)

1. `@Component`는 클래스를 Spring IoC 컨테이너에 자동 등록하는 어노테이션. `@Service`·`@Repository`·`@Controller`는 역할을 명시하는 파생 어노테이션.
2. 자동 등록 vs 수동 등록의 핵심은 "누가 인스턴스 생성을 제어하느냐". 외부 라이브러리 클래스는 `@Component`를 붙일 수 없으므로 `@Bean`으로 수동 등록.
3. Bean = Spring이 싱글톤으로 생성·관리·주입해주는 객체. `new` 없이 쓸 수 있는 이유.
4. `@Autowired` 생략 가능 조건: 생성자가 단 하나일 때 (Spring 4.3+). 생성자 주입이 권장 — `final` 보장, 테스트 용이, 순환 의존성 조기 감지.
5. `@RequiredArgsConstructor`(final 필드만) vs `@AllArgsConstructor`(모든 필드). DI에는 `@RequiredArgsConstructor`가 적합.
6. `addFilterBefore(내 필터, 기준필터.class)` = 기준 필터 앞에 삽입. JWT 필터는 `UsernamePasswordAuthenticationFilter` 앞에 넣어야 `SecurityContext` 세팅 후 인증이 완료됨.
7. Spring Security는 HttpSecurity 구성 시 기본 필터 16개를 자동 등록. `UsernamePasswordAuthenticationFilter`가 항상 존재하므로 기준 필터로 사용 가능.
8. `SessionCreationPolicy.STATELESS` = 서버가 세션 미생성. JWT 방식에서 필수 — 미설정 시 Spring Security가 세션을 만들어버려 JWT 의미가 없어짐.

## 언급된 엔티티

- Spring Security: `SecurityFilterChain`, `UsernamePasswordAuthenticationFilter`, `AuthorizationFilter`, `CsrfFilter`
- Spring: `@Component`, `@Service`, `@Repository`, `@Controller`, `@Bean`, `@Autowired`
- Lombok: `@RequiredArgsConstructor`, `@AllArgsConstructor`
- ZeroVerse: `AuthService`, `SecurityConfig`, `JwtAuthenticationFilter`

## 관련 페이지

- [[spring-bean]] — Bean 개념 상세
- [[dependency-injection]] — DI와 생성자 주입 원리
- [[spring-annotations]] — 어노테이션 참조 인덱스
- [[lombok]] — @RequiredArgsConstructor vs @AllArgsConstructor 상세
- [[spring-security]] — SecurityFilterChain, 기본 필터 체인, addFilterBefore
- [[filter]] — Spring Security가 위치하는 서블릿 Filter 레이어
- [[jwt]] — JWT 구조와 Spring 구현
- [[session-auth]] — STATELESS와 대비되는 세션 방식
