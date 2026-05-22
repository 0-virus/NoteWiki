---
type: concept
tags: [spring, ioc, design-principle]
updated: 2026-05-21
sources: ["raw/notes/Spring Framework.md"]
---

# Inversion of Control (IoC)

## 한 줄 정의

**제어의 역전.** 흐름의 주인이 내 코드가 아니라 프레임워크/컨테이너로 뒤집힌 것.

## 라이브러리 vs 프레임워크로 보는 IoC

가장 흔한 비유:

```
라이브러리:  내 코드 ───호출──▶ 라이브러리
                  (내가 주체)

프레임워크:  프레임워크 ──호출──▶ 내 코드
                  (프레임워크가 주체, "Hollywood Principle: Don't call us, we'll call you")
```

이게 "제어가 뒤집혔다(inverted)"의 의미다. JSP 페이지에 Java를 한 줄 적으면 [[servlet-container]]가 그걸 알아서 실행해주는 것도, [[servlet]]의 `doGet`을 직접 부르지 않는데도 컨테이너가 알아서 부르는 것도 — 다 IoC다.

## IoC의 두 얼굴 — 객체 생성에서의 역전

Spring이 말하는 IoC는 한 발 더 들어간 것 — **객체 생성·결합의 순서가 역전**된다.

### 일체형 (전통 방식)

```
new Computer() 호출  →  내부에서 new Mouse() 호출  →  내부에서 new Button() 호출

생성 순서: Computer → Mouse → Button
```

큰 객체가 작은 객체를 알고, 만든다.

### IoC 방식

```
new Button()  →  Mouse가 Button을 받고 조립  →  Computer가 Mouse를 받고 조립

생성 순서: Button → Mouse → Computer  ← 역순!
```

작은 부품부터 만들어 큰 객체에 끼워 넣는다. **객체 결합 순서가 역순**이라서 "역전(Inversion)".

이 부품을 외부에서 만들어 끼우는 행위가 [[dependency-injection]]. **IoC는 원리, DI는 그 구현 방식 중 하나.**

## IoC Container

위 "역순 조립"을 사람이 매번 하면 [[manual-di-to-spring-ioc]] 흐름의 4단계처럼 `main`이 비대해진다. 그래서 컨테이너에게 맡긴다.

```
[설정파일/어노테이션]
       │  "이런 객체들이 있다"
       ▼
[IoC Container]  ←─ 객체들을 생성·조립·관리·주입
       │
       │  getBean("orderService") / @Autowired
       ▼
[Application 코드]  ←─ 만들어진 객체를 받아서 쓰기만 함
```

Spring에서 IoC Container의 구체적 구현이 `ApplicationContext`다. 그 안에 들어 있는 객체가 [[spring-bean]].

## 영균 학습 트리에서

- [[servlet-container]] **= IoC Container의 웹 버전.** Tomcat이 Servlet 객체를 만들고 라이프사이클을 관리한다 — Spring Container가 Bean을 관리하는 것과 같은 원리, 같은 싱글톤 함정.
- 따라서 [[concurrency-problem]]의 "공유 상태를 인스턴스 필드에 두지 마라"는 원칙은 Servlet → Spring Bean까지 같은 이유로 이어진다.

## 관련 페이지

- [[dependency-injection]] — IoC를 객체 결합에 적용한 패턴
- [[spring-bean]] — Spring IoC Container가 관리하는 객체
- [[servlet-container]] — 같은 원리의 웹 컨테이너 버전
- [[concurrency-problem]] — 싱글톤 컨테이너가 부르는 동시성 함정
- 흐름: [[manual-di-to-spring-ioc]]
- 출처: [[spring-framework-1-note]]
