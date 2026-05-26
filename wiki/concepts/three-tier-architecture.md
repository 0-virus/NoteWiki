---
type: concept
tags: [architecture, spring, web]
updated: 2026-05-21
sources: ["raw/notes/Spring Framework.md"]
---

# 3-tier Layered Architecture

## 한 줄 정의

**클라이언트 접근 → 비즈니스 로직 → 데이터 저장의 세 계층으로 책임을 나누는 구조.**
[[mvc-pattern]]이 "표현(Presentation)을 어떻게 분리할까"라면, 3-tier는 "**시스템 전체를 어떤 층으로 쌓을까**"의 답.

## 세 계층

```
┌──────────────────────────────────────┐
│ Web Layer (Presentation)             │ ← Client 직접 접근
│   Controller · Filter · Interceptor  │
├──────────────────────────────────────┤
│ Service Layer (Business Logic)       │ ← 비즈니스 로직
│   @Service · @Transactional          │
├──────────────────────────────────────┤
│ Repository Layer (Data Access)       │ ← DB 접근
│   @Repository · DAO · JdbcTemplate   │
└──────────────────────────────────────┘
                 │
                 ▼
              Database
```

## 각 계층의 책임

### Web Layer
- 외부 요청과 응답의 **전반적 영역**.
- Controller · View(JSP·템플릿) · Filter · Interceptor.
- HTTP 알고, 비즈니스는 모른다.

### Service Layer
- Controller와 Repository **사이의 중간 영역**.
- `@Transactional`이 붙는 곳 — 트랜잭션 경계가 여기서 그어진다.
- 비즈니스 로직 처리. (관점에 따라 Domain Model이 일부를 가져가기도 함.)

### Repository Layer
- **DB에 접근하는 영역**, 곧 [[dao-pattern]]의 영역.
- SQL/JPQL이 들어가는 유일한 곳.
- Web도 Service도 SQL을 알지 못한다.
- 구현 도구: [[jdbc]]를 직접 / [[mybatis]] SQL Mapper / [[orm]](JPA·Prisma 등) —
  추상화 단계가 다를 뿐 책임은 같다.

## 양 옆 — DTO와 Domain Model

3-tier는 위아래 화살표를 만들 때 두 가지 객체를 쓴다.

| 객체            | 위치                       | 역할                                       |
| --------------- | -------------------------- | ------------------------------------------ |
| [[dto-vs-entity]] (DTO) | 계층 사이를 오가는 운반체  | "데이터 전달 전용", 동작 없음              |
| Domain Model    | 비즈니스 로직의 중심       | 상태 + 행위. `@Entity`가 자주 붙는다       |

DTO는 한 계층의 데이터를 다른 계층으로 옮기기 위해 만들어진 빈 그릇. Domain Model은 **비즈니스 규칙을 실행하는 진짜 객체**다 — 여기서 말하는 "[[domain]]"이 정확히 뭔지 따로 정리해두었다. ([[dto-vs-entity]] 참조)

## 3-tier vs MVC — 둘이 어떻게 겹치나

영균이 헷갈리기 쉬운 지점.

| 분류 기준 | [[mvc-pattern]]              | 3-tier                          |
| --------- | ---------------------------- | ------------------------------- |
| 무엇      | 표현 패턴 (UI 분리)          | 시스템 계층 (전체 분리)         |
| 분할      | Controller / View / Model    | Web / Service / Repository      |
| 어디 산다 | Web Layer 안                 | 시스템 전체에 걸침              |

**둘은 다른 축의 분리고, 동시에 적용된다.** Spring에서:
- MVC: `@Controller` ← 표현 분리
- 3-tier: `@Controller` → `@Service` → `@Repository` ← 시스템 분리

Controller가 양쪽에 다 등장하니 헷갈리지만, **"MVC는 화면 쪽 분리만, 3-tier는 화면 안 쪽까지 포함한 전체 분리"**로 기억하면 된다.

## 왜 이렇게 나누나

[[solid-principles]]의 SRP 적용 + 변경 영향 격리.
- DB 엔진 교체 → Repository 계층만 바꾸면 끝.
- 화면 추가 → Web Layer만 손대면 끝.
- 비즈니스 규칙 변경 → Service만.

각 계층이 알아야 할 게 좁아질수록 **테스트하기 쉽고 변경에 강한 코드**가 된다.

## 영균 학습 트리에서

- [[mvc-pattern]]에서 Controller가 [[dao-pattern]]에 위임한다고 적었던 그 위임 흐름이, 정식 명칭으로는 "Web → Service → Repository의 3-tier 계층 호출".
- Spring에서 `@Controller`·`@Service`·`@Repository` 세 어노테이션이 각 계층에 1:1 대응한다.

## 관련 페이지

- [[mvc-pattern]] — 표현 분리 패턴 (3-tier와 다른 축)
- [[dao-pattern]] — Repository Layer의 본질
- [[dto-vs-entity]] — 계층 사이 운반체 vs 도메인 모델
- [[solid-principles]] — SRP가 이 분리의 근거
- 출처: [[spring-framework-1-note]]
