---
type: concept
tags: [java, jvm, memory]
updated: 2026-05-19
sources: ["raw/notes/JVM의 메모리 할당.md", "raw/notes/static의 개념과 활용.md"]
---

# JVM 메모리 구조

## 한 줄 정의

JVM이 프로그램 실행 중 사용하는 메모리를 **역할에 따라 나눈 영역들**. 어떤 데이터가
어디에 살고 언제 사라지는지가 여기서 결정된다.

## 3대 영역

| 영역            | 저장 내용                                  | 생기는 시점 | 사라지는 시점 |
| --------------- | ------------------------------------------ | ----------- | ------------- |
| **Method Area** | 클래스 메타데이터, 바이트코드, static 변수 | 클래스 로딩 | 프로그램 종료 |
| **Heap**        | `new`로 생성된 객체, 인스턴스 변수         | `new` 시점  | GC가 수거     |
| **Stack**       | 메서드 호출 프레임, 지역변수, 참조변수     | 메서드 호출 | 메서드 종료   |

## 왜 이렇게 나누는가

데이터마다 **수명(lifetime)** 과 **공유 범위**가 다르기 때문이다.

- **Method Area** — 클래스 자체에 속한 것. 프로그램 내내 1벌만 존재하면 된다.
  메서드 바이트코드는 static이든 instance든 여기에 **딱 한 벌** 올라간다.
- **Heap** — 객체마다 다른 데이터. `new` 할 때마다 따로 생기고, 아무도 안 가리키면 GC 대상.
- **Stack** — 메서드 한 번 호출되는 동안만 필요한 데이터. 호출이 끝나면 프레임째 사라진다.

## 한 객체의 메모리 흐름 (예: `Circle2 c = new Circle2()`)

```
Stack               Heap                  Method Area
┌─────────┐        ┌──────────────┐       ┌───────────────────────┐
│  main   │        │ Circle2 obj  │       │ numOfCircle = 0       │
│  c ─────┼───────►│ radius = 0.0 │       │ (static 변수)         │
└─────────┘        └──────────────┘       │ 메서드 바이트코드     │
                                          └───────────────────────┘
```

- `static int numOfCircle` → **Method Area**, 클래스 로딩 시 `0`으로 초기화 (main 실행 *전*).
- `double radius` (인스턴스 변수) → **Heap**, 객체 생성 시 `0.0`으로 초기화.
- 참조변수 `c` → **Stack**의 main 프레임. Heap 객체의 **주소를 담는다**.

> ⚠️ static 초기화는 main()보다 먼저 일어난다. "클래스 로딩 시점"과 "객체 생성 시점"을
> 구분하는 것이 [[static-keyword]] 이해의 핵심.

## `this`가 끼어드는 자리

인스턴스 메서드를 호출하면 JVM이 Stack 프레임에 `this`(= 호출한 객체의 Heap 주소)를
자동으로 넣어준다. 그래서 `printInfo()` 바이트코드는 Method Area에 한 벌뿐인데도,
`c1.printInfo()`와 `c2.printInfo()`가 각자 다른 Heap 객체를 읽어 다르게 동작한다.
→ [[static-keyword]]의 "static엔 this가 없다"가 여기서 갈린다.

## 실무 연결

- 가비지 컬렉션(GC) 대상은 곧 "Heap에서 아무 Stack도 가리키지 않게 된 객체".
  [[mutable-immutable]]에서 불변 객체가 중간 객체를 양산하면 Heap·GC에 부담이 간다.
- Servlet은 컨테이너가 인스턴스 1개를 만들어 공유한다([[servlet-lifecycle]]) — 이때
  인스턴스 변수가 Heap에 1벌뿐이라 동시성 문제가 생긴다. 메모리 영역 감각이 그 토대.

## 관련 페이지

- [[static-keyword]] — Method Area에 사는 클래스 멤버
- [[mutable-immutable]] — Heap 객체의 상태 변경과 GC
- [[string-pool]] — Heap 안의 특수 영역
- [[java-buffer]] — 마찬가지로 Heap에 위치하는 임시 저장 공간; 버퍼 이해를 위한 메모리 온토관이 바탕
- 출처: [[jvm-memory-note]], [[static-note]]
