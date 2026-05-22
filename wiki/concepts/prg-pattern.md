---
type: concept
tags: [java, web, http, pattern]
updated: 2026-05-19
sources: ["raw/dialogues/Servlet과 JSP의 차이 및 활용.md"]
---

# PRG 패턴 (Post-Redirect-Get)

## 한 줄 정의

POST 요청을 처리한 뒤 **곧바로 Redirect**해서, 결과 페이지를 GET으로 보여주는 패턴.
**새로고침에 의한 중복 처리를 막는다.**

## 왜 필요한가 — 문제 상황

로그인·회원가입·결제처럼 POST로 처리한 뒤, 결과 페이지를 [[forward-vs-redirect]]의
**forward**로 보여줬다고 하자. 이때 주소창은 여전히 POST를 보낸 URL이다.

```
브라우저 주소창: /login (POST 상태 유지)
```

사용자가 **새로고침**을 누르면 브라우저는 "POST /login을 다시 보낼까요?" 팝업을 띄운다.
확인하면 로그인·결제 요청이 **또 날아간다** → 중복 가입, 중복 결제.

## 해결 — POST 후 Redirect

```
POST /login → (처리) → Redirect → GET /home
```

POST 처리가 끝나면 결과를 직접 그리지 말고 다른 URL로 [[forward-vs-redirect]]의
**redirect**를 한다. 그러면 주소창이 GET URL로 바뀌고, 이후 새로고침은
**GET /home만 반복**되므로 안전하다. GET은 멱등(idempotent)하니 여러 번 해도 무해.

## 핵심 원리

> "위험한 동작(POST)을 주소창에 남기지 않는다."
> 새로고침은 주소창의 요청을 그대로 재실행하므로, 그 자리에 안전한 GET만 두면 된다.

## Spring으로 이어지는 지점

Spring MVC에서도 이 개념이 그대로 쓰인다 — 컨트롤러에서 `"redirect:/home"`을
반환하는 방식. 원리를 알면 Spring의 redirect 반환이 왜 그렇게 생겼는지 바로 이해된다.

## 관련 페이지

- [[forward-vs-redirect]] — PRG의 redirect가 무엇인지
- [[servlet]] — POST는 doPost에서 처리
- [[servlet-to-spring-mvc]] — Spring에서의 redirect 반환
- 출처: [[servlet-jsp-dialogue]]
