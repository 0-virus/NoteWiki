---
type: concept
tags: [java, generics, type]
updated: 2026-05-19
sources: ["raw/notes/제네릭, 람다, 함수형 인터페이스, 익명 클래스.md"]
---

# 제네릭 (Generics)

## 한 줄 정의

클래스·인터페이스·메서드가 **사용할 타입을 외부에서 파라미터처럼 받는** 기능.
타입을 변수처럼 다룬다.

```java
class Box<T> {
    private T value;
    public void set(T value) { this.value = value; }
    public T get() { return value; }
}

Box<String>  sBox = new Box<>();   // T → String 으로 치환된 버전
Box<Integer> iBox = new Box<>();   // T → Integer 로 치환된 버전
```

## 왜 쓰는가

1. **컴파일 타임 타입 체크** — 잘못된 타입 사용을 컴파일 시점에 잡는다. 런타임
   `ClassCastException`이 줄어든다.
2. **캐스팅 불필요** — 꺼낼 때 형변환이 사라진다.

   ```java
   List list = new ArrayList();          // 옛날 방식
   Object o = list.get(0);               // 꺼낼 때마다 형변환 필요

   List<String> list2 = new ArrayList<>();
   String s = list2.get(0);              // 형변환 불필요
   ```

3. **타입 안정성 + 가독성** — `Box<String>`만 봐도 무엇이 든 상자인지 안다.

> 핵심 "왜": 제네릭이 없던 시절엔 `Object`로 받고 꺼낼 때 캐스팅했다. 캐스팅은
> **런타임에야** 틀린 걸 안다. 제네릭은 그 검증을 **컴파일 타임으로 앞당겨** 버그를
> 일찍 잡는 장치다.

## 기본 규칙

- **참조 타입만 가능** — `int`는 안 되고 `Integer`는 된다.
- 타입 매개변수 관습 네이밍: `T`(Type), `E`(Element), `K`·`V`(Key·Value), `N`(Number).
- 여러 개 가능: `<T, U>`, `<K, V>`.

## 함수형 인터페이스와의 조합

제네릭은 [[functional-interface]]·[[lambda]]와 함께 쓰일 때 진가가 나온다 —
제네릭 타입이 람다의 매개변수·리턴 타입을 **자동으로 확정**해준다.

```java
interface IAdd<T> { T add(T x, T y); }

IAdd<Integer> o = (x, y) -> x + y;   // T=Integer → Integer add(Integer, Integer) 로 확정
```

## 관련 페이지

- [[functional-interface]] — 제네릭 타입 파라미터를 받는 함수 틀
- [[lambda]] — 제네릭이 매개변수·리턴 타입을 결정해줌
- [[anonymous-class-to-lambda]] — 제네릭→함수형 인터페이스→람다 흐름
- 출처: [[generics-lambda-note]]
