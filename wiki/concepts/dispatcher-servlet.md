---
type: concept
tags: [java, spring, mvc, servlet, dispatcher]
updated: 2026-05-21
sources: ["raw/notes/Spring Framework.md"]
---

# DispatcherServlet

## 한 줄 정의

**Spring MVC의 Front Controller**. 모든 HTTP 요청을 단 하나의 [[servlet]]이 먼저 받은 뒤,
적절한 컨트롤러·뷰 처리기로 **위임**해 흘려보내는 중앙 디스패처.

이름이 `~Servlet`인 이유 — 본질이 그냥 **하나의 [[servlet]]**이기 때문이다. [[servlet-container]](Tomcat) 위에서 도는,
URL 매핑 `/*`로 등록된 단 한 개의 서블릿. 다만 그 안의 일이 특별할 뿐.

## 왜 "하나의 서블릿"으로 모았나 — Front Controller 패턴

순수 [[servlet]]만으로 큰 앱을 짜면 URL마다 서블릿을 따로 만들어야 한다.

```java
@WebServlet("/posts/list")    public class PostListServlet extends HttpServlet { ... }
@WebServlet("/posts/detail")  public class PostDetailServlet extends HttpServlet { ... }
@WebServlet("/users/login")   public class LoginServlet extends HttpServlet { ... }
// ... 수십·수백 개
```

그런데 **모든 서블릿이 공통으로 해야 하는 일**이 있다. 인증 확인, 로깅, 뷰 결정, 예외 처리, 응답 직렬화. 이걸 각 서블릿에 복붙하면 지옥.

→ **요청을 받는 정문을 단 하나로 모으자.** 그게 Front Controller 패턴이고, 그 구현체가 DispatcherServlet.

```
Before (Servlet/JSP)            After (Spring MVC)
─────────────────────           ─────────────────────
URL 1 → ServletA                URL 1 ─┐
URL 2 → ServletB                URL 2 ─┼─▶ DispatcherServlet ─▶ 적절한 @Controller로 위임
URL 3 → ServletC                URL 3 ─┘
(공통 처리 매번 복붙)            (공통 처리 한 곳에서)
```

## 4단계 위임 구조 — 정작 자기는 직접 하는 게 별로 없다

DispatcherServlet은 매핑·호출·렌더링을 **직접 안 한다**. 전부 부품에게 넘긴다.
이 "위임 구조" 덕분에 부품만 교체하면 동작이 바뀐다 → 인프라 수준의 OCP.

```
요청 → DispatcherServlet
         │
         │ ① "이 URL을 누구한테 보낼까?"
         ▼
   HandlerMapping            ← URL + HTTP 메서드 → Handler (컨트롤러 메서드) 결정
         │
         │ ② "그 Handler 어떻게 호출해야 하지?"
         ▼
   HandlerAdapter            ← 다양한 Handler 타입을 일관된 방식으로 호출
         │
         │ Interceptor.preHandle
         ▼
   @Controller 메서드 실행
         │
         │ Interceptor.postHandle
         ▼
         │ ③ "반환된 뷰 이름은 어떤 파일이지?"
         ▼
   ViewResolver              ← "posts/detail" → /WEB-INF/posts/detail.jsp
         │  (또는 @ResponseBody면 건너뜀)
         ▼
         │ ④ "객체를 어떻게 응답 바디로 만들지?"
         ▼
   View / HttpMessageConverter
         │   · View       → HTML 렌더링
         │   · Converter  → Jackson이 객체 → JSON
         │
         │ Interceptor.afterCompletion
         ▼
       응답 송출
```

### 네 부품의 역할

| 부품 | 한마디로 | 비유 |
| --- | --- | --- |
| **HandlerMapping** | "URL → Handler 찾기" | 호텔 안내 데스크 (어느 방으로 가실 분이세요?) |
| **HandlerAdapter** | "그 Handler 호출 방식을 안다" | 통역사 (Handler 타입마다 다른 방식으로 부름) |
| **ViewResolver** | "뷰 이름 → 실제 뷰 파일" | 사서 (책 제목으로 책장 위치 찾기) |
| **HttpMessageConverter** | "객체 ↔ JSON/XML 변환" | 환전소 (DTO → JSON, JSON → DTO) |

[[filter]]·[[interceptor]]는 이 흐름 양 옆에 끼는 가로채기 → [[filter-vs-interceptor]] 참고.

## "스프링 없는 세상"과의 대비 — 무엇을 대신해주나

| 순수 [[servlet]]이면 직접 해야 할 일 | DispatcherServlet 시대 |
| --- | --- |
| URL마다 `@WebServlet("/...")` 분리 | HandlerMapping이 한 번에 라우팅 |
| `doGet` / `doPost` 분기, 파라미터 일일이 파싱 | HandlerAdapter가 메서드·파라미터 자동 바인딩 |
| `req.setAttribute(...)` + `forward(...)` | ViewResolver가 뷰 이름만으로 렌더 |
| JSON 응답이면 `PrintWriter`로 `{...}` 손글씨 | Jackson이 객체 → JSON 자동 변환 |
| 예외 처리 매 서블릿마다 try/catch | `@ControllerAdvice` 한 곳에서 |

→ Spring MVC가 "편하다"고 느껴지는 이유의 90%가 이 표 안에 있다.

## Spring Boot에서의 등장 시점

Spring Boot가 `SpringApplication.run()`을 부르면:
1. 내장 [[servlet-container]](Tomcat)가 뜬다.
2. `DispatcherServlet`이 Tomcat에 URL 패턴 `/`로 등록된다.
3. 이때부터 모든 요청은 DispatcherServlet을 거친다.

즉 `localhost:8080/anything`이 작동하는 이유는 DispatcherServlet이 Tomcat 안에 등록되어 있기 때문이다. → [[spring-boot]] / [[servlet-container]]

## ⚠️ "DispatcherServlet도 결국 Servlet"이라는 함정

[[servlet-lifecycle]]에서 본 **싱글톤 함정**이 그대로 적용된다 — DispatcherServlet은 인스턴스가 단 하나이므로
인스턴스 필드에 요청별 상태를 두면 모든 요청에서 섞인다. (Spring이 만든 디스패처라 직접 필드를 추가할 일이 거의 없지만, 커스텀 디스패처를 짜는 드문 경우 주의.)

이 함정은 [[spring-bean]]에도 그대로 적용된다 — Bean도 싱글톤이라 같은 원칙. → [[concurrency-problem]]

## 영균의 학습 트리에서

- [[servlet-to-spring-mvc]] 흐름의 "오른쪽 절반"의 중심. 왼쪽 ([[servlet]]·[[jsp]])을 손으로 만져본 뒤 이 페이지를 보면 "아, Spring이 이걸 대신해줬구나"가 체감된다.
- [[mvc-pattern]]에서 "Spring으로 이어지는 지점"으로 언급되는 그 DispatcherServlet이 여기.
- [[filter]] → DispatcherServlet → [[interceptor]] → @Controller 순서를 외워두면 [[filter-vs-interceptor]]가 한눈에 들어온다.

## 관련 페이지

- [[servlet]] · [[servlet-container]] · [[servlet-lifecycle]] — DispatcherServlet이 그 위에서 도는 토대
- [[mvc-pattern]] — DispatcherServlet이 추상화한 Controller 흐름
- [[filter]] · [[interceptor]] · [[filter-vs-interceptor]] — 디스패처 앞뒤로 끼는 가로채기
- [[servlet-to-spring-mvc]] — Spring 진입 흐름 (이 페이지의 발전사)
- [[spring-bean]] · [[concurrency-problem]] — 싱글톤 함정의 공유 원리
- [[spring-boot]] — DispatcherServlet이 자동 등록되는 환경
- 흐름: [[spring-mvc-request-flow]] — 디스패처를 포함한 한 요청의 풀 파이프라인
- 출처: [[spring-framework-1-note]]
