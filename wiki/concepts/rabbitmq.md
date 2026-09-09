---
type: concept
tags: [messaging, rabbitmq, amqp, broker, backend]
updated: 2026-09-07
sources: ["raw/notes/Message Queue.md"]
---

# RabbitMQ

## 한 줄 정의

**Producer가 보낸 메시지를 받아 규칙에 따라 적절한 Queue로 배달하고, Consumer가 안전하게
처리하도록 중간에서 관리하는 메시지 브로커 서버.**
AMQP 프로토콜의 대표 구현체다.

## 성격 — "이 작업을 누가 처리할 것인가"

[[kafka]]가 "무슨 일이 일어났는가"를 기록하는 로그 플랫폼이라면, RabbitMQ는 전통적 의미의
**메시지 전달·작업 분배 시스템**이다. 메시지는 처리되면 큐에서 사라지는 것이 기본이다.

가장 직관적인 비유는 **택배 분류 센터**다.

```
Producer     보내는 사람
Exchange     분류 센터
Routing Key  배송 주소
Binding      "이 주소는 이 라인으로" 규칙
Queue        배송 대기 구역
Consumer     배송 기사
ACK          배송 완료 처리
```

## 핵심: Producer는 Queue에 직접 보내지 않는다

RabbitMQ를 처음 볼 때 가장 헷갈리는 지점이다. 구조는 이렇다.

```
Producer → Exchange → Queue → Consumer
```

Producer는 **Exchange**(교환기)에 메시지를 던지고, 어느 큐로 갈지는 Exchange가 정한다.

**왜 한 단계를 더 두는가?** Producer가 큐 이름을 직접 지정하면, 수신자가 하나 늘 때마다
Producer 코드를 고쳐야 한다. 그러면 큐를 쓰는 이유(느슨한 결합)가 절반은 사라진다.
Exchange를 두면 Producer는 "무슨 일이 일어났는지"(`order.created`)만 말하고, "누가 받을지"는
브로커 설정(Binding)이 결정한다 — **발신자와 수신자의 결합을 브로커 설정으로 밀어낸 것**이다.

라우팅 규칙의 상세는 [[amqp-exchange]] 참고.

## 구성요소

```
Producer      메시지를 보내는 프로그램
Exchange      메시지를 어느 Queue로 보낼지 결정하는 라우터
Queue         메시지가 대기하는 공간
Binding       Exchange ↔ Queue 연결 규칙
Routing Key   배달 주소로 쓰이는 문자열 (예: order.created)
Consumer      Queue를 구독해 메시지를 처리하는 프로그램
ACK           처리 완료 신호
```

전체 흐름은 [[rabbitmq-message-flow]]에 단계별로 정리했다.

## 안정성 장치 — 메시지를 잃지 않기 위한 4겹

RabbitMQ의 "왜"가 가장 잘 드러나는 부분이다. 메시지가 사라질 수 있는 지점마다 대응 장치가 있다.

### ① Publisher Confirm — Producer ↔ Broker 구간
Producer가 "보냈다"고 생각했지만 브로커가 못 받았을 수 있다. Publisher Confirm을 켜면
브로커가 메시지를 안전하게 받았을 때 확인을 돌려준다.
```
Producer → RabbitMQ → 저장 성공 → Confirm → Producer가 안심
```
이게 없으면 [[outbox-pattern]]을 써도 "Outbox에서 지웠는데 실제로는 안 갔다"가 가능하다.

### ② Durable Queue — 브로커 재시작 구간
`durable = true`인 큐는 서버가 재시작돼도 큐 **정의 자체**가 남는다.
**단, 이것만으로 메시지가 보존되지는 않는다.**

### ③ Persistent Message — 브로커 재시작 구간(메시지)
메시지도 디스크에 쓰도록 표시해야 한다. 안정성을 원하면
**Durable Queue + Persistent Message를 반드시 함께** 써야 한다 — 둘 중 하나만으로는
재시작 시 메시지가 날아간다. (대가는 성능: 디스크 쓰기가 끼어든다.)

### ④ Consumer ACK — Broker ↔ Consumer 구간
메시지를 전달하자마자 지우면, 처리 중 Consumer가 죽었을 때 작업이 사라진다. 그래서 기본은
**처리 성공 후 ACK**다. ACK가 안 오면 RabbitMQ는 같은 메시지를 다시 큐에 넣거나 다른
Consumer에게 넘긴다. 실패를 명시적으로 알리는 **NACK**도 있으며, 재큐·폐기·[[dead-letter-queue|DLQ]] 중
하나로 처리된다.

→ ④의 재전달 때문에 **중복이 발생할 수 있다**. 자세한 것은
[[message-delivery-semantics|전달 보장]] 참고.

## 작업 분배 — Competing Consumers와 Prefetch

같은 큐를 여러 Consumer가 구독하면 메시지가 분산된다.

```
Queue ├→ Consumer A   Message1 → A
      ├→ Consumer B   Message2 → B
      └→ Consumer C   Message3 → C
```

**한 메시지는 한 Consumer만** 처리한다 — 작업을 나누는 것이 목적이기 때문이다.
([[kafka-consumer-group]]과 겉보기는 비슷하지만, Kafka는 파티션 단위로 배정한다는 점이 다르다.)

**Prefetch**는 Consumer가 한 번에 미리 가져갈 메시지 수의 상한이다. 제한이 없으면
브로커가 메시지를 앞에서부터 몰아주기 때문에 한 Consumer는 100개를 쥐고 낑낑대는데 다른
Consumer는 놀 수 있다.

```
prefetch = 1  → 하나 처리하고 ACK한 뒤에야 다음 메시지 수신
```

**작업 시간이 길고 편차가 큰 워크로드일수록 prefetch를 낮게** 잡는 것이 원칙이다.
처리 시간이 짧은 작업에 1을 주면 왕복 지연 때문에 처리량이 떨어진다 — 균형의 문제다.

## 강점과 한계

**강한 곳**
- 작업 큐 (이메일·PDF 생성·이미지 리사이즈·배치)
- 복잡한 라우팅 (Direct/Topic/Fanout/Headers)
- Retry·DLQ가 자연스럽게 내장
- 서비스 간 느슨한 결합

**약한 곳**
- 대규모 이벤트 로그의 장기 저장·재처리(replay) — 메시지를 소비하면 지우는 모델이라 태생적으로 맞지 않음
- 초대용량 스트리밍 처리량

선택 기준은 [[rabbitmq-vs-kafka]] 참고.

## 실행

개발 환경에서는 [[docker]]로 띄우는 것이 일반적이다.

```bash
docker run -d --name rabbitmq \
  -p 5672:5672 -p 15672:15672 \
  rabbitmq:management
```

- `5672` — 애플리케이션 통신용(AMQP)
- `15672` — 관리 웹 콘솔. Queue·Exchange·Binding·Consumer·Message Rate·Connection·Channel을 눈으로 확인할 수 있다

Spring 연동은 [[spring-amqp]] 참고.

## 실무에서 RabbitMQ 코드를 볼 때 체크리스트

낯선 프로젝트에서 메시지 흐름을 빠르게 파악하는 10가지.

```
1. Exchange 이름        6. Consumer 위치
2. Queue 이름           7. ACK 방식
3. Routing Key          8. Retry 정책
4. Exchange Type        9. DLQ 존재 여부
5. Producer 위치       10. 멱등성 처리 여부
```

예를 들어 아래 넷만 찾아도 메시지가 어디서 어디로 가는지 대부분 잡힌다.

```
Exchange:    loan.exchange
Routing Key: loan.created
Queue:       loan.screening.queue
Consumer:    LoanScreeningConsumer
```

## 관련 페이지

- [[amqp-exchange]] — Exchange 4종·Binding·Routing Key 라우팅 원리
- [[rabbitmq-message-flow]] — Producer부터 ACK/DLQ까지 전체 흐름
- [[spring-amqp]] — Spring Boot에서의 사용법
- [[rabbitmq-vs-kafka]] — 언제 무엇을 쓰는가
- [[message-queue]] — 상위 개념
- [[dead-letter-queue]] · [[message-delivery-semantics]] · [[idempotency]]
- [[outbox-pattern]] — DB 저장과 메시지 발행의 정합성
- 출처: [[message-queue-note]]
