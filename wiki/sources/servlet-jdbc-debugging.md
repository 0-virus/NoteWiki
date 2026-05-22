---
type: source
tags: [java, servlet, jsp, jdbc, dao, debugging, clippings/claude]
updated: 2026-05-19
sources: ["raw/dialogues/conversation.md"]
---

# 소스: Servlet+JDBC 실습 디버깅 (Claude 대화)

> 원본: `raw/dialogues/conversation.md`
> Claude와의 대화 — `jwbook` 부트캠프 프로젝트(`ch05`·`ch06`)에서 마주친
> 17개 오류·수정 기록 · 2026-05-19 인제스트.

## 맥락 (왜 저장했나)

**Servlet+JDBC 요청 처리 흐름을 복습하려고** 저장한 대화다. 영균은 현재 부트캠프
실습으로 Controller·DAO·JSP를 직접 손으로 짜며 `jwbook` 프로젝트를 만들고 있고,
**Spring 진입 직전** 단계다.

> 이 소스는 [[servlet-jsp-dialogue]]의 다음 가지다. 그 대화가 Servlet/JSP의 *개념*을
> 잡은 것이라면, 이 대화는 같은 구조를 **실제 코드로 짜다 깨진 지점들의 기록**이다.
> 개념 → 실습으로의 자연스러운 확장.

## 핵심 주장 (Key Claims)

- **JDBC는 표준 인터페이스**다. Driver만 바꾸면 DB가 바뀌어도 코드가 그대로다.
  `executeQuery()`는 SELECT(ResultSet 반환), `executeUpdate()`는 INSERT/UPDATE/DELETE
  (영향 행 수 반환).
- **`ResultSet`은 커서**다. `rs.next()`의 반환값이 곧 루프 종료 조건 —
  `while(rs.next())`가 정석, `while(true)`는 행 소진 후 `SQLException`.
- **DB 자원은 연 순서의 역순으로 닫는다**(pstmt → conn). 안 닫으면 커넥션 누수,
  `open()` 실패 대비해 `null` 체크 필수.
- **DAO 패턴**은 데이터 접근을 한 객체로 모은다. 반환 타입이 의미를 말한다 —
  여러 건은 `List`, 단건은 `if(rs.next())` 후 없으면 `null`.
- **EL `${...}`이 안 풀리는 3대 원인**: attribute 이름 불일치 · `taglib` URI 누락 ·
  `isELIgnored="false"` 누락.
- 디버깅은 **위에서 아래로 의심을 좁히는 일**이다 — 404의 진짜 원인이 JDBC URL도
  빌드도 아닌 톰캣의 `contextPath` 설정이었던 사례.

## 자주 한 실수 — 체크리스트

실습에서 반복해서 막힌 지점들. 같은 오류를 다시 안 내려는 복습용 정리.

| # | 증상 | 원인 | 교훈 |
| --- | --- | --- | --- |
| 1 | `NullPointerException` at `switch(action)` | `getParameter`가 `null` → `null.hashCode()` | `switch` 진입 전 null 기본값 처리 (`if(action==null) action="list"`) |
| 2 | `${product.xxx}` 안 풀림 | attribute 이름 불일치 + taglib 누락 + 빈 `${}` | → [[jstl-el]] 3원인 |
| 3 | `${...}`가 글자 그대로 출력 | `isELIgnored="false"` 누락 | page 지시자를 JSP마다 확인 |
| 4 | Docker 이미지 못 찾음 | `-P`(랜덤 매핑) ≠ `-p`(포트 지정), `MYSQL` ≠ `mysql` | 옵션 대소문자·이미지명 소문자 |
| 7 | `SQLException`으로 루프 종료 | `while(true)` — `rs.next()` 무시 | `while(rs.next())` → [[jdbc]] |
| 9 | 커넥션 누수 | `close()`가 비었거나 `conn`만 닫음 | pstmt→conn 역순, null 체크 → [[jdbc]] |
| 12a | 화면이 안 바뀜 | `forward` 호출 누락 | view 문자열만 만들고 `getRequestDispatcher().forward()` 빠짐 |
| 12b | 날짜가 이상함 | `"yyyy-mm-dd"`의 `mm`=분(minute) | 월은 대문자 `MM` → `"yyyy-MM-dd"` |
| 12c | `ClassCastException` | `(java.sql.Date) birth` 강제 캐스팅 | `new java.sql.Date(birth.getTime())`로 변환 → [[dao-pattern]] |
| 14 | `//` 이중 슬래시 경로 | `"/ch06/" + "/student/..."` | 경로 조각을 합칠 때 슬래시 중복 주의 |
| 17 | HTTP 404 | 톰캣 `contextPath`가 `/jwbook` 아닌 `/` | SmartTomcat `workspace.xml` 설정 확인 |

> takeaway: 오류의 **층(layer)을 의심하는 순서**가 중요하다. 17번처럼 코드(JDBC·빌드)를
> 다 뒤져도 안 나오면, 그 아래 **실행 환경(톰캣 설정)**을 봐야 한다.

## 엔티티 (Entities)

- 도구: JDBC, MySQL, Docker, Connector/J, JSTL, SmartTomcat
- 프로젝트: `jwbook` (artifactId), 패키지 `ch05`·`ch06`
- 개념 키워드: NPE, ResultSet, DAO, EL, forward, contextPath, executeUpdate

## 위키 반영

- [[jdbc]] — *(신규)* Java의 표준 DB 접근 API, Driver/Connection/ResultSet, 자원 해제
- [[dao-pattern]] — *(신규)* 데이터 접근을 전담 객체로 분리하는 패턴
- [[jstl-el]] — *(신규)* JSP의 `${...}`·`<c:forEach>`, EL이 안 풀리는 원인
- [[jsp]] — EL/JSTL 가지 추가
- [[mvc-pattern]] — Controller→DAO→JSP 데이터 접근 계층 추가
- 흐름: [[servlet-to-spring-mvc]] — DAO·JDBC가 Spring `@Repository`로 이어지는 맥락
