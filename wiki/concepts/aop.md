---
type: concept
tags: [spring, aop, aspect, proxy]
updated: 2026-05-28
sources: ["raw/notes/Spring Framework.md", "raw/dialogues/2026-05-28 Spring 도메인 구조와 @Transactional — 프록시 vs 컨테이너.md"]
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

## 컨테이너 vs 프록시 — 누가 언제 일하나

헷갈리기 쉬운 지점: **프록시와 컨테이너는 같은 게 아니다.** "만든 쪽"과 "만들어진 것"의 관계다.

| | 컨테이너 (ApplicationContext) | 프록시 |
|---|---|---|
| 정체 | 빈 전체를 관리하는 본부 | 빈 하나를 감싼 래퍼 객체 |
| 개수 | 앱당 1개 | (AOP·트랜잭션 붙은) 빈마다 1개 |
| 역할 | 빈 생성·보관·주입(DI)·생명주기 | 메서드 호출을 가로채 부가기능 추가 |
| 관계 | **프록시를 만드는 쪽** | **컨테이너가 만든 결과물** |

핵심은 **컨테이너가 일하는 시점**과 **프록시가 일하는 시점**이 다르다는 것이다.

**① 앱 시작 시 (딱 1번) — 컨테이너가 일함**
```
컨테이너: UserService 빈 만들려는데 @Transactional(또는 @Aspect 대상)이네?
          → 진짜 UserService를 프록시로 감싸서 등록
          → 주입할 땐 진짜 대신 "프록시"를 꽂아줌  (받는 쪽은 모름)
```

**② 런타임, 실제 호출 시 (매번) — 컨테이너는 빠지고 프록시만 일함**
```
controller.userService.save()      ← 이미 주입받은 게 프록시라, 이건 곧 프록시 호출
        │  (컨테이너는 이 순간 개입하지 않음!)
        ▼
   [프록시]  ─① 부가기능 앞단 (트랜잭션 begin 등)
        │
        ▼ ② 진짜 UserService.save() 위임
        │
        ▼ ③ 부가기능 뒷단 (commit / 예외면 rollback)
```

> 비유: 본부(컨테이너)가 채용·배치할 때 직원 자리에 **비서(프록시)**를 앉혀놨다. 그 뒤
> 일을 시킬 땐 본부를 거치지 않고 비서한테 바로 말하고, 비서가 앞뒤 처리를 한 뒤 진짜 직원에게 넘긴다.

### ⚠️ 자기호출(self-invocation) 함정

프록시는 **바깥에서 들어오는 호출만** 가로챈다. 그래서 같은 클래스 안에서 `this.다른메서드()`로
부르면 비서(프록시)를 안 거치고 진짜 객체끼리 직접 호출이라, 그 메서드의 `@Transactional`·
`@Around` 등이 **안 먹는다**. 해결: 메서드를 다른 빈으로 분리하거나, 자기 자신을 프록시로
주입받아 호출한다.

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
- [[transaction-propagation]] — 프록시 경계에서 rollback-only가 찍히는 메커니즘
- [[spring-annotations]] — `@Aspect`·`@Transactional` 등 프록시로 동작하는 어노테이션 인덱스
- 출처: [[spring-transaction-proxy-dialogue]]
