---
type: flow
tags: [java, spring, di, ioc]
updated: 2026-05-21
sources: ["raw/notes/Spring Framework.md"]
---

# 흐름: 직접 `new`에서 Spring IoC 컨테이너까지

> 강의자료 §2(DI/IoC)의 **이야기 자체**가 이 흐름이다.
> "왜 Spring 컨테이너가 필요한가?"는 단번에 도달하는 게 아니라, **4단계의 점진적 진화**로 자연스럽게 도착한다. 각 단계는 앞 단계의 한계를 직접 풀려다가 한 발씩 더 멀리 간다.

## 4단계 진화

```
1단계  ─▶  2단계  ─▶  3단계  ─▶  4단계
일체형      조립형      추상화에      외부 설정으로
(new)       (setter/    의존          조립 결정
            생성자)    (interface)   (IoC Container)
```

## 1단계 — 일체형 (`new`로 직접 만듦)

```java
public class Computer {
    private Mouse mouse;
    public Computer() {
        mouse = new Mouse();   // 안에서 직접 생성
    }
}
```

`Computer`를 만들면 알아서 `Mouse`가 따라온다. 편하다.

> **한계**: `Mouse`를 다른 종류(`WirelessMouse`)로 바꾸려면 `Computer` 코드를 고쳐야 한다.
> 부품 교체 = 본체 코드 수정. 결합력이 너무 높다 → [[solid-principles]]의 OCP 위반.

## 2단계 — 조립형 (setter / 생성자 주입)

```java
public class Computer {
    private Mouse mouse;
    public Computer() { }
    public void setMouse(Mouse mouse) {   // setter 주입
        this.mouse = mouse;
    }
}
```

```java
Mouse m = new Mouse();
Computer c = new Computer();
c.setMouse(m);
```

이제 어떤 `Mouse`를 끼울지는 외부에서 결정. 이게 [[dependency-injection]]의 출발점.

> **한계**: 여전히 `new Mouse()`라고 **구체 클래스**를 적었다.
> "마우스 종류를 바꿔야 하면?" — `new WirelessMouse()`로 코드를 고쳐야 한다.
> 결합이 일부 풀렸지만 아직 구체 클래스에 묶여 있다.

## 3단계 — 추상화에 의존 (인터페이스 도입)

```java
public interface PrintPost {
    void print();
}

public class PrintLnPost implements PrintPost {
    private Post post;
    public PrintLnPost(Post post) { this.post = post; }
    public void print() { System.out.println(post.getAllPosts()); }
}

public class PrintNoLnPost implements PrintPost {   // 새 구현 추가
    private Post post;
    public PrintNoLnPost(Post post) { this.post = post; }
    public void print() { System.out.print(post.getAllPosts()); }
}
```

```java
public class Main {
    public static void main(String[] args) {
        Post post = new NewPost();
        PrintPost printPost = new PrintLnPost(post);   // ← 여기를
        // PrintPost printPost = new PrintNoLnPost(post);  // ← 이것으로 바꾸려면?
        printPost.print();
    }
}
```

이제 `PrintPost`라는 **인터페이스(추상)에 의존**한다 → [[solid-principles]]의 DIP 절반 성공.

> **한계**: `printPost.print()` 코드 자체는 손대지 않지만, **`Main`에서 어떤 구체 구현을 고를지** 결정하기 위해 `new PrintLnPost(...)` 줄을 `new PrintNoLnPost(...)`로 고쳐야 한다.
> **결국 소스 코드가 수정된다.** 추상화는 했지만 "조립 결정"이 여전히 컴파일된 코드 안에 박혀 있다.

## 4단계 — 외부 설정으로 조립 (Spring IoC Container)

해결책: **객체 생성 부분을 외부 설정 파일/어노테이션으로 옮긴다.**

```xml
<!-- 예: 옛 XML 설정 방식 -->
<bean id="post" class="NewPost" />
<bean id="printPost" class="PrintLnPost">
    <constructor-arg ref="post" />
</bean>
```

또는 어노테이션 방식:

```java
@Component
public class PrintLnPost implements PrintPost { ... }
```

```java
ApplicationContext ctx = new AnnotationConfigApplicationContext(AppConfig.class);
PrintPost printPost = ctx.getBean(PrintPost.class);
printPost.print();
```

이제 **구현체를 바꾸려면 설정만 바꾸면 된다.** `Main`의 자바 코드는 그대로.

```
[설정/어노테이션]
       │
       ▼
[Spring IoC Container]  ←─ Bean 생성·관리·주입을 전담
       │
       │  getBean() / @Autowired
       ▼
[Application 코드]      ←─ 받은 객체를 쓰기만
```

이걸 일반화한 원리가 [[inversion-of-control]], 그 안의 객체가 [[spring-bean]].

## 각 단계의 책임 이동

| 단계 | 객체 생성을 누가 | 결합 조립을 누가 | 사용 코드 수정 |
| ---- | ---------------- | ---------------- | -------------- |
| 1    | 본체가 직접      | 본체가 직접      | 항상 필요      |
| 2    | 외부 (Main)      | 외부 (Main)      | 종류 바뀌면 필요 |
| 3    | 외부 (Main)      | 외부 (Main, 인터페이스 통해) | 구현 선택 바뀌면 필요 |
| **4** | **Container**   | **Container**    | **불필요 — 설정만 바꾸면 됨** |

[[dependency-injection]]은 2~4단계의 공통 패턴이고, [[inversion-of-control]]은 4단계로 **점프하는 그 도약**이다. "DI를 자동화한 게 IoC 컨테이너"라고 한 줄로 정리하면 안 보이는 이 점진성을 보여주는 게 이 흐름의 핵심.

## 영균 학습 트리에서

- 부트캠프 강의에서 1→2→3→4를 코드로 직접 따라간 흐름이 §2 전체였다.
- Spring을 "그냥 마법"으로 받아들이지 않고 **"손으로 가다 막힌 지점들을 차례로 푼 도구"**로 이해하는 게 영균의 원리 우선 학습과 맞다.
- 같은 진화 도식은 다른 프레임워크(Guice·Dagger)에도 적용 가능 — 4단계는 어느 IoC 컨테이너든 동일하다.

## 관련 페이지

- [[dependency-injection]] — 2~4단계의 공통 패턴
- [[inversion-of-control]] — 4단계로의 도약 원리
- [[spring-bean]] — 4단계에서 컨테이너가 관리하는 객체
- [[solid-principles]] — OCP·DIP가 단계마다 어떻게 충족·미충족되는지의 기준
- 출처: [[spring-framework-1-note]]
