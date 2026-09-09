---
type: concept
tags: [data-pipeline, kafka, database, messaging, backend]
updated: 2026-09-07
sources: ["raw/notes/Message Queue.md"]
---

# CDC (Change Data Capture)

## 한 줄 정의

**DB의 변경(INSERT·UPDATE·DELETE)을 감지해 이벤트 스트림으로 흘려보내는 기술.**
"데이터가 바뀌었다"는 사실을 애플리케이션 코드가 아니라 **DB 자체에서** 뽑아낸다.

## 왜 필요한가

운영 DB의 데이터를 검색엔진·분석 시스템·캐시 등에 반영해야 하는 일은 흔하다.
소박한 방법은 셋인데, 셋 다 문제가 있다.

**① 애플리케이션이 직접 이중 쓰기** — DB에 쓰고 검색엔진에도 쓴다.
→ [[outbox-pattern]]이 지적하는 **이중 쓰기 문제**가 그대로 발생한다. 한쪽만 성공하면 어긋난다.

**② 주기적 배치 조회** — `updated_at > 마지막 시각`으로 폴링한다.
→ 지연이 크고, DB에 부하를 주고, **DELETE를 감지할 수 없다**(행이 사라지므로 조회에 안 걸린다).

**③ DB 트리거** — DB에 트리거를 건다.
→ 원본 트랜잭션에 부하가 얹히고, 로직이 DB에 숨어 유지보수가 어렵다.

CDC는 다른 곳을 본다. **트랜잭션 로그**다.

## 원리 — 트랜잭션 로그를 읽는다

관계형 DB는 장애 복구·복제를 위해 모든 변경을 순차 로그에 기록한다 (MySQL의 binlog,
PostgreSQL의 WAL). CDC 도구는 이 로그를 **복제 슬레이브인 척 구독해서** 읽는다.

```
애플리케이션 → MySQL (INSERT order)
                 ↓ binlog 기록
             Debezium (로그 구독)
                 ↓
               Kafka
                 ↓
          검색엔진 / 분석 / 캐시
```

이 방식의 장점이 원리에서 그대로 나온다.

- **누락이 없다** — 커밋된 모든 변경은 반드시 로그에 남는다. 폴링처럼 사이를 건너뛰지 않는다
- **DELETE도 잡힌다** — 로그에는 삭제도 기록된다
- **원본에 부하가 거의 없다** — 이미 쓰고 있는 로그를 읽을 뿐, 애플리케이션 쿼리와 경쟁하지 않는다
- **애플리케이션 코드 수정이 필요 없다** — 레거시 시스템에도 붙일 수 있다
- **순서가 보존된다** — 로그는 커밋 순서 그 자체다

대표 도구는 **Debezium**이고, 보통 [[kafka]] Connect 위에서 동작한다.

## Outbox 패턴과의 관계 — 경쟁이 아니라 조합

둘 다 "DB 변경을 외부에 알린다"는 문제를 풀지만 초점이 다르다.

| | [[outbox-pattern]] | CDC |
|---|---|---|
| 무엇을 발행하나 | **애플리케이션이 의도한 비즈니스 이벤트** | **테이블 행 변경(기술적 사실)** |
| 코드 수정 | 필요 (Outbox 테이블에 INSERT) | 불필요 |
| 이벤트 품질 | 도메인 의미가 담김 (`LOAN_APPROVED`) | 스키마에 종속 (`loan` 행의 `status` 컬럼이 바뀜) |

**실무에서 가장 좋은 조합은 둘을 겹치는 것**이다. 애플리케이션은 Outbox 테이블에 의미 있는
이벤트를 쓰고, CDC가 그 **Outbox 테이블만** 구독해 Kafka로 흘린다.

```
BEGIN; INSERT order; INSERT outbox_event; COMMIT;
              ↓ binlog
          Debezium → Kafka
```

이러면 Outbox의 **정합성**(같은 트랜잭션)과 CDC의 **신뢰성**(폴링 워커 불필요, 누락 없음)을
동시에 얻는다. Outbox 패턴에서 별도 Publisher 워커를 만들 필요조차 없어진다.

## 관련 페이지

- [[kafka]] — CDC 이벤트가 흘러가는 곳 (Kafka Connect)
- [[outbox-pattern]] — 함께 조합되는 패턴
- [[event-driven-architecture]] — CDC가 공급하는 아키텍처
- [[eventual-consistency]] — CDC 파이프라인이 전제하는 일관성 모델
- [[transaction]] — 트랜잭션 로그가 존재하는 이유
- 출처: [[message-queue-note]]
