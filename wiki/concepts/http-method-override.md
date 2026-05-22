---
type: concept
tags: [web, http, spring, filter]
updated: 2026-05-21
sources: ["raw/notes/Spring Framework.md"]
---

# HTTP Method Override (HTTP 메서드 변환)

## 한 줄 정의

**클라이언트가 PUT·DELETE를 직접 못 보낼 때, POST로 보낸 뒤 헤더/파라미터로 "사실은 PUT/DELETE야"라고 알려주는 기법.**

## 왜 필요한가

이상적으로는 클라이언트가 PUT·DELETE·PATCH를 그대로 보내면 된다. 하지만 현실엔 제약이 있다.

| 제약            | 사연                                                       |
| --------------- | ---------------------------------------------------------- |
| HTML 폼         | `<form>`은 `method="GET"` 또는 `"POST"`만 지원 (PUT/DELETE 직접 X) |
| 방화벽·프록시   | 일부 네트워크는 GET/POST만 허용                            |
| 보안 정책       | 일부 보안 환경은 브라우저의 PUT/DELETE를 차단              |

이런 환경에서 RESTful API를 살리려면 — **POST로 위장해서 보내고, 서버가 진짜 메서드를 알아채게** 한다.

## 두 가지 변환 방식

### (1) 헤더 방식 — `X-HTTP-Method-Override`

```http
POST /api/posts/1 HTTP/1.1
X-HTTP-Method-Override: PUT
```

POST지만 서버는 `X-HTTP-Method-Override` 헤더를 보고 PUT 요청으로 처리한다.

### (2) 쿼리 파라미터 방식 — `_method`

```http
POST /api/posts/1?_method=DELETE HTTP/1.1
```

`_method=DELETE`를 보고 DELETE로 처리. HTML 폼에서 자주 쓰는 패턴.

## Spring에서의 구현 — Filter여야 하는 이유

### ⚠️ Interceptor로는 안 된다

`HandlerInterceptor.preHandle()`에서 헤더를 보고 메서드를 바꾸려고 시도해도 — **실패한다.**

```
이유: HttpServletRequest의 HTTP 메서드는 한 번 설정되면
      내부적으로 변경할 수 없다 (immutable).
      Interceptor 시점에는 이미 디스패처가 메서드를 확정한 뒤다.
```

이게 영균이 처음에 헷갈리기 쉬운 지점. "어디서 가로채서 바꾸지?"의 답은 **더 이른 시점**이다.

### ✅ Filter로 해야 한다

Filter는 [[servlet]] 스펙의 일부로 `DispatcherServlet`보다 **먼저** 실행된다. 거기서 `HttpServletRequestWrapper`로 요청을 감싸 메서드를 바꿔치기한다.

```
요청 ─▶ [Filter (메서드 오버라이드)] ─▶ DispatcherServlet ─▶ Controller
        ↑ 여기서 PUT으로 바뀜
```

### 구현 골격 (강의 예시 단순화)

```java
public class MethodOverrideFilter implements Filter {
    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest http = (HttpServletRequest) req;
        String override = http.getHeader("X-HTTP-Method-Override");

        if ("POST".equalsIgnoreCase(http.getMethod()) && override != null) {
            // HttpServletRequestWrapper로 감싸 method를 override로 갈아끼움
        }
        chain.doFilter(req, res);
    }
}
```

Filter를 [[spring-bean]]으로 등록하려면 `FilterRegistrationBean`을 `@Bean`으로 노출.

## 영균 학습 트리에서

- 인터셉터 / 필터 / DispatcherServlet의 **실행 순서**를 정확히 알아야 풀리는 문제 — Spring MVC 요청 처리 흐름 학습의 자연스러운 진입점.
- 같은 함정: 인증·로깅을 인터셉터에 두려다가 "요청 본문 한번 읽으면 다시 못 읽음"으로 깨지는 패턴이 있다 → Filter + 캐싱 래퍼로 풀어야 함.

## 관련 페이지

- [[servlet]] — Filter가 사는 곳, 메서드 확정 시점의 무대
- [[restful-api]] — Method Override가 살리려는 그것
- [[content-negotiation]]·[[etag]] — 같은 묶음의 HTTP 부가 기능
- 출처: [[spring-framework-1-note]]
