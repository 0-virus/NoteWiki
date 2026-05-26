---
type: source
tags: [java, spring, mybatis, debugging, practice, clippings/claude]
updated: 2026-05-26
sources: ["raw/notes/study-notes.md"]
---

# 소스: Spring Boot + MyBatis 실습 정리 (Claude 대화 디버깅)

> 원본: `raw/notes/study-notes.md`
> Claude Code와의 대화 — 부트캠프 MyBatis 단원 실습(`usertest` 프로젝트)에서
> 마주친 8가지 막힘 지점 정리 · 2026-05-26 인제스트.

## 맥락 (왜 저장했나)

영균이 직접 적은 원본 첫 줄:

> "MyBatis 실습을 하면서 claude code와 대화한 내용을 정리한 문서.
> **위키에 실습 관련 문서를 따로 모아두고 참고하고 싶음.**"

이 소스는 [[servlet-jdbc-debugging]]의 다음 가지다. 그 대화가 **JDBC를 직접 손으로 짜다
깨진 지점들**이었다면, 이 대화는 같은 영역을 **MyBatis로 한 단계 올린 뒤** 새로 만나는
함정들의 기록이다 — 자원 해제·ResultSet 순회는 사라졌지만, XML namespace·예외 매핑·
어노테이션 동작 시점 같은 **새로운 함정**이 그 자리를 채운다.

부트캠프 MyBatis 단원 실습 중이고, 이 패턴은 곧 본 Spring 프로젝트 백엔드의 영속성으로
이어진다.

## 핵심 주장 (Key Claims)

- **MyBatis는 ORM이 아니라 SQL Mapper다.** 객체-테이블 자동 매핑이 아닌, 메서드 호출 ↔
  SQL 1:1 연결. SQL 통제권은 그대로 개발자에게 있다. → [[mybatis]]
- **XML namespace는 Java 인터페이스의 정규명**과 일치해야 한다. 다른 프로젝트 패키지가
  남아 있으면 "Invalid bound statement" 또는 엉뚱한 쿼리 실행.
- **`<sql>` + `<include>`로 컬럼 목록을 재사용**하면, 모델 필드 추가 시 한 줄 수정으로
  모든 쿼리가 따라온다. 단 `@Select` 어노테이션은 이 혜택 밖.
- **HTTP 상태 코드는 "클라이언트가 다르게 반응해야 하면" 구분해 던진다.** 무지성 500이
  아니라 404·400·409를 적극 사용. `RuntimeException`은 Spring이 500으로 잡으므로
  `ResponseStatusException`이 필요. → [[http-status-codes]]
- **`@PathVariable required=false`는 동작하지 않는다** — URL 매칭 자체가 안 되기 때문.
  매칭 *이후* 옵션이라 매칭 전 단계에서는 무의미. 해법은 `@RequestParam` 전환 또는
  엔드포인트 두 개 매핑.
- **응답 래퍼(`ApiResponse`)는 실습 단계엔 과잉**, 실무·팀 프로젝트에서 자연스럽게 도입.
  → [[api-response-wrapper]]

## 자주 한 실수 — 체크리스트

실습 중 반복해서 막힌 지점들. 같은 오류를 다시 안 내려는 복습용 정리.

| # | 증상 | 원인 | 교훈 |
| --- | --- | --- | --- |
| 1 | XML 매핑 안 됨 | `mybatix.mapper-locations` 오타 + 값 비어 있음 | property 이름 오타는 Spring이 경고만 함 — 발견 어려움. `mybatis.mapper-locations=classpath:mappers/*.xml` → [[mybatis]] |
| 2 | "Invalid bound statement" | XML `namespace`가 다른 프로젝트 패키지를 가리킴 | namespace = Java 인터페이스 정규명. 프로젝트 시작 시 가장 먼저 확인 |
| 3 | XML 자체 invalid | `<select>` 닫는 태그 누락 | 빌드 단계가 아닌 런타임 첫 호출에서 터짐 — XML 변경 후 한 번은 띄워본다 |
| 4 | 500 Internal Server Error | `findById(999)` → `null` → `null.getId()` NPE | `null` 체크 + `ResponseStatusException(NOT_FOUND)` → [[http-status-codes]] |
| 5 | 404로 안 바뀜 | `throw new RuntimeException()`은 Spring이 500으로 잡음 | `ResponseStatusException` 또는 `@ResponseStatus` 커스텀 예외 |
| 5b | DB를 두 번 조회 | `if(null)` 체크 후 `findById()`를 한 번 더 호출 | 이미 가져온 변수 재사용 — 작은 차이지만 N+1의 첫 단추 |
| 6 | "Constructor takes 6 arguments, but 4 columns" | 모델에 필드 추가했는데 SQL 컬럼 그대로 | `<sql id="userColumns">`로 컬럼 목록 한 곳에 두고 `<include>` 사용 |
| 7 | `resultType="User"` 안 풀림 | `mybatis.type-aliases-package` 누락 | application.properties에 패키지 등록 → 전체 패키지명 생략 가능 |
| 8 | `/users/dept` 호출 시 404 | `@PathVariable(required=false)`는 URL 매칭 후 옵션 | `@RequestParam(required=false)`로 전환 (REST 적합), 또는 엔드포인트 2개 매핑 |

> takeaway: MyBatis는 [[jdbc]]의 반복 코드를 없애지만, **새로운 종류의 함정**(XML 설정·
> namespace 매핑·어노테이션 동작 시점)을 가져온다. 추상화는 항상 트레이드오프다 —
> 무엇이 사라졌고 무엇이 새로 등장했는지 추적하는 것이 학습.

## 엔티티 (Entities)

- 도구: MyBatis, Spring Boot, MySQL, JDBC, `ResponseStatusException`
- 프로젝트: `usertest` (MyBatis 단원 실습), 패키지 `org.example.usertest`
- 개념 키워드: namespace, type-aliases-package, map-underscore-to-camel-case,
  `<sql>`/`<include>`, ApiResponse, @PathVariable vs @RequestParam, HTTP 404/409/400

## 위키 반영

- [[mybatis]] — *(신규)* SQL Mapper의 메타 페이지. ORM이 아닌 이유, namespace 매핑,
  주요 설정, `<sql>`/`<include>` 재사용, `#{}` vs `${}` 안전성
- [[api-response-wrapper]] — *(신규)* 공통 응답 래퍼 패턴 (`ApiResponse`),
  [[dto-vs-entity]]의 위층, 도입 시점 판단
- [[http-status-codes]] — *(신규)* "클라이언트가 다르게 반응해야 하면 구분"의 판단 기준,
  `ResponseStatusException`·`@ControllerAdvice`로 던지는 법, Filter 예외가 안 잡히는 함정
- [[orm]] · [[jdbc]] · [[dao-pattern]] · [[three-tier-architecture]] · [[restful-api]] ·
  [[dto-vs-entity]] — 백링크 보강 (MyBatis가 들어갈 자리 명시)

명시적으로 제외한 항목: `@PathVariable vs @RequestParam`의 독립 개념 페이지 —
영균 판단으로 [[restful-api]] 본문에 흡수 가능. 이 체크리스트의 #8로만 남긴다.
