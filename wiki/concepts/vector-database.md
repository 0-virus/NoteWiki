---
type: concept
tags: [ai, rag, database, vector]
updated: 2026-05-26
sources: ["raw/dialogues/rag-conversation.md"]
---

# Vector Database (벡터 DB)

## 한 줄 정의

[[embedding]] 벡터를 대량으로 저장하고, 주어진 쿼리 벡터와 **유사한 벡터를 빠르게 찾아주는** 데이터베이스.

## 왜 일반 DB로는 안 되나

일반 RDB·NoSQL은 **정확 매칭**(`=`, `LIKE`, 인덱스 스캔)에 최적화되어 있다. 벡터 검색은 다르다:

- 쿼리: "이 벡터와 가장 가까운 top-5 벡터를 찾아줘"
- 거리 계산: 모든 벡터와 코사인 유사도 → **수백만 벡터면 한 번에 수십초**
- 정확한 답이 아니라 **근사 최근접(ANN, Approximate Nearest Neighbor)**로 충분

→ 이 패턴에 특화된 인덱스(HNSW, IVF 등)를 갖춘 DB가 필요하다.

## 핵심 인덱스 알고리즘

| 알고리즘 | 핵심 아이디어 |
| --- | --- |
| **HNSW** (Hierarchical Navigable Small World) | 다층 그래프로 점프하며 빠르게 근접 노드 도달. 가장 널리 쓰임. |
| **IVF** (Inverted File Index) | 벡터들을 클러스터로 나눠 쿼리에 가까운 클러스터만 탐색 |
| **PQ** (Product Quantization) | 벡터를 압축해 메모리·속도 절약 (정확도 트레이드오프) |

→ 대부분의 벡터 DB는 HNSW 또는 IVF+PQ 조합을 쓴다.

## 대표 제품 (2026 기준)

| 제품 | 형태 | 특징 |
| --- | --- | --- |
| **Pinecone** | 관리형 SaaS | 구축·운영 부담 0, 비용↑ |
| **Chroma** | 임베디드(파일) | 로컬 PoC·소규모, 매우 가벼움 |
| **pgvector** | PostgreSQL 확장 | 기존 RDB와 통합, 운영 익숙함 |
| **Qdrant** | 셀프 호스트 / 클라우드 | Rust로 빠름, 풍부한 필터링 |
| **Weaviate** | 셀프 호스트 / 클라우드 | GraphQL API, 하이브리드 검색 내장 |
| **Milvus** | 셀프 호스트 / 클라우드 | 대규모 분산, 중국 발 |

## 선택 기준

- **PoC·소규모** → Chroma (로컬 파일이면 충분)
- **기존 PostgreSQL을 쓰는 팀** → pgvector (운영 단순화, 트랜잭션 통합)
- **대규모·관리 부담 회피** → Pinecone
- **셀프 호스트·고성능 필요** → Qdrant / Weaviate

## 메타데이터 필터링 — 실무 필수

벡터 DB는 보통 각 벡터에 **메타데이터(tags, source, date 등)**도 같이 저장한다. 그래서 다음과 같은 쿼리가 가능:

```
"이 질문과 유사하면서, source='handbook'이고, 2025년 이후 작성된" top-5
```

→ 벡터 유사도 + 구조화 필터의 조합이 실무에서 진짜 가치 있는 부분.

## 관련 페이지

- [[rag]] — 벡터 DB의 가장 대표적 활용처
- [[embedding]] — 벡터 DB에 저장되는 데이터의 정체
