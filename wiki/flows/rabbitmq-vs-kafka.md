---
type: flow
tags: [messaging, rabbitmq, kafka, architecture, backend]
updated: 2026-09-07
sources: ["raw/notes/Message Queue.md"]
---

# RabbitMQ vs Kafka — 언제 무엇을 쓰는가

> 가장 자주 비교되는 두 메시징 기술. 우열이 아니라 **설계 목적이 다르다.**

## 한 문장 차이

```
RabbitMQ:  "이 작업을 누가 처리할 것인가?"   → 택배 분류 센터
Kafka:     "어떤 일이 발생했는가?"          → 신문 기록 보관소
```

**모든 차이는 여기서 파생된다.** 택배는 배달되면 끝이고, 신문은 읽어도 남는다.

## 근본 차이 하나 — 소비하면 사라지는가

| | [[rabbitmq]] | [[kafka]] |
|---|---|---|
| 소비 후 | 메시지 **제거** | **그대로 남음** (retention 기간까지) |
| 소비 추적 | 브로커가 메시지별 상태 관리 | Consumer가 **[[kafka-topic-partition\|offset]]** 만 관리 |
| Replay | 제한적 | 매우 강력 (offset 되감기) |

이 한 줄이 나머지 모든 항목을 결정한다. 아래 표를 외우기보다 **"지우는가 남기는가"에서
각 항목을 재유도할 수 있어야** 실무에서 흔들리지 않는다.

## 전체 비교

| 항목 | RabbitMQ | Kafka |
|---|---|---|
| 성격 | Message Broker | Event Streaming Platform |
| 핵심 목적 | 작업 전달·분배 | 이벤트 저장·스트리밍 |
| 모델 | Queue 기반 | append-only Log 기반 |
| 라우팅 | 매우 강력 (Direct/Topic/Fanout/Headers) | 단순 (Topic 중심) |
| 소비 방식 | Queue에서 꺼내 처리 | Log에서 offset 기반 읽기 |
| 순서 보장 | 큐 단위 | [[kafka-topic-partition\|파티션]] 내부만 |
| 확장 단위 | Consumer 수 | 파티션 수 (병렬성 상한) |
| Retry / DLQ | 내장, 자연스러움 | 별도 설계 필요 |
| 처리량 | 충분히 높음 | 압도적 |
| 다중 소비자 | Fanout으로 복사 | [[kafka-consumer-group\|Consumer Group]] 별 독립 소비 |
| 운영 난이도 | 상대적으로 단순 | 복잡 (파티션·복제·리밸런싱) |

## 상황별 선택

**RabbitMQ가 자연스러운 경우 — "작업 하나를 워커 하나에게"**

```
회원가입 → Queue → Email Worker
PDF 생성 요청 → Queue → PDF Worker
이미지 업로드 → Queue → Resize Worker
```

공통점: 작업이 **한 번 처리되면 끝**이고, 나중에 다시 볼 필요가 없다. 실패 시 재시도·DLQ가
바로 필요하고, "누구에게 보낼지"의 라우팅 규칙이 복잡할 수 있다.

**Kafka가 자연스러운 경우 — "이벤트를 여러 시스템이 재사용"**

```
클릭·검색·조회·구매 이벤트  →  Kafka  →  분석 / 추천 / 저장 / 감사
```

공통점: 데이터가 **대량**이고, **여러 소비자**가 각자 다르게 쓰고, 나중에 **다시 읽을**
가능성이 있다.

## 판단 질문 5개

실무에서 고를 때 이 순서로 묻는다.

1. **이 데이터를 나중에 다시 읽을 일이 있는가?** → 있다면 Kafka
2. **소비자가 하나인가, 여럿이 각자 다르게 쓰는가?** → 여럿이면 Kafka
3. **라우팅 규칙이 복잡한가?** → 복잡하면 RabbitMQ
4. **초당 몇 건인가?** → 수만 건 이상이면 Kafka
5. **운영 인력을 감당할 수 있는가?** → 아니면 RabbitMQ (또는 관리형 서비스)

> 규모가 작을 때 Kafka를 들이는 것은 **배보다 배꼽이 큰 선택**이 되기 쉽다.
> 반대로 이벤트 재사용·재처리 요구가 명확한데 RabbitMQ로 시작하면 나중에 갈아엎게 된다.

## 함께 쓰기도 한다

둘 중 하나만 골라야 하는 것은 아니다. 실무에서는

```
Kafka      — 서비스 간 이벤트 백본 (사실의 기록)
RabbitMQ   — 특정 서비스 내부의 작업 큐 (일감 분배)
```

로 층을 나눠 쓰는 구성도 흔하다. 또 **어느 쪽을 쓰든 공통으로 필요한 것**이 있다.

- [[outbox-pattern]] — DB와 브로커 사이의 이중 쓰기 문제는 브로커 종류와 무관하다
- [[idempotency]] — 둘 다 기본이 [[message-delivery-semantics\|At-least-once]]다
- [[dead-letter-queue]] — 내장이냐 직접 구현이냐의 차이일 뿐, 필요하다는 사실은 같다

**브로커를 고르는 일보다, 이 셋을 설계하는 일이 실무에서 훨씬 오래 걸린다.**

## 다른 선택지

- **Redis Pub/Sub** — 매우 단순하고 빠르지만 **저장하지 않는다.** 발행 순간 구독자가 없으면
  메시지는 사라진다. 실시간 알림처럼 유실을 감수할 수 있을 때만
- **Amazon SQS / Google Pub/Sub** — 관리형. 운영 부담을 클라우드에 넘기는 선택
- **직접 호출(REST)** — 서비스가 두세 개뿐이고 즉시 응답이 필요하다면 이게 정답일 수 있다.
  [[event-driven-architecture]]는 공짜가 아니다

## 관련 페이지

- [[rabbitmq]] · [[amqp-exchange]] · [[spring-amqp]] · [[rabbitmq-message-flow]]
- [[kafka]] · [[kafka-topic-partition]] · [[kafka-consumer-group]] · [[kafka-replication]] · [[kafka-event-flow]]
- [[message-queue]] — 공통 상위 개념
- [[event-driven-architecture]] · [[outbox-pattern]] · [[idempotency]] · [[dead-letter-queue]]
- 출처: [[message-queue-note]]
