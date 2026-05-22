---
type: concept
tags: [java, static, class-member]
updated: 2026-05-19
sources: ["raw/notes/static의 개념과 활용.md", "raw/notes/JVM의 메모리 할당.md"]
---

# static 키워드

## 한 줄 정의

**객체와 무관하게 클래스 자체에 속하는 것.** 객체를 `new` 하지 않고 클래스명으로
바로 쓴다. 모든 객체가 **하나를 공유**한다.

## 인스턴스 멤버 vs static 멤버

| 구분        | 인스턴스 멤버         | static 멤버              |
| ----------- | --------------------- | ------------------------ |
| 소속        | 객체(인스턴스)        | 클래스                   |
| 메모리      | Heap (객체마다 따로)  | Method Area (1벌만)      |
| 사용 조건   | `new`로 객체 생성 후  | 클래스명으로 바로        |
| 호출 방식   | `참조변수.멤버`       | `클래스명.멤버`          |
| `this`      | ✅ 자동 주입          | ❌ 없음                  |

```java
class Car {
    String color;             // 인스턴스 변수 — 차마다 다름
    static int carCount = 0;  // static 변수 — 전체 차의 수, 하나면 됨

    void drive() { }           // 인스턴스 메서드
    static void showCount() { }// static 메서드
}

Car.carCount;            // 객체 없이 바로
Car myCar = new Car();
myCar.color;             // 객체 생성 후
```

## 왜 나눠 뒀는가

**"객체마다 달라지는 것"** vs **"모두가 공유하는 것"** 을 구분하기 위해서다.

`totalUsers`(전체 유저 수) 같은 값을 인스턴스 변수로 두면 `user1`, `user2`가 각자
자기 사본을 들고 따로 논다 — 공유가 안 돼 의미가 없어진다. 전체에 하나만 있으면
되는 데이터·기능은 static으로 둬야 한다.

## main()이 static·public인 이유

```
JVM이 프로그램을 시작 → 아직 객체가 하나도 없음
→ 진입점(main)을 객체 없이 호출할 수 있어야 함  → static 필수
→ JVM이 외부에서 호출할 수 있어야 함            → public 필수
```

객체가 없는 상태에서 가장 먼저 실행되어야 하니, "객체 없이 호출 가능"한 static이
강제된다. static 메서드에 `this`가 없는 이유와 같은 논리다.

## static 메서드는 왜 인스턴스 멤버에 직접 접근 못 하나

static 메서드에는 `this`가 없다([[jvm-memory]] 참고). `this`가 없으면 "어느 객체의"
인스턴스 변수인지 지목할 수 없다. 그래서 static 컨텍스트에서 인스턴스 멤버를 쓰려면
반드시 객체 참조를 명시해야 한다.

## 관련 페이지

- [[jvm-memory]] — static 변수는 Method Area, this는 Stack 프레임
- [[mutable-immutable]] — static 가변 필드는 공유 상태라 동시성 주의
- 출처: [[static-note]], [[jvm-memory-note]]
