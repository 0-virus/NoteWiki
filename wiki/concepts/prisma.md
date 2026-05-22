---
type: concept
tags: [database, orm, prisma]
updated: 2026-05-18
sources: ["raw/notes/Prisma 필기.md"]
---

# Prisma

## 한 줄 정의

JavaScript / TypeScript 전용 **[[orm]]** 라이브러리. SQL 없이 관계형 DB를 다룬다.

## 두 개의 패키지

| 패키지 | 역할 | 설치 |
|--------|------|------|
| `prisma` | 개발 도구 — 스키마 작성, 마이그레이션, DB 관리 | `npm install -D prisma` |
| `@prisma/client` | 런타임 라이브러리 — 실제 코드에서 DB 접근 | `npm install @prisma/client` |

## 스키마 (schema.prisma)

`datasource`(DB 연결), `generator`(클라이언트 생성 설정), `model`(테이블 정의)로 구성된다.

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
}
```

주요 문법: `@id`(기본 키), `@unique`(유니크), `@default()`(기본값),
`@relation()`(관계), `@updatedAt`(자동 타임스탬프), `?`(옵셔널 필드).

## 클라이언트 사용

```ts
const user = await prisma.user.create({ data: { email: "a@b.com" } });
const users = await prisma.user.findMany({ include: { posts: true } });
```

`create` / `findMany` / `update` / `delete` 로 CRUD. `include`로 관계 데이터를 함께 조회.

## 관련 페이지

- [[orm]] — Prisma가 속한 기술 범주와 장단점
- [[n-plus-1-problem]] — `include` 없이 관계를 반복 조회하면 발생
- [[prisma-workflow]] — 설치부터 CRUD까지의 전체 흐름
- 출처: [[prisma-orm]]
