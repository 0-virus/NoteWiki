---
type: source
tags: [database, orm, prisma]
updated: 2026-05-18
sources: ["raw/notes/Prisma 필기.md"]
---

# 소스: Prisma 필기

> 원본: `raw/notes/Prisma 필기.md` — 직접 작성 필기(노션 이전분).

## 맥락 (왜 기록했나)

풀스택 블로그 개인 프로젝트의 백엔드(Next.js·Postgres·Prisma)를 처음 접하며 정리.
"풀스택 인재 성장" 목표와 직접 닿아 있는 노트.

## 핵심 요약

- Prisma는 JS/TS 전용 **ORM**. 객체를 관계형 DB 테이블에 자동 매핑.
- 패키지 둘: `prisma`(개발 도구 — 스키마/마이그레이션) + `@prisma/client`(런타임 DB 접근).
- 워크플로우: 설치 → `prisma init` → `schema.prisma` 작성 → `migrate dev` → `PrismaClient`로 CRUD.
- 스키마 문법: `@id`, `@unique`, `@default()`, `@relation()`, `@updatedAt`, `?`(옵셔널).
- ORM은 만능 아님: 복잡한 JOIN/서브쿼리 한계, **N+1 문제**, 추상화로 인한 디버깅 난이도.
- 단순 CRUD엔 ORM, 복잡 로직엔 Raw SQL — 목적에 따라 유연하게.

## 위키 반영

- [[prisma]] — Prisma ORM 사용법
- [[orm]] — ORM 개념과 장단점
- [[n-plus-1-problem]] — ORM에서 흔한 쿼리 비효율
- [[prisma-workflow]] — 설치부터 CRUD까지의 흐름
