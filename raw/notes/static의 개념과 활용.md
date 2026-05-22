### 1. 핵심 개념

- 클래스 = **설계도**, 객체 = **설계도로 찍어낸 실체**
- 인스턴스 멤버 → `new` 로 객체를 만들어야 사용 가능
- static 멤버 → 객체 없이 **클래스명으로 바로** 사용 가능

---

### 2. 메모리 구조

```
프로그램 시작
     ↓
[ 메서드 영역 ]  ← 클래스 로딩 시 자동으로 올라감
  - static 변수
  - static 메서드

[ 힙 영역 ]      ← new 할 때마다 그때그때 생성됨
  - 인스턴스 변수
  - 인스턴스 메서드용 객체
```

| 구분     | 메모리에 올라가는 시점      | 사라지는 시점  |
| -------- | --------------------------- | -------------- |
| static   | 클래스 로딩 (프로그램 시작) | 프로그램 종료  |
| 인스턴스 | `new` 할 때                 | GC가 수거할 때 |

---

### 3. 호출 방식 비교

```java
Copyclass Car {
    String color;             // 인스턴스 변수
    static int carCount = 0;  // static 변수

    void drive() { }          // 인스턴스 메서드
    static void showCount(){ }// static 메서드
}

// static → 객체 없이 클래스명으로 바로 접근
Car.carCount;
Car.showCount();

// 인스턴스 → 반드시 객체 생성 후 접근
Car myCar = new Car();
myCar.color;
myCar.drive();
```

---

### 4. 왜 나눠 뒀냐?

**객체마다 달라지는 것** vs **모두가 공유하는 것** 을 구분하기 위해

```java
Copyclass User {
    String name;   // 유저마다 다름 → 인스턴스
    int age;       // 유저마다 다름 → 인스턴스

    static int totalUsers = 0;       // 전체 유저 수는 하나면 됨 → static
    static void showTotalUsers() { } // 마찬가지 → static
}
```

> static 없이 인스턴스로 만들면?
>
> ```java
> CopyUser user1 = new User();  // user1.totalUsers = 0
> User user2 = new User();  // user2.totalUsers = 0 ← 따로 놀아버림
> ```
>
> → 공유가 안 됨. 의미 없어짐.

---

### 5. main()이 static인 이유

```
JVM이 프로그램 시작
       ↓
아직 아무 객체도 없는 상태
       ↓
진입점(main)을 찾아서 실행해야 함
       ↓
객체 없이 호출 가능해야 함 → static 필수
객체 없이 호출 가능해야 함 → 어디서든 접근 가능해야 함 → public 필수
```

---

### 6. 한줄 요약

> `static` = **"객체와 무관하게 클래스 자체에 속하는 것"**
>
> 객체마다 달라질 필요 없는 **공용 데이터/기능**에 쓴다.
