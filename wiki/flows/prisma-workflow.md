---
type: flow
tags: [database, orm, prisma]
updated: 2026-05-18
sources: ["raw/notes/Prisma 필기.md"]
---

# 흐름: Prisma 사용 워크플로우

## 흐름 한눈에

```
설치  →  init  →  schema 작성  →  migrate  →  Client 생성  →  CRUD
```

## 단계별

### 1. 설치
```bash
npm install -D prisma          # 개발 도구
npm install @prisma/client     # 런타임 클라이언트
```
두 패키지의 차이는 [[prisma]] 참고.

### 2. 초기화
```bash
npx prisma init   # prisma/ 폴더 + schema.prisma 생성
```
`.env`의 `DATABASE_URL`로 DB 연결 정보를 지정한다.

### 3. 스키마 작성 (schema.prisma)
`datasource`·`generator`·`model`을 정의한다. 코드로 테이블 구조를 관리하는 단계.

### 4. 마이그레이션
```bash
npx prisma migrate dev --name init   # 개발: 스키마 → SQL 변환·적용
npx prisma migrate deploy            # 프로덕션 적용
```
스키마 변경이 마이그레이션 파일로 **버전 관리**된다 — [[orm]]의 핵심 이점.

### 5. Client 생성 & CRUD
```ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

await prisma.user.create({ data: { email: "a@b.com" } });
await prisma.user.findMany({ include: { posts: true } });
```

## 유용한 명령어

- `npx prisma studio` — GUI DB 브라우저
- `npx prisma db pull` — 기존 DB에서 스키마 역생성(Introspection)
- `npx prisma db push` — 마이그레이션 없이 스키마 직접 적용(개발 중)
- `npx prisma format` — 스키마 포맷팅

## 주의

관계 데이터를 반복 조회하면 [[n-plus-1-problem]]이 발생한다 — `include`로 회피.

## 관련 페이지

- [[prisma]] · [[orm]] · [[n-plus-1-problem]]
- 출처: [[prisma-orm]]
