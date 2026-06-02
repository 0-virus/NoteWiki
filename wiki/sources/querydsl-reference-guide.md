---
type: source
tags: [jpa, querydsl, database, query, dynamic-query, spring-data-jpa]
updated: 2026-06-02
sources: ["raw/articles/Querydsl Reference Guide.md"]
---

# 소스: Querydsl Reference Guide (v5.0.0)

> 원본: `raw/articles/Querydsl Reference Guide.md`
> URL: http://querydsl.com/static/querydsl/5.0.0/reference/html_single/
> 클리핑: 2026-06-02

## 맥락

수업에서 나온 개념이라 우선 개념을 파악하고, 프로젝트에서 실제로 도입할 예정이기도 함.
개념 + 실제 사용법(QType 생성, 동적 쿼리, DTO 반환 등) 모두 위키에 담아두는 것이 목적.

## 핵심 주장 (Key Claims)

1. **탄생 배경**: HQL(JPQL)을 문자열로 다루면 타입 안전이 없다 → Querydsl은 타입 세이프 쿼리 빌더로 그 문제를 해결했다.
2. **핵심 원칙**: 타입 안전(Type Safety) + 일관성(Consistency). 모든 백엔드(JPA, JDBC, MongoDB 등)에서 같은 API.
3. **QType**: `@Entity` 붙은 클래스에서 APT가 `Q{ClassName}`을 자동 생성 → 필드를 문자열이 아닌 자바 코드로 참조.
4. **JPAQueryFactory**: 쿼리의 진입점. `selectFrom`, `where`, `fetch*` 메서드 체인으로 쿼리 조립.
5. **BooleanBuilder**: 조건을 런타임에 누적하는 동적 쿼리의 핵심 도구.
6. **Projections**: DTO로 바로 받을 때 사용. `bean`, `fields`, `constructor`, `@QueryProjection` 4가지 방식.

## 언급된 엔티티

- **Querydsl** — 타입 세이프 쿼리 빌더 프레임워크 (서드파티, 오픈소스)
- **APT (Annotation Processing Tool)** — 컴파일 시 `@Entity`를 읽어 QType 생성
- **JPAQueryFactory** — 쿼리 생성의 진입점 (Spring Bean으로 등록)
- **BooleanBuilder** — 동적 조건 누적기
- **Projections** — 결과를 DTO로 매핑하는 팩토리

## 다루는 개념

- [[querydsl]] — 메인 개념 페이지 (이 소스의 핵심 결과물)
- [[jpql]] — Querydsl이 대체·보완하는 쿼리 레이어
- [[jpa]] — Querydsl이 올라타는 기반
- [[spring-data-jpa]] — 통합 포인트 (`QuerydslPredicateExecutor` 또는 커스텀 리포지토리)
