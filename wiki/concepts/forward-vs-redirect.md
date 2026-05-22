---
type: concept
tags: [java, web, http]
updated: 2026-05-19
sources: ["raw/dialogues/Servlet과 JSP의 차이 및 활용.md"]
---

# Forward vs Redirect

## 한 줄 정의

둘 다 "다른 페이지로 이동"이지만, **누가 이동시키느냐**가 핵심 차이다.
Forward는 서버가, Redirect는 브라우저가 이동한다.

## Forward — 서버 내부 이동

서버 내부에서 [[servlet]] → [[jsp]]로 넘긴다. **브라우저는 이동했다는 사실조차 모른다.**

```java
req.setAttribute("users", userList);   // 데이터 담고
req.getRequestDispatcher("/WEB-INF/users.jsp").forward(req, res); // 넘김
```

요청이 1번뿐이라 **request 객체가 그대로 유지**된다 → `setAttribute`로 데이터 전달 가능.
주소창은 변하지 않는다.

## Redirect — 브라우저 재요청

브라우저에게 "딴 데로 가"라고 명령한다. 브라우저가 직접 새 요청을 보낸다.

```java
res.sendRedirect("/home");
```

```
브라우저 → [POST /login] → 서버
브라우저 ← [302 + Location: /home] ← 서버   "거기로 가"
브라우저 → [GET /home] → 서버               브라우저가 새 요청
```

요청이 **2번** 일어나고, 새 요청이라 **request 객체가 초기화**된다 →
`setAttribute`로 담은 데이터는 사라진다. 주소창은 `/home`으로 바뀐다.

## 나란히 비교

|  | Forward | Redirect |
| --- | --- | --- |
| 이동 주체 | 서버 | 브라우저 |
| 요청 횟수 | 1번 | 2번 |
| 주소창 변화 | 없음 | 변경됨 |
| request 유지 | 유지됨 | 초기화됨 |
| 데이터 전달 | `setAttribute` 가능 | 세션·쿼리스트링 써야 함 |

## 언제 무엇을 쓰는가

- **Forward** → 같은 요청 흐름 안에서 View만 바꿀 때 (예: 조회 후 JSP 렌더링). [[mvc-pattern]]의 기본.
- **Redirect** → 다른 흐름으로 완전히 넘길 때, 특히 **POST 처리 후**. → [[prg-pattern]]

### Redirect 후 데이터 전달

request가 사라지므로 두 수단을 쓴다.

- **쿼리스트링** → 가볍고 공개돼도 되는 데이터. `sendRedirect("/result?status=success")`. URL 노출되므로 민감정보 금지.
- **세션** → 로그인 정보처럼 민감하거나 여러 요청에 걸쳐 유지할 데이터. 서버에 저장되고 브라우저엔 세션 ID만 쿠키로 남아 상대적으로 안전.

> Spring에서는 `RedirectAttributes`로 이 문제를 더 깔끔히 처리한다 — 개념이 잡혀 있으면 바로 이해된다.

## 관련 페이지

- [[mvc-pattern]] — Controller→View 전달에 forward 사용
- [[prg-pattern]] — POST 후 redirect를 쓰는 이유
- 출처: [[servlet-jsp-dialogue]]
