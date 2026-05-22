---
type: source
tags: [java, spring, lecture-note]
updated: 2026-05-21
sources: ["raw/notes/Spring Framework.md"]
---

# 출처: 부트캠프 Spring Framework-1 강의자료

## 원본

`raw/notes/Spring Framework.md` — 부트캠프(생성형 AI 활용 풀스택 양성과정) **스프링 프레임워크-1** 강의자료 PDF에서 텍스트만 추출한 파일.

> 추출 아티팩트: PDF 페이지 단위로 동일 내용이 **49회 반복**되어 있다. 1회분(라인 1~640)만 읽으면 전체 내용을 얻을 수 있고, 나머지는 글머리표 기호(`-` vs `*`) 차이만 있는 같은 본문이다.

## 캡처 맥락 (인터뷰 요약)

- **왜 저장**: Spring 입문 정리. [[servlet-jsp-dialogue]]·[[servlet-jdbc-debugging]]으로 Servlet/JSP/JDBC를 끝낸 직후, 본격적인 Spring 학습의 출발점.
- **현재 연결**: 곧 시작할 **Spring 기반 웹 프로젝트 직전 준비**. 코드를 짤 때 바로 꺼내 쓸 색인이 필요.
- **방침** (영균 본인 선택):
  1. 핵심 개념을 **페이지로 쪼갠다** (한 개념 = 한 페이지).
  2. REST·HTTP 부가기능(Content Negotiation·ETag·HTTP Method Override·Swagger)은 별도 페이지로.
  3. 실습 코드(미니 SNS) 흐름은 **가볍게** — 자세한 코드 대신 패턴·원리만.
- **기존 [[servlet-to-spring-mvc]] 흐름은 건드리지 않음** — Spring 다리는 이미 놓여 있고, 이번엔 다리 건너편(Spring 본진)에 잎을 매단다.

## 다루는 범위 (강의자료 §1~§3)

### §1 스프링 프레임워크 개요
[[spring-framework]] · [[solid-principles]] · [[pojo]] · [[maven]] · [[gradle]] · [[spring-boot]]

### §2 DI 컨테이너 / IoC
[[dependency-injection]] · [[inversion-of-control]] · [[spring-bean]] (갱신) · 흐름 [[manual-di-to-spring-ioc]]

### §3 스프링 MVC와 REST/HTTP
[[three-tier-architecture]] · [[dto-vs-entity]] · [[java-record]] · [[restful-api]] · [[content-negotiation]] · [[http-method-override]] · [[etag]] · [[swagger-oas]]

## 핵심 주장 (Key Claims)

1. **Spring의 본질은 "객체 만들기·연결을 프레임워크가 대신 하는 것"** — DI/IoC가 출발점이고, 나머지(AOP·MVC·트랜잭션)는 다 그 위에 얹힌 기능이다.
2. **POJO 지향**이 EJB 대비 결정적 차별점 — 특정 상속·구현 없이 순수 Java 객체로 개발 가능.
3. **MVC ≠ 3-tier**. MVC는 표현 패턴(Controller-View-Model), 3-tier는 계층 분리(Web-Service-Repository). Spring에서 둘이 겹쳐 보인다.
4. **Entity를 그대로 API에 노출하지 마라** — DTO를 따로 둬야 도메인 변경이 클라이언트로 새지 않는다.
5. **HTTP 메서드 변경은 Filter에서** — `HttpServletRequest`는 한 번 정해진 메서드를 바꿀 수 없어 Interceptor 단계에선 불가.
6. **Bean = Singleton**. Servlet 싱글톤이 [[concurrency-problem]]을 부르듯, Spring Bean도 같은 함정.

## 자주 한 실수 / 강의가 강조한 함정

- 인터페이스를 도입했지만 **`main`에서 결국 `new`로 구체 클래스 선택** → 결국 코드 수정 필요 → 외부 설정이 필요 → 그것이 IoC 컨테이너의 출발.
- **Entity = DB 스키마 = API 응답**으로 묶으면 도메인 변경 한 번에 클라이언트 전부 영향.
- `Accept` 헤더 안 보내면 Content Negotiation 작동 안 함 → 의도와 다른 형식 응답.
- ETag는 본문이 변경되지 않은 **GET 캐싱**에만 의미 — POST 응답에 붙이면 의미 없음.
- 인터셉터에서 `X-HTTP-Method-Override` 처리하려고 시도 → **HttpServletRequest 메서드는 immutable** → 안 됨 → Filter로.

## 영균 학습 트리에서의 위치

```
Java 언어 기초 (이미 정리)
        │
Servlet/JSP/JDBC (이미 정리: servlet-jsp-dialogue, servlet-jdbc-debugging)
        │
   ▼ servlet-to-spring-mvc (다리)
        │
Spring Framework  ←── 지금 여기 (이 소스)
   │
   ├─ 원리: DI · IoC · Bean
   ├─ 환경: Spring Boot · Maven/Gradle
   ├─ 설계: SOLID · POJO · 3-tier
   ├─ 데이터: DTO vs Entity · Java record
   └─ HTTP 응용: RESTful · Content Negotiation · ETag · Method Override · Swagger
```

## 관련 페이지

- 다리: [[servlet-to-spring-mvc]]
- 메타: [[spring-framework]]
- 원리: [[dependency-injection]] · [[inversion-of-control]] · [[spring-bean]]
- 흐름: [[manual-di-to-spring-ioc]]
