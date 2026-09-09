---
type: source
tags: [messaging, kafka, rabbitmq, note, backend]
updated: 2026-09-07
sources: ["raw/notes/Message Queue.md"]
---

# 소스: Message Queue 필기 (MQ 기초 + RabbitMQ + Kafka)

- **원본**: `raw/notes/Message Queue.md`
- **형태**: 자가 학습 노트 (약 4,150줄). MQ 기초 → RabbitMQ 46절 → Kafka 54절 3부 구성
- **작성 맥락**: "프로젝트 기술 스택으로 쓰이는 Kafka를 이해하기 위해 공부한 내용"

## 맥락 (인터뷰)

**왜 정리했나** — **곧 Kafka를 써야 해서.** 아직 직접 다루진 않지만 투입이 예정돼 있어
개념을 미리 잡아두려 한 선행 학습이다. 도구 사용법이 아니라 **원리부터** 훑은 것이
이 노트의 성격을 결정한다 — "카프카 쓰는 법"이 아니라 "왜 이런 구조인가"가 중심이다.

**어떻게 쓰고 싶나** — 두 가지.
1. **실무 코드 독해용** — 낯선 코드에서 토픽·Consumer Group·Exchange 이름만 보고 메시지가
   어디서 어디로 흐르는지 추적할 수 있게. (원본 45절의 "체크해야 하는 것 10가지"가
   정확히 이 목적으로 쓰인 부분이다.)
2. **기술 선택 근거** — RabbitMQ / Kafka / 직접 호출 중 무엇을 언제 쓰는지 판단 기준.

**학습 트리에서의 위치** — 2026-07 [[outbox-pattern]] 정리가 "DB 밖 시스템과의 정합성"이라는
문을 열었다면, 이 노트는 그 **문 너머의 세계 전체**를 훑는다. Outbox의 Publisher가 메시지를
보내는 "그 외부 시스템"이 바로 여기의 브로커다.

## 핵심 주장 (Key Claims)

1. **메시지 큐의 존재 이유는 세 가지 결함의 해소다** — 장애 전파, 처리 용량 불일치, 강한 결합.
   → [[message-queue]]
2. **RabbitMQ에서 Producer는 Queue가 아니라 Exchange에 보낸다.** 이 한 단계가 "누가 받을지"를
   브로커 설정으로 밀어내 느슨한 결합을 완성한다. → [[amqp-exchange]]
3. **Kafka는 소비해도 메시지를 지우지 않는다.** offset만 전진한다. 여기서 다중 독립 소비와
   Replay가 파생된다 — Kafka의 거의 모든 특성의 출발점. → [[kafka]]
4. **Kafka는 토픽 전체 순서를 보장하지 않는다. 파티션 내부만 보장한다.**
   전역 순서를 포기하고 처리량을 얻은 거래이며, 필요한 범위는 Message Key로 묶는다.
   → [[kafka-topic-partition]]
5. **Consumer 병렬성의 상한 = 파티션 개수.** Consumer만 늘려도 소용없다.
   → [[kafka-consumer-group]]
6. **실무 표준은 At-least-once + 멱등한 Consumer.** Exactly-once는 Kafka 내부로 범위가
   한정된다. → [[message-delivery-semantics]]
7. **DB 저장과 메시지 발행의 정합성 문제는 브로커 종류와 무관하다.** RabbitMQ든 Kafka든
   Outbox 패턴의 원리는 동일하다. → [[outbox-pattern]]
8. **RabbitMQ와 Kafka는 우열이 아니라 목적 차이다** — "누가 처리할 것인가" vs "무슨 일이
   있었는가". → [[rabbitmq-vs-kafka]]

## 다루는 개념 (Concepts)

**공통** — Message Queue, Producer/Consumer, ACK/NACK, Retry, DLQ, 멱등성, 전달 보장
(At-most/least/Exactly-once), Competing Consumers

**RabbitMQ** — Message Broker, Exchange(Direct/Topic/Fanout/Headers), Binding, Routing Key,
Prefetch, Durable Queue, Persistent Message, Publisher Confirm, Spring AMQP
(`RabbitTemplate`·`@RabbitListener`), 관리 콘솔(15672)

**Kafka** — 이벤트, 스트리밍, append-only log, Topic, Partition, Offset, Message Key,
Broker/Cluster, Replication, Leader/Follower, Consumer Group, Rebalancing, Retention,
Replay, Kafka Connect, Kafka Streams, CDC(Debezium), Event-driven Architecture

## 언급된 엔티티

- **기술**: Apache Kafka, RabbitMQ, Redis Pub/Sub, Spring AMQP, Spring Boot, Debezium,
  Kafka Connect, Kafka Streams, Apache Flink, Apache Spark, Elasticsearch, MySQL, Docker
- **개념 출처**: AMQP 프로토콜, Transactional Outbox Pattern

## 범위 판단 (회사 지식 경계)

원본 48~49절에 **대출 신청 시스템 예제**가 있다. 검토 결과:

- 사원명·고객사명·사내 시스템명·실제 승인 로직 **없음**
- 등장하는 식별자(`A10001`, `C5001`)는 **구조 설명용 가상 값**
- 구조 자체(신청 → 이벤트 발행 → 심사/알림/감사/분석 구독)는 어느 금융 시스템에나
  적용되는 **일반적 EDA 패턴**

→ 영균 확인을 거쳐 **대출 예제를 그대로 유지**하기로 결정. 금융 도메인 감각이 학습에
도움이 되고, 회사 고유 정보가 없어 NoteWiki의 "어디서나 통용되는 일반 기술 지식" 원칙에
어긋나지 않는다. 단, 위키 페이지에는 **가상 예시임을 명시**했다.

## 생성·갱신한 페이지

**개념 (신규 12)**
[[message-queue]] · [[dead-letter-queue]] · [[message-delivery-semantics]] ·
[[rabbitmq]] · [[amqp-exchange]] · [[spring-amqp]] ·
[[kafka]] · [[kafka-topic-partition]] · [[kafka-consumer-group]] · [[kafka-replication]] ·
[[event-driven-architecture]] · [[change-data-capture]]

**흐름 (신규 3)**
[[rabbitmq-message-flow]] · [[kafka-event-flow]] · [[rabbitmq-vs-kafka]]

**갱신**
[[outbox-pattern]] · [[idempotency]] · [[eventual-consistency]]

## 후속 탐구 후보

- **Saga 패턴** — 여러 서비스에 걸친 트랜잭션을 이벤트로 조율하는 패턴. 원본에는 없지만
  EDA의 자연스러운 다음 단계 (보상 트랜잭션)
- **Kafka Streams / Flink 실습** — 원본은 개념만 짚고 지나감
- **Spring Kafka** — 이 노트는 Spring 연동을 RabbitMQ 쪽만 코드로 다뤘다.
  `@KafkaListener`·`KafkaTemplate`·`DeadLetterPublishingRecoverer`는 미정리
- **CQRS** — 2026-07-28 lint에서도 누락 개념으로 지목됐고, EDA와 함께 자주 등장한다
