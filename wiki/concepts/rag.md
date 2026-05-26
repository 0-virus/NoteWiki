---
type: concept
tags: [ai, llm, rag, retrieval]
updated: 2026-05-26
sources: ["raw/dialogues/rag-conversation.md"]
---

# RAG (Retrieval-Augmented Generation)

## 한 줄 정의

LLM이 답변을 생성하기 **직전**에 외부 지식 베이스에서 관련 문서를 검색해, 그 자료를 컨텍스트로 함께 넣어주는 패턴.

## 왜 필요한가 — LLM의 세 가지 한계

1. **학습 시점 이후 지식 없음** — 모델은 특정 시점까지의 데이터로 훈련되어 그 이후는 모른다.
2. **도메인 특화 지식 부족** — 사내 문서, 비공개 코드, 개인 노트는 본 적이 없다.
3. **환각(Hallucination)** — 모르면 그럴듯하게 지어낸다.

해결책은 단순하다: **답변 직전에 관련 문서를 찾아서 같이 보여주면 된다.** 이게 RAG.

## 작동 원리 — 3단계

### 1. Indexing (사전 작업, 한 번)

```
원본 문서 → Chunking → Embedding → Vector DB 저장
```

- **Chunking**: 문서를 200~500 토큰 단위로 쪼갠다. 너무 크면 노이즈, 너무 작으면 맥락 손실.
- **Embedding**: 각 chunk를 [[embedding]] 모델로 벡터화. 의미가 비슷한 텍스트는 벡터 공간에서 가까이 위치한다 — RAG의 핵심 원리.
- **저장**: [[vector-database]]에 벡터들을 넣어 유사도 검색이 가능하도록 둔다.

### 2. Retrieval (질문 시)

```
사용자 질문 → Embedding → Vector DB 유사도 검색 → top-k chunk
```

- 사용자 질문을 **같은 임베딩 모델**로 벡터화. (모델이 다르면 같은 좌표계가 아니라 무의미)
- 코사인 유사도로 가장 가까운 top-k(보통 5개) chunk를 찾는다.
- (선택) Reranker로 재정렬해 정확도를 더 끌어올린다.

### 3. Generation

```
[검색된 chunk들] + [사용자 질문] → LLM → 답변
```

검색 결과를 프롬프트의 컨텍스트로 주입한다. 모델은 환각 대신 실제 문서 기반으로 답하고, **출처(citation)**를 표시할 수 있다.

## 실무 패턴 (놓치면 안 되는 것들)

- **Hybrid Search** — 벡터 검색 + 키워드(BM25) 결합. 벡터만으론 약어·고유명사·정확 매칭에 약하다.
- **Query Rewriting** — 모호한 질문을 LLM이 한 번 더 다듬어서 검색에 넣음.
- **Re-ranking** — 1차로 top-50 검색 → 정교한 reranker로 top-5 재선정.
- **Citation** — 답변에 출처를 명시. 신뢰도와 디버깅 모두에 필수.

## 스택 (2026 기준 실무 표준)

| 역할 | 대표 도구 |
| --- | --- |
| 오케스트레이션 | LangChain, LlamaIndex |
| LLM | OpenAI · Anthropic API, 로컬은 Ollama |
| 임베딩 | OpenAI `text-embedding-3-small`, BGE, E5 |
| 벡터 DB | Pinecone(관리형), Chroma(로컬), pgvector, Qdrant |
| Reranker | Cohere Rerank, BGE-reranker |

## 활용 사례

- 사내 문서 챗봇 (Notion·Confluence 통합)
- 코드베이스 Q&A (Cursor, Continue)
- 법률·의료 도메인 어시스턴트
- 고객 지원 자동화

## ⚠️ RAG의 한계 — 그래서 LLM Wiki 패턴이 등장

- **chunk 간 연결이 끊긴다** — 문서를 잘게 쪼개면서 전체 맥락·개념 간 연결이 사라진다.
- **매 질문마다 검색** — 동일한 검색·동일한 사고가 반복된다. 결과가 누적되지 않는다.
- **chunk 품질이 답변 품질** — 검색이 실패하면 답도 실패. "Garbage in, garbage out"이 즉시 드러난다.

이 한계 때문에 Karpathy는 [[llm-wiki-pattern]]을 제안했다 — chunk 검색 대신 **AI가 미리 컴파일한 위키**를 유지하자는 발상. 두 패턴의 비교는 [[rag-vs-llm-wiki]] 참조.

## 관련 페이지

- [[embedding]] — RAG의 핵심 부품, 의미를 벡터로
- [[vector-database]] — 임베딩 저장·검색용 DB
- [[llm-wiki-pattern]] — RAG의 대안 (이 저장소가 따르는 패턴)
- [[rag-vs-llm-wiki]] — 두 패턴의 트레이드오프 비교
