---
type: source
tags: [database, mysql, ddl, lock, performance]
updated: 2026-06-13
sources:
  - raw/youtube/(280) 컬럼 하나 추가했는데 서비스가 10분간 멈췄습니다 (DDL의 함정).md
---

# 컬럼 하나 추가했는데 서비스가 10분간 멈췄습니다 — DDL의 함정 (코딩애플 쇼츠)

- **원본**: `raw/youtube/(280) 컬럼 하나 추가했는데 서비스가 10분간 멈췄습니다 (DDL의 함정).md`
- **링크**: https://www.youtube.com/shorts/hA_NComKJQM
- **채널**: 코딩애플

## 핵심 주장

1. ALTER TABLE은 테이블 메타데이터에 배타적 락(Exclusive MDL)이 필요
2. 열린 트랜잭션이 Shared MDL을 보유 중이면 ALTER TABLE이 WAITING → 뒤 쿼리 전부 대기열
3. ALTER TABLE 자체가 직접 막는게 아니라 "WAITING 상태의 ALTER TABLE 뒤에 줄이 쌓이는" 구조
4. 해결책: pt-online-schema-change (트리거 + 청크 복사 + RENAME)
5. MySQL 8.0 Instant DDL로 일부 해결 가능, 컬럼 삭제·타입 변경은 여전히 불가
6. 운영 DDL = 코드 변경이 아닌 인프라 배포

## 맥락

내 메모 3가지 질문(MDL·배타적 락·트리거 용어, ALTER TABLE 락 케이스 A vs B, pt-osc 원리)을 대화로 보완함.

## 다루는 개념

- [[ddl-lock]]
- [[transaction]]
- [[database-index]]
