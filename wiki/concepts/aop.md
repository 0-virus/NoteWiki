---
type: concept
tags: [spring, aop, aspect, proxy]
updated: 2026-05-27
sources: ["raw/notes/Spring Framework.md"]
---

# AOP (Aspect-Oriented Programming)

## 한 줄 정의

**공통 관심사(로깅·트랜잭션·보안)를 핵심 비즈니스 로직에서 분리해 모듈화하는 프로그래밍 패러다임.**
Spring의 5대 특징 중 하나로, [[dependency-injection|DI/IoC]]와 함께 Spring의 양대 기둥이다.

## 왜 필요한가 — 횡단 관심사(Cross-Cutting Concern)

```
UserService.save()     ─┐
OrderService.place()   ─┼─ 각각 "로깅 시작 → 핵심 로직 → 로깅 종료" 를 반복
ItemService.update()   ─┘
```

로깅, 트랜잭션 시작/커밋/롤백, 보안 체크는 **여러 클래스를 가로질러 반복**된다.
이걸 각 메서드에 직접 써 넣으면:
- 코드가 중복된다 → [[solid-principles|SRP·DRY 위반]]
- 로깅 방식 바꾸면 수십 곳을 수정해야 한다

AOP는 이 "가로로 잘리는" 공통 코드를 따로 꺼내 **Aspect**라는 모듈로 만든다.

## 핵심 용어

| 용어 | 의미 | 예시 |
|---|---|---|
| **Aspect** | 분리한 공통 관심사 모듈 | "로깅 Aspect", "트랜잭션 Aspect" |
| **Join Point** | Aspect를 끼워 넣을 수 있는 지점 | 메서드 호출, 예외 발생 |
| **Pointcut** | 실제로 Aspect를 적용할 Join Point를 고르는 식 | `execution(* com.example.service.*.*(..))` |
| **Advice** | 끼워 넣을 실제 코드 (언제 실행할지) | `@Before`, `@After`, `@Around` |
| **Weaving** | Advice를 대상 코드에 합치는 과정 | Spring AOP는 런타임 Proxy 방식 |

## Spring AOP의 동작 원리 — Proxy

Spring AOP는 **런타임에 Proxy 객체**를 만들어 끼워 넣는다.

```
클라이언트 코드
    │ userService.save() 호출
    ▼
[Proxy — Spring이 만든 껍데기]
    1. Advice 앞 코드 실행 (예: 로그 출력)
    2. 실제 UserService.save() 위임
    3. Advice 뒤 코드 실행 (예: 시간 측정)
    ▼
실제 UserService 빈
```

`@Bean`으로 등록된 `userService`를 주입받아도, 실제로 받는 건 **Proxy 객체**다.
[[spring-bean]]이 컨테이너에 의해 관리되기 때문에 이 교체가 가능하다.

> [[transaction|@Transactional]]이 작동하는 방식이 정확히 이 Proxy AOP다.
> `@Transactional`이 붙은 메서드를 호출하면, Proxy가 트랜잭션을 열고 → 메서드 위임 → 커밋/롤백한다.

## 코드 예시

```java
@Aspect
@Component
public class LoggingAspect {

    // com.example.service 패키지 아래 모든 메서드에 적용
    @Around("execution(* com.example.service.*.*(..))")
    public Object log(ProceedingJoinPoint pjp) throws Throwable {
        System.out.println("시작: " + pjp.getSignature());
        Object result = pjp.proceed();   // 실제 메서드 실행
        System.out.println("종료: " + pjp.getSignature());
        return result;
    }
}
```

`@Aspect` + `@Component` 두 어노테이션이면 Spring이 자동으로 Proxy를 생성해준다.

## Filter·Interceptor와의 차이

셋 다 "중간에 끼어드는" 구조지만 적용 위치가 다르다.

| | [[filter]] | [[interceptor]] | AOP |
|---|---|---|---|
| 위치 | Servlet 컨테이너 앞 | DispatcherServlet ~ Controller 사이 | 메서드 호출 시점 |
| 대상 | HTTP 요청/응답 전체 | Spring MVC 요청 | 모든 Spring Bean 메서드 |
| 주 용도 | 인코딩·CORS·XSS | 인증·권한 | 로깅·트랜잭션·보안 |

→ [[filter-vs-interceptor]] 흐름과 함께 읽으면 큰 그림이 잡힌다.

## 관련 페이지

- [[spring-framework]] — AOP는 Spring 5대 특징의 하나
- [[spring-bean]] — Proxy가 Bean을 대체하는 방식
- [[transaction]] — `@Transactional`은 AOP Proxy로 구현된 가장 대표적인 Aspect
- [[dependency-injection]] · [[inversion-of-control]] — Proxy 교체가 가능한 이유
- [[filter]] · [[interceptor]] — "끼어들기" 3형제의 위치 비교
- [[filter-vs-interceptor]] — 비교 흐름 페이지
- [[solid-principles]] — AOP가 자동화하는 SRP·DRY 원칙
