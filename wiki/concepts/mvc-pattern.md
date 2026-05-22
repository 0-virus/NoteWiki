---
type: concept
tags: [java, web, architecture, mvc]
updated: 2026-05-19
sources: ["raw/dialogues/Servlet과 JSP의 차이 및 활용.md", "raw/dialogues/conversation.md"]
---

# MVC 패턴 (Servlet + JSP)

## 한 줄 정의

[[servlet]]과 [[jsp]]가 각자 잘하는 일로 **역할을 분리해 협업하는** 구조.
Servlet은 Controller, JSP는 View.

## 왜 분리하는가

- [[servlet]]은 로직 처리에 강하지만 HTML 작성이 불편하다.
- [[jsp]]는 화면 렌더링에 강하지만 복잡한 로직 작성이 불편하다.

→ 서로의 약점을 약점인 채로 두지 않고, **강점만 쓰도록 역할을 나눈다.** 이것이 MVC.

## 흐름

```
[브라우저] ──요청──▶ [Servlet]  ← Controller: 요청 처리, 비즈니스 로직, DB 접근
                         │ 결과 데이터를 request에 담아 forward
                         ▼
                     [JSP]      ← View: 데이터를 받아 HTML로 렌더링
[브라우저] ◀──응답────────┘
```

```java
// Servlet (Controller)
List<User> users = userService.findAll();   // 비즈니스 로직
req.setAttribute("users", users);            // 데이터 전달
req.getRequestDispatcher("/WEB-INF/users.jsp").forward(req, res); // View로 넘김
```

```jsp
<%-- JSP (View) --%>
<c:forEach var="user" items="${users}">
    <p>${user.name}</p>
</c:forEach>
```

Servlet이 `setAttribute`로 담은 데이터를 JSP가 `${변수명}`으로 꺼낸다.
이 전달은 [[forward-vs-redirect]]의 **forward**로 이뤄진다 (request 객체가 유지되므로).

## Controller 아래: DAO 계층

위 흐름에서 Controller가 한다고 적은 "DB 접근"은, 실제 코드에서는 Controller가 직접
SQL을 쓰지 않고 **[[dao-pattern]]에 위임**한다.

```
[브라우저] ─▶ [Servlet/Controller] ─▶ [DAO] ─▶ [Database]
                  요청 처리·흐름        SQL·JDBC
```

Controller가 SQL까지 들고 있으면 화면 흐름 제어와 DB 접근이 한 클래스에 뒤엉킨다.
DAO로 떼어내면 Controller는 `studentDAO.findAll()`의 **의도만** 다루고, [[jdbc]]
세부는 DAO 안에 머문다 — MVC의 "역할 분리" 원칙을 데이터 접근까지 확장한 것이다.

> ⚠️ 실습 함정: Controller에서 view 경로 문자열만 만들고 `forward`를 빼먹으면 화면이
> 넘어가지 않는다. 데이터를 담는 것(`setAttribute`)과 넘기는 것(`forward`)은 별개 단계다.

## Spring으로 이어지는 지점

Spring MVC는 이 구조를 더 추상화한 것이다. [[dispatcher-servlet]]이 Front Controller로
모든 요청을 받고, `@Controller`가 반환한 뷰 이름을 `ViewResolver`가 실제 View 파일로
연결한다. 골격은 동일 — Controller가 데이터를 만들고 View가 그린다. → [[servlet-to-spring-mvc]] · [[spring-mvc-request-flow]]

## MVC ≠ 3-tier — 다른 축의 분리

영균이 헷갈리기 쉬운 지점: MVC와 [[three-tier-architecture]]는 같은 게 아니다.

- **MVC**: 표현 패턴. Controller / View / Model로 **화면 관련 책임**을 분리.
- **3-tier**: 시스템 계층. Web / Service / Repository로 **시스템 전체**를 위아래로 분리.

Spring에서는 둘이 동시에 적용된다. `@Controller`는 MVC의 Controller이면서 3-tier의 Web Layer이고, 그 아래로 `@Service` → `@Repository`가 이어진다. 위 흐름도의 "Controller → DAO → Database"가 정식 명칭으로는 Web → Service → Repository.

## 관련 페이지

- [[servlet]] — Controller 역할
- [[jsp]] — View 역할
- [[dao-pattern]] — Controller 아래 데이터 접근 계층
- [[jdbc]] — DAO가 실제 DB에 접근하는 수단
- [[forward-vs-redirect]] — Controller→View 데이터 전달 수단
- [[three-tier-architecture]] — MVC와 동시에 적용되는 시스템 계층 분리
- [[servlet-to-spring-mvc]] — Spring MVC로의 발전
- 출처: [[servlet-jsp-dialogue]], [[servlet-jdbc-debugging]]
