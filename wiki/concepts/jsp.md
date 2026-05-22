---
type: concept
tags: [java, jsp, web]
updated: 2026-05-19
sources: ["raw/dialogues/Servlet과 JSP의 차이 및 활용.md", "raw/dialogues/conversation.md"]
---

# JSP (JavaServer Pages)

## 한 줄 정의

**HTML 파일 안에 Java 코드를 삽입하는 방식.** [[servlet]]의 반대 방향 접근.

## 구조

```jsp
<%@ page contentType="text/html;charset=UTF-8" %>
<% String name = request.getParameter("name"); %>
<html><body>
    <h1>Hello, <%= name %>!</h1>
</body></html>
```

HTML이 바깥, Java가 안. [[servlet]]이 "Java 안에 HTML"이었던 것과 정반대다.
훨씬 HTML스러워서 화면 렌더링에 적합하다.

### 주요 태그

| 태그 | 용도 |
| --- | --- |
| `<% %>` | Java 코드 실행 |
| `<%= %>` | 값 출력 |
| `<%@ %>` | 지시자 (import 등) |
| `<%! %>` | 멤버 변수/메서드 선언 |

## 스크립틀릿을 넘어: EL과 JSTL

위 표의 `<% %>`(스크립틀릿)를 많이 쓰면 JSP가 다시 Java 코드로 지저분해진다.
실무에서는 값 출력·반복·분기를 **EL `${...}`과 JSTL `<c:forEach>` 태그**로 처리해
화면을 선언적으로 유지한다. 실습에서 `${...}`이 안 풀리는 문제는 거의 정형화돼 있다.
→ [[jstl-el]]

## 핵심 원리: JSP는 결국 Servlet이다

가장 중요한 포인트. JSP 파일은 서버에서 **자동으로 Servlet 클래스로 변환·컴파일**된다.

```
hello.jsp → hello_jsp.java (Servlet) → hello_jsp.class → 실행
```

즉 JSP는 새로운 기술이 아니라 **Servlet을 편하게 쓰기 위한 문법적 설탕(Syntactic Sugar)**이다.
브라우저가 받는 결과물은 Servlet이 만든 것과 동일하다.

## 왜 알아둬야 하나

Spring은 JSP 대신 **Thymeleaf** 같은 템플릿 엔진을 주로 쓴다. "JSP=Servlet 변환"의
구조를 이해하면, Spring이 왜 별도 템플릿 엔진을 두고 View를 분리하는지 맥락이 잡힌다.
Spring 진입 단계에서는 태그 문법을 세세히 외울 필요는 없다 — 변환 원리만 알면 충분.

## 관련 페이지

- [[servlet]] — JSP가 변환되는 대상, 짝이 되는 기술
- [[jstl-el]] — JSP에서 스크립틀릿을 대체하는 표현 도구
- [[mvc-pattern]] — JSP는 View 역할
- [[servlet-to-spring-mvc]] — JSP → Thymeleaf로 이어지는 흐름
- 출처: [[servlet-jsp-dialogue]], [[servlet-jdbc-debugging]]
