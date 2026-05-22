[JVM 메모리 구조와 5가지 핵심 영역 필기 노트 (2).html](<attachment:6a0f16ce-f42f-4545-9f3e-c3835cd68a73:JVM_메모리_구조와_5가지_핵심_영역_필기_노트_(2).html>)

## Java 메모리 관리 — StaticInstanceVarDemo 분석

### 소스코드

```java
package ch04;

public class StaticInstanceVarDemo {
    public static void main(String[] args) {
        Circle2 c = new Circle2();
        Circle2.printStaticInfo();
        Circle2.numOfCircle = 1;
        Circle2.printStaticInfo();

        c.printInfo();
        c.radius = 1.0;
        c.printInfo();
    }
}

class Circle2 {
    static int numOfCircle; // 클래스 로딩 시 0으로 초기화
    double radius;          // 객체 생성 시 0.0으로 초기화

    static void printStaticInfo() {
        System.out.println(numOfCircle);
    }

    void printInfo() {
        System.out.println(radius);
    }
}Copy
```

---

### JVM 메모리 영역 구조

| 영역            | 저장 내용                                  |
| --------------- | ------------------------------------------ |
| **Method Area** | 클래스 메타데이터, 바이트코드, static 변수 |
| **Heap**        | new로 생성된 객체, 인스턴스 변수           |
| **Stack**       | 메서드 호출 프레임, 지역변수, 참조변수     |

---

### 단계별 메모리 흐름

**1. 클래스 로딩 (실행 전)**

- `StaticInstanceVarDemo`, `Circle2` → **Method Area**에 저장
  - 바이트코드 (main, printStaticInfo, printInfo)
  - `Circle2.numOfCircle = 0` (static 변수, Method Area에서 초기화)

> ⚠️ static 변수 초기화는 main() 실행 전, 클래스 로딩 시점에 발생

---

**2. main() 실행**

- `main` 프레임 → **Stack**에 push
- `c = new Circle2()` → **Heap**에 객체 생성
  - `radius = 0.0` (인스턴스 변수)
- 참조변수 `c` → **Stack**의 main 프레임에 저장 (Heap 주소 가리킴)

```
Stack               Heap                  Method Area
┌─────────┐        ┌──────────────┐       ┌───────────────────────┐
│  main   │        │ Circle2 obj  │       │ numOfCircle = 0       │
│  c ─────┼───────►│ radius = 0.0 │       │ printStaticInfo() ... │
└─────────┘        └──────────────┘       │ printInfo() ...       │
                                          └───────────────────────┘
```

---

**3. Circle2.printStaticInfo() 호출 → 0 출력**

- `printStaticInfo` 프레임 → Stack push
- `println` 프레임 → Stack push → `0` 출력
- `println`, `printStaticInfo` 순서로 Stack pop

---

**4. Circle2.numOfCircle = 1 대입**

- **Method Area**의 `numOfCircle` 값 0 → 1로 변경

---

**5. Circle2.printStaticInfo() 호출 → 1 출력**

- 3번과 동일한 흐름, Method Area의 `numOfCircle = 1` 읽음

---

**6. c.printInfo() 호출 → 0.0 출력**

- `printInfo` 프레임 → Stack push
  - **this = c가 가리키는 Heap 주소** (JVM이 자동으로 끼워줌)
- `this.radius = 0.0` 읽어서 출력
- `println`, `printInfo` 순서로 Stack pop

---

**7. c.radius = 1.0 대입**

- `c`가 가리키는 **Heap 객체**의 `radius` 값 0.0 → 1.0으로 변경

---

**8. c.printInfo() 호출 → 1.0 출력**

- 6번과 동일한 흐름, Heap의 `radius = 1.0` 읽음

---

**9. main() 종료**

- `main` 프레임 → Stack pop
- Heap의 Circle2 객체 → 참조 없어지면 GC 대상

---

## 핵심 개념 정리

### static vs instance 메서드의 차이

|             | static 메서드       | instance 메서드     |
| ----------- | ------------------- | ------------------- |
| 저장 위치   | Method Area         | Method Area         |
| `this` 여부 | ❌ 없음             | ✅ 자동 주입        |
| Heap 접근   | ❌ 불가             | ✅ this로 접근      |
| 호출 방식   | `클래스명.메서드()` | `참조변수.메서드()` |

> 💡 메서드 코드(바이트코드)는 static이든 instance든 **Method Area에 1벌만 존재** instance 메서드는 `this`를 통해 Heap의 각자 다른 객체를 참조하여 다른 동작을 수행

---

### this 동작 원리

```java
CopyCircle2 c1 = new Circle2();  // Heap: { radius: 3.0 }
Circle2 c2 = new Circle2();  // Heap: { radius: 7.0 }

c1.printInfo();  // Stack 프레임: this = c1 주소 → 3.0 출력
c2.printInfo();  // Stack 프레임: this = c2 주소 → 7.0 출력
// printInfo() 바이트코드는 Method Area에 딱 1개
```
