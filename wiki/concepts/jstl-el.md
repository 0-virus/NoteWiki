---
type: concept
tags: [java, jsp, jstl, el, web]
updated: 2026-05-19
sources: ["raw/dialogues/conversation.md"]
---

# JSTL과 EL (JSP 표현 도구)

## 한 줄 정의

- **EL (Expression Language)**: `${...}`로 값을 꺼내 쓰는 표현식.
- **JSTL (JSP Standard Tag Library)**: `<c:forEach>` 같은 **태그로 화면 로직**을 쓰는 라이브러리.

둘 다 [[jsp]]에서 Java 코드(`<% %>` 스크립틀릿)를 몰아내기 위한 도구다.

## 왜 필요한가

[[jsp]]는 "HTML 안에 Java"인데, 스크립틀릿 `<% %>`를 많이 쓰면 [[servlet]]에서 벗어나려던
JSP가 다시 Java로 지저분해진다. EL/JSTL은 **화면에서 자주 쓰는 일(값 출력·반복·분기)을
태그·표현식으로 깔끔하게** 만들어 이 문제를 푼다.

```jsp
<%-- 스크립틀릿: HTML 속에 Java 덩어리 --%>
<% for (Student s : list) { %> <td><%= s.getName() %></td> <% } %>

<%-- EL + JSTL: 선언적이고 HTML스럽다 --%>
<c:forEach var="s" items="${studentList}">
    <td>${s.name}</td>
</c:forEach>
```

EL의 출처는 [[mvc-pattern]]: Controller가 `setAttribute("studentList", ...)`로 담은
값을 JSP가 `${studentList}`로 꺼낸다.

## `${...}`가 안 풀릴 때 — 흔한 3원인

실습에서 가장 자주 막히는 지점이다. EL이 동작하지 않으면 거의 이 셋 중 하나다.

| 원인 | 증상 | 해결 |
| --- | --- | --- |
| **attribute 이름 불일치** | 값이 비어 보임 | Controller `setAttribute` 이름과 JSP `${이름}`을 일치 |
| **taglib URI 누락** | `<c:forEach>`가 동작 안 함 | `<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>` 선언 |
| **`isELIgnored` 미설정** | `${...}`가 **문자 그대로** 출력됨 | `<%@ page ... isELIgnored="false" %>` 추가 |

> ⚠️ 셋째가 특히 함정이다 — 한 JSP에는 `isELIgnored="false"`가 있고 다른 JSP에는
> 빠지면, 같은 코드인데 한쪽만 EL이 풀린다. 페이지마다 page 지시자를 확인할 것.

## Spring으로 이어지는 지점

Spring MVC는 JSP+JSTL 대신 **Thymeleaf** 같은 템플릿 엔진을 주로 쓴다. `<c:forEach>`는
`th:each`로, `${...}`는 Thymeleaf의 표현식으로 대응된다 — **"데이터를 꺼내 화면을
반복·분기로 그린다"**는 발상은 동일하다. → [[servlet-to-spring-mvc]]

## 관련 페이지

- [[jsp]] — JSTL/EL이 얹히는 토대, 스크립틀릿을 대체
- [[mvc-pattern]] — `setAttribute`로 담긴 데이터를 EL이 꺼낸다
- [[servlet-to-spring-mvc]] — JSTL/EL → Thymeleaf로 이어지는 흐름
- 출처: [[servlet-jdbc-debugging]]
