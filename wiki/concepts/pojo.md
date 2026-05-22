---
type: concept
tags: [java, spring, design]
updated: 2026-05-21
sources: ["raw/notes/Spring Framework.md"]
---

# POJO (Plain Old Java Object)

## 한 줄 정의

**아무것도 상속하지 않고, 아무 인터페이스도 강제로 구현하지 않은, 그냥 평범한 Java 객체.**

## 왜 이런 이름이 붙었나

마틴 파울러가 한 말 (강의자료 인용):

> "우리는 사람들이 자기네 시스템에 보통의 객체를 사용하는 것을 왜 그렇게 반대하는지 궁금하였는데, 간단한 객체는 폼 나는 명칭이 없기 때문에 그랬던 것이라고 결론지었다. 그래서 적당한 이름을 하나 만들어 붙였더니, 아 글쎄, 다들 좋아하더라고."

당시 표준이던 **EJB**는 객체 하나 만들려고 `javax.ejb.EJBObject` 같은 특정 인터페이스를 상속·구현해야 했다. 그러면 그 객체는 EJB 컨테이너 안에서만 동작하고, 단위 테스트도 어렵고, 다른 환경으로 이식도 어렵다.

POJO는 "그런 거 다 빼고 그냥 `class Order { ... }`만 써도 충분하다"는 선언이었다.

## Spring과 POJO

Spring의 핵심 셀링 포인트 중 하나:

> [[spring-bean]]은 **POJO다.** 아무 인터페이스도 상속할 필요가 없다.
> `@Service`·`@Repository` 같은 어노테이션은 메타데이터일 뿐, 클래스의 본질을 바꾸지 않는다.

```java
// POJO — 어떤 프레임워크와도 무관한 순수 Java 객체
public class OrderService {
    public void cancel(Long orderId) { ... }
}

// Spring 메타데이터 하나 붙여도 여전히 POJO
@Service
public class OrderService {
    public void cancel(Long orderId) { ... }
}
```

`@Service`를 떼면 그냥 평범한 Java 클래스로 돌아간다. EJB와 결정적으로 다른 점이다.

## 4가지 이득

1. **테스트 용이성** — 컨테이너 없이도 `new OrderService()`로 인스턴스 만들어 단위 테스트 가능.
2. **이식성** — Spring 의존을 떼도 클래스 자체는 살아남는다.
3. **단순성** — 학습 곡선이 낮다. 비전공자에게 특히 유리.
4. **재사용** — 같은 클래스를 다른 프레임워크에서도 그대로 쓸 수 있다.

## 어디까지가 POJO인가 — 흔한 오해

`@Entity`·`@Service` 같은 **어노테이션**은 POJO 위반이 아니다. 어노테이션은 "메타데이터"이지 동작 강제가 아니다. 떼면 평범한 Java 객체로 돌아간다.

반면 `extends HttpServlet`은 [[servlet]] 컨테이너 환경에서만 동작하므로 POJO가 아니다.

## 영균 학습 트리에서

- [[servlet]]은 POJO가 아니다 — `HttpServlet`을 상속해야 한다. 그래서 단위 테스트가 까다롭고 Tomcat 없이는 동작 불가.
- [[spring-bean]]은 POJO다 — Spring 컨테이너 없이도 클래스 자체로는 `new`만으로 만들 수 있다.
- 이 차이가 Servlet 시대에서 Spring 시대로 넘어오며 **테스트하기 쉬워진** 가장 큰 이유.

## 관련 페이지

- [[spring-framework]] — POJO 지향이 5대 특징 중 하나
- [[spring-bean]] — POJO를 컨테이너가 관리하는 형태
- [[servlet]] — POJO가 아닌 대표적인 예 (상속 강제)
- 출처: [[spring-framework-1-note]]
