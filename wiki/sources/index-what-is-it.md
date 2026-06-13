---
type: source
tags: [database, index, btree]
updated: 2026-06-13
sources:
  - raw/youtube/index가 뭔지 설명해보세요 (개발면접시간).md
---

# index가 뭔지 설명해보세요 (코딩애플)

- **원본**: `raw/youtube/index가 뭔지 설명해보세요 (개발면접시간).md`
- **채널**: 코딩애플
- **링크**: https://www.youtube.com/watch?v=iNvYsGKelYs

## 핵심 주장

1. 인덱스 = 컬럼을 복사해서 미리 정렬해 둔 별도 구조
2. 탐색 원리 = Binary Search (1~100 카드 게임 비유 — 절반씩 소거)
3. 자료 구조 발전: Binary Search Tree → B-tree → B+tree
4. B+tree: 리프 노드끼리 연결 → 범위 검색 효율
5. 클러스터드 인덱스: PK는 자동 정렬, 별도 인덱스 불필요
6. 단점: 추가 용량 + DML(INSERT/UPDATE/DELETE) 성능 저하

## 다루는 개념

- [[database-index]]
- [[covering-index]]
- [[explain]]
