---
type: concept
tags: [java, functional-interface, lambda]
updated: 2026-05-19
sources: ["raw/notes/Functional Interface.md", "raw/notes/제네릭, 람다, 함수형 인터페이스, 익명 클래스.md"]
---

# 함수형 인터페이스 (Functional Interface)

## 한 줄 정의

**추상 메서드가 딱 하나뿐인 인터페이스.** "함수 하나"를 표현하기 위한 틀이며,
[[lambda]]의 **타겟 타입**이 된다.

```java
@FunctionalInterface
interface IAdd<T> {
    T add(T x, T y);   // 추상 메서드 1개 — "T 둘 받아 T 하나 반환하는 함수"
}
```

`@FunctionalInterface`는 추상 메서드가 2개 이상이면 컴파일 에러를 내주는 안전장치다.

## 왜 "추상 메서드 1개"인가

람다식 `(x, y) -> x + y`에는 **메서드 이름이 없다.** 그래서 컴파일러가 "이 람다가
어느 메서드의 구현인지" 알려면, 인터페이스에 구현 대상 메서드가 **딱 하나로 확정**돼
있어야 한다. 2개면 어느 쪽 구현인지 모호해진다. → 이게 람다가 함수형 인터페이스에만
쓰일 수 있는 이유. [[lambda]]

## 대표 표준 함수형 인터페이스 (`java.util.function`)

|             | 타입 파라미터            | 메서드     | 반환        |
| ----------- | ------------------------ | ---------- | ----------- |
| `Runnable`  | 없음                     | `run()`    | 없음 (void) |
| `Supplier`  | `T` (반환)               | `get()`    | O           |
| `Consumer`  | `T` (파라미터)           | `accept()` | 없음 (void) |
| `Function`  | `T`(파라미터), `R`(반환) | `apply()`  | O           |
| `Predicate` | `T` (파라미터)           | `test()`   | O (boolean) |

이름으로 역할이 드러난다 — **공급**(Supplier), **소비**(Consumer), **변환**(Function),
**판정**(Predicate). 직접 인터페이스를 정의하지 않아도 이 표준 타입으로 대부분의
람다를 받을 수 있다.

## 제네릭과의 결합

함수형 인터페이스를 [[generics]]로 만들면 같은 틀을 여러 타입에 재사용한다.

```java
IAdd<Integer> intAdd = (x, y) -> x + y;       // Integer add(Integer, Integer)
IAdd<String>  strAdd = (a, b) -> a + b;       // String add(String, String)
```

## 관련 페이지

- [[lambda]] — 함수형 인터페이스의 유일한 메서드를 짧게 구현하는 문법
- [[generics]] — 함수형 인터페이스의 타입을 파라미터화
- [[anonymous-class]] — 람다 이전, 함수형 인터페이스를 구현하던 방식
- [[short-circuit]] — `Predicate.and()` / `Predicate.or()`는 쁜단 평가를 순차적으로 적용. `Predicate<T> and(Predicate<? super T> other)` 구현에 쁜단 평가 원리가 내장됨
- [[anonymous-class-to-lambda]] — 전체 흐름
- 출처: [[functional-interface-table]], [[generics-lambda-note]]
