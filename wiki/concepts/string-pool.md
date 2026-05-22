---
type: concept
tags: [java, string, memory]
updated: 2026-05-19
sources: ["raw/notes/가변 객체 vs 불변 객체.md"]
---

# String Pool

## 한 줄 정의

같은 문자열 리터럴을 **하나의 객체로 공유**하기 위해 JVM이 Heap 안에 따로 둔 영역.
[[mutable-immutable]]에서 String이 불변이기 때문에 가능한 최적화다.

## 동작

```java
String a = "hello";
String b = "hello";
String c = "hello";

a == b   // true — 셋 다 Pool의 같은 객체를 가리킴
```

```
[ Stack ]              [ Heap - String Pool ]
a ───┐
b ───┼────────────────► [ "hello" ] 0x001
c ───┘
```

내부 구조는 **Hash Table**이라 탐색이 O(1) — Pool이 아무리 커도 속도가 일정하다.

```
"hello" 입력 → hash("hello") → 해당 버킷 확인
   → 있으면 기존 객체 반환 / 없으면 새로 생성 후 추가
```

## 언제 Pool을 쓰고 언제 우회하나

| 방법            | Pool 사용  | 예시                                       |
| --------------- | ---------- | ------------------------------------------ |
| 문자열 리터럴   | ✅ 사용    | `String a = "hello";`                      |
| `new` 키워드    | ❌ 우회    | `String a = new String("hello");` → 일반 Heap에 별도 객체 |
| `intern()`      | ✅ 강제 추가 | `new String("hello").intern();`            |

> 그래서 `"hello" == new String("hello")`는 `false`다 — 한쪽은 Pool, 한쪽은 일반 Heap.
> 문자열 비교에 `==` 대신 `.equals()`를 써야 하는 이유. → [[equals-hashcode]]

## 왜 이런 게 필요한가

문자열은 프로그램에서 가장 흔하게 중복되는 값이다(URL, 설정 키, 라벨…). 같은
`"hello"`를 쓸 때마다 객체를 새로 만들면 메모리 낭비가 크다. String이 **불변**이라
값이 바뀔 걱정이 없으니, 안심하고 한 객체를 여러 변수가 공유하게 한 것이다.
→ 불변성이 Pool을 가능하게 한 전제. [[mutable-immutable]]

## 관련 페이지

- [[mutable-immutable]] — Pool은 불변 객체라서 성립하는 최적화
- [[jvm-memory]] — Pool이 사는 곳(Heap)
- [[equals-hashcode]] — `==` 대신 `equals()`를 써야 하는 이유
- 출처: [[mutable-immutable-note]]
