---
type: flow
tags: [java, spring, filter, interceptor, web]
updated: 2026-05-21
sources: ["raw/notes/Spring Framework.md"]
---

# Filter vs Interceptor — 두 가로채기 기술의 비교

> 발표용으로 정리한 비교. 본문 두 페이지는 [[filter]] / [[interceptor]].

## 한 줄 비교

| | 🛡️ [[filter]] | 🕴️ [[interceptor]] |
| --- | --- | --- |
| 비유 | **단지 정문 경비원** | **702호 문 앞 비서** |
| 속한 세계 | [[servlet-spec|서블릿 스펙]] (스프링 밖) | Spring MVC (스프링 안) |
| 위치 | [[servlet-container]] ↔ DispatcherServlet 사이 | DispatcherServlet ↔ Controller 사이 |

## 요청의 이동 경로

```
[사용자 요청]
   │
   ▼
[ 🛡️ Filter ]               ← [[servlet-spec|서블릿 스펙]]
   │
   ▼
[ DispatcherServlet ]      ← 스프링 진입점
   │
   ▼
[ 🕴️ Interceptor ]          ← 스프링 컴포넌트
   │
   ▼
[ Controller ]              ← 비즈니스 로직
   │
   ▼
( 응답은 역순: Interceptor → Filter → 사용자 )
```

## 자세한 비교표

| 축 | Filter | Interceptor |
| --- | --- | --- |
| **속한 곳** | [[servlet-spec|서블릿 스펙]]. 스프링이 없어도 존재 | 스프링 MVC 한정 |
| **다루는 객체** | `HttpServletRequest`/`Response` | + `HandlerMethod`, `ModelAndView` |
| **Bean 주입** | 어색함 (`FilterRegistrationBean` 우회) | 자유로움 (`@Autowired`, 생성자 주입) |
| **HandlerMethod 인지** | ❌ 모른다 (디스패처가 정하기 전) | ✅ 안다 (메서드 어노테이션까지 검사 가능) |
| **요청 객체 변형** | ✅ `HttpServletRequestWrapper`로 가능 | ❌ 메서드/URL 갈아끼우기 불가 |
| **예외 처리** | `@ControllerAdvice`가 **닿지 않음** | `@ControllerAdvice`로 우아하게 처리 |
| **에러 시 결과** | 톰캣 기본 에러 페이지 (지저분함) | 커스텀 에러 화면 / JSON 응답 |
| **주 용도** | 인코딩, XSS/CORS, 메서드 오버라이드 | 로그인 인증, 권한 제어, 감사 |

## 왜 스프링은 둘 다 두었나 — 본질

영균이 헷갈리기 쉬운 지점: "필터만으로 다 할 수 있는 거 아닌가요?"

가능은 하다. 하지만 **다루는 정보의 깊이가 다르다**.

- 필터는 **HTTP 그 자체**만 본다. 어느 컨트롤러로 갈지, 어떤 사용자가 보낸 건지는 모른다.
- 인터셉터는 **스프링 안에서** 일한다. Bean·HandlerMethod·인증 객체에 자유롭게 접근한다.

핵심 통찰:
> "같은 일을 두 명이 하는 게 아니라, **다른 깊이로 다른 일**을 한다.
> 어디서 일하느냐가 그 사람이 무엇을 할 수 있는지 결정한다."

## 예외(에러) 처리의 차이 — 결정적 분기점

```
Filter에서 throw → 톰캣까지 올라감 → 기본 에러 페이지 😱
                  (스프링 영역 밖이라 @ControllerAdvice가 못 잡는다)

Interceptor에서 throw → 스프링 예외 처리기로 → @ControllerAdvice로 변환 ✨
                       (이미 스프링 안이라 인프라가 그대로 작동)
```

이 차이 때문에 **비즈니스 로직과 밀접한 검사는 인터셉터로 옮긴다** — 사용자에게 보여줄
에러 메시지를 깔끔히 제어할 수 있기 때문.

## 선택 기준 — 실무에서

| 일의 성격 | 선택 |
| --- | --- |
| 단지 전체에 적용되는 거대한 작업 | **Filter** |
| 인코딩 설정, 한글 깨짐 방지 | Filter (`CharacterEncodingFilter`) |
| XSS / CORS 등 웹 보안 | Filter |
| 모든 요청 로깅 | Filter |
| HTTP 메서드 변환 ([[http-method-override]]) | **Filter (인터셉터로는 불가)** |
| 스프링 컨트롤러와 연계된 정교한 작업 | **Interceptor** |
| 로그인 세션 체크 | Interceptor |
| `@AdminOnly` 같은 어노테이션 기반 권한 | Interceptor |
| 컨트롤러별 성능 측정 | Interceptor |
| `@ControllerAdvice`와 연동된 인증 실패 응답 | Interceptor |

## 영균의 학습 트리에서

- 자연스러운 진입점: [[mvc-pattern]] → [[servlet-to-spring-mvc]] → **이 페이지** → [[spring-framework]]
- 같은 패턴의 변주: **Spring Security**의 핵심 구조도 결국 "Filter Chain" — 이미 익숙한 그 Filter가
  스프링에서도 보안 인프라의 기반이 되어 있다.
- 정교한 사례: [[http-method-override]] — "왜 인터셉터로는 안 되는가"의 결정적 예시.

## 관련 페이지

- [[filter]] · [[interceptor]] — 본문
- [[servlet]] · [[servlet-container]] — Filter가 사는 곳
- [[mvc-pattern]] · [[spring-framework]] — Interceptor가 사는 곳
- [[http-method-override]] — Filter여야만 가능한 일
- [[dependency-injection]] — Interceptor의 강점이 살아나는 이유
- 출처: [[spring-framework-1-note]]
