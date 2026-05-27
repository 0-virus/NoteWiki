---
type: concept
tags: [hibernate, jpa, orm, java, persistence]
updated: 2026-05-27
sources: ["raw/lectures/JPA.md"]
---

# Hibernate

## 한 줄 정의

**[[jpa]] 명세의 실제 구현체 중 하나이자 사실상의 표준(de facto standard).**
JPA가 "이런 메서드가 있어야 한다"는 **인터페이스**라면, Hibernate는 그 메서드가
**실제로 SQL을 만들어 실행하는 코드**다.

## 명세 vs 구현 — 왜 둘로 나눠놨나

```
[ JPA 명세 (JSR 338) ]   ← "이렇게 동작해야 한다"는 규약 (interface)
        ▲ 구현
[ Hibernate / EclipseLink / DataNucleus ]   ← 실제로 동작하는 코드
        └─ Hibernate가 압도적 1위 = de facto
```

- **명세(JPA)**: `EntityManager.persist()`가 무슨 일을 해야 하는지 정의.
- **구현(Hibernate)**: `persist()`를 실제로 작성 — DB 방언 처리, SQL 생성, 1차 캐시,
  지연 로딩 등을 직접 구현.

이 분리의 가치는 **벤더 독립성**이다. JPA 표준 API만 쓰면 구현체를 Hibernate에서
EclipseLink로 바꿔도 코드가 그대로 돈다. [[jdbc]]가 DB 드라이버를 갈아끼워도 코드가
유지되는 것과 같은 구조 — **표준 인터페이스 뒤로 구현을 숨긴다**.

## 구현체 목록

| 구현체 | 비고 |
| --- | --- |
| **Hibernate** | 사실상 표준. Spring Boot의 기본 JPA 구현체 |
| EclipseLink | JPA 참조 구현(RI) |
| DataNucleus | JPA + JDO 지원 |

> [[spring-data-jpa]]를 쓰면 의존성에 `hibernate-entitymanager`가 따라온다 —
> 즉 영균이 Spring Boot로 JPA를 쓰는 순간 **밑에서 도는 건 Hibernate**다.
> 이름만 JPA여도 실제 SQL을 만드는 손은 Hibernate라는 걸 알아두면, 로그에 찍히는
> Hibernate SQL이 낯설지 않다.

## 명세에 없는 기능

Hibernate는 JPA 표준을 넘는 자체 기능도 제공한다(예: `@Type`, 더 풍부한 페치 옵션 등).
표준만 쓰면 이식성이 좋고, Hibernate 전용 기능을 쓰면 강력하지만 구현체에 묶인다 —
[[orm]]의 추상화 트레이드오프가 여기서도 반복된다.

## 관련 페이지

- [[jpa]] — Hibernate가 구현하는 표준 명세
- [[orm]] — Hibernate가 속한 기술 카테고리
- [[spring-data-jpa]] — Hibernate를 기본 구현체로 끌어다 쓰는 Spring 추상화
- [[jdbc]] — "표준 인터페이스 + 교체 가능한 구현"이라는 동일 구조의 선례
- 출처: [[jpa-lecture]]
