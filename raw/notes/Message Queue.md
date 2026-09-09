프로젝트 기술 스택으로 쓰이는 kafka를 이해하기 위해 공부한 내용을 바탕으로 적은 노트이다.

# 정의

---

메시지 큐는 한마디로, **시스템 간 작업을 전달하는 메시지를 보관하는 대기열**이다.

# 배경

---

다음과 같이 쇼핑몰 서비스가 운영 중이라고 하자.

```
사용자 주문 -> 주문 서버 -> 이메일 서버
```

여기서 주문 서버가 이메일 서버를 직접 호출하게 되면 문제가 생길 수 있다. 가령 이메일 서버에 장애가 발생하면 주문 서버까지 영향을 받아 주문 처리 자체가 느려질 수도 있다. 또, 두 서버의 트래픽 처리 용량이 다를 경우 (예를 들어 주문 서버는 10,000건, 이메일 서버는 1000건) 중간에 서버가 터질 수도 있다.

그래서 중간에 큐를 둔다.

```
주문 서버 -> [ Massage Queue ] -> 이메일 서버
```

그리고 주문 서버는 메시지 큐에 다음과 같은 메시지만 넣고 자기 할 일을 한다.

```json
{
  "type": "SEND_ORDER_EMAIL",
  "orderid": 1001
}
```

그리고 이메일 서버는 나중에 큐에서 메시지만 꺼내서 작업을 처리하면 된다.

# 구조

---

기본적인 구조는 다음과 같다.

```jsx
Producer -> Message Queue -> Consumer
```

Producer : 메시지를 보내는 서버

Consumer: 메시지를 받아 처리하는 서버

# 메시지 큐의 핵심 특징(장점)

---

## 비동기 처리

동기 방식이 아닌 비동기 방식으로 처리함으로써 각 서비스가 서로를 기다리지 않아도 된다.

```
A -> Queue / Queue -> B
```

## 시스템 간 결합도를 낮춘다

A 서비스가 B 서비스를 직접 호출해야 하면 A 서비스가 B 서비스의 주소 또는 API를 알고 있어야 한다.

하지만 Queue를 사용하면 A 서비스는 B 서비스를 몰라도 되고, 그저 B 서비스에 전달할 메시지만 넣으면 된다. (느슨한 결합, Loose Coupling)

## 트래픽 완충

이벤트 발생으로 초당 10,000건의 주문이 들어왔다고 하자.

이때 아까 상황과 같이 초당 처리 능력이 주문 서버는 10,000건, 이메일 서버는 1,000건이라면 다음과 같은 문제가 발생할 수 있다.

```
주문 10,000건
      ↓
이메일 서버 (처리 능력: 1,000건)
      ↓
서버 다운...
```

메시지 큐를 활용하면:

```
  주문 서버
      ↓
    Queue
[9,000개 대기]
    ↓
[1,000개 처리]
```

이메일 서버는 자기 속도로 처리하면 된다.

이를 **트래픽 버퍼** 라고 한다.

## 장애 대응

이메일 서버가 10분간 죽었다고 하자.

직접 호출인 경우:

```
주문 서버 → 이메일 서버

FAIL
FAIL
FAIL
```

이메일 서버 호출이 유실될 수 있다.

메시지 큐를 활용할 경우:

```
주문 서버 → Queue

[Message]
[Message]
[Message]

이메일 서버 (복구 완료) → 밀린 메시지 처리
```

# 문제점

---

메시지 큐가 만사 오케이는 아니다.

예를 들어, Consumer가 메시지를 처리한 직수 서버가 죽어버려서 “처리 완료” 상태를 Queue에 보내지 못하는 경우, Queue는 메시지가 처리되지 않은 줄 알고 다시 전달하게 될 수 있다.

```
Message A

1차 처리 → Retry → ...
```

즉 중복 메시지 처리가 될 수 있다. 이 때문에 **멱등성**이 중요하다.

# ACK

---

일반적으로 메시지 큐에서는 Consumer가 메시지를 처리했다고 Queue에 알려준다. 이를 ACK라고 한다.

Queue가 ACK를 받으면 메시지를 제거한다.

ACK가 없을 경우 Queue가 메시지를 다시 전달할 수 있다.

# Retry & Dead Letter Queue

---

그러나 영원히 실패하는 메시지가 있을 수도 있다. (예: 잘못된 데이터) 이런 데이터가 계속 Retry될 경우 시스템에 문제가 생길 수 있다.

그래서 보통 여러 번 실패하는 메시지는 Dead Letter Queue라는 별도의 Queue에 저장한다.

```
Main Queue → Consumer → 실패
                         ↓
                       Retry
                       Retry
                       Retry
                         ↓
                        DLQ
```

이렇게 DLQ에 저장된 메시지는 운영자가 나중에 따로 확인한다.

# 전체 프로세스

---

```
Producer

   │
   ▼

┌──────────── Queue ────────────┐
│ Message1                     │
│ Message2                     │
│ Message3                     │
└───────────────────────────────┘

   │
   ▼

Consumer

   │
   ├─ 성공 → ACK
   │
   └─ 실패 → Retry
               │
               └→ 반복 실패 → DLQ
```

# 그럼 RabbitMQ는 무엇인가

RabbitMQ는 앞서 설명한 **메시지 큐(Message Queue)를 실제 서비스에서 구현하기 위한 대표적인 메시지 브로커(Message Broker)**다.

핵심부터 말하면:

> **RabbitMQ는 Producer가 보낸 메시지를 받아서 적절한 Queue에 전달하고, Consumer가 그 메시지를 안전하게 처리할 수 있도록 중간에서 관리해주는 서버다.**

Kafka가 “이벤트 로그를 쌓고 여러 소비자가 독립적으로 읽는 플랫폼”에 가깝다면, RabbitMQ는 훨씬 전통적인 의미의 **메시지 전달·작업 분배 시스템**에 가깝다.

---

# 1. RabbitMQ는 왜 필요한가

예를 들어 주문 서비스가 이메일을 보내야 한다고 하자.

직접 호출하면:

```
OrderService
    ↓ HTTP
EmailService
```

문제는 EmailService가 느리거나 장애가 나면 OrderService까지 영향을 받을 수 있다는 것이다.

RabbitMQ를 중간에 두면:

```
OrderService
    ↓
RabbitMQ
    ↓
EmailService
```

OrderService는:

```
"주문 완료 이메일을 보내라"
```

라는 메시지만 RabbitMQ에 전달하면 된다.

이후 EmailService가 자기 속도대로 메시지를 가져가 처리한다.

즉:

```
Producer → RabbitMQ → Consumer
```

구조다.

---

# 2. RabbitMQ는 Message Queue 그 자체인가?

조금 정확하게 구분할 필요가 있다.

RabbitMQ는 단순히 Queue 하나만 제공하는 게 아니다.

RabbitMQ는:

> **메시지를 받고, 라우팅하고, Queue에 저장하고, Consumer에게 전달하는 Message Broker**

다.

구조를 보면:

```
Producer
   ↓
Exchange
   ↓
Queue
   ↓
Consumer
```

여기서 RabbitMQ의 중요한 특징이 하나 나온다.

Producer가 보통 **Queue에 직접 보내지 않는다.**

대신:

```
Exchange
```

에 메시지를 보낸다.

Exchange가 메시지를 어떤 Queue로 보낼지 결정한다.

---

# 3. RabbitMQ의 핵심 구성요소

RabbitMQ에서 가장 중요한 개념은 다음이다.

```
Producer
Exchange
Queue
Binding
Routing Key
Consumer
ACK
```

전체 흐름:

```
Producer
   │
   │ Message
   ▼
Exchange
   │
   │ Routing
   ▼
Queue
   │
   ▼
Consumer
   │
   └→ ACK
```

하나씩 보자.

---

# 4. Producer

Producer는 메시지를 보내는 프로그램이다.

예:

```
주문 서비스
결제 서비스
회원 서비스
배치 프로그램
```

주문 서비스가 다음 메시지를 보낸다고 하자.

```
{
  "orderId": 1001,
  "type": "SEND_EMAIL"
}
```

Producer는 이 메시지를 RabbitMQ에 전달한다.

---

# 5. Queue

Queue는 메시지가 대기하는 공간이다.

예:

```
email.queue
```

안에 메시지가 쌓인다.

```
[Message1]
[Message2]
[Message3]
```

Consumer가 하나씩 가져가 처리한다.

```
Consumer
   ↓
Message1 처리
```

처리 후:

```
[Message2]
[Message3]
```

같은 형태가 된다.

---

# 6. Exchange

RabbitMQ에서 아주 중요한 개념이다.

Exchange는:

> **Producer가 보낸 메시지를 받아 어떤 Queue로 보낼지 결정하는 라우터**

라고 보면 된다.

예:

```
Producer
   ↓
order.exchange
   ↓
email.queue
```

조금 복잡하게:

```
                ┌→ email.queue
Producer → Exchange
                ├→ sms.queue
                └→ analytics.queue
```

Exchange가 규칙에 따라 메시지를 분배한다.

---

# 7. Binding

Exchange와 Queue의 연결 관계를 **Binding**이라고 한다.

예:

```
Exchange
   │
   │ Binding
   ▼
Queue
```

이를 설정해서:

```
order.exchange
    ↓
order.email.queue
```

같은 관계를 만든다.

---

# 8. Routing Key

Routing Key는 메시지를 어디로 보낼지 결정할 때 사용하는 값이다.

예:

```
order.created
order.cancelled
payment.completed
```

Producer가:

```
Routing Key = order.created
```

로 메시지를 보낸다.

그러면 Exchange가 Binding 설정을 보고:

```
order.created
    ↓
order.queue
```

로 보낼 수 있다.

---

# 9. RabbitMQ 전체 메시지 흐름

실제로는 다음처럼 동작한다.

```
1. Producer가 메시지 생성
2. Producer가 Exchange로 메시지 전송
3. Exchange가 Routing Key 확인
4. Binding Rule 확인
5. 적절한 Queue로 메시지 전달
6. Queue가 메시지 저장
7. Consumer가 메시지 수신
8. Consumer가 작업 수행
9. Consumer가 ACK 전송
10. RabbitMQ가 메시지 제거
```

그림으로 보면:

```
Producer
   │
   │ Message
   │ routingKey=order.created
   ▼
Exchange
   │
   │ Binding
   ▼
order.queue
   │
   ▼
Consumer
   │
   │ 처리 성공
   ▼
ACK
```

---

# 10. Exchange 종류

RabbitMQ에서 중요한 부분이다.

Exchange는 크게 네 종류를 많이 사용한다.

```
Direct
Topic
Fanout
Headers
```

---

# 11. Direct Exchange

가장 직관적이다.

Routing Key가 정확히 일치하면 전달한다.

예:

```
Routing Key = order.created
```

Binding:

```
order.created → order.queue
```

그러면:

```
Producer
   ↓
Exchange
   ↓ order.created
order.queue
```

예:

```
payment.success → payment.queue
payment.failed → payment.fail.queue
```

정확하게 일치해야 한다.

---

# 12. Topic Exchange

패턴 기반으로 라우팅한다.

예:

```
order.*
```

라면:

```
order.created
order.cancelled
order.completed
```

등을 받을 수 있다.

예:

```
*.created
```

이면:

```
order.created
user.created
loan.created
```

같은 메시지를 받을 수 있다.

RabbitMQ에서 꽤 많이 사용한다.

---

# 13. Fanout Exchange

Routing Key를 무시하고 연결된 모든 Queue로 메시지를 보낸다.

예:

```
Producer
   ↓
Fanout Exchange
   ├→ Queue A
   ├→ Queue B
   └→ Queue C
```

같은 메시지를 모두 받는다.

예를 들어 주문 생성 이벤트를:

```
알림
통계
로그
```

에서 모두 처리하고 싶다면 적합하다.

---

# 14. Headers Exchange

Routing Key 대신 메시지 Header를 기준으로 라우팅한다.

예:

```
header:
type=payment
region=KR
```

같은 조건으로 분기한다.

실무에서는 Direct나 Topic보다 덜 자주 보는 편이다.

---

# 15. Consumer는 어떻게 메시지를 가져가는가

Consumer는 Queue를 구독한다.

예:

```
email.queue
   ↓
EmailConsumer
```

RabbitMQ가 메시지를 Consumer에게 전달한다.

```
Message1
   ↓
Consumer
```

Consumer는 실제 작업을 수행한다.

예:

```
메일 발송
DB 저장
외부 API 호출
PDF 생성
```

---

# 16. ACK가 중요한 이유

Consumer가 메시지를 받았다고 해서 바로 삭제하면 위험하다.

예:

```
Queue
 ↓
Consumer
 ↓
처리 중 서버 다운
```

메시지를 이미 삭제했다면 작업이 유실된다.

그래서 RabbitMQ는 보통:

```
Consumer가 처리 성공 후 ACK
```

를 보낸다.

```
Queue
 ↓
Consumer
 ↓
작업 성공
 ↓
ACK
```

그때 RabbitMQ가 메시지를 제거한다.

---

# 17. ACK가 안 오면?

예를 들어:

```
Consumer가 메시지 받음
↓
작업 중 서버 다운
```

RabbitMQ는:

```
ACK를 못 받음
```

을 확인하고 메시지를 다시 Queue에 넣거나 다른 Consumer에게 전달할 수 있다.

이를 통해 메시지 유실을 줄인다.

---

# 18. NACK

Consumer가 처리 실패를 명시적으로 알릴 수도 있다.

이를:

```
NACK
```

이라고 한다.

예:

```
Consumer
 ↓
처리 실패
 ↓
NACK
```

그리고 설정에 따라:

```
다시 Queue에 넣기
```

또는:

```
버리기
```

또는:

```
Dead Letter Queue로 보내기
```

같은 처리를 할 수 있다.

---

# 19. Retry

실무에서는 실패한 메시지를 다시 처리해야 하는 경우가 많다.

예:

```
외부 API 일시 장애
```

라면:

```
Message
 ↓
Consumer
 ↓
FAIL
 ↓
Retry
```

한다.

하지만 바로 계속 재시도하면 장애가 커질 수 있다.

그래서 보통:

```
1초 후
10초 후
1분 후
```

처럼 지연 재시도를 둔다.

---

# 20. Dead Letter Queue

계속 실패하는 메시지는 따로 분리한다.

```
Main Queue
   ↓
Consumer
   ↓
FAIL
   ↓
Retry
   ↓
FAIL
   ↓
DLQ
```

DLQ는:

> **정상적으로 처리할 수 없는 메시지를 별도로 보관하는 Queue**

다.

운영자가 나중에 확인한다.

예:

```
email.queue
```

실패 메시지:

```
email.dlq
```

---

# 21. RabbitMQ에서 Worker 여러 개를 둘 수 있다

예를 들어 Queue에 메시지가 1000개 쌓였다고 하자.

Consumer 하나:

```
Queue
 ↓
Consumer A
```

처리가 느리다.

Consumer를 늘리면:

```
Queue
 ├→ Consumer A
 ├→ Consumer B
 ├→ Consumer C
 └→ Consumer D
```

메시지를 나누어 처리한다.

이를:

```
Competing Consumers Pattern
```

이라고 한다.

---

# 22. 하나의 메시지는 누구에게 가나?

같은 Queue를 여러 Consumer가 구독하면 일반적으로:

```
Message1 → Consumer A
Message2 → Consumer B
Message3 → Consumer C
```

처럼 분산된다.

즉 같은 Queue 내에서는:

> **한 메시지를 한 Consumer가 처리하는 것**

이 기본 목적이다.

Kafka의 Consumer Group과 어느 정도 비슷한 느낌이 있다.

---

# 23. Prefetch

Consumer가 한 번에 너무 많은 메시지를 받아버리면 문제가 될 수 있다.

예:

```
Consumer A → 100개
Consumer B → 1개
```

처럼 불균형이 발생할 수 있다.

그래서 RabbitMQ에는:

```
Prefetch
```

설정이 있다.

예:

```
prefetch = 1
```

이면:

```
Consumer가 메시지 하나 처리 후 다음 메시지 수신
```

하게 할 수 있다.

작업 시간이 긴 시스템에서 중요하다.

---

# 24. RabbitMQ는 메시지를 어디에 저장하나?

기본적으로 Queue에 저장한다.

다만 메시지를 안전하게 보관하려면 설정이 중요하다.

예를 들어:

```
Durable Queue
Persistent Message
```

를 사용한다.

---

# 25. Durable Queue

RabbitMQ 서버가 재시작되어도 Queue 자체가 유지되도록 한다.

```
durable = true
```

하지만 이것만으로 메시지가 보존되는 것은 아니다.

---

# 26. Persistent Message

메시지도 디스크에 저장하도록 설정해야 한다.

```
Persistent
```

메시지로 보내야 한다.

즉 안정성을 높이려면 보통:

```
Durable Queue
+
Persistent Message
```

를 함께 사용한다.

---

# 27. Producer Confirm

Producer 입장에서도 문제가 있다.

```
Producer → RabbitMQ
```

메시지를 보냈다고 생각했는데 실제 Broker가 못 받았을 수도 있다.

그래서 RabbitMQ에는:

```
Publisher Confirm
```

이 있다.

흐름:

```
Producer
 ↓
RabbitMQ
 ↓
저장 성공
 ↓
Confirm
```

Producer는 RabbitMQ가 메시지를 받았다는 것을 확인할 수 있다.

---

# 28. RabbitMQ 사용 흐름을 실무적으로 정리하면

예를 들어 주문 이메일 시스템을 만든다고 하자.

### 1. Queue 정의

```
order.email.queue
```

### 2. Exchange 정의

```
order.exchange
```

### 3. Binding 설정

```
order.exchange
    │
    │ routing key = order.created
    ↓
order.email.queue
```

### 4. Producer 전송

```
OrderService
   ↓
order.exchange
```

메시지:

```
{
  "orderId": 1001,
  "email": "user@example.com"
}
```

Routing Key:

```
order.created
```

### 5. Exchange 라우팅

```
order.created
 ↓
order.email.queue
```

### 6. Consumer 처리

```
EmailConsumer
 ↓
메일 발송
 ↓
ACK
```

이게 RabbitMQ의 전형적인 흐름이다.

---

# 29. Spring Boot에서는 어떻게 사용하는가

Java/Spring 환경에서는 보통:

```
Spring AMQP
```

를 사용한다.

대표 의존성:

```
spring-boot-starter-amqp
```

이다.

---

# 30. Producer 예시

Spring에서는 보통 `RabbitTemplate`을 사용한다.

```
@Service
public class OrderProducer {

    private final RabbitTemplate rabbitTemplate;

    public OrderProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendOrderCreated(Long orderId) {

        // order.exchange로 메시지를 보내고
        // routing key는 order.created를 사용한다.
        rabbitTemplate.convertAndSend(
                "order.exchange",
                "order.created",
                orderId
        );
    }
}
```

흐름:

```
OrderProducer
   ↓
RabbitTemplate
   ↓
order.exchange
   ↓
order.created
   ↓
Queue
```

---

# 31. Consumer 예시

Spring에서는 `@RabbitListener`를 많이 사용한다.

```
@Component
public class OrderConsumer {

    @RabbitListener(queues = "order.email.queue")
    public void consume(Long orderId) {

        // Queue에서 받은 주문 번호로 이메일 발송 처리
        System.out.println("주문 이메일 발송: " + orderId);
    }
}
```

RabbitMQ에 메시지가 들어오면 Spring이 자동으로 이 메서드를 호출한다.

```
Queue
 ↓
@RabbitListener
 ↓
consume()
```

---

# 32. Queue와 Exchange 설정

예:

```
@Configuration
public class RabbitConfig {

    @Bean
    public Queue orderQueue() {
        // 서버 재시작 이후에도 유지되는 Queue
        return new Queue("order.email.queue", true);
    }

    @Bean
    public DirectExchange orderExchange() {
        // 주문 이벤트를 받는 Exchange
        return new DirectExchange("order.exchange");
    }

    @Bean
    public Binding orderBinding(
            Queue orderQueue,
            DirectExchange orderExchange
    ) {
        // order.created라는 Routing Key를
        // order.email.queue와 연결한다.
        return BindingBuilder
                .bind(orderQueue)
                .to(orderExchange)
                .with("order.created");
    }
}
```

이 설정은 다음 구조를 만든다.

```
order.exchange
      ↓
routing key = order.created
      ↓
order.email.queue
```

---

# 33. RabbitMQ 서버는 어떻게 실행하나

개발 환경에서는 Docker로 많이 띄운다.

예:

```
docker run -d \
  --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:management
```

주요 포트:

```
5672
```

애플리케이션 통신용.

```
15672
```

RabbitMQ 관리 웹 화면용.

관리 페이지에서는:

```
Queue
Exchange
Binding
Consumer
Message Rate
Connection
Channel
```

등을 확인할 수 있다.

---

# 34. Spring Boot 연결 설정

보통 `application.yml`에:

```
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
```

정도로 설정한다.

그러면 Spring Boot가 RabbitMQ와 연결한다.

---

# 35. 실제 처리 흐름

Spring Boot 기준으로 전체를 연결하면:

```
HTTP 요청
   ↓
OrderController
   ↓
OrderService
   ↓
DB 저장
   ↓
RabbitTemplate
   ↓
RabbitMQ Exchange
   ↓
Queue
   ↓
@RabbitListener
   ↓
EmailService
```

즉 사용자는 주문 처리만 기다리고:

```
메일 발송
```

같은 작업은 비동기로 수행할 수 있다.

---

# 36. RabbitMQ와 DB Transaction 문제

여기서 실무적으로 중요한 문제가 나온다.

```
DB 저장
 ↓
RabbitMQ 메시지 전송
```

을 한다고 하자.

DB는 성공했는데:

```
RabbitMQ 전송 실패
```

하면 상태가 꼬인다.

예:

```
주문 DB 저장 성공
RabbitMQ 메시지 실패
```

그러면 이메일 Consumer는 주문이 생성된 사실을 모른다.

그래서 중요한 업무에서는:

```
Transactional Outbox Pattern
```

을 사용할 수 있다.

---

# 37. RabbitMQ + Outbox

구조:

```
OrderService
   ↓
DB Transaction

Order Table
+
Outbox Table
```

같은 트랜잭션에서:

```
주문 저장
+
이벤트 저장
```

을 한다.

이후 별도 Worker가:

```
Outbox
 ↓
RabbitMQ
```

로 전송한다.

즉:

```
Business Transaction
        ↓
      Outbox
        ↓
     RabbitMQ
        ↓
     Consumer
```

구조다.

Kafka에서 설명한 Outbox와 원리는 동일하다.

---

# 38. RabbitMQ에서도 멱등성이 중요하다

RabbitMQ는 재전송이 발생할 수 있다.

예:

```
Consumer
 ↓
DB 저장 성공
 ↓
ACK 보내기 직전 서버 다운
```

RabbitMQ는:

```
ACK가 안 왔네?
```

라고 판단한다.

그리고 같은 메시지를 다시 전달할 수 있다.

그러면:

```
첫 번째 처리
+
두 번째 처리
```

가 발생한다.

따라서 Consumer는 가능하면 멱등하게 설계해야 한다.

예:

```
eventId = E10001
```

이미 처리했다면:

```
무시
```

한다.

---

# 39. RabbitMQ의 장점

RabbitMQ는 특히 이런 경우 좋다.

### 작업 큐

```
이미지 처리
이메일 발송
PDF 생성
배치 작업
```

### 비동기 처리

```
API 응답과 후속 작업 분리
```

### 복잡한 메시지 라우팅

```
Direct
Topic
Fanout
Headers
```

### Retry / DLQ

실패 처리에 강하다.

### 서비스 간 느슨한 결합

서비스가 서로 직접 호출하지 않아도 된다.

---

# 40. RabbitMQ의 단점

Kafka와 비교하면 대규모 이벤트 로그 저장·재처리에는 덜 적합하다.

RabbitMQ는 기본적으로:

```
메시지를 전달해서 처리한다.
```

라는 목적이 강하다.

Kafka는:

```
이벤트를 장기간 저장하고
여러 Consumer가 다시 읽는다.
```

라는 목적이 강하다.

---

# 41. RabbitMQ와 Kafka 비교

핵심만 비교하면:

| 항목            | RabbitMQ                | Kafka                     |
| --------------- | ----------------------- | ------------------------- |
| 성격            | Message Broker          | Event Streaming Platform  |
| 핵심 목적       | 작업 전달               | 이벤트 저장·스트리밍      |
| 메시지 처리 후  | 보통 제거               | Retention 기간 동안 유지  |
| Replay          | 제한적                  | 매우 강력                 |
| Routing         | 매우 강력               | 단순한 Topic 중심         |
| Consumer        | Queue에서 작업 소비     | Log에서 Offset 기반 소비  |
| Retry/DLQ       | 자연스러움              | 별도 설계 필요            |
| 작업 큐         | 매우 적합               | 가능하지만 주 목적은 아님 |
| 데이터 스트리밍 | 가능하지만 주 목적 아님 | 매우 적합                 |

---

# 42. 상황별로 보면 더 쉽다

### 이메일 발송

```
회원가입
 ↓
Queue
 ↓
Email Worker
```

RabbitMQ가 자연스럽다.

### PDF 생성

```
PDF 생성 요청
 ↓
Queue
 ↓
PDF Worker
```

RabbitMQ가 잘 맞는다.

### 이미지 리사이즈

```
Upload
 ↓
Queue
 ↓
Image Worker
```

RabbitMQ가 잘 맞는다.

---

반대로:

### 사용자 클릭 이벤트 수집

```
클릭
검색
조회
구매
```

수억 건을 쌓고 여러 시스템이 읽는다면 Kafka가 더 자연스럽다.

---

# 43. RabbitMQ를 가장 직관적으로 비유하면

RabbitMQ는 **택배 분류 센터**와 비슷하다.

Producer:

```
택배를 보내는 사람
```

Exchange:

```
분류 센터
```

Routing Key:

```
배송 주소
```

Binding:

```
어떤 주소는 어떤 배송 라인으로 갈지 정한 규칙
```

Queue:

```
배송 대기 구역
```

Consumer:

```
배송 기사
```

ACK:

```
배송 완료 처리
```

전체 흐름은:

```
보내는 사람
 ↓
분류 센터
 ↓
주소 확인
 ↓
배송 대기열
 ↓
배송 기사
 ↓
배송 완료
```

이다.

---

# 44. Kafka와 비유를 비교하면

RabbitMQ:

```
택배 시스템
```

이다.

> “이 작업을 누가 처리할 것인가?”

Kafka:

```
신문 기록 보관소
```

에 가깝다.

> “어떤 일이 발생했는가?”

이 차이를 기억하면 두 기술을 구분하기 쉽다.

---

# 45. 실무에서 RabbitMQ를 볼 때 체크해야 하는 것

RabbitMQ를 사용하는 코드를 보면 다음을 먼저 찾으면 된다.

```
1. Exchange 이름
2. Queue 이름
3. Routing Key
4. Exchange Type
5. Producer 위치
6. Consumer 위치
7. ACK 방식
8. Retry 정책
9. DLQ 존재 여부
10. 멱등성 처리 여부
```

예:

```
Exchange: loan.exchange

Routing Key:
loan.created

Queue:
loan.screening.queue

Consumer:
LoanScreeningConsumer
```

이 정도만 파악해도 메시지가 어디에서 어디로 이동하는지 상당 부분 이해할 수 있다.

---

# 46. RabbitMQ의 핵심 구조를 최종 정리하면

```
           RabbitMQ Broker

Producer
   │
   │ publish
   ▼
Exchange
   │
   │ Routing Key
   │ Binding
   ▼
Queue
   │
   │ deliver
   ▼
Consumer
   │
   ├─ 성공 → ACK
   │
   └─ 실패 → Retry
                 │
                 └→ DLQ
```

RabbitMQ를 한 문장으로 다시 말하면:

> **Producer와 Consumer 사이에서 메시지를 안전하게 보관하고, 조건에 따라 Queue로 라우팅하며, Consumer가 안정적으로 비동기 작업을 수행할 수 있게 해주는 메시지 브로커다.**

그리고 지금 단계에서 가장 중요한 차이는 이 두 문장이다.

```
RabbitMQ
→ "이 작업을 처리해라."
```

```
Kafka
→ "이 사건이 발생했다."
```

물론 실제 서비스에서는 둘의 역할이 일부 겹치지만, 이 관점으로 시작하면 구조를 이해하기 쉽다.

다음은 **Spring Boot 실습**, **RabbitMQ 내부 구조 심화**, **Kafka와 코드 수준 비교** 중 어느 쪽으로 이어갈까?

2026년 9월 7일 오전 11:37

메시지 큐는 프록시와 비슷한 것인가?

겉보기 구조는 비슷해 보일 수 있지만, 역할은 꽤 다르다.

둘 다 중간에 끼어 있다는 점은 같다.

```
A → 중간 시스템 → B
```

그래서 처음 보면 비슷하게 느껴진다.

하지만 핵심 차이는 **무엇을 위해 중간에 있느냐**다.

메시지 큐는:

> **메시지를 저장해두고, 나중에 Consumer가 처리할 수 있게 만드는 것**

이 핵심이다.

```
Producer
  ↓
Message Queue
  ↓
Consumer
```

반면 프록시는:

> **요청을 대신 받아서 다른 서버로 전달하는 것**

이 핵심이다.

```
Client
  ↓
Proxy
  ↓
Server
```

가장 큰 차이는 **비동기성과 저장 여부**다.

예를 들어 프록시에서는:

```
Client → Proxy → Server
```

클라이언트가 HTTP 요청을 보내면 프록시는 보통 그 요청을 서버에 전달하고, 서버의 응답을 다시 클라이언트에게 돌려준다.

```
Client
  │ 요청
  ▼
Proxy
  │ 요청 전달
  ▼
Server
  │ 응답
  ▼
Proxy
  │ 응답 전달
  ▼
Client
```

즉 기본적으로 하나의 요청-응답 흐름 안에 있다.

반대로 메시지 큐는:

```
Producer → Queue
```

여기까지만 하고 Producer가 자기 일을 끝낼 수 있다.

Consumer는 나중에 처리한다.

```
Producer
   ↓
[ Message Queue ]
       ↓
       ↓ 10초 뒤일 수도 있음
       ↓
Consumer
```

그래서 메시지 큐는 **시간적으로 Producer와 Consumer를 분리한다**.

이게 아주 중요한 차이다.

예를 들어 이메일 발송을 보자.

프록시 구조라면:

```
주문 서버
  ↓
Proxy
  ↓
Email Server
```

Proxy는 Email Server가 죽어 있으면 보통 요청 자체를 제대로 처리할 수 없다.

하지만 메시지 큐라면:

```
주문 서버
  ↓
Queue
```

이메일 서버가 현재 죽어 있어도 메시지를 큐에 쌓아둘 수 있다.

```
Queue

[메일1]
[메일2]
[메일3]
```

나중에 Email Server가 복구되면:

```
Queue
  ↓
Email Server
```

밀린 작업을 처리할 수 있다.

그래서 역할을 비교하면 이렇다.

| 구분                  | Proxy                 | Message Queue              |
| --------------------- | --------------------- | -------------------------- |
| 핵심 역할             | 요청 전달/중계        | 메시지 저장 및 비동기 전달 |
| 요청 처리             | 주로 동기적           | 주로 비동기적              |
| 데이터를 오래 보관    | 보통 안 함            | 함                         |
| 대상 서버가 죽으면    | 요청 실패 가능        | Queue에 대기 가능          |
| 요청-응답             | 중요                  | 꼭 필요하지 않음           |
| 서비스 간 시간적 분리 | 거의 없음             | 강함                       |
| 대표 기술             | Nginx, HAProxy, Envoy | RabbitMQ, Kafka, SQS       |

조금 더 직관적으로 비유하면:

**Proxy는 안내 데스크**에 가깝다.

```
손님
 ↓
안내 데스크
 ↓
담당 직원
```

안내 데스크가 "이 요청은 3층으로 가세요"라고 전달해주는 것이다.

반면 메시지 큐는 **우편함**에 가깝다.

```
보내는 사람
 ↓
우편함
 ↓
받는 사람이 나중에 수거
```

보내는 사람과 받는 사람이 동시에 존재할 필요가 없다.

그리고 RabbitMQ와 비교하면 차이가 더 선명하다.

RabbitMQ는:

```
Producer
 ↓
Exchange
 ↓
Queue
 ↓
Consumer
```

여기서 Exchange는 약간 **프록시나 라우터처럼 보일 수 있다.**

왜냐하면 메시지를 받아 적절한 Queue로 라우팅하기 때문이다.

```
        ┌→ Queue A
Producer → Exchange
        └→ Queue B
```

하지만 Exchange만 떼어서 보면 라우터와 비슷할 뿐이고, **RabbitMQ 전체는 Proxy와 다르다.**

RabbitMQ에는 Queue라는 저장 공간이 있기 때문이다.

```
Exchange
   ↓
Queue
[메시지]
[메시지]
[메시지]
   ↓
Consumer
```

그래서 정리하면:

> **프록시는 "지금 이 요청을 어디로 전달할까?"를 해결하고, 메시지 큐는 "이 작업을 안전하게 맡겨두고 누군가 나중에 처리하게 하자"를 해결한다.**

이 차이를 잡으면 이후에 **로드 밸런서, API Gateway, Reverse Proxy, Message Broker**도 서로 잘 구분된다.

# 그럼 Kafka는 무엇인가

Kafka는 한마디로 말하면 **“시스템들 사이에서 대량의 이벤트 데이터를 빠르고 안정적으로 전달하고 저장하는 분산 이벤트 스트리밍 플랫폼”**이다.

처음 접하면 “메시지 큐 아닌가?”라고 생각하기 쉬운데, Kafka는 단순한 메시지 큐보다 범위가 넓다. **메시지를 전달하는 기능 + 데이터를 일정 기간 저장하는 기능 + 여러 소비자가 같은 데이터를 독립적으로 읽는 기능 + 실시간 데이터 파이프라인을 만드는 기능**을 함께 제공한다.

아래에서 완전히 처음부터 설명하겠다.

---

# 1. Kafka를 왜 쓰는가?

먼저 Kafka가 없는 상황을 생각해보자.

예를 들어 쇼핑몰 시스템에 다음 서비스가 있다고 하자.

```
주문 서비스
결제 서비스
재고 서비스
배송 서비스
알림 서비스
추천 서비스
데이터 분석 서비스
```

사용자가 주문을 하면 주문 서비스가 여러 시스템에 알려야 한다.

```
주문 서비스
 ├── 결제 서비스 호출
 ├── 재고 서비스 호출
 ├── 배송 서비스 호출
 ├── 알림 서비스 호출
 ├── 추천 서비스 호출
 └── 분석 서비스 호출
```

처음에는 이렇게 해도 된다.

그런데 시스템이 커지면 문제가 생긴다.

### 문제 1. 서비스가 강하게 결합된다

주문 서비스가 다른 서비스들의 존재를 전부 알고 있어야 한다.

```
paymentService.pay();
inventoryService.decrease();
notificationService.send();
analyticsService.record();
recommendationService.update();
```

서비스가 하나 추가되면 주문 서비스 코드를 수정해야 한다.

---

### 문제 2. 하나의 서비스 장애가 다른 서비스에 영향을 준다

예를 들어 분석 서버가 죽었다.

```
주문 → 분석 서버 호출 → timeout
```

분석은 사실 주문 처리에 필수적이지 않은데도 주문 자체가 느려질 수 있다.

---

### 문제 3. 순간적인 트래픽을 버티기 어렵다

평소 초당 100개의 주문이 발생하다가 이벤트 때문에 갑자기 초당 100,000개 주문이 들어온다고 하자.

```
주문 서버
  ↓
알림 서버
```

알림 서버가 초당 5,000건밖에 처리하지 못하면 터질 수 있다.

---

Kafka를 가운데 두면 구조가 바뀐다.

```
             ┌→ 결제 서비스
             │
             ├→ 재고 서비스
주문 서비스 → Kafka ─→ 배송 서비스
             ├→ 알림 서비스
             ├→ 추천 서비스
             └→ 분석 서비스
```

주문 서비스는 단순히 Kafka에 다음 이벤트를 기록한다.

```
OrderCreated
```

그리고 다른 서비스들이 필요한 경우 가져간다.

이것이 Kafka의 핵심적인 존재 이유다.

---

# 2. Kafka는 무엇인가?

Kafka를 가장 정확하게 표현하면 다음과 같다.

> Apache Kafka는 분산 이벤트 스트리밍 플랫폼이다.

여기에는 중요한 단어가 세 개 있다.

```
분산
이벤트
스트리밍
```

하나씩 이해하면 Kafka가 거의 이해된다.

---

# 3. 이벤트(Event)란 무엇인가?

이벤트는 쉽게 말해서

> **“무언가 발생했다”는 기록**

이다.

예를 들어:

```
회원이 가입했다.
상품이 주문되었다.
결제가 완료되었다.
배송이 시작되었다.
주식 가격이 변경되었다.
서버에서 오류가 발생했다.
사용자가 페이지를 클릭했다.
```

이를 데이터로 표현하면 다음과 같다.

```
{
  "eventType": "ORDER_CREATED",
  "orderId": 12345,
  "userId": 777,
  "price": 30000,
  "timestamp": "2026-09-03T12:30:00"
}
```

Kafka는 이런 이벤트를 저장하고 전달한다.

---

# 4. Streaming이란 무엇인가?

전통적인 데이터 처리는 주로 Batch였다.

예를 들어:

```
하루 동안 주문 저장

00:00
↓
하루치 데이터 모음
↓
배치 프로그램 실행
↓
통계 계산
```

이것이 **Batch Processing**이다.

반대로 Streaming은 데이터가 발생하는 즉시 처리한다.

```
주문 발생
↓
Kafka
↓
실시간 처리
↓
통계 업데이트
```

예:

```
12:00:01 주문 발생
12:00:01 Kafka 저장
12:00:01 분석 서비스 읽기
12:00:02 대시보드 반영
```

그래서 Kafka를 **Event Streaming Platform**이라고 부른다.

---

# 5. Kafka의 기본 구조

Kafka를 이해하기 위해 반드시 알아야 할 구성요소가 있다.

```
Producer
Topic
Partition
Broker
Consumer
Consumer Group
Offset
```

이 일곱 개가 핵심이다.

전체 구조를 먼저 보면:

```
Producer
    │
    ▼
┌──────────────── Kafka Cluster ────────────────┐
│                                              │
│ Broker 1        Broker 2        Broker 3     │
│                                              │
│ Topic: order                                  │
│                                              │
│ Partition 0     Partition 1     Partition 2  │
│                                              │
└──────────────────────────────────────────────┘
    │
    ▼
Consumer Group
 ├ Consumer A
 ├ Consumer B
 └ Consumer C
```

---

# 6. Producer

Producer는 Kafka에 메시지를 넣는 프로그램이다.

예:

```
주문 서비스
결제 서비스
로그 수집기
IoT 센서
웹 서버
```

주문 서비스에서:

```
주문 생성
↓
Kafka
```

다음 이벤트를 보낼 수 있다.

```
{
  "orderId": 1001,
  "product": "MacBook",
  "price": 2000000
}
```

Kafka 용어로는 보통

```
Produce
```

한다고 표현한다.

---

# 7. Topic

Kafka는 데이터를 **Topic**이라는 단위로 분류한다.

데이터베이스의 테이블과 조금 비슷한 개념이라고 생각해도 된다.

예:

```
order-created
payment-completed
delivery-started
user-login
server-log
```

예를 들어:

```
Topic: order-created
```

안에는 다음 이벤트들이 계속 들어간다.

```
Order1
Order2
Order3
Order4
Order5
...
```

개념적으로 보면:

```
order-created

[Order1][Order2][Order3][Order4][Order5]...
```

Kafka는 이 데이터를 순서대로 추가한다.

이 구조를 흔히 **append-only log**라고 한다.

---

# 8. Kafka의 핵심: Log 구조

Kafka를 이해하는 가장 중요한 개념 중 하나다.

Kafka는 기본적으로 데이터를 다음처럼 저장한다.

```
0      1      2      3      4
↓      ↓      ↓      ↓      ↓

[A] → [B] → [C] → [D] → [E]
```

새로운 데이터는 뒤에 붙는다.

```
[A][B][C][D][E][F]
```

기존 데이터를 중간에서 수정하는 구조가 아니다.

즉:

```
append-only log
```

이다.

이것 때문에 Kafka가 매우 빠르다.

---

# 9. Offset

Kafka에서는 각 메시지에 번호가 붙는다.

이를 **Offset**이라고 한다.

```
Offset

0        1        2        3
↓        ↓        ↓        ↓

OrderA   OrderB   OrderC   OrderD
```

Consumer는 자신의 현재 위치를 기억한다.

예를 들어:

```
Consumer offset = 2
```

라면

```
0   1   2
A   B   C
        ↑
      여기까지 읽음
```

다음에는 offset 3부터 읽는다.

이 구조가 Kafka에서 아주 중요하다.

---

# 10. Kafka가 일반 메시지 큐와 다른 핵심

일반적인 메시지 큐를 단순화하면:

```
Producer
   ↓
Queue

[A][B][C]

Consumer가 A 읽음

[B][C]
```

메시지를 소비하면 사라지는 개념이 강하다.

Kafka는 다르다.

```
Kafka

[A][B][C]
```

Consumer가 A를 읽어도

```
[A][B][C]
```

그대로 존재한다.

Consumer가 어디까지 읽었는지는 offset으로 관리한다.

```
Consumer 1 offset = 2
Consumer 2 offset = 0
Consumer 3 offset = 1
```

따라서 여러 시스템이 같은 이벤트를 독립적으로 사용할 수 있다.

---

# 11. Kafka는 데이터를 저장한다

Kafka에서 특히 중요한 부분이다.

Kafka는 단순 전달 시스템이 아니다.

메시지를 디스크에 저장한다.

예:

```
order topic

Day 1
Day 2
Day 3
...
```

설정에 따라:

```
7일 보관
30일 보관
90일 보관
무제한 보관
```

등이 가능하다.

이를 **Retention**이라고 한다.

예:

```
retention.ms=604800000
```

이면 약 7일이다.

---

# 12. 메시지를 다시 읽을 수 있다

Kafka가 강력한 이유다.

예를 들어 분석 서비스에 버그가 있었다.

```
Kafka

Event1
Event2
Event3
Event4
Event5
```

분석 서비스가 Event5까지 읽었다.

```
offset = 5
```

버그를 고친 다음

```
offset = 0
```

으로 되돌리면 처음부터 다시 처리할 수 있다.

이것을 흔히 **Replay**라고 한다.

로그 시스템, 데이터 플랫폼에서 매우 유용하다.

---

# 13. Partition

Topic은 실제로 하나의 거대한 로그로만 존재하지 않는다.

Topic은 여러 **Partition**으로 나눌 수 있다.

예:

```
Topic: order
```

Partition 3개라면:

```
Partition 0
[A][D][G]

Partition 1
[B][E][H]

Partition 2
[C][F][I]
```

왜 이렇게 나누는가?

가장 큰 이유는

> 병렬 처리

다.

---

# 14. Kafka가 빠른 핵심 이유 중 하나: Partition

만약 Topic이 하나의 줄이라면:

```
[A][B][C][D][E][F]
```

한 Consumer가 모두 처리해야 한다.

하지만 Partition이 세 개라면:

```
Partition 0 → Consumer A

Partition 1 → Consumer B

Partition 2 → Consumer C
```

동시에 처리할 수 있다.

```
Consumer A
Consumer B
Consumer C

동시에 처리
```

따라서 Kafka는 매우 높은 처리량을 낼 수 있다.

---

# 15. Partition 내부에서는 순서가 보장된다

Kafka의 매우 중요한 규칙이다.

Kafka는 **Topic 전체의 순서를 기본적으로 보장하지 않는다.**

대신:

> Partition 내부에서는 순서를 보장한다.

예:

```
Partition 0

A → B → C → D
```

이 순서는 유지된다.

하지만:

```
Partition 0: A C E
Partition 1: B D F
```

전체적으로

```
A B C D E F
```

순서를 보장하는 것은 아니다.

이 때문에 메시지의 Key가 중요하다.

---

# 16. Message Key

Kafka 메시지는 보통 다음 구조를 갖는다.

```
Key
Value
Timestamp
Headers
```

예:

```
Key = userId 100
Value = 주문 이벤트
```

같은 Key는 일반적으로 같은 Partition으로 보내진다.

예:

```
userId = 100

Order1
Order2
Order3
```

모두:

```
Partition 2
```

로 갈 수 있다.

따라서:

```
Order1 → Order2 → Order3
```

순서를 유지할 수 있다.

---

# 17. Broker

Kafka 서버 하나를 **Broker**라고 한다.

예:

```
Kafka Cluster

Broker 1
Broker 2
Broker 3
```

실제 운영에서는 Kafka 서버 여러 개를 묶어 사용한다.

이를:

```
Kafka Cluster
```

라고 한다.

예:

```
Producer
   ↓

┌──────── Kafka Cluster ────────┐

Broker 1
Broker 2
Broker 3

└───────────────────────────────┘

   ↓
Consumer
```

---

# 18. 왜 여러 Broker를 사용하는가?

두 가지 이유가 크다.

### 성능

데이터를 나누어 저장할 수 있다.

```
Broker1 → Partition0
Broker2 → Partition1
Broker3 → Partition2
```

### 장애 대응

한 서버가 죽어도 시스템이 계속 동작할 수 있다.

이를 위해 Kafka는 **Replication**을 사용한다.

---

# 19. Replication

예를 들어:

```
Partition 0
```

을 Broker 1에만 저장했다고 하자.

```
Broker 1
Partition 0
```

Broker 1이 죽으면 데이터에 접근하지 못한다.

그래서 Kafka는 복제한다.

```
Broker 1
Partition 0 Leader

Broker 2
Partition 0 Replica

Broker 3
Partition 0 Replica
```

예:

```
Replication Factor = 3
```

이면 같은 Partition 데이터를 3개 Broker에 둔다.

---

# 20. Leader와 Follower

Partition에는 Leader가 있다.

예:

```
Partition 0

Broker1 → Leader
Broker2 → Follower
Broker3 → Follower
```

Producer와 Consumer는 기본적으로 Leader와 통신한다.

```
Producer
   ↓
Leader
   ↓
Follower 복제
```

Leader Broker가 장애가 나면 Replica 중 하나가 새로운 Leader가 될 수 있다.

```
Broker1 DOWN

Broker2 → New Leader
```

그래서 Kafka가 장애에 강하다.

---

# 21. Consumer

Consumer는 Kafka 메시지를 읽는 프로그램이다.

예:

```
Kafka

order-created
      ↓

Consumer
```

Consumer가 될 수 있는 서비스:

```
알림 서비스
배송 서비스
결제 서비스
분석 서비스
추천 서비스
```

---

# 22. Consumer Group

Kafka에서 아주 중요한 개념이다.

Consumer 여러 개를 묶으면:

```
Consumer Group
```

이라고 한다.

예:

```
Group: order-processing

Consumer A
Consumer B
Consumer C
```

Kafka는 Partition을 Consumer들에게 나눠준다.

```
Partition 0 → Consumer A
Partition 1 → Consumer B
Partition 2 → Consumer C
```

이를 통해 병렬 처리한다.

---

# 23. Consumer Group의 핵심 규칙

하나의 Consumer Group 안에서는

> **하나의 Partition을 동시에 하나의 Consumer만 처리한다.**

예:

```
3 Partition

P0
P1
P2
```

Consumer 3명:

```
C1 → P0
C2 → P1
C3 → P2
```

완벽하게 병렬 처리된다.

---

Consumer가 2개면:

```
C1 → P0 + P1
C2 → P2
```

하나가 여러 Partition을 담당할 수 있다.

---

Consumer가 4개면:

```
C1 → P0
C2 → P1
C3 → P2
C4 → idle
```

Partition보다 Consumer가 많으면 일부 Consumer는 논다.

따라서 중요한 관계가 있다.

```
Consumer 병렬성의 최대치 ≈ Partition 개수
```

---

# 24. 서로 다른 Consumer Group은 같은 메시지를 읽는다

이 부분이 Kafka 설계에서 매우 중요하다.

예를 들어:

```
Topic: order-created
```

에 다음 이벤트가 있다.

```
Order1
Order2
Order3
```

Consumer Group을 여러 개 만들 수 있다.

```
Group: notification

Group: analytics

Group: recommendation
```

각각 독립적으로 데이터를 읽는다.

```
                  → notification
order-created →   → analytics
                  → recommendation
```

즉 하나의 이벤트를 여러 시스템에서 활용할 수 있다.

---

# 25. Offset 관리

Consumer Group마다 Offset을 가진다.

예:

```
order-created

Offset
0 1 2 3 4 5
```

Notification 서비스:

```
offset = 5
```

Analytics 서비스:

```
offset = 3
```

Recommendation 서비스:

```
offset = 1
```

각자 다른 속도로 처리할 수 있다.

이것이 Kafka의 매우 중요한 특징이다.

---

# 26. Rebalancing

Consumer Group에서 Consumer가 추가되거나 사라지면 Partition 할당이 변경된다.

예:

기존:

```
C1 → P0, P1
C2 → P2, P3
```

새 Consumer C3가 들어오면:

```
C1 → P0
C2 → P1
C3 → P2, P3
```

같이 재분배될 수 있다.

이를:

```
Rebalancing
```

이라고 한다.

Kafka 운영에서 매우 중요한 개념이다.

왜냐하면 Rebalancing 동안 Consumer 처리가 잠시 중단될 수 있기 때문이다.

---

# 27. Kafka의 전체 흐름

이제 전체를 연결해보자.

```
주문 서비스
(Producer)

       │
       │ OrderCreated
       ▼

Kafka Cluster

Topic: order-created

Partition 0
Partition 1
Partition 2

       │
       ▼

Consumer Group: notification

Consumer 1
Consumer 2
Consumer 3

       │
       ▼

문자 / Push / 이메일 발송
```

---

# 28. Kafka를 실제 서비스에서 어떻게 사용하는가?

Kafka는 다양한 곳에서 사용된다.

대표적인 용도는 크게 다섯 가지다.

---

## 28.1 서비스 간 이벤트 전달

마이크로서비스에서 가장 흔한 용도다.

```
Order Service
      ↓
Kafka
      ↓
Payment Service
Shipping Service
Notification Service
```

이 구조를:

```
Event-Driven Architecture
```

라고 한다.

즉 서비스가 직접 서로 호출하기보다 이벤트를 통해 통신한다.

---

# 29. Event-driven Architecture

기존 구조:

```
Order Service
   ↓ HTTP
Payment Service
   ↓ HTTP
Inventory Service
   ↓ HTTP
Shipping Service
```

서비스들이 강하게 연결되어 있다.

Kafka 기반:

```
Order Service
      ↓
OrderCreated
      ↓
Kafka
  ├→ Payment
  ├→ Inventory
  └→ Analytics
```

서비스 간 결합도가 낮아진다.

---

# 30. 동기 통신과 비동기 통신

REST API는 일반적으로 동기 방식이다.

```
A → B

A: "처리해줘"

B 처리

B: "완료했어"

A 계속 실행
```

Kafka는 보통 비동기 방식이다.

```
A → Kafka

A: 이벤트 저장

A는 자기 작업 계속

B가 나중에 Kafka에서 가져감
```

따라서 시스템 간 의존성을 낮출 수 있다.

---

# 31. Kafka를 사용하는 대표적인 실제 사례

Kafka는 대규모 서비스에서 많이 사용한다.

예를 들어:

```
사용자 클릭 데이터
결제 이벤트
주문 이벤트
로그 데이터
IoT 센서 데이터
주식 거래 데이터
추천 시스템 데이터
게임 이벤트
```

등이다.

---

# 32. 로그 수집 플랫폼

Kafka는 로그 수집에도 많이 사용된다.

예:

```
Server A ─┐
Server B ─┼→ Kafka → Elasticsearch → Kibana
Server C ─┘
```

서버 로그를 Kafka로 모은 뒤 검색 시스템으로 전달한다.

---

# 33. 데이터 파이프라인

Kafka는 데이터 엔지니어링에서도 핵심 기술이다.

예:

```
Application
     ↓
Kafka
     ↓
Flink
     ↓
Data Warehouse
```

또는:

```
MySQL
 ↓
CDC
 ↓
Kafka
 ↓
Snowflake / BigQuery / Elasticsearch
```

같은 구조다.

---

# 34. CDC와 Kafka

CDC는:

```
Change Data Capture
```

즉 DB 변경을 감지하는 기술이다.

예:

```
INSERT order
```

DB가 변경되면:

```
MySQL
   ↓
Debezium
   ↓
Kafka
   ↓
다른 시스템
```

로 전달할 수 있다.

이 방식은 현대 데이터 플랫폼에서 많이 사용된다.

---

# 35. 실시간 데이터 분석

예를 들어 쿠팡 같은 쇼핑몰에서:

```
사용자 클릭
검색
장바구니
구매
```

이벤트를 Kafka로 보낸다.

```
User
 ↓
Website
 ↓
Kafka
 ↓
Stream Processing
 ↓
추천 시스템
```

그러면 실시간 추천이 가능하다.

---

# 36. Kafka Connect

Kafka에는 외부 시스템과 연결하기 위한 도구도 있다.

바로:

```
Kafka Connect
```

이다.

예:

```
MySQL
 ↓
Kafka Connect
 ↓
Kafka
```

또는:

```
Kafka
 ↓
Kafka Connect
 ↓
Elasticsearch
```

Connector가 많이 존재하기 때문에 직접 코드를 작성하지 않고 연결할 수 있다.

---

# 37. Kafka Streams

Kafka 데이터를 처리하기 위한 Java 라이브러리다.

예:

```
Kafka Topic
     ↓
Kafka Streams
     ↓
필터링
집계
조인
변환
     ↓
Kafka Topic
```

예:

```
주문 이벤트

10000
20000
30000
```

Kafka Streams로:

```
1분 주문 총액 = 60000
```

같은 계산을 할 수 있다.

---

# 38. Apache Flink / Spark와 Kafka

실제 시스템에서는 Kafka를 다음과 함께 사용하는 경우가 많다.

```
Kafka
 +
Flink
```

또는

```
Kafka
 +
Spark Streaming
```

예:

```
Producer
 ↓
Kafka
 ↓
Flink
 ↓
Database
```

Kafka는 데이터를 전달·보관하고,

Flink는 복잡한 실시간 계산을 담당한다.

---

# 39. Kafka의 강점

Kafka가 인기가 많은 이유는 몇 가지가 있다.

### 매우 높은 처리량

초당 엄청난 양의 메시지를 처리할 수 있다.

### 확장성

Broker와 Partition을 늘려서 규모를 확장할 수 있다.

```
Broker 3대
↓
Broker 10대
↓
Broker 100대
```

---

### 장애 복구

Replication을 통해 장애를 견딜 수 있다.

---

### 메시지 Replay

과거 메시지를 다시 처리할 수 있다.

---

### 여러 Consumer 사용 가능

```
Kafka
 ├ Analytics
 ├ Notification
 ├ Search
 ├ Recommendation
 └ Machine Learning
```

같은 이벤트를 여러 시스템이 독립적으로 활용한다.

---

# 40. Kafka의 단점

Kafka가 모든 문제의 정답은 아니다.

### 운영이 복잡하다

Kafka Cluster를 운영하려면 신경 써야 할 것이 많다.

```
Broker
Partition
Replication
Consumer Lag
Rebalancing
Disk
Network
Retention
```

---

### 작은 시스템에서는 과한 기술일 수 있다

예:

```
회원 1,000명
서버 1대
```

정도의 작은 서비스라면 Kafka까지 도입하는 것은 오히려 복잡성을 증가시킬 수 있다.

RabbitMQ, Redis Queue 또는 단순 DB 기반 Queue가 더 적절할 수 있다.

---

# 41. Kafka와 RabbitMQ 차이

많이 비교되는 기술이다.

단순화하면:

| Kafka                   | RabbitMQ                |
| ----------------------- | ----------------------- |
| Event Streaming         | Message Broker          |
| 로그 기반               | Queue 기반              |
| 메시지 저장             | 소비 중심               |
| Replay 강력             | 보통 Replay 목적이 아님 |
| 대규모 데이터 처리 강점 | 작업 큐/라우팅 강점     |
| 데이터 파이프라인       | 메시지 전달             |
| Partition 기반 확장     | Queue 중심              |

예를 들어:

```
"이벤트 기록을 여러 시스템이 재사용"
```

이라면 Kafka가 잘 맞는다.

```
"작업 하나를 Worker 하나에게 맡김"
```

이라면 RabbitMQ가 더 자연스러울 수 있다.

---

# 42. Kafka와 Redis Pub/Sub 차이

Redis Pub/Sub은 상당히 단순하다.

```
Publisher
 ↓
Redis
 ↓
Subscriber
```

그 순간 Subscriber가 없으면 메시지를 놓칠 수 있다.

Kafka는:

```
Producer
 ↓
Kafka (Disk 저장)
 ↓
Consumer
```

이기 때문에 나중에 Consumer가 와도 읽을 수 있다.

---

# 43. Kafka와 DB의 차이

Kafka를 처음 배우면 이런 의문도 생긴다.

> "Kafka에 데이터 저장하면 DB가 필요 없는 거 아닌가?"

보통 그렇지 않다.

둘의 목적이 다르다.

DB:

```
현재 상태
```

예:

```
order_id = 100
status = 배송완료
```

Kafka:

```
상태 변화의 흐름
```

예:

```
OrderCreated
PaymentCompleted
ShippingStarted
DeliveryCompleted
```

라고 이해하면 좋다.

---

# 44. 상태와 이벤트

DB에는 현재 상태가 있다.

```
주문 상태 = 배송완료
```

Kafka에는 이벤트가 쌓인다.

```
주문 생성
↓
결제 완료
↓
상품 준비
↓
배송 시작
↓
배송 완료
```

그래서 Kafka는 시스템의 **시간 흐름**을 표현하기 좋다.

---

# 45. Kafka 메시지 처리 보장 방식

Kafka를 제대로 배우기 시작하면 반드시 만나는 개념이다.

```
At-most-once
At-least-once
Exactly-once
```

---

## At-most-once

최대 한 번 처리한다.

```
메시지 유실 가능
중복 없음
```

---

## At-least-once

최소 한 번 처리한다.

```
메시지 유실 가능성 낮음
중복 가능
```

실무에서는 이 방식이 흔하다.

따라서 Consumer를 보통 **멱등성(idempotency)** 있게 설계한다.

---

## Exactly-once

논리적으로 정확히 한 번 처리하는 것을 목표로 한다.

하지만 실제 분산 시스템에서는 훨씬 복잡한 문제다.

Kafka는 트랜잭션과 idempotent producer 등을 통해 Exactly-once semantics를 지원하는 영역이 있지만, DB나 외부 시스템까지 포함하면 별도로 설계해야 한다.

---

# 46. 멱등성(Idempotency)

Kafka에서 매우 중요하다.

같은 이벤트가 두 번 들어왔다고 하자.

```
PaymentCompleted
PaymentCompleted
```

잘못 처리하면:

```
결제금액 30,000원

↓
30,000원 처리

↓
또 30,000원 처리
```

문제가 발생한다.

그래서:

```
eventId = 12345
```

를 저장하고 이미 처리한 이벤트이면 무시하는 식으로 만든다.

```
if eventId already processed
    ignore
```

이러한 구조를 **멱등성 처리**라고 한다.

---

# 47. Kafka와 Outbox Pattern

이건 특히 금융·결제·주문 시스템에서 중요하다.

예를 들어:

```
DB 저장
↓
Kafka 전송
```

을 한다고 하자.

문제는:

```
DB 저장 성공
Kafka 전송 실패
```

가 발생할 수 있다는 것이다.

그러면 DB와 Kafka 상태가 다르게 된다.

이를 해결하기 위해 **Transactional Outbox Pattern**을 많이 사용한다.

```
Business Table
+
Outbox Table

같은 DB Transaction
```

예:

```
BEGIN

INSERT order

INSERT outbox_event

COMMIT
```

그리고 별도의 Worker가:

```
Outbox
 ↓
Kafka
```

로 이벤트를 전송한다.

이전에 질문했던 Outbox 패턴이 Kafka와 굉장히 자주 함께 등장하는 이유가 바로 이것이다.

---

# 48. 실무 예제: 대출 신청 시스템

금융 시스템 예제로 보면 훨씬 이해하기 쉽다.

대출 신청이 들어온다.

```
플랫폼
 ↓
대출 서비스
 ↓
DB
```

대출 서비스가 Kafka에:

```
{
  "eventType": "LOAN_APPLICATION_CREATED",
  "applicationId": "A10001",
  "customerId": "C5001"
}
```

이벤트를 전달한다.

```
Loan Service
     ↓
Kafka
```

그러면:

```
심사 시스템
알림 시스템
로그 시스템
분석 시스템
```

이 각각 읽을 수 있다.

```
                 ┌→ 심사
Loan Service → Kafka ─→ 알림
                 ├→ 감사 로그
                 └→ 분석
```

대출 서비스는 이 시스템들의 세부 구현을 알 필요가 없다.

---

# 49. Kafka를 사용하면 서비스 구조가 어떻게 바뀌는가

기존:

```
LoanService
   ↓
CreditService
   ↓
NotificationService
   ↓
AnalyticsService
```

Kafka 기반:

```
LoanService
     ↓
Kafka

CreditService ← Kafka
Notification ← Kafka
Analytics ← Kafka
```

이것이 **Loose Coupling**, 즉 느슨한 결합이다.

---

# 50. Kafka와 HTTP API는 경쟁 관계가 아니다

중요한 점이다.

Kafka를 사용한다고 REST API를 버리는 것이 아니다.

일반적으로 함께 사용한다.

예:

```
사용자
 ↓ HTTP
Order API
 ↓ DB
Kafka
 ↓
다른 서비스
```

즉:

```
외부 요청

HTTP / REST
```

```
내부 비동기 이벤트

Kafka
```

같은 방식으로 역할을 나누는 경우가 많다.

---

# 51. Kafka를 직관적으로 비유하면

Kafka를 **신문사**라고 생각하면 이해하기 쉽다.

Producer:

```
기자
```

Topic:

```
신문 섹션

경제
스포츠
정치
```

Kafka:

```
신문 보관소
```

Consumer:

```
독자
```

Consumer Group:

```
독자 집단
```

Offset:

```
내가 어디까지 읽었는지 표시한 책갈피
```

Partition:

```
신문 섹션을 여러 권으로 나눈 것
```

Kafka의 핵심은:

> 신문을 누가 읽었다고 해서 신문이 사라지지 않는다는 것이다.

다른 사람도 읽을 수 있다.

---

# 52. Kafka 구조를 한 번에 정리하면

```
                   Kafka Cluster

Producer
   │
   │ produce
   ▼

Topic: orders

Partition 0
Offset 0 1 2 3 4
       ↓ ↓ ↓ ↓ ↓
       A B C D E

Partition 1
Offset 0 1 2 3
       ↓ ↓ ↓ ↓
       F G H I

Partition 2
Offset 0 1 2
       ↓ ↓ ↓
       J K L

       │
       │ consume
       ▼

Consumer Group

Consumer 1 → Partition 0
Consumer 2 → Partition 1
Consumer 3 → Partition 2
```

그리고 Broker 레벨에서는:

```
Kafka Cluster

Broker 1
 ├ P0 Leader
 └ P2 Replica

Broker 2
 ├ P1 Leader
 └ P0 Replica

Broker 3
 ├ P2 Leader
 └ P1 Replica
```

같은 형태가 된다.

---

# 53. Kafka를 공부할 때 반드시 알아야 할 용어

처음에는 아래 정도를 확실하게 이해하면 된다.

| 개념           | 의미                             |
| -------------- | -------------------------------- |
| Producer       | Kafka에 메시지를 보내는 프로그램 |
| Consumer       | Kafka 메시지를 읽는 프로그램     |
| Topic          | 메시지 종류                      |
| Partition      | Topic을 나눈 단위                |
| Broker         | Kafka 서버                       |
| Cluster        | Broker 집합                      |
| Offset         | 메시지 위치                      |
| Consumer Group | Consumer 묶음                    |
| Replication    | 데이터 복제                      |
| Leader         | Partition의 주 서버              |
| Follower       | Partition 복제본                 |
| Retention      | 데이터 보관 기간                 |
| Rebalancing    | Partition-Consumer 재할당        |

이 정도가 Kafka의 핵심 뼈대다.

---

# 54. Kafka의 본질을 가장 간단하게 정리하면

Kafka는 단순히

```
메시지를 전달하는 시스템
```

이 아니다.

조금 더 정확하게는:

```
이벤트를

1. 빠르게 받고
2. 순서대로 기록하고
3. 여러 서버에 분산 저장하고
4. 복제해서 장애를 대비하고
5. 여러 소비자가 독립적으로 읽고
6. 필요하면 과거부터 다시 읽을 수 있게 하는

분산 이벤트 로그 시스템
```

이다.

그래서 Kafka를 이해할 때 가장 좋은 사고방식은:

```
Message Queue
```

보다는

```
Distributed Event Log
```

에 가깝다.
