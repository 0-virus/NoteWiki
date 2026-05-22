---
type: flow
tags: [java, generics, lambda, functional-interface]
updated: 2026-05-19
sources: ["raw/notes/제네릭, 람다, 함수형 인터페이스, 익명 클래스.md", "raw/notes/Functional Interface.md"]
---

# 흐름: 제네릭 → 함수형 인터페이스 → 익명 클래스 → 람다

> Java에서 "함수를 값처럼 다루는" 네 개념이 어떻게 맞물리는지의 흐름.
> 각각 따로 외우면 흩어지지만, **하나의 이야기**로 보면 자연스럽게 이어진다.

## 한눈에

```
제네릭          타입을 파라미터로 받아 → 함수의 입력·출력 타입을 확정
   │
   ▼
함수형 인터페이스  추상 메서드 1개 = "함수 하나"의 틀 (= 람다의 타겟 타입)
   │
   ▼
익명 클래스       그 틀을 즉석에서 구현하는 원래 방식 (보일러플레이트 많음)
   │
   ▼
람다             함수형 인터페이스 구현을 군더더기 없이 짧게 쓴 축약 문법
```

## 1. 제네릭 — 타입을 비워 둔다

[[generics]]는 클래스·메서드가 쓸 타입을 외부에서 받게 한다. 함수의 입출력 타입을
나중에 정하도록 **빈칸(`T`)** 으로 남겨 두는 역할.

```java
interface IAdd<T> { T add(T x, T y); }   // "T 둘 받아 T 하나 반환"
```

## 2. 함수형 인터페이스 — "함수 하나"의 틀

[[functional-interface]]는 추상 메서드가 **딱 1개**인 인터페이스. 메서드가 하나로
확정돼야 람다가 "어느 메서드의 구현인지" 알 수 있다 → 람다의 **타겟 타입**.
표준 틀(`Supplier`/`Consumer`/`Function`/`Predicate`)을 쓰면 직접 정의도 불필요.

## 3. 익명 클래스 — 원래의 구현 방식

[[anonymous-class]]는 그 틀을 그 자리에서 일회용으로 구현한다. 동작은 되지만
`new ...() { @Override public ... }`라는 군더더기가 길다.

```java
IAdd<Integer> a = new IAdd<Integer>() {
    @Override public Integer add(Integer x, Integer y) { return x + y; }
};
```

## 4. 람다 — 군더더기를 걷어낸다

[[lambda]]는 같은 구현을 한 줄로 줄인다. 제네릭이 타입을 확정해 주므로 매개변수
타입조차 생략 가능.

```java
IAdd<Integer> b = (x, y) -> x + y;   // T=Integer 가 x,y,반환 타입을 자동 확정
```

## 맞물리는 지점

- **제네릭 → 람다**: `IAdd<Integer>`로 선언하는 순간 `T=Integer`가 되어, 람다
  `(x, y) -> x + y`의 `x`·`y`·반환 타입이 전부 `Integer`로 확정된다.
- **익명 클래스 → 람다**: 람다는 익명 클래스의 축약이되 **동일하지 않다.** `this`가
  가리키는 대상(자기 자신 vs 바깥 객체), 스코프, 적용 범위가 다르다. 메서드가
  2개 이상이거나 추상 클래스를 구현해야 하면 람다는 못 쓰고 익명 클래스로 돌아간다.

## 관련 페이지

- [[generics]] · [[functional-interface]] · [[anonymous-class]] · [[lambda]]
- 출처: [[generics-lambda-note]], [[functional-interface-table]]
