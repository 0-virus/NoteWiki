---
type: concept
tags: [spring, rabbitmq, amqp, messaging, backend]
updated: 2026-09-07
sources: ["raw/notes/Message Queue.md"]
---

# Spring AMQP (Spring + RabbitMQ)

## 한 줄 정의

**Spring에서 [[rabbitmq]]를 다루기 위한 추상화 모듈.**
`RabbitTemplate`(발행)과 `@RabbitListener`(구독) 두 축으로 구성된다.

의존성은 `spring-boot-starter-amqp` 하나다.

## 설계 원리 — Spring의 반복되는 패턴

Spring AMQP는 새로운 발상이 아니라, Spring이 계속 써 온 두 패턴의 재적용이다.

- **`XxxTemplate`** — 연결 획득·직렬화·예외 변환·연결 반납 같은 반복 작업을 대신 처리하는
  템플릿 (`JdbcTemplate`·`RestTemplate`과 같은 계보). 개발자는 "무엇을 보낼지"만 쓴다.
- **`@XxxListener`** — 메시지 수신 루프를 [[spring-boot|컨테이너]]가 돌리고, 메시지가 오면
  등록된 메서드를 호출한다. `@RabbitListener` 붙은 메서드는 **내가 부르는 코드가 아니라
  불려지는 코드**다 — [[inversion-of-control|제어의 역전]]이 그대로 적용된 지점.

## Producer — RabbitTemplate

```java
@Service
public class OrderProducer {

    private final RabbitTemplate rabbitTemplate;

    public OrderProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendOrderCreated(Long orderId) {
        // order.exchange로 보내고, routing key는 order.created를 사용한다.
        rabbitTemplate.convertAndSend(
                "order.exchange",   // exchange
                "order.created",    // routing key
                orderId             // payload
        );
    }
}
```

`convertAndSend`의 `convert`는 **자바 객체를 메시지 바이트로 [[serialization|직렬화]]**한다는
뜻이다. 기본 컨버터는 자바 직렬화라 언어 간 호환이 안 되므로, 실무에서는 보통
`Jackson2JsonMessageConverter`를 빈으로 등록해 JSON으로 바꾼다.

큐 이름이 아니라 **Exchange + Routing Key**를 넘긴다는 점에 주목 — [[amqp-exchange]]의
설계가 API에 그대로 드러난다.

## Consumer — @RabbitListener

```java
@Component
public class OrderConsumer {

    @RabbitListener(queues = "order.email.queue")
    public void consume(Long orderId) {
        // Queue에서 받은 주문 번호로 이메일 발송 처리
        System.out.println("주문 이메일 발송: " + orderId);
    }
}
```

메시지가 들어오면 Spring이 이 메서드를 호출한다. **메서드가 예외 없이 끝나면 자동으로 ACK,
예외를 던지면 NACK**로 처리된다 (기본 `AcknowledgeMode.AUTO`). 즉
[[message-delivery-semantics|ACK 시점]]이 "메서드 정상 종료"에 묶여 있다는 뜻이다.

여기서 실무 함정이 하나 나온다. **DB 저장이 끝난 뒤 메서드 마지막 줄에서 예외가 나면
메시지는 재전달되고 DB 작업은 두 번 수행된다.** 그래서 Consumer는 [[idempotency|멱등]]해야
한다 — `eventId`를 저장해 두고 이미 처리한 이벤트면 그냥 반환하는 식이다.

## 구조 선언 — Queue · Exchange · Binding

```java
@Configuration
public class RabbitConfig {

    @Bean
    public Queue orderQueue() {
        // 서버 재시작 이후에도 유지되는 Queue (durable = true)
        return new Queue("order.email.queue", true);
    }

    @Bean
    public DirectExchange orderExchange() {
        return new DirectExchange("order.exchange");
    }

    @Bean
    public Binding orderBinding(Queue orderQueue, DirectExchange orderExchange) {
        // order.created 라우팅 키를 order.email.queue와 연결
        return BindingBuilder.bind(orderQueue)
                             .to(orderExchange)
                             .with("order.created");
    }
}
```

만들어지는 구조:

```
order.exchange
      ↓ routing key = order.created
order.email.queue
```

Queue·Exchange·Binding을 **[[spring-bean|빈]]으로 등록해 두면 Spring이 기동 시 브로커에
자동 선언**한다(없으면 만들고, 있으면 통과). 인프라 구성이 코드로 남는다는 점에서
[[flyway]]가 DB 스키마를 코드로 관리하는 것과 같은 발상이다.

## 연결 설정

```yaml
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
```

## 전체 요청 흐름

```
HTTP 요청
   ↓
OrderController
   ↓
OrderService  → DB 저장
   ↓
RabbitTemplate
   ↓
RabbitMQ Exchange → Queue
   ↓
@RabbitListener → EmailService
```

사용자는 **주문 처리까지만 기다리고**, 메일 발송은 응답 이후 비동기로 진행된다.
이것이 메시지 큐를 도입하는 가장 즉각적인 효과다.
([[spring-mvc-request-flow]]의 동기 요청 처리가 어디서 끊기는지 비교해 보면 이해가 빠르다.)

> ⚠️ 위 흐름에는 함정이 있다. **DB 저장은 성공했는데 `convertAndSend`가 실패하면**
> 주문은 생겼지만 이메일 이벤트는 사라진다. `@Transactional` 안에서 발행해도 마찬가지다 —
> 브로커 전송은 DB 트랜잭션의 롤백 대상이 아니기 때문이다. 이 문제의 정석 해법이
> [[outbox-pattern]]이다.

## 관련 페이지

- [[rabbitmq]] — 브로커 자체의 구조와 안정성 장치
- [[amqp-exchange]] — Exchange·Binding·Routing Key
- [[rabbitmq-message-flow]] — 전체 메시지 흐름
- [[spring-boot]] · [[spring-bean]] · [[inversion-of-control]] — 템플릿·리스너가 딛고 선 기반
- [[outbox-pattern]] — DB 저장과 메시지 발행의 정합성
- [[idempotency]] — Consumer 재전달 대비
- 출처: [[message-queue-note]]
