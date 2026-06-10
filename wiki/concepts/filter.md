---
type: concept
tags: [java, servlet, spring, filter, web]
updated: 2026-06-10
sources: ["raw/notes/Spring Framework.md", "raw/dialogues/2026-06-10-zeroverse-spring-security-jwt-auth-practice.md"]
---

# Filter (서블릿 필터)

## 한 줄 정의

**HTTP 요청과 응답을 가로채서 변형하거나 거르는 [[servlet-spec|서블릿 스펙]]의 기술.**
[[servlet-container]](Tomcat) 영역에서, 스프링에 도착하기 *전*에 동작한다.

## 비유 — 아파트 단지 정문 경비원

> 웹 서버 = 아파트 단지, HTTP 요청 = 방문객, 컨트롤러 = 입주민

필터는 **정문에 서 있는 경비원**이다. 아파트 건물(스프링) 내부로 들어가기도 전에
방문객을 막아선다.

- "마스크 안 쓰셨으면 못 들어갑니다." → **인코딩 설정**
- "이 수상한 물건은 빼고 들어가세요." → **요청 데이터 검사/변형**
- "방문 기록은 남깁니다." → **공통 로깅**

특징: 단지 전체의 안전을 관리하기 때문에, 개별 입주민(컨트롤러)의 사정은 잘 모른다.

## 위치 — 흐름에서 어디에 있는가

```
[브라우저]
   │
   ▼
[Tomcat / 서블릿 컨테이너]
   │
   ▼
┌─────────────┐
│   Filter    │ ← 여기 (스프링 진입 전)
└─────────────┘
   │
   ▼
[DispatcherServlet]   ← 여기부터 스프링 영역
   │
   ▼
[Interceptor]
   │
   ▼
[Controller]
```

## 왜 필요한가

모든 페이지에서 공통으로 필요한 작업(인코딩, 보안, 로깅)을 컨트롤러마다 복붙하면
코드가 엉망이 된다. 한 곳에서 **요청을 가로채서 처리**할 방법이 필요했고,
그것이 [[servlet-spec|서블릿 스펙]]에 처음 들어간 기술이 Filter다.

## 주로 하는 일

| 책임 | 예시 |
| --- | --- |
| **인코딩** | UTF-8 강제 (`CharacterEncodingFilter`) |
| **웹 보안** | XSS 방어, CORS 처리 |
| **요청/응답 변형** | [[http-method-override]] — POST를 PUT으로 갈아끼움 |
| **공통 로깅** | 모든 요청의 접근 기록 |
| **압축 / 캐시** | gzip, ETag |

**핵심 특징**: 스프링을 거치기 전이므로, 순수한 **HTTP 요청/응답 자체를 가공**하는 데 특화된다.

## 구현 골격

```java
public class MyFilter implements Filter {
    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        // 요청 전 처리
        HttpServletRequest http = (HttpServletRequest) req;
        // ...

        chain.doFilter(req, res);   // 다음 필터 or 디스패처로 넘김

        // 응답 후 처리
    }
}
```

[[spring-bean]]으로 등록하려면 `FilterRegistrationBean`을 `@Bean`으로 노출하면 된다.

## Interceptor와의 결정적 차이

- **Bean 주입**: Filter는 [[servlet-spec|서블릿 스펙]] 객체라 [[spring-bean]] 주입이 자유롭지 않다.
  `FilterRegistrationBean`을 거치는 우회 등록이 필요.
- **예외 처리**: Filter에서 발생한 예외는 스프링의 `@ControllerAdvice`가 **잡지 못한다**.
  → 톰캣의 기본 에러 페이지가 그대로 노출될 수 있다.
- **다룰 수 있는 정보**: `HttpServletRequest`/`Response`만 본다. 어떤 컨트롤러로
  갈지(HandlerMethod)는 모른다 — 그건 디스패처가 정한 뒤니까.

> ⚠️ "메서드 변환"처럼 **요청 자체를 갈아끼워야 하는** 일은 인터셉터로는 못 한다.
> 요청 객체가 immutable이라, 디스패처가 메서드를 확정한 뒤에는 못 바꾸기 때문.
> → [[http-method-override]] 참고.

## 영균의 학습 트리에서

- [[servlet]] 학습의 자연스러운 확장. "Servlet은 컨테이너가 호출하는 콜백"이라는
  모델이 그대로 이어진다 — Filter도 컨테이너가 호출하는 콜백이다.
- 스프링으로 넘어가도 Filter는 그대로 살아 있다. 스프링이 추상화한 것은
  Servlet → Controller지, Filter는 아니다. **Spring Security가 Filter Chain으로 구현**된 것이 대표적.

## 관련 페이지

- [[interceptor]] — 같은 "가로채기"지만 스프링 영역에서 작동
- [[filter-vs-interceptor]] — 두 가로채기 기술의 비교와 선택 기준
- [[servlet-container]] — Filter가 사는 무대
- [[servlet]] — Filter와 같은 [[servlet-spec|서블릿 스펙]] 가족
- [[http-method-override]] — Filter여야만 가능한 대표 사례
- [[dispatcher-servlet]] — Filter 다음 단계 (스프링 진입점)
- 흐름: [[spring-mvc-request-flow]] — Filter가 끼는 전체 파이프라인
- 출처: [[spring-framework-1-note]]

## OncePerRequestFilter와 doFilterInternal

Spring Security JWT 실습에서 만든 `JwtAuthenticationFilter`는 [[once-per-request-filter]]를 상속한다. 이때 `doFilterInternal()`은 "현재 필터가 이번 요청에서 할 일"을 작성하는 메서드이고, `filterChain.doFilter(request, response)`는 다음 필터 또는 Controller로 요청을 넘기는 호출이다.

```text
doFilterInternal()
-> 토큰 추출/검증/인증 저장
-> filterChain.doFilter()
-> 다음 필터 또는 Controller
```

Spring Security의 내장 필터들도 모두 필터 체인에서 실행되지만, 각 필터가 반드시 `doFilterInternal()`만 쓰는 것은 아니다.
