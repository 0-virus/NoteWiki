---
type: concept
tags: [oop, design-principle, java]
updated: 2026-05-21
sources: ["raw/notes/Spring Framework.md"]
---

# SOLID 원칙

## 한 줄 정의

**객체 지향 설계의 5가지 기본 원칙.** 로버트 마틴이 정리, 마이클 페더스가 앞 글자만 따 SOLID로 명명. Spring이 강조하는 이유는 — DI/IoC가 결국 이 원칙들의 자동 실현이기 때문.

## 다섯 원칙

| 약자 | 풀이 | 한마디로 |
| --- | --- | --- |
| **S** | Single Responsibility | 한 클래스는 한 가지 책임만 |
| **O** | Open-Closed | 확장엔 열고, 변경엔 닫는다 |
| **L** | Liskov Substitution | 자식이 부모를 대체해도 깨지지 않는다 |
| **I** | Interface Segregation | 큰 인터페이스 하나보다 작은 여러 개 |
| **D** | Dependency Inversion | 구체가 아니라 추상에 의존하라 |

## SRP — 단일 책임 원칙

"한 클래스는 변경 이유가 하나여야 한다."

좋은 신호: 기능을 바꿀 때 **파급 효과가 작다**. 한 페이지를 고치는 변경이 다른 페이지까지 줄줄이 끌고 가지 않는다.

[[mvc-pattern]]에서 Controller·View·Model을 나누는 것도 SRP의 적용. [[dao-pattern]]으로 데이터 접근을 떼어내는 것도 같은 원칙.

## OCP — 개방-폐쇄 원칙

"기존 코드를 고치지 않고 새 기능을 추가할 수 있어야 한다."

도구: **다형성**. 인터페이스를 만들고 새 구현 클래스를 추가하는 식으로 확장한다.

```java
interface PrintPost { void print(); }
class PrintLnPost implements PrintPost { ... }
class PrintNoLnPost implements PrintPost { ... }   // 추가 — 기존 코드 수정 X
```

> ⚠️ OCP의 함정: 인터페이스를 만들어도 **`main`에서 `new PrintLnPost()`로 구체 클래스를 직접 고르면** 결국 사용처 코드를 수정해야 한다. 이걸 해결하는 게 [[inversion-of-control]] 컨테이너 — 어떤 구현체를 줄지 외부 설정으로 결정한다. → 흐름 [[manual-di-to-spring-ioc]]

## LSP — 리스코프 치환 원칙

"자식 타입은 부모 타입을 어디서든 대체할 수 있어야 한다." 단순히 상속이 컴파일된다는 게 아니라, **계약(메서드의 약속한 동작)**이 깨지지 않아야 한다는 의미.

전형적 위반: `Rectangle`을 상속한 `Square`에서 `setWidth`/`setHeight`가 서로 영향을 주면, `Rectangle`을 쓰는 코드가 `Square`로 바뀌었을 때 깨진다.

## ISP — 인터페이스 분리 원칙

"클라이언트는 자신이 쓰지 않는 메서드에 의존하면 안 된다."

큰 인터페이스 하나(`UserRepository`에 CRUD + 통계 + 권한관리 다 포함)보다, 작은 인터페이스 여럿(`UserReader`·`UserWriter`·`UserStats`)이 낫다.

## DIP — 의존 역전 원칙

**"구체적인 것이 아니라, 추상에 의존하라."**

```java
// ❌ DIP 위반 — Service가 구체 클래스에 의존
class OrderService {
    private MySqlProductRepository repo;
}

// ✅ DIP — 인터페이스(추상)에 의존
class OrderService {
    private ProductRepository repo;   // interface
}
```

이 원칙의 자연스러운 구현 도구가 [[dependency-injection]]. Spring이 의존성 주입을 강제하면 DIP가 따라온다.

## SOLID와 Spring의 연결

| 원칙 | Spring에서 자동으로 실현되는 방식 |
| ---- | --------------------------------- |
| SRP  | `@Controller` / `@Service` / `@Repository` 계층 분리 ([[three-tier-architecture]]) |
| OCP  | 인터페이스 + Bean 갈아 끼우기 (설정 한 줄로) |
| LSP  | (개발자 책임 — 자동화 X)          |
| ISP  | (개발자 책임 — 인터페이스 설계로) |
| **DIP** | **[[dependency-injection]]이 곧 DIP의 도구** |

Spring을 "쓰기 편한 라이브러리" 정도로 보면 SOLID 위에 만들어진 것이라는 사실이 안 보인다. **"Spring은 SOLID를 자동화하는 도구다"**가 영균의 원리 우선 학습에 적합한 정의.

## 관련 페이지

- [[dependency-injection]] — DIP의 직접적 도구
- [[inversion-of-control]] — OCP를 가능하게 하는 컨테이너 원리
- [[mvc-pattern]] · [[dao-pattern]] · [[three-tier-architecture]] — SRP의 실제 적용
- 출처: [[spring-framework-1-note]]
