---
type: concept
tags: [java, immutable, mutable, string]
updated: 2026-05-19
sources: ["raw/notes/가변 객체 vs 불변 객체.md"]
---

# 가변 객체 vs 불변 객체

## 한 줄 정의

**가변(mutable)** = 객체 생성 후 내부 상태를 바꿀 수 있다. **불변(immutable)** = 한 번
만들면 못 바꾼다. 값을 바꾸려면 새 객체를 만들어 참조를 교체한다.

## 참조형과는 별개 개념

참조형은 "어떻게 접근하느냐"(변수 → 주소 → 객체)의 문제고, 가변/불변은 "그 객체의
내용을 바꿀 수 있느냐"의 문제다. **둘은 독립적**이다 — 참조형이라고 다 가변인 게 아니다.

| 구분           | 가변 객체                       | 불변 객체                   |
| -------------- | ------------------------------- | --------------------------- |
| 예시           | `StringBuilder`, `ArrayList`, `HashMap` | `String`, `Integer`, `LocalDate` |
| 값 변경 방식   | 같은 주소에서 내부 수정         | 새 객체 생성 + 참조 교체    |
| 스레드 안전성  | 동기화 필요 ❌                  | 자동으로 안전 ✅            |

```java
StringBuilder sb = new StringBuilder("hello"); // sb → ["hello"] 0x001
sb.append(" world");                           // sb → ["hello world"] 0x001 (같은 주소)

String s = "hello";   // s → ["hello"] 0x001
s = "world";          // s → ["world"] 0x002 (새 객체, "hello"는 그대로 GC 대상)
```

## 왜 Java는 불변 객체를 만들었나

불변이라서 얻는 4가지 이득 — 전부 "값이 안 바뀜이 보장된다"에서 나온다:

1. **String Pool 최적화** — 안 바뀌니 같은 리터럴을 안심하고 공유한다 → [[string-pool]]
2. **멀티스레드 안전성** — 여러 스레드가 동시에 읽어도 바뀔 일이 없어 동기화 불필요.
3. **hashCode 안정성** — 키가 안 바뀌니 `HashMap`에서 항상 같은 자리에 있다.
   가변이라면 키 내용이 바뀌며 hashCode도 바뀌어 "넣어둔 걸 못 찾는" 버그가 난다.
   → [[equals-hashcode]]
4. **보안** — 실행 중간에 경로·설정값이 바뀌어 생기는 취약점을 원천 차단.

## 양면성 — 불변의 비용

같은 값을 여러 곳이 공유할 땐 메모리 절약이지만, **수정이 잦으면 독**이다.

```java
String result = "";
for (int i = 0; i < 10000; i++) {
    result = result + i;   // 매번 새 String 생성 → 중간 객체 9999개 쓰레기 → GC 폭탄
}
```

진짜 문제는 String Pool 탐색(O(1)이라 무시 가능)이 아니라, **반복 수정 시 중간 객체
대량 생성**이다. 그래서 Java는 가변 짝(`StringBuilder`)을 함께 제공한다 — **"기본은
불변, 수정 많으면 가변"** 이 설계 철학이다.

```java
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 10000; i++) sb.append(i);  // 객체 1개를 계속 수정
String result = sb.toString();
```

대표 쌍: `String ↔ StringBuilder`, `List ↔ Collections.unmodifiableList()`.

## 선택 기준

| 상황                  | 추천              |
| --------------------- | ----------------- |
| 같은 값 여러 변수 공유 | String (불변)     |
| 문자열 연산 반복 ≥ 10번 | StringBuilder (가변) |
| 멀티스레드 환경        | 불변 객체         |

## 관련 페이지

- [[string-pool]] — 불변이라서 가능한 문자열 공유 메커니즘
- [[equals-hashcode]] — 불변이어야 hashCode가 안정적
- [[jvm-memory]] — 새 객체 생성과 GC가 일어나는 Heap
- [[java-record]] — JDK 16+ 불변 데이터 클래스를 한 줄로 정의
- 출처: [[mutable-immutable-note]]
