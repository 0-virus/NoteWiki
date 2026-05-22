---
type: concept
tags: [java, javascript, operator]
updated: 2026-05-19
sources: ["raw/notes/Java의 쇼트 서킷.md"]
---

# 쇼트 서킷 (Short Circuit)

## 한 줄 정의

논리 `&&`·`||` 연산에서 **결과가 앞 조건만으로 확정되면 뒤 조건을 아예 평가하지
않는** 동작.

- `A && B` — `A`가 `false`면 결과는 무조건 `false` → `B`를 계산하지 않음.
- `A || B` — `A`가 `true`면 결과는 무조건 `true` → `B`를 계산하지 않음.

## 왜 이렇게 동작하는가

논리적으로 결과가 이미 정해졌는데 뒤를 더 계산하는 건 낭비다. 그래서 언어가
**불필요한 평가를 건너뛴다.** 부수 효과로 "뒤 조건을 실행할지 말지를 앞 조건으로
제어"하는 패턴이 가능해진다 (예: `obj != null && obj.method()` 로 NPE 방어).

## "이게 되면 좋은데…" — Java에서 안 되는 이유

```java
int i = 0;
i != 0 && System.out.println(5 / i);   // ❌ 컴파일 에러
// The operator && is undefined for the argument type(s) int, void
```

앞이 `false`니 `println`은 무시되어 `/ by zero`도 안 날 것 같지만, **컴파일조차
안 된다.** `&&`는 양쪽이 모두 `boolean`이어야 하는데 `System.out.println()`의
반환형이 **`void`** 라서다.

## Java vs JavaScript — 반환값 처리 차이

같은 코드가 JS에서는 동작한다:

```javascript
let i = 0;
i != 0 && console.log(5 / i);   // ✅ 동작 (아무것도 출력 안 함)
```

`console.log()`는 `undefined`를 반환하고, JS의 `&&`는 양쪽이 boolean이 아니어도
**truthy/falsy로 평가**하기 때문이다. 반면 Java의 `&&`는 **엄격하게 boolean 전용**이고
`println`은 `void`라 식의 일부가 될 수 없다.

> 결론: Java에서 이 패턴을 쓰려면 `boolean`을 반환하는 메서드를 따로 만들어야 하는데,
> 그럴 바엔 그냥 `if` 문을 쓰는 게 낫다. **언어마다 "식(expression)"의 규칙이 다르다**는
> 점이 핵심 교훈.

## 관련 페이지

- [[short-circuit-note]] — 출처
