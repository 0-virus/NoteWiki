---
type: flow
tags: [java, servlet, spring, web]
updated: 2026-05-19
sources: ["raw/dialogues/Servlet과 JSP의 차이 및 활용.md", "raw/dialogues/conversation.md"]
---

# 흐름: Servlet/JSP → Spring MVC 진입

> 영균의 목표(이 소스 캡처 이유): **Spring으로 넘어가기 전, Servlet/JSP가
> Spring MVC로 어떻게 이어지는지 연결 흐름을 정리한다.** 현재 [[servlet-container]](Tomcat)
> 실습 단계 → 다음이 Spring MVC.

## 흐름 한눈에

```
Tomcat 실습  →  Servlet/JSP 원리  →  Spring MVC
 (지금)         (이 소스)            (다음)
```

Spring은 새 기술이 아니라 **Servlet 구조를 추상화**한 것이다.
아래 표가 이 흐름의 핵심 — 왼쪽을 알면 오른쪽이 "왜 저렇게 생겼는지" 보인다.

## 무엇이 무엇으로 추상화되나

| Servlet/JSP 세계 | Spring MVC 세계 | 연결 페이지 |
| --- | --- | --- |
| `doGet` / `doPost` 오버라이드 | `@GetMapping` / `@PostMapping` | [[servlet]] |
| 요청을 받는 진입 Servlet | `DispatcherServlet` (Front Controller) | [[servlet]] |
| 뷰 파일 경로를 직접 forward | `ViewResolver`가 뷰 이름 → 파일 연결 | [[mvc-pattern]] |
| [[jsp]] (View) | Thymeleaf 등 템플릿 엔진 | [[jsp]] |
| `res.sendRedirect()` | `return "redirect:/home"` | [[prg-pattern]] |
| 세션·쿼리스트링으로 redirect 데이터 | `RedirectAttributes` | [[forward-vs-redirect]] |
| Tomcat 따로 설치 + `.war` 배포 | 내장 Tomcat + `.jar` 실행 | [[servlet-container]] |
| Servlet 싱글톤 (Tomcat 관리) | Spring Bean 싱글톤 (Container 관리) | [[spring-bean]] |
| 손으로 짠 DAO 클래스 | `@Repository` / Spring Data JPA | [[dao-pattern]] |
| `Connection` 열고 `close()` 직접 | `DataSource`·`JdbcTemplate`이 관리 | [[jdbc]] |

## 두 문장으로 확인하는 준비도

이 소스가 제시한 기준 — 아래 두 문장이 자연스럽게 이해되면 Spring 진입 준비 완료다.

> `DispatcherServlet`은 모든 요청을 받는 **Front Controller** 역할의 Servlet이다.

> `@Controller` 메서드가 반환하는 뷰 이름을 **ViewResolver**가
> 실제 JSP/Thymeleaf 파일로 연결해준다.

## 어디까지 알면 되나

Spring 진입에는 **"동작 원리 이해"** 수준이면 충분하다. 능숙하게 짤 필요는 없다.

- **꼭 알 것**: 요청-응답 흐름, [[mvc-pattern]]의 분리 이유, "JSP는 결국 [[servlet]]",
  [[servlet-container]](Tomcat)의 역할, [[forward-vs-redirect]] 차이
- **몰라도 될 것**: [[jsp]] 태그 문법 세부, `web.xml` 직접 작성, 필터·리스너 심화

## 왜 이 순서로 배우나

Spring은 위 표의 오른쪽을 다 감춰준다. 하지만 디버깅·설계에서 막히면
결국 왼쪽으로 내려가야 한다. 추상화의 바닥을 먼저 본 사람만이
추상화의 편함을 "이해하고" 쓴다 — 영균의 원리 우선 학습 방식과 정확히 맞는 순서다.

## 관련 페이지

- 개념: [[servlet]] · [[jsp]] · [[servlet-container]] · [[servlet-lifecycle]] ·
  [[mvc-pattern]] · [[dispatcher-servlet]] · [[forward-vs-redirect]] · [[prg-pattern]] · [[spring-bean]] ·
  [[dao-pattern]] · [[jdbc]] · [[jstl-el]]
- 흐름: [[spring-mvc-request-flow]] — Spring 진입 후 한 요청의 풀 파이프라인
- 출처: [[servlet-jsp-dialogue]], [[servlet-jdbc-debugging]]
