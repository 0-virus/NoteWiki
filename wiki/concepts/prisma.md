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

## Prisma `include` vs JPA fetch join

개념은 같다 — **기본은 연관 데이터를 안 가져오고, 필요하면 명시적으로 요청한다.**

```ts
// Prisma: include 없으면 comments 필드 자체가 없음
const post = await prisma.post.findUnique({ where: { id: 1 } });
post.comments // → undefined

// include 하면 같이 가져옴 (JOIN)
const post = await prisma.post.findUnique({
  where: { id: 1 },
  include: { comments: true }
});
```

```java
// JPA: LAZY면 comments는 프록시(껍데기)
Post post = postRepository.findById(1L).get();
post.getComments(); // → 프록시 (트랜잭션 밖에서 접근 시 예외)

// fetch join하면 같이 가져옴 (JOIN)
Post post = postRepository.findByIdWithComments(1L);
```

결정적 차이는 **"없을 때의 표현"**이다.

| | 연관 미로딩 시 | 접근하면 |
| --- | --- | --- |
| Prisma | 필드 자체가 `undefined` | 즉시 알 수 있음 |
| JPA | 프록시(껍데기) 반환 | 트랜잭션 밖에서 `LazyInitializationException` |

Prisma가 더 명시적인 이유: TypeScript는 필드가 `undefined`일 수 있다. Java는
`Post post` 필드가 반드시 뭔가를 가리켜야 해서(타입 시스템 제약) 프록시가 필요했다.
→ [[jpa-association]] 프록시 섹션 참조.

## 관련 페이지

- [[orm]] — Prisma가 속한 기술 범주와 장단점
- [[n-plus-1-problem]] — `include` 없이 관계를 반복 조회하면 발생
- [[prisma-workflow]] — 설치부터 CRUD까지의 전체 흐름
- [[jpa-association]] — JPA에서 같은 문제를 프록시로 푸는 방식
- 출처: [[prisma-orm]]
