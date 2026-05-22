---
type: concept
tags: [java, spring, ioc]
updated: 2026-05-21
sources: ["raw/dialogues/Servlet과 JSP의 차이 및 활용.md", "raw/notes/Spring Framework.md"]
---

# Spring Bean

## 한 줄 정의

**Spring IoC Container가 생성·관리·주입해주는 객체.** [[inversion-of-control]]의 산물이고, [[dependency-injection]]의 대상이다.

## 왜 이렇게 하는가

원래 Java에서 객체는 개발자가 직접 만든다.

```java
UserService userService = new UserService();   // 개발자가 직접 생성
```

Spring에서는 이를 Spring이 대신 한다.

```java
@Service                       // "이 클래스 네가 관리해줘"
public class UserService { ... }
```

```java
@Autowired
private UserService userService; // 개발자는 가져다 쓰기만 — Spring이 넣어줌
```

객체 생성·연결을 프레임워크가 책임지면, 개발자는 의존성을 일일이 `new`로 엮지 않아도
되고 결합도가 낮아진다. 이 "내가 만들지 않고 받아 쓰는" 뒤집힘이 **제어의 역전**.

## [[servlet-lifecycle]] 싱글톤과 이어지는 지점

Spring Bean도 기본이 **싱글톤**이다.

```
Servlet 싱글톤      → Tomcat([[servlet-container]])이 관리
Spring Bean 싱글톤  → Spring Container가 관리
```

관리 주체만 다를 뿐 이유는 같다 — 매번 새로 만드는 비용 회피.
따라서 **"인스턴스 변수로 상태를 갖지 마라"**는 [[concurrency-problem]]의 원칙이
Spring Bean에도 그대로 적용된다.

## 어노테이션 미리보기

`@Controller`·`@Service`·`@Repository`는 모두 "이 클래스를 Spring Bean으로 등록해줘"라는
뜻이고, 등록된 Bean은 전부 싱글톤으로 관리된다. Spring 학습 때 이 한 줄을 기억하면 된다.

각 어노테이션은 [[three-tier-architecture]]의 세 계층에 1:1 대응한다 — Bean이라는 같은 도구를 계층 구분과 함께 쓰는 셈.

## Bean이 만들어지는 4단계

[[manual-di-to-spring-ioc]] 흐름의 4단계로 봤듯, 강의자료가 정리한 IoC Container의 동작은:

```
[설정 파일 / @Component·@Service 어노테이션]
       │ "이런 객체들이 있다, 이렇게 엮어달라"
       ▼
[Spring IoC Container (ApplicationContext)]
       │ Bean 인스턴스화 + 의존성 주입 + 라이프사이클 관리
       │ getBean("postService") / @Autowired
       ▼
[Application 코드]
       └─ 받은 Bean 사용
```

Bean은 [[pojo]]다 — 어떤 상속·구현도 강제하지 않는다. `@Service`를 떼면 평범한 Java 클래스로 돌아간다.

## 핵심 함정 — 싱글톤이라 상태를 갖지 마라

기본 스코프가 싱글톤이라는 건 **하나의 Bean 인스턴스가 모든 요청을 처리한다**는 뜻. 즉 인스턴스 필드에 요청별 상태를 두면 다른 요청과 섞인다.

```java
@Service
public class OrderService {
    private Long currentUserId;   // ❌ 멀티 요청에서 섞임

    public void process(Long userId) {
        this.currentUserId = userId;   // 다른 요청이 동시에 덮어쓸 수 있음
        ...
    }
}
```

요청별 데이터는 **메서드 파라미터 / 지역 변수**로만 다뤄야 한다 — [[concurrency-problem]]에서 본 [[servlet-lifecycle]] 함정과 정확히 같은 이유.

## 관련 페이지

- [[inversion-of-control]] — Bean이 사는 컨테이너의 원리
- [[dependency-injection]] — Bean이 주입되는 방식
- [[pojo]] — Bean의 본질적 형태
- [[three-tier-architecture]] — `@Controller`·`@Service`·`@Repository` 분리
- [[servlet-lifecycle]] — 같은 싱글톤 원리의 출발점
- [[concurrency-problem]] — 싱글톤이 부르는 동시성 주의점
- [[servlet-to-spring-mvc]] — Spring 진입 흐름 속 Bean의 위치
- 흐름: [[manual-di-to-spring-ioc]]
- 출처: [[servlet-jsp-dialogue]], [[spring-framework-1-note]]
