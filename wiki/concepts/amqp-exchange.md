---
type: concept
tags: [messaging, rabbitmq, amqp, routing, backend]
updated: 2026-09-07
sources: ["raw/notes/Message Queue.md"]
---

# Exchange · Binding · Routing Key (AMQP 라우팅)

## 한 줄 정의

[[rabbitmq]]에서 **메시지를 어느 Queue로 보낼지 결정하는 3요소.**
Exchange(라우터) + Binding(연결 규칙) + Routing Key(주소)의 조합으로 배달지가 결정된다.

## 왜 이 구조인가

Producer가 큐 이름을 직접 지정하면 "누가 받는지"를 발신자가 알아야 한다. AMQP는 이를
쪼갰다.

- **Producer의 책임** — "무슨 일이 일어났는가"만 선언한다 (`routingKey = order.created`)
- **브로커 설정의 책임** — "그 사건을 누가 받는가"를 정한다 (Binding)

덕분에 새 수신자(예: SMS 발송)를 붙일 때 **Binding만 추가**하면 되고 Producer 코드는
건드리지 않는다. 이것이 [[message-queue|메시지 큐]]가 약속한 느슨한 결합을 실제로
구현하는 지점이다.

## 3요소

### Exchange — 라우터
Producer가 보낸 메시지를 받아 어느 Queue로 보낼지 판단한다. 메시지를 **저장하지 않는다** —
판단하고 넘길 뿐이다. 그래서 매칭되는 Binding이 하나도 없으면 메시지는 **조용히 버려진다**
(mandatory 플래그를 켜야 Producer가 반환받는다 — 실무에서 메시지가 사라지는 흔한 원인).

```
                ┌→ email.queue
Producer → Exchange ├→ sms.queue
                └→ analytics.queue
```

### Binding — 연결 규칙
Exchange와 Queue를 잇는 선. "이 Exchange로 온 메시지 중 이런 조건은 저 Queue로"라는 규칙.

```
order.exchange --[order.created]--> order.email.queue
```

### Routing Key — 주소
Producer가 메시지에 붙이는 문자열. 관례적으로 점(`.`)으로 계층을 표현한다.

```
order.created
order.cancelled
payment.completed
```

## Exchange 4종

### Direct — 정확히 일치
Routing Key가 Binding Key와 **문자열 그대로 일치**하면 전달한다.

```
payment.success → payment.queue
payment.failed  → payment.fail.queue
```

가장 단순하고 예측 가능하다. 목적지가 명확한 작업 큐에 적합하다.

### Topic — 패턴 매칭
와일드카드로 매칭한다. **`*`는 단어 하나, `#`는 0개 이상의 단어**를 의미한다.

```
order.*     → order.created, order.cancelled, order.completed
*.created   → order.created, user.created, loan.created
order.#     → order.created, order.item.added (여러 단계까지)
```

"주문 관련 전부를 감사 로그로", "생성 이벤트 전부를 분석으로" 같은 **횡단 구독**을
Producer 수정 없이 만들 수 있다. 그래서 실무에서 가장 많이 쓰인다.

### Fanout — 전부에게
Routing Key를 **무시**하고 연결된 모든 Queue에 복사해 보낸다.

```
Producer → Fanout Exchange ├→ Queue A (알림)
                           ├→ Queue B (통계)
                           └→ Queue C (로그)
```

하나의 사건을 여러 시스템이 각자 처리해야 할 때. 이 지점이 [[kafka]]의
"여러 [[kafka-consumer-group|Consumer Group]]이 같은 이벤트를 읽는" 모델과 가장 닮았다.
차이는 Kafka는 저장돼 있어 나중에 붙은 소비자도 과거 데이터를 읽을 수 있지만,
Fanout은 **그 시점에 바인딩된 큐에만** 간다는 것.

### Headers — 헤더 조건
Routing Key 대신 메시지 헤더로 분기한다.

```
headers: { type: payment, region: KR }
```

다차원 조건(`type` AND `region`)을 걸 수 있지만 문자열 매칭보다 느리고 설정이 복잡해
실무에서는 Direct·Topic보다 드물게 쓰인다.

## 선택 기준

| 상황 | Exchange |
|---|---|
| 목적지가 하나로 정해져 있다 | Direct |
| 이벤트 계층 구조로 구독을 나누고 싶다 | Topic |
| 한 사건을 모든 구독자가 받아야 한다 | Fanout |
| 라우팅 조건이 여러 속성의 조합이다 | Headers |

## 라우팅 예시 — 전체 경로

```
Producer
   │  message + routingKey = order.created
   ▼
order.exchange  (Topic)
   │  Binding: order.*  →  order.email.queue
   │           order.#  →  audit.queue
   ▼
order.email.queue,  audit.queue   ← 두 큐 모두에 복사되어 들어감
   ▼
각 Consumer가 독립적으로 처리
```

**하나의 메시지가 여러 Queue로 복사될 수 있다**는 점이 중요하다. 하지만 **같은 Queue 안에서는
한 Consumer만** 그 메시지를 가져간다 (Competing Consumers). "큐 간 복사, 큐 내 분배"가
AMQP 라우팅의 핵심 규칙이다.

## 관련 페이지

- [[rabbitmq]] — Exchange가 속한 브로커 전체 구조
- [[rabbitmq-message-flow]] — 라우팅을 포함한 전체 메시지 흐름
- [[spring-amqp]] — `DirectExchange`·`BindingBuilder`로 코드에서 선언하기
- [[kafka-topic-partition]] — Kafka의 대응 개념(토픽·파티션·키)과의 차이
- [[message-queue]] — 상위 개념
- 출처: [[message-queue-note]]
