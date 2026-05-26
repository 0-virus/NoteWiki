---
type: concept
tags: [java, spring, mvc, interceptor, web]
updated: 2026-05-21
sources: ["raw/notes/Spring Framework.md"]
---

# Interceptor (스프링 인터셉터)

## 한 줄 정의

**`DispatcherServlet`이 컨트롤러를 호출하기 전/후에 요청을 가로채는** 스프링 MVC 컴포넌트.
[[filter]]와 다르게 **스프링 영역 안**에서 동작한다.

## 비유 — 702호 문 앞의 사설 경호원 / 비서

정문 경비([[filter]])를 통과해 로비([[mvc-pattern]] / DispatcherServlet)에서 안내를 받고,
엘리베이터를 타고 702호 앞에 도착했을 때 — **초인종 누르기 직전** 문 앞을 지키고
있는 사설 경호원(또는 개인 비서)이 인터셉터다.

- "입주민 연락처나 초대장 있으신가요?" → **로그인 세션 확인**
- "이분 블랙리스트인데 돌려보낼게요." → **권한(Role) 체크**
- "전화 왔다고 전해드릴게요." → **컨트롤러별 사전/사후 처리**

특징: 입주민(컨트롤러) 바로 앞에서 일하기 때문에, 입주민의 사정(스프링의 Bean과 데이터)을
**아주 잘 알고 소통도 자유롭다**.

## 위치 — 흐름에서 어디에 있는가

```
[Filter] ─▶ [DispatcherServlet] ─▶ ┌─────────────┐ ─▶ [Controller]
                                  │ Interceptor │
                                  │  preHandle  │
                                  └─────────────┘
                                  ↑ 컨트롤러 호출 직전
```

3단계 훅을 가진다:

| 훅 | 시점 | 반환/효과 |
| --- | --- | --- |
| `preHandle` | 컨트롤러 호출 **전** | `false` 반환 시 컨트롤러 호출을 막음 |
| `postHandle` | 컨트롤러 호출 **후**, View 렌더링 **전** | ModelAndView를 손볼 수 있음 |
| `afterCompletion` | View 렌더링까지 **완료된 후** | 자원 정리, 감사 로그 |

## 왜 또 두었나 — Filter만으로는 부족했던 이유

영균의 자연스러운 질문: "필터만으로 다 할 수 있는 거 아닌가요?"

가능은 하다. 하지만 다음의 차이 때문에 스프링은 **별도의 가로채기 계층**을 따로 두었다.

1. **Bean을 자유롭게 주입받고 싶다.**
   필터는 [[servlet-spec|서블릿 스펙]] 객체라 `@Autowired UserService`가 자연스럽지 않다.
   인터셉터는 스프링 Bean이라 그냥 주입받으면 된다.

2. **HandlerMethod를 알고 싶다.**
   필터는 "어느 컨트롤러로 갈지" 모른다. 인터셉터는 디스패처가 정한 뒤이므로
   `HandlerMethod`를 받아 — "이 메서드에 어떤 어노테이션이 붙었는지"까지 본다.
   `@AdminOnly` 같은 정책 어노테이션 기반 검사가 가능해진다.

3. **예외를 우아하게 처리할 수 있다.**
   필터에서 던진 예외는 톰캣 기본 에러 페이지로 빠지지만,
   인터셉터에서 던진 예외는 `@ControllerAdvice`가 받아 JSON/뷰로 변환할 수 있다.

> 정리: **거친 그물(Filter)**로 단지 전체를 막고, **정교한 손길(Interceptor)**로
> 호수마다 다르게 검사한다. — 같은 일을 두 명이 하는 게 아니라, **다른 깊이로 다른 일**을 한다.

## 주로 하는 일

| 책임 | 예시 |
| --- | --- |
| **로그인 세션 체크** | `HttpSession`에 로그인 정보가 있는지 |
| **권한(Role) 체크** | 컨트롤러 메서드의 `@AdminOnly` 검사 |
| **감사 로그** | 어느 사용자가 어느 핸들러를 호출했는지 |
| **성능 측정** | 컨트롤러별 실행 시간 |
| **공통 모델 추가** | 모든 화면에 로그인 사용자 정보 주입 |

## 구현 골격

```java
@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final UserService userService;   // ★ Bean 주입 자유로움

    public AuthInterceptor(UserService userService) {
        this.userService = userService;
    }

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            res.sendRedirect("/login");
            return false;   // ★ 컨트롤러 호출 차단
        }
        return true;
    }
}
```

등록은 `WebMvcConfigurer.addInterceptors()`로:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new AuthInterceptor(userService))
                .addPathPatterns("/admin/**")
                .excludePathPatterns("/admin/login");
    }
}
```

## ⚠️ 인터셉터로 못 하는 일

요청 객체의 **HTTP 메서드를 갈아끼우는 일**은 못 한다.
디스패처가 메서드를 확정한 뒤이기 때문 — 요청 객체가 immutable이라 변경 불가.

→ 그런 변형은 [[filter]]에서 `HttpServletRequestWrapper`로 감싸 처리한다.
→ 자세한 사례: [[http-method-override]]

## 영균의 학습 트리에서

- [[mvc-pattern]] / [[spring-framework]] 학습의 자연스러운 다음 단계.
  "DispatcherServlet이 어떻게 컨트롤러로 요청을 보내는가" 흐름에서 **딱 그 사이**에 끼는 부품.
- [[dependency-injection]]의 가치를 체감하는 좋은 예시 — 같은 일을 Filter로 하면
  `UserService` 주입이 어색하지만, 인터셉터로 하면 그냥 생성자 주입으로 끝난다.

## 관련 페이지

- [[filter]] — 정문 경비. 인터셉터 이전의 가로채기
- [[dispatcher-servlet]] — 인터셉터를 호출하는 디스패처 본문
- [[filter-vs-interceptor]] — 둘의 차이와 선택 기준
- [[mvc-pattern]] — 인터셉터가 끼는 무대
- [[spring-framework]] — 인터셉터가 속한 세계
- [[dependency-injection]] — 인터셉터의 강점이 살아나는 이유
- [[http-method-override]] — 인터셉터로 못 하는 일의 대표 사례
- 흐름: [[spring-mvc-request-flow]] — 인터셉터가 끼는 전체 파이프라인
- 출처: [[spring-framework-1-note]]
