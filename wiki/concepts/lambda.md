---
type: concept
tags: [java, lambda, functional-interface]
updated: 2026-05-19
sources: ["raw/notes/제네릭, 람다, 함수형 인터페이스, 익명 클래스.md"]
---

# 람다식 (Lambda)

## 한 줄 정의

[[functional-interface]]의 **유일한 추상 메서드 구현을 짧게 쓰는 문법**.
`(매개변수) -> 동작` 형태다.

```java
IAdd<Integer> o = (x, y) -> x + y;
```

## 람다 = 익명 클래스의 축약

위 람다는 사실 이 코드의 짧은 버전이다:

```java
IAdd<Integer> o = new IAdd<Integer>() {
    @Override
    public Integer add(Integer x, Integer y) { return x + y; }
};
```

즉 람다도 **실제로는 객체 하나가 만들어진다.** "함수를 값처럼 변수에 담는" 문법이지만,
내부적으로는 [[functional-interface]]를 구현한 객체다. → [[anonymous-class]]와 비교

## 왜 함수형 인터페이스에만 쓸 수 있나

람다에는 메서드 이름이 없다. 컴파일러가 "이게 어느 메서드의 구현인가"를 알려면
구현 대상이 **하나로 확정**돼야 한다. 그래서 추상 메서드가 1개인 함수형
인터페이스에만 람다를 쓸 수 있다.

## 람다 vs 익명 클래스 — `this`의 차이 (핵심)

가장 헷갈리는 지점. **익명 클래스의 `this`는 자기 자신**, **람다의 `this`는 바깥 객체**다.

```java
class Outer {
    int v = 1;
    void test() {
        // 익명 클래스 — 진짜 새 클래스가 생김
        IAdd<Integer> a = new IAdd<Integer>() {
            int v = 2;                          // 익명 클래스의 필드
            public Integer add(Integer x, Integer y) {
                System.out.println(this.v);       // 2  — this = 익명 클래스 인스턴스
                System.out.println(Outer.this.v); // 1  — 바깥은 Outer.this 로
                return x + y;
            }
        };
        // 람다 — 새 this를 만들지 않음
        IAdd<Integer> b = (x, y) -> {
            System.out.println(this.v);           // 1  — this = 바깥 Outer
            return x + y;
        };
    }
}
```

왜? 익명 클래스는 **진짜 클래스를 하나 더 만드는** 것이라 자기만의 스코프(필드 선언
가능)와 `this`를 갖는다. 람다는 메서드 안의 **코드 블록처럼** 취급되어 바깥 메서드의
지역 변수 스코프를 공유하고, 별도 `this`를 만들지 않는다.

→ 그래서 람다 안에서는 바깥 메서드의 지역 변수와 같은 이름을 다시 선언할 수 없다
(스코프 공유). 익명 클래스 안의 `int v = 2`는 별개 스코프의 필드라 가능하다.

## 내부 처리

익명 클래스는 컴파일 시 별도 클래스 파일이 생기고, 람다는 JVM이 `invokedynamic`으로
더 최적화해 처리한다. (실무에선 "문법 + 사용 제약 + this 차이" 정도면 충분)

## 관련 페이지

- [[functional-interface]] — 람다가 구현하는 대상
- [[anonymous-class]] — 람다의 전신, this·스코프가 다름
- [[generics]] — 람다의 매개변수·리턴 타입을 결정
- [[anonymous-class-to-lambda]] — 전체 흐름
- 출처: [[generics-lambda-note]]
