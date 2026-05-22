---
type: concept
tags: [spring, di, design-pattern]
updated: 2026-05-21
sources: ["raw/notes/Spring Framework.md"]
---

# Dependency Injection (DI)

## 한 줄 정의

**의존 객체를 안에서 만들지 말고, 외부에서 받아서 쓰는 것.** "조립을 누가 하느냐"가 핵심.

## has-a 관계 두 종류

객체가 다른 객체를 "갖고 있는" 방식은 두 가지다.

### Composition (합성)

부품의 수명이 전체에 종속. 전체가 사라지면 부품도 사라진다.

```java
public class Computer {
    private Mouse mouse;
    public Computer() {
        mouse = new Mouse();   // ← 안에서 직접 만듦 (일체형)
    }
}
```

부품을 바꾸려면 `Computer` 코드를 고쳐야 한다. **변경에 닫혀 있지 않다.**

### Association (연합/연관)

부품과 전체가 각자 수명을 갖는다. 외부에서 만든 부품을 조립한다.

```java
public class Computer {
    private Mouse mouse;
    public void setMouse(Mouse mouse) {  // ← 외부에서 주입받음 (조립형)
        this.mouse = mouse;
    }
}
```

부품을 바꿔 끼울 수 있다. 이게 **DI**다.

## DI의 두 가지 방식

```java
// (1) setter 주입
Computer c = new Computer();
c.setMouse(new Mouse());

// (2) 생성자 주입 ← Spring 권장
Mouse m = new Mouse();
Computer c = new Computer(m);
```

| 방식           | 장점                                     | 단점                       |
| -------------- | ---------------------------------------- | -------------------------- |
| **생성자 주입** | 객체 생성과 동시에 필수 의존성 확정 → 불변 가능 | 의존성 많으면 생성자 인자 폭증 |
| **setter 주입** | 선택적 의존성에 유용                     | 객체 생성 후 `null` 위험   |

Spring 권장은 **생성자 주입** — 필드를 `final`로 두고 불변으로 유지할 수 있고, 순환 의존성을 컴파일 단계에서 탐지할 수 있다.

## 왜 이게 좋은가 — 4가지 이득

1. **느슨한 결합**: 부품을 바꿔 끼우기 쉬워진다.
2. **테스트 용이성**: 의존 객체를 Mock으로 갈아 끼울 수 있다.
3. **SRP·OCP 준수**: 객체 생성 책임이 사용 책임에서 분리된다. → [[solid-principles]]
4. **재사용**: 같은 부품을 여러 전체가 공유 가능.

## DI의 한계 — 누가 부품을 만들고 조립하나

DI 자체는 "주입받는 쪽" 이야기다. 누군가는 결국 `new Mouse()`를 해야 한다.

`Main`에서 직접 한다면 — `Main`이 모든 부품 종류를 알아야 하고, 부품 종류가 바뀌면 `Main`이 수정된다. → 이걸 외부에 떠넘긴 게 [[inversion-of-control]]의 컨테이너.

이 진화의 흐름이 [[manual-di-to-spring-ioc]]에 정리돼 있다.

## Spring에서의 DI

Spring은 부품(=[[spring-bean]])들을 자동으로 만들고, 어디에 주입할지도 자동으로 결정한다.

```java
@Service
public class OrderService {
    private final ProductRepository repo;

    @Autowired   // 생성자 1개면 생략 가능
    public OrderService(ProductRepository repo) {
        this.repo = repo;
    }
}
```

`@Autowired`가 "여기 `ProductRepository` 타입 Bean 좀 넣어줘"라는 신호다. Spring 컨테이너가 등록된 Bean 중에서 타입이 맞는 걸 찾아 넣는다.

## 관련 페이지

- [[inversion-of-control]] — DI를 가능하게 하는 컨테이너 원리
- [[spring-bean]] — 주입의 대상이 되는 객체
- [[solid-principles]] — DI는 DIP(의존 역전 원칙)의 구체적 실현
- 흐름: [[manual-di-to-spring-ioc]] — 직접 `new` → DI → IoC 컨테이너 진화
- 출처: [[spring-framework-1-note]]
