---
type: concept
tags: [database, orm]
updated: 2026-05-27
sources: ["raw/notes/Prisma 필기.md", "raw/lectures/JPA.md"]
---

# ORM (Object-Relational Mapping)

## 한 줄 정의

객체 지향 코드의 **객체**를 관계형 데이터베이스의 **테이블**에 자동으로 매핑해주는 기술.

## 왜 쓰는가

SQL을 직접 쓰지 않고도 DB를 다룰 수 있다. 하지만 단순 "SQL 대필"이 아니라
다음 부가 기능이 진짜 가치다:

1. 테이블 구조를 코드로 관리하고, 스키마 변경을 **마이그레이션 파일로 버전 관리**.
2. 코드 한 줄로 테이블 간 FK 관계·JOIN·역참조를 자동 처리.
3. 데이터 유효성 검증 수행.

## 한계 (만능이 아니다)

- 복잡한 JOIN·서브쿼리는 ORM으로 작성하기 어렵거나 불가능.
- 최적화되지 않은 쿼리가 나오기 쉽다 → [[n-plus-1-problem]].
- 추상화가 오히려 디버깅을 어렵게 한다 — DB 자체에 대한 이해가 없으면 독이 된다.

## 선택 기준

단순 CRUD 위주면 ORM, 복잡한 로직이 필요하면 Raw SQL —
**목적에 따라 유연하게** 섞어 쓰는 것이 좋다.

## ⚠️ ORM vs SQL Mapper — 카테고리가 다르다

[[mybatis]]는 자주 ORM과 같이 묶이지만 **다른 카테고리**다.

| | ORM (Prisma·JPA·Hibernate) | SQL Mapper ([[mybatis]]) |
| --- | --- | --- |
| SQL 작성 | 프레임워크가 자동 생성 | **개발자가 직접** |
| 매핑 단위 | 객체 모델 = 테이블 모델 | 결과 행 → 객체만 |
| SQL 통제권 | 프레임워크에 양도 | 개발자가 유지 |

→ 한국 SI는 SQL 통제 문화 때문에 MyBatis 우세, 글로벌·신규는 JPA 우세.
**둘은 우열이 아니라 SQL 통제권 선택의 문제**. 자세한 비교는 [[mybatis]] 본문에.

## 자바 진영의 ORM = JPA

[[prisma]]가 JS/TS의 대표 ORM이듯, 자바 진영의 ORM 표준은 **[[jpa]]**(명세) +
**[[hibernate]]**(구현체)다. 위 표에서 "ORM" 칸의 자바 대표가 곧 JPA. 영균은 [[mybatis]]
다음 단계로 이쪽을 배우는 중 → [[mybatis-to-jpa]]. ORM의 장점(마이그레이션·관계 자동
처리)과 한계(복잡 쿼리·[[n-plus-1-problem]])가 JPA에서 그대로 재현된다.

## 관련 페이지

- [[prisma]] — JS/TS 진영의 대표 ORM
- [[jpa]] · [[hibernate]] — 자바 진영의 ORM 표준과 구현체
- [[mybatis]] — ORM과 다른 카테고리(SQL Mapper)의 대표 도구
- [[n-plus-1-problem]] — ORM에서 흔히 발생하는 쿼리 비효율
- [[mybatis-to-jpa]] — SQL Mapper에서 ORM으로의 전환 흐름
- 출처: [[prisma-orm]] · [[jpa-lecture]]
