# 개인 프로젝트 어렵다…

---

블로그 프로젝트 한 번쯤은 해보고 싶다고 생각해왔었다. 혼자서 프론트엔드, 백엔드 다 해보고 싶었던 욕심이 있었기 때문에…(풀스택 인재 성장 빠샤)

근데 막상 하려고 보니까 첩첩산중이다. 프론트는 리액트 공부 좀 해서 할만할 것 같다는 생각이 드는데, 백엔드가 너무 처음 보는 것들 투성이다… 일단 시작해보자! 하고 호기롭게 스타트 끊었는데 Next.js니 Postgres니 Prisma니 하는 것들이 당최 무슨 말인지… 앞길이 막막하지만 천천히 정리해보도록 한다.

# 필기 시작!

---

## Prisma는 무엇인가

Prisma는 JavaScript / TypeScript 전용 ORM 라이브러리이다. ORM이란 Object-Relational Mapping의 약자로, 객체 지향 프로그래밍의 객체를 관계형 데이터베이스의 테이블로 자동 매핑해주는 기술이라고 한다.

쉽게 말해서, Prisma는 SQL 못해도 관계형 데이터베이스를 다룰 수 있도록 해주는 기술인 듯하다.(이럴거면 그냥 SQL을 배우는 게 낫겠다는 나쁜말은 ㄴㄴ)

## Prisma 초기 세팅

### 설치

```bash
# Prisma를 개발 의존성으로 설치
npm install -D prisma

# Prisma Client 설치
npm install @prisma/client
```

- Prisma Client?
  prisma: 개발 도구. 스키마 작성, 마이그레이션 관리, DB 관리 등.
  @prisma/client: 런타임 라이브러리. 실제 애플리케이션 코드에서 DB에 접근하는 기능.

### 초기화

```bash
# Prisma 프로젝트 초기화 - prisma/ 폴더 & schema.prisma 파일 생성
npx prisma init
```

### 데이터베이스 연결 설정

.env 파일에서 데이터베이스 URL을 지정한다.

```bash
# PostgreSQL 예시
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

## Prisma Schema 작성

prisma/schema.prisma 파일을 작성한다. (블로그 프로젝트에서는 데이터소스 설정 과정에서 환경변수로 url을 접근하는 방법이 버전 문제로 빨간줄이 뜨는데, 버전 다운그레이드하고 무시하면 되는 것 같다)

```
// 데이터소스 설정
datasource db {
  provider = "postgresql"  // 또는 "mysql", "sqlite", "sqlserver", "mongodb"
  url      = env("DATABASE_URL")
}

// Prisma Client 생성 설정
generator client {
  provider = "prisma-client-js"
}

// 모델 정의 예시
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 주요 Prisma Schema 문법

- `@id`: 기본 키
- `@unique`: 유니크 제약
- `@default()`: 기본값
- `@relation()`: 관계 설정
- `@updatedAt`: 자동 업데이트 타임스탬프
- `?`: 옵셔널 필드

## 데이터베이스 마이그레이션

Schema를 작성했으니, SQL 파일로 마이그레이션하는 작업이 필요하다.

```bash
# 마이그레이션 생성
npx prisma migrate dev --name init

# 프로덕션 환경에서 마이그레이션 적용
npx prisma migrate deploy
```

## Prisma Client 사용

```tsx
// prisma 클라이언트 인스턴스 생성 (db.ts 또는 prisma.ts)
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
```

```tsx
// 실제 사용 예시
import prisma from "./db";

// 데이터 생성
const user = await prisma.user.create({
  data: {
    email: "user@example.com",
    name: "John Doe",
  },
});

// 데이터 조회
const users = await prisma.user.findMany({
  include: {
    posts: true, // 관계 데이터 포함
  },
});

// 데이터 수정
const updatedUser = await prisma.user.update({
  where: { id: 1 },
  data: { name: "Jane Doe" },
});

// 데이터 삭제
await prisma.user.delete({
  where: { id: 1 },
});
```

## 유용한 명령어

```bash
# Prisma Studio 실행 (GUI 데이터베이스 브라우저)
npx prisma studio

# 기존 데이터베이스에서 schema 생성 (Introspection)
npx prisma db pull

# Schema를 데이터베이스에 직접 적용 (개발 중)
npx prisma db push

# Schema 포맷팅
npx prisma format
```

# Appendix: ORM vs. Raw SQL

---

모범생의 질문이 있어 그에 대한 대답을 정리한다.

ORM은 SQL을 대신 적어주기만 하는 비서 정도가 아니라 다음과 같은 부가적인 기능도 한다.

1. 테이블 구조를 코드로 관리하고, 스키마 변경을 마이그레이션 파일로 추적하고 버전을 관리할 수 있다.
2. 코드 한 줄로 테이블 간 FK 관계나 JOIN 로직 및 역참조까지 자동으로 처리해준다.
3. 데이터 유효성 검증도 수행해준다.

그렇다고 ORM이 만능인 것도 아니다.

1. 복잡한 JOIN이나 서브쿼리는 ORM으로 작성하기 어렵거나 불가능한 경우가 있다.
2. 또, N+1 문제와 같이 최적화되지 않은 쿼리가 발생하기도 한다.
   - N+1 문제란?
     한 번의 쿼리로 가능할 문제를 N+1번이나 쿼리하게 되는 문제
     - 블로그 게시물에 대한 제목과 작성자를 표시하려고 할 때, users와 posts 테이블을 다음과 같이 JOIN하기만 하면 한 번의 쿼리만으로 끝난다.
       ```python
       for post in posts:
           cursor.execute("SELECT * FROM user WHERE id = %s", ...)
       ```
     - 하지만 ORM을 활용하는 경우, 게시물을 한 번 조회한 뒤 각 게시글마다 작성자를 조회하는 과정에서 수많은 쿼리 요청이 발생할 수 있다.
       ```python
       posts = Post.objects.all()  # 쿼리 1번: 게시글 전체 조회

       for post in posts:
           print(post.author.name)  # 쿼리 N번: 각 게시글마다 작성자 조회
       ```
       ```sql
       -- 내부적으로 이렇게 돌아감

       -- 1번째 쿼리 (1)
       SELECT * FROM post;

       -- 게시글마다 추가 쿼리 (N = 100번)
       SELECT * FROM user WHERE id = 1;
       SELECT * FROM user WHERE id = 2;
       SELECT * FROM user WHERE id = 3;
       ...
       SELECT * FROM user WHERE id = 100;
       ```
3. 추상화가 장점이 되기도 하지만, DB에 대한 이해가 없으면 오히려 디버깅이 더 어려울 수도 있다.

그래서 프로젝트의 목적에 따라 단순 CRUD 구성 정도만 필요하면 ORM을, 보다 복잡한 로직을 원하는 경우에는 Raw SQL을 이용하는 등 유연하게 사용하는 것이 좋다고 한다.
