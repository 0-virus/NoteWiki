---
type: concept
tags: [java, servlet, web]
updated: 2026-05-19
sources: ["raw/dialogues/Servlet과 JSP의 차이 및 활용.md"]
---

# Servlet

## 한 줄 정의

**웹 요청을 처리하는 주체가 되는 Java 클래스.** HTTP 요청을 받아 응답을 만들어 보낸다.

## 구조

`HttpServlet`을 상속하고, HTTP 메서드별 처리 메서드를 오버라이드한다.

```java
@WebServlet("/hello")
public class HelloServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        String name = req.getParameter("name");   // 요청 파라미터 읽기
        res.setContentType("text/html;charset=UTF-8");
        PrintWriter out = res.getWriter();
        out.println("<h1>Hello, " + name + "!</h1>"); // HTML을 문자열로 작성
    }
}
```

핵심 형태는 **Java 코드 안에 HTML을 문자열로 끼워 넣는 것**. 로직 처리는 강력하지만
HTML이 많아질수록 유지보수가 어렵다. → 이 약점을 보완하는 짝이 [[jsp]].

## doGet / doPost — HTTP 메서드와 연결

`doGet`·`doPost`·`doPut`·`doDelete`는 각각 HTTP 메서드 GET/POST/PUT/DELETE에 대응한다.
브라우저가 해당 URL로 GET 요청을 보내면 `doGet`이, POST면 `doPost`가 호출된다.

> Spring에서는 이게 `@GetMapping`·`@PostMapping` 어노테이션으로 추상화된다 —
> 어노테이션이 결국 `doGet`/`doPost`를 감싼 것. ([[servlet-to-spring-mvc]] 참고)

## 왜 이렇게 동작하는가

Servlet은 혼자 HTTP를 다루지 못한다. TCP 연결 수락, HTTP 파싱, 응답 변환은
**[[servlet-container]](Tomcat)**가 대신 한다. 개발자는 `doGet` 안의 비즈니스 로직만 채운다.
즉 Servlet은 "컨테이너가 호출해주는 콜백"에 가깝다 — 이 분담이 Servlet 모델의 핵심.

## 관련 페이지

- [[servlet-spec]] — Servlet 인터페이스를 정의한 표준 명세서
- [[jsp]] — Servlet의 HTML 작성 불편을 보완하는 짝
- [[servlet-container]] — Servlet을 실행·관리하는 런타임
- [[servlet-lifecycle]] — init/service/destroy, 싱글톤 관리
- [[mvc-pattern]] — Servlet은 Controller 역할
- [[servlet-to-spring-mvc]] — Spring으로의 추상화 흐름
- 출처: [[servlet-jsp-dialogue]]
