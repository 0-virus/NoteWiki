---
type: concept
tags: [java, servlet, spec, web]
updated: 2026-05-26
sources: ["dialogue: 서블릿 스펙이라는 게 무슨 뜻이야?"]
---

# Servlet Specification (서블릿 스펙)

## 한 줄 정의

**"Java로 웹 요청을 처리하려면 이런 규칙을 따라야 한다"고 못박은 표준 명세서.**
원래 Oracle(Sun)이 Java EE 일부로 관리했고, 지금은 **Jakarta EE**가 이어받았다.

## "스펙"이라는 단어가 뜻하는 것

스펙(spec, specification)은 **인터페이스와 동작 규약만 정의하고, 구현은 안 하는 문서**다.

> 비유: **콘센트 규격서**.
> 220V·2핀 모양·간격만 정해두고, 실제 콘센트는 LS·파나소닉·이케아가 각자 만든다.
> 그래도 어느 회사 콘센트에 꽂아도 내 노트북 충전기는 동작한다.

서블릿 스펙도 똑같다. 문서가 이렇게 말한다:

- 웹 요청을 처리하는 클래스는 `Servlet` 인터페이스를 구현해야 한다
- HTTP 요청은 `HttpServletRequest`, 응답은 `HttpServletResponse`로 다룬다
- 요청을 가로채려면 `Filter` 인터페이스로 만든다 → [[filter]]
- 컨테이너는 `init()` → `service()` → `destroy()` 순서로 서블릿을 호출해야 한다 → [[servlet-lifecycle]]
- ...

**구현은 누가 하나?** [[servlet-container]] — Tomcat, Jetty, Undertow, WebLogic, JBoss 등이
각자 이 스펙대로 만든다. 그래서 우리 서블릿 코드는 어느 컨테이너 위에서 돌든 똑같이 동작한다.

## 스펙이 정의하는 주요 인터페이스

| 종류 | 인터페이스 / 클래스 | 위키 페이지 |
| --- | --- | --- |
| 서블릿 본체 | `Servlet`, `HttpServlet` | [[servlet]] |
| HTTP 요청/응답 객체 | `HttpServletRequest`, `HttpServletResponse` | [[servlet]] |
| 가로채기 | `Filter`, `FilterChain` | [[filter]] |
| 생명주기 | `init()` / `service()` / `destroy()` | [[servlet-lifecycle]] |
| 컨테이너 핸들 | `ServletContext` | — |
| 비동기 처리 | `AsyncContext` (Servlet 3.0+) | — |
| 세션 | `HttpSession` | — |

이 인터페이스들의 **구체적인 구현 클래스는 컨테이너 안에 있다** — `org.apache.catalina.connector.RequestFacade` 같은 Tomcat 내부 클래스가 `HttpServletRequest`의 실제 구현체.

## 왜 스펙이라는 형태로 만들었나

만약 스펙이 없었다면:

- Tomcat용 서블릿 ≠ Jetty용 서블릿 (서로 호환 안 됨)
- 컨테이너 바꾸려면 코드 다 새로 짜야 함
- "JDBC 드라이버처럼" 표준 API에 의존해서 짜는 자유를 못 누림

스펙을 두면 **"내 코드는 인터페이스에만 의존, 구현체는 갈아끼울 수 있음"** —
[[solid-principles]]의 DIP를 언어 표준 차원에서 강제한 셈. [[dependency-injection]] 사고방식의
원조 격.

## "서블릿 스펙의 기술 vs 스프링의 기술" 구분

위키에서 자주 마주치는 구분이 이거다. **무슨 차이?**

| 기준 | 서블릿 스펙 기술 | 스프링 기술 |
| --- | --- | --- |
| 정의자 | Jakarta EE 표준 | Spring 프로젝트 |
| 동작에 필요한 것 | [[servlet-container]]만 있으면 됨 | Spring 앱 안에서만 |
| 패키지 | `jakarta.servlet.*` (옛 `javax.servlet.*`) | `org.springframework.*` |
| 대표 예 | [[servlet]], [[filter]], `ServletContext` | [[dispatcher-servlet]], [[interceptor]], `@Controller` |

> 그래서 [[filter]]는 **스프링 없이도 Tomcat만으로 동작**하지만,
> [[interceptor]]는 [[dispatcher-servlet]] 안으로 들어와야만 동작한다.
> [[filter-vs-interceptor]]에서 두 기술의 위치가 갈리는 근본 원인이 이것.

심지어 **[[dispatcher-servlet]] 자체도 `HttpServlet`을 상속한 하나의 서블릿**이다 —
즉 Spring MVC 전체가 결국 "서블릿 스펙 위에 올린 한 겹의 추상화"라는 사실이 여기서 드러난다.

## `javax` → `jakarta` 패키지 이동 (중요)

옛날 튜토리얼을 보다가 import가 안 먹는다면 99% 이 문제다.

| 시기 | 패키지 |
| --- | --- |
| Servlet 4.0까지 (Java EE) | `javax.servlet.*` |
| Servlet 5.0+ (Jakarta EE 9~) | `jakarta.servlet.*` |

- **Spring Boot 2.x** → `javax.*`
- **Spring Boot 3.x+** → `jakarta.*`
- **Tomcat 9** → `javax.*`
- **Tomcat 10+** → `jakarta.*`

> ⚠️ Oracle이 Java EE를 Eclipse Foundation에 넘기면서 "javax" 상표 사용권은 안 줬다.
> 그래서 강제로 패키지 이름을 바꿔야 했다. 기술적 변화가 아니라 **법적 사정**.

## 영균의 학습 맥락에서

- 지금 다루는 [[servlet]]·[[jsp]]·[[filter]]는 전부 이 스펙의 멤버다.
- [[servlet-container|Tomcat]] 실습 = **스펙 구현체를 손으로 만져보는 것**.
  Spring Boot가 "내장 Tomcat"으로 감춘 것의 정체가 곧 이 스펙의 구현체.
- 이후 [[spring-framework]]·[[dispatcher-servlet]]로 넘어가도, 그 밑바닥에는 항상
  이 스펙이 깔려 있다. 즉 **Spring을 배워도 서블릿 스펙 지식은 폐기되지 않는다** —
  Spring Security가 [[filter]] 체인으로 구현된 것이 대표 사례.

## 관련 페이지

- [[servlet]] — 스펙의 중심 인터페이스
- [[servlet-container]] — 이 스펙을 구현하는 런타임 (Tomcat 등)
- [[servlet-lifecycle]] — 스펙이 정한 호출 순서
- [[filter]] — 스펙이 정의한 가로채기 (vs 스프링의 [[interceptor]])
- [[dispatcher-servlet]] — 스프링이 이 스펙 위에 올린 Front Controller
- [[filter-vs-interceptor]] — 스펙 기술 vs 스프링 기술의 대조 사례
- [[solid-principles]] — 스펙/구현 분리가 DIP를 강제하는 사례
