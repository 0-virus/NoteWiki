---
type: concept
tags: [database, orm, performance]
updated: 2026-05-18
sources: ["raw/notes/Prisma 필기.md"]
---

# N+1 문제

## 한 줄 정의

한 번의 쿼리로 끝낼 수 있는 작업을, **1번 + N번** 으로 쪼개 쿼리하게 되는 비효율.

## 왜 발생하는가

[[orm]]에서 목록을 조회한 뒤 각 항목의 관계 데이터를 반복 접근할 때 생긴다.

```python
posts = Post.objects.all()      # 쿼리 1번: 게시글 전체
for post in posts:
    print(post.author.name)     # 쿼리 N번: 게시글마다 작성자 조회
```

게시글 100개면 `SELECT`가 1 + 100 = 101번 나간다.

## 해결

JOIN(또는 ORM의 eager loading)으로 관계 데이터를 **한 번에** 가져온다.
Prisma에서는 `include`가 그 역할을 한다:

```ts
const posts = await prisma.post.findMany({ include: { author: true } });
```

## 관련 페이지

- [[orm]] — N+1은 ORM 추상화의 대표적 함정
- [[prisma]] — `include`로 회피
- 출처: [[prisma-orm]]
