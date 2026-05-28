---
type: concept
tags: [spring, framework]
updated: 2026-05-27
sources: ["raw/notes/Spring Framework.md"]
---

# Spring Framework

## 한 줄 정의

**Java 엔터프라이즈 개발을 편하게 해주는 경량 오픈소스 애플리케이션 프레임워크.**
본질은 "객체 만들기와 연결을 프레임워크가 대신 해주는 것" — 나머지(AOP·트랜잭션·MVC)는 다 그 위에 얹힌 부수다.

## 왜 등장했나 — EJB의 무거움

Spring 이전엔 **EJB**가 주류였다. EJB로 객체 하나 만들려면 특정 인터페이스 구현·홈/리모트 인터페이스 분리·디스크립터 작성 같은 의식이 필요했다. 결과: 개발 시간·비용 폭증.

2002년 Rod Johnson이 *Expert One-on-One J2EE Design and Development*에서 "그냥 평범한 Java 객체로 충분하다"는 주장을 코드로 보여줬고, 그게 Spring의 원형이 됐다. → [[pojo]]

## 5대 특징

| 특징                       | 한마디로                                | 연결                                   |
| -------------------------- | --------------------------------------- | -------------------------------------- |
| **컨테이너**               | Java 객체 라이프사이클 관리             | [[inversion-of-control]]·[[spring-bean]] |
| **DI 지원**                | 외부에서 의존 객체 주입                 | [[dependency-injection]]               |
| **AOP 지원**               | 공통 관심사(트랜잭션·로깅·보안)를 핵심에서 분리 | [[aop]]                |
| **POJO 지향**              | 특정 상속/구현 없이 순수 Java로 개발    | [[pojo]]                               |
| **트랜잭션·영속성 추상화** | 구현(JDBC·JTA·Hibernate)에 무관 동일 코드 | [[jdbc]]·[[orm]]·[[jpa]]             |

## 프레임워크 vs 라이브러리 — 제어의 역전

- **라이브러리**: 내 코드가 라이브러리를 부른다 (`Math.sqrt(9)`).
- **프레임워크**: 프레임워크가 내 코드를 부른다 ("Hollywood Principle — Don't call us, we'll call you").

이 뒤집힘이 [[inversion-of-control]]의 가장 일반적 사례다. Spring이 특별한 이유는 IoC를 **객체 생성·결합** 수준까지 끌어와 [[dependency-injection]]으로 일반화했기 때문.

## 버전 역사 (요약)

| 버전 | 연도 | 핵심                                                       |
| ---- | ---- | ---------------------------------------------------------- |
| 1.0  | 2004 | IoC, AOP, XML Bean, 트랜잭션                               |
| 2.0  | 2006 | Security/Batch/WebFlow 시작                                |
| 3.0  | 2009 | JPA 2.0, Spring MVC, REST                                  |
| 4.0  | 2013 | Java 8                                                     |
| 5.0  | 2017 | Reactive·Kotlin (Spring Boot 2.X)                          |
| **6.0** | **2022** | **Java 17 최소·Jakarta EE 전환** (Spring Boot 3.X)   |
| 7.0  | 2025 | Java 21·Jakarta EE 11 (Spring Boot 4.X)                    |

> 영균이 부트캠프에서 다룰 가능성이 가장 큰 버전: **6.0 / Spring Boot 3.X**.
> Jakarta EE 전환으로 `javax.servlet.*` → `jakarta.servlet.*` 패키지 이름이 바뀐다.
> [[servlet]] 실습에서 본 `import javax.servlet.http.HttpServlet`이 Spring Boot 3에선 `jakarta.servlet.http.HttpServlet`이 되는 식.

## 학습 트리 진입점 — 영균용

이 페이지는 깊이 들어가지 않는다. **목차 역할**.

```
Spring Framework (여기)
├── 원리      : dependency-injection · inversion-of-control · spring-bean
├── 설계 원칙 : solid-principles · pojo
├── 실행 환경 : spring-boot · maven · gradle
├── 웹 응용   : mvc-pattern · three-tier-architecture
├── 영속성    : jdbc · mybatis · jpa · spring-data-jpa (데이터 접근 추상화 사다리)
└── 다리      : servlet-to-spring-mvc (Servlet/JSP에서 넘어오는 흐름)
```

## 관련 페이지

- 원리: [[dependency-injection]] · [[inversion-of-control]] · [[spring-bean]]
- 환경: [[spring-boot]] · [[maven]] · [[gradle]]
- 설계: [[pojo]] · [[solid-principles]]
- 흐름: [[servlet-to-spring-mvc]] · [[manual-di-to-spring-ioc]] · [[mybatis-to-jpa]]
- 영속성: [[jdbc]] · [[mybatis]] · [[jpa]] · [[spring-data-jpa]]
- 필수 심화: [[aop]] · [[transaction]] · [[transaction-propagation]]
- 참조 색인: [[spring-annotations]] — 자주 쓰는 어노테이션을 한곳에서 찾는 허브
- 출처: [[spring-framework-1-note]]
