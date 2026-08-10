# Outbox 패턴 상세 설명

## 1. Outbox 패턴이란?

Outbox 패턴은 **같은 애플리케이션에서 발생하는 DB 변경과 외부 메시지 전달 사이의 불일치를 줄이기 위한 설계 패턴**이다.

예를 들어 애플리케이션이 다음 두 작업을 수행해야 한다고 하자.

1. DB 레코드의 상태를 `ACTIVE`로 변경한다.
2. 다른 시스템에 `ResourceActivated` 이벤트를 전달한다.

이 두 작업은 서로 다른 자원에 쓰기를 수행한다.

```text
내부 DB
+
외부 메시지 브로커 또는 HTTP 서비스
```

일반적인 로컬 DB 트랜잭션은 외부 시스템의 처리까지 함께 커밋하거나 롤백하지 못한다. 이 때문에 **이중 쓰기 문제(Dual Write Problem)**가 발생한다.

---

## 2. Outbox가 없을 때의 이중 쓰기 문제

### DB를 먼저 변경하는 경우

```text
1. DB 상태 변경 성공
2. DB 커밋 성공
3. 외부 전송 실패
```

결과:

```text
내부 DB: 새 상태
외부 시스템: 이전 상태
```

### 외부 전송을 먼저 하는 경우

```text
1. 외부 전송 성공
2. 외부 시스템 처리 완료
3. 내부 DB 변경 실패
4. 내부 트랜잭션 롤백
```

결과:

```text
내부 DB: 이전 상태
외부 시스템: 새 상태
```

작업 순서만 바꾸는 것으로는 문제를 해결할 수 없다.

---

## 3. 핵심 아이디어

Outbox 패턴은 외부 전송을 데이터 변경 트랜잭션 안에서 직접 실행하지 않는다. 대신 같은 DB 트랜잭션에서 다음을 함께 저장한다.

1. 내부 데이터를 변경한다.
2. 외부로 전달할 메시지를 Outbox 테이블에 추가한다.

```sql
BEGIN;

UPDATE resources
SET status = 'ACTIVE'
WHERE resource_id = 100;

INSERT INTO outbox_message (
    message_id,
    aggregate_type,
    aggregate_id,
    event_type,
    payload,
    send_status,
    created_at
) VALUES (
    'msg-8dd55b6e',
    'RESOURCE',
    '100',
    'RESOURCE_ACTIVATED',
    '{"resourceId":"100","status":"ACTIVE"}',
    'PENDING',
    CURRENT_TIMESTAMP
);

COMMIT;
```

두 DB 작업은 함께 성공하거나 함께 실패한다.

그 후 별도의 Publisher 또는 Worker가 Outbox 메시지를 읽어 외부 시스템에 전달한다.

```text
데이터 변경 트랜잭션
├── 내부 데이터 변경
└── Outbox 메시지 저장
           ↓ COMMIT
Outbox Publisher
           ↓
외부 시스템 또는 메시지 브로커
```

---

## 4. 전체 처리 흐름

### 1단계: 상태 변경 이벤트 발생

애플리케이션의 내부 상태가 바뀐다.

```text
CREATED → CONFIRMED
```

### 2단계: 동일 트랜잭션으로 저장

내부 데이터 변경과 Outbox 메시지 생성을 한 트랜잭션으로 처리한다.

### 3단계: 트랜잭션 커밋

내부 데이터 변경이 존재한다면 그 변경을 알리는 메시지도 DB에 남는다.

### 4단계: 메시지 조회와 선점

Publisher가 전송 가능한 메시지를 조회하고, 여러 Worker가 같은 메시지를 처리하지 않도록 선점한다.

### 5단계: 외부 전달

메시지 브로커, 네트워크 엔드포인트 또는 다른 통신 수단으로 메시지를 전달한다.

### 6단계: 성공 또는 실패 기록

- 성공: `SENT`
- 일시적 실패: `RETRY`
- 자동 재시도 한도 초과 또는 영구 오류: `FAILED`

---

## 5. Outbox 테이블 예시

```sql
CREATE TABLE outbox_message (
    outbox_id BIGINT PRIMARY KEY,
    message_id VARCHAR(100) NOT NULL UNIQUE,
    aggregate_type VARCHAR(50) NOT NULL,
    aggregate_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    schema_version INT NOT NULL,
    payload TEXT NOT NULL,
    send_status VARCHAR(20) NOT NULL,
    retry_count INT NOT NULL DEFAULT 0,
    next_retry_at TIMESTAMP,
    processing_owner VARCHAR(100),
    processing_started_at TIMESTAMP,
    last_error TEXT,
    created_at TIMESTAMP NOT NULL,
    sent_at TIMESTAMP
);
```

| 필드 | 의미 |
|---|---|
| `outbox_id` | Outbox 내부 식별자 |
| `message_id` | 중복을 구분하는 전역 고유 메시지 ID |
| `aggregate_type` | 이벤트가 속한 객체 유형 |
| `aggregate_id` | 같은 객체의 이벤트를 묶는 식별자 |
| `event_type` | 발생한 이벤트의 종류 |
| `schema_version` | Payload 스키마 버전 |
| `payload` | 외부에 전달할 데이터 |
| `send_status` | 전송 처리 상태 |
| `retry_count` | 재시도 횟수 |
| `next_retry_at` | 다음 재시도 가능 시각 |
| `processing_owner` | 메시지를 선점한 Worker |
| `processing_started_at` | 처리 시작 시각 |
| `last_error` | 마지막 오류 정보 |
| `created_at` | 메시지 생성 시각 |
| `sent_at` | 전송 성공 시각 |

시스템 요구사항에 따라 컬럼은 단순화하거나 확장할 수 있다.

---

## 6. 메시지 상태 머신

Outbox 메시지도 상태 머신으로 관리할 수 있다.

```text
PENDING
   ↓ 선점
PROCESSING
   ├── 성공 ─────→ SENT
   ├── 일시 오류 → RETRY
   └── 영구 오류 → FAILED

RETRY
   ↓ 재선점
PROCESSING
```

| 상태 | 의미 |
|---|---|
| `PENDING` | 아직 전송되지 않은 새 메시지 |
| `PROCESSING` | 특정 Worker가 처리 중 |
| `RETRY` | 일시적 실패 후 재시도 예정 |
| `SENT` | 외부 전달이 성공했다고 확인됨 |
| `FAILED` | 자동 처리가 중단되어 확인이 필요함 |

`FAILED`는 반드시 메시지가 영원히 폐기됐다는 뜻일 필요는 없다. 보통 자동 재시도를 중단하고 운영자나 별도 복구 절차를 기다리는 상태다.

---

## 7. Outbox가 보장하는 것과 보장하지 않는 것

### 보장하려는 것

```text
내부 데이터 변경이 커밋됐다면
그에 대응하는 전송 대상 메시지도 DB에 존재한다.
```

이로 인해 다음이 가능해진다.

- 전송 대상 유실 방지
- 실패 메시지 식별
- 재전송
- 처리 이력 추적
- 서버 재시작 후 복구

### 직접 보장하지 않는 것

Outbox만으로는 다음을 보장하지 않는다.

- 외부 시스템이 즉시 처리한다.
- 두 시스템이 항상 같은 상태를 가진다.
- 메시지가 정확히 한 번만 전달된다.
- 외부 시스템이 올바르게 처리했다.
- 영구 오류가 자동으로 해결된다.

따라서 Outbox는 외부 시스템과의 불일치를 완전히 제거하기보다 **식별하고 복구할 수 있는 불일치로 바꾸는 패턴**이라고 보는 것이 정확하다.

---

## 8. 최종 일관성

Outbox 기반 구조에서는 내부 DB 변경과 외부 반영 사이에 시간 차이가 생긴다.

```text
10:00:00 내부 DB 변경과 Outbox 생성
10:00:05 첫 전송 실패
10:00:15 두 번째 전송 성공
10:00:15 외부 시스템 반영
```

10시부터 10시 15초까지는 두 시스템의 상태가 다르지만, 재시도가 성공하면 최종적으로 일치한다. 이를 **최종 일관성(Eventual Consistency)**이라고 한다.

영구적인 데이터 오류나 계약 불일치가 있다면 자동으로 일치하지 않는다. 원인을 수정하고 재처리하거나 별도 보정이 필요하다.

---

## 9. 최소 한 번 전달과 중복

Outbox Publisher는 일반적으로 **최소 한 번 전달(At-Least-Once Delivery)**을 목표로 한다.

다음 상황을 생각해 보자.

```text
1. Publisher가 메시지 전송
2. 외부 시스템이 처리 성공
3. 성공 응답이 네트워크에서 유실
4. Publisher는 실패로 판단
5. 같은 메시지를 재전송
```

외부 시스템은 같은 메시지를 두 번 받을 수 있다. Publisher가 외부 처리 성공과 Outbox의 `SENT` 변경을 하나의 원자적 트랜잭션으로 묶을 수 없기 때문이다.

Outbox는 보통 메시지 누락 가능성을 낮추는 대신 중복 가능성을 허용한다.

---

## 10. 멱등성

중복 전달에 안전하려면 소비자가 같은 메시지를 여러 번 받아도 결과가 한 번 처리한 것과 같아야 한다. 이를 **멱등성(Idempotency)**이라고 한다.

메시지에는 고유한 `messageId`를 포함한다.

```json
{
  "messageId": "msg-8dd55b6e",
  "eventType": "RESOURCE_ACTIVATED",
  "resourceId": "100",
  "occurredAt": "2026-07-28T10:00:00Z"
}
```

소비자는 처리된 `messageId`를 기록한다.

```text
처음 받은 messageId
→ 상태 변경 반영
→ 처리 완료 ID 저장
→ 성공 응답

이미 처리한 messageId
→ 중복 상태 변경 생략
→ 성공 응답
```

소비자가 DB를 사용한다면 상태 변경과 처리 완료 ID 저장을 같은 트랜잭션으로 묶는 것이 중요하다.

```sql
BEGIN;

INSERT INTO processed_message (message_id, processed_at)
VALUES ('msg-8dd55b6e', CURRENT_TIMESTAMP);

UPDATE read_model
SET status = 'CONFIRMED'
WHERE object_id = '100';

COMMIT;
```

`message_id`에 고유 제약을 두면 동시 중복 처리도 방어할 수 있다.

---

## 11. Payload를 저장하는 이유

Outbox에 객체 ID와 이벤트 종류만 저장하고, 전송 시 원본 테이블을 다시 읽을 수도 있다. 그러나 원본 데이터는 메시지를 보내기 전에 바뀔 수 있다.

```text
10:00 상태 A 이벤트 발생
10:01 상태 B로 변경
10:02 Publisher 실행
```

10시 2분에 현재 값만 읽으면 10시에 발생한 이벤트의 데이터를 정확히 재구성하지 못할 수 있다.

따라서 Outbox에는 보통 **이벤트 발생 당시의 전송 스냅샷**을 저장한다.

```json
{
  "messageId": "msg-8dd55b6e",
  "eventType": "ITEM_UPDATED",
  "itemId": "42",
  "newValue": "A",
  "occurredAt": "2026-07-28T10:00:00Z"
}
```

장점:

- 발생 당시 데이터를 보존한다.
- 재전송할 때 같은 내용을 사용할 수 있다.
- 원본 데이터의 후속 변경에 영향을 받지 않는다.

주의점:

- 데이터가 중복 저장된다.
- Payload 스키마 버전 관리가 필요하다.
- 민감 정보가 있다면 최소화, 암호화, 접근 통제가 필요하다.
- 보관 기간과 삭제 정책이 필요하다.

---

## 12. Polling Publisher

가장 단순한 방식은 Publisher가 Outbox 테이블을 주기적으로 조회하는 것이다.

```text
Outbox 테이블
    ↓ 주기적 조회
Publisher
    ↓
외부 시스템
```

조회 예시:

```sql
SELECT *
FROM outbox_message
WHERE send_status IN ('PENDING', 'RETRY')
  AND (
      next_retry_at IS NULL
      OR next_retry_at <= CURRENT_TIMESTAMP
  )
ORDER BY created_at
FETCH FIRST 100 ROWS ONLY;
```

장점:

- 구조가 단순하다.
- 별도 스트리밍 인프라가 없어도 된다.
- 처리 상태와 재시도를 DB에서 관리하기 쉽다.

단점:

- 조회 주기만큼 지연될 수 있다.
- 빈 조회가 반복될 수 있다.
- 동시 Worker의 선점과 잠금 처리가 필요하다.
- Outbox 테이블이 커지면 인덱스와 정리 정책이 중요하다.

---

## 13. 여러 Worker의 동시 처리

여러 Publisher가 같은 `PENDING` 메시지를 동시에 읽으면 중복 전송이 늘어날 수 있다. 이를 줄이기 위해 메시지를 선점한다.

### 조건부 UPDATE

```sql
UPDATE outbox_message
SET send_status = 'PROCESSING',
    processing_owner = 'worker-a',
    processing_started_at = CURRENT_TIMESTAMP
WHERE outbox_id = 100
  AND send_status IN ('PENDING', 'RETRY');
```

수정된 행 수가 1이면 현재 Worker가 선점에 성공한 것이다. 0이면 다른 Worker가 먼저 처리권을 얻은 것이다.

### `FOR UPDATE SKIP LOCKED`

DB가 지원하면 잠긴 행을 건너뛰며 병렬로 선점할 수 있다.

```sql
SELECT *
FROM outbox_message
WHERE send_status IN ('PENDING', 'RETRY')
ORDER BY created_at
FOR UPDATE SKIP LOCKED;
```

선점은 중복 가능성을 줄이지만 완전히 제거하지는 못한다. 외부 전송 성공 직후 Publisher가 중단될 수 있기 때문에 최종 방어선은 여전히 소비자의 멱등성이다.

---

## 14. `PROCESSING` 상태의 복구

Worker가 메시지를 선점한 뒤 중단되면 메시지가 `PROCESSING`에 영원히 남을 수 있다.

```text
PENDING
→ PROCESSING
→ Worker 종료
→ 상태 갱신 없음
```

이를 막기 위해 처리 임대 시간 또는 타임아웃을 둔다.

```sql
UPDATE outbox_message
SET send_status = 'RETRY',
    processing_owner = NULL,
    processing_started_at = NULL
WHERE send_status = 'PROCESSING'
  AND processing_started_at
      < CURRENT_TIMESTAMP - INTERVAL '10' MINUTE;
```

단, 오래 걸리는 정상 작업을 섣불리 재선점하면 중복 처리가 증가한다. 처리 제한 시간은 실제 작업 시간과 외부 호출 제한 시간을 고려해 정해야 한다.

---

## 15. 재시도 정책

모든 오류를 같은 방식으로 재시도해서는 안 된다.

### 일반적으로 재시도할 수 있는 오류

- 연결 실패
- 연결 또는 읽기 시간 초과
- 일시적인 5xx 오류
- 일시적 자원 부족
- 호출 제한 응답

### 자동 재시도가 무의미할 수 있는 오류

- 필수 필드 누락
- 지원되지 않는 값
- Payload 형식 오류
- 인증 정보 자체의 오류
- 더 이상 존재하지 않는 대상

일시적 오류와 영구 오류를 구분하지 않으면 잘못된 메시지를 계속 전송하는 무한 재시도가 발생할 수 있다.

---

## 16. 지수 백오프와 지터

장애 중 같은 간격으로 많은 메시지를 재전송하면 상대 시스템에 부하가 집중될 수 있다. 재시도 간격을 점차 늘리는 방식을 **지수 백오프(Exponential Backoff)**라고 한다.

```text
1차 실패 → 1초 후
2차 실패 → 2초 후
3차 실패 → 4초 후
4차 실패 → 8초 후
```

여러 Worker가 정확히 같은 시점에 재시도하는 것을 피하기 위해 임의의 작은 지연인 **지터(Jitter)**를 추가할 수 있다.

```text
계산된 지연 8초
+ 임의 지연 0~3초
```

재시도에는 보통 다음 제한도 필요하다.

- 최대 재시도 횟수
- 최대 총 경과 시간
- 메시지별 만료 시각
- 외부 호출 제한 시간

---

## 17. 최대 재시도 초과와 실패 처리

자동 재시도 한도를 초과한 메시지는 `FAILED`로 분리할 수 있다.

```text
PENDING
  ↓ 실패
RETRY
  ↓ 최대 횟수 초과
FAILED
```

`FAILED` 메시지에는 다음 운영 절차가 필요하다.

- 알림
- 오류 원인 확인
- Payload 또는 코드 수정
- 수동 재처리
- 별도 격리 영역으로 이동
- 필요할 경우 데이터 보정

메시지 브로커의 Dead Letter Queue와 비슷한 역할을 DB 상태나 별도 테이블로 구현할 수 있다.

---

## 18. 메시지 순서 보장

같은 객체에서 발생한 이벤트의 순서가 중요할 수 있다.

```text
이벤트 1: CREATED
이벤트 2: CONFIRMED
이벤트 3: COMPLETED
```

이벤트 2의 전송이 실패한 사이 이벤트 3이 먼저 성공하면 소비자는 순서를 다르게 관찰한다.

순서가 반드시 필요하다면 다음 방법을 고려할 수 있다.

- 객체별 순번을 저장한다.
- 같은 `aggregate_id`는 한 번에 하나만 처리한다.
- 이전 순번이 성공한 메시지만 선택한다.
- 메시지 브로커에서 같은 객체를 같은 파티션으로 보낸다.
- 소비자가 버전 번호를 검사한다.

예:

```json
{
  "aggregateId": "100",
  "sequence": 3,
  "eventType": "COMPLETED"
}
```

전체 시스템에 대한 전역 순서는 구현 비용이 매우 크다. 보통은 같은 객체나 파티션 내부에서 필요한 수준만 보장한다.

---

## 19. CDC 기반 Outbox

Polling 대신 **CDC(Change Data Capture)** 도구가 DB 변경 로그에서 Outbox INSERT를 감지해 메시지 브로커로 전달할 수 있다.

```text
Outbox INSERT
    ↓
DB 변경 로그
    ↓
CDC 도구
    ↓
메시지 브로커
    ↓
Consumer
```

장점:

- 짧은 전달 지연
- 반복 조회 부하 감소
- 대규모 이벤트 스트림과 연계하기 좋음

단점:

- 추가 인프라가 필요함
- 운영과 장애 분석이 복잡해짐
- 스키마 변경과 커넥터 관리가 필요함
- 브로커 이후에도 중복과 멱등성을 다뤄야 함

Polling과 CDC 중 어느 방식이 더 좋은지는 처리량, 지연 요구, 운영 역량, 기존 인프라에 따라 달라진다.

---

## 20. Outbox 레코드 생성 예시

```java
@Transactional
public void activateResource(Long resourceId) {
    Resource resource = resourceRepository.findById(resourceId)
            .orElseThrow();

    resource.activate();

    ResourceActivated event =
            new ResourceActivated(
                    resource.getId(),
                    resource.getActivatedAt()
            );

    OutboxMessage message =
            OutboxMessage.pending(
                    UUID.randomUUID().toString(),
                    "RESOURCE",
                    resource.getId().toString(),
                    "RESOURCE_ACTIVATED",
                    1,
                    serialize(event)
            );

    outboxRepository.save(message);
}
```

핵심은 내부 객체 변경과 Outbox 저장이 **같은 DB와 같은 트랜잭션**에 참여한다는 점이다.

---

## 21. Publisher 의사 코드

```java
public void publishAvailableMessages() {
    List<OutboxMessage> messages =
            outboxRepository.findAvailableBatch(100);

    for (OutboxMessage message : messages) {
        if (!outboxRepository.tryAcquire(message.getId())) {
            continue;
        }

        try {
            externalClient.send(
                    message.getMessageId(),
                    message.getEventType(),
                    message.getPayload()
            );

            outboxRepository.markSent(
                    message.getId(),
                    Instant.now()
            );
        } catch (TemporaryException e) {
            outboxRepository.markRetry(
                    message.getId(),
                    calculateNextRetry(message),
                    safeErrorMessage(e)
            );
        } catch (PermanentException e) {
            outboxRepository.markFailed(
                    message.getId(),
                    safeErrorMessage(e)
            );
        }
    }
}
```

실제 구현에서는 외부 호출을 긴 DB 트랜잭션 안에서 수행하지 않도록 주의한다. DB 락을 잡은 채 네트워크 응답을 기다리면 잠금 시간이 길어지고 처리량이 떨어질 수 있다.

---

## 22. 정리와 보관 정책

`SENT` 레코드를 영원히 보관하면 Outbox 테이블이 계속 커진다. 다음 정책이 필요하다.

- 성공 메시지의 온라인 보관 기간
- 장기 보관소로의 이동 여부
- 감사 또는 분석 목적의 보존 기간
- 배치 삭제 단위
- 삭제 중 DB 부하 관리
- 관련 인덱스 정리

대량 삭제는 락과 로그 부하를 만들 수 있으므로 작은 단위로 나누거나 파티셔닝을 사용할 수 있다.

자주 사용하는 조회 조건에는 적절한 인덱스가 필요하다.

```sql
CREATE INDEX ix_outbox_publishable
ON outbox_message (
    send_status,
    next_retry_at,
    created_at
);
```

---

## 23. 관측성과 운영

Outbox는 저장 구조뿐 아니라 운영 체계까지 갖춰야 효과가 있다.

확인할 만한 지표:

- `PENDING`, `RETRY`, `FAILED` 메시지 수
- 가장 오래된 미전송 메시지의 나이
- 단위 시간당 생성·성공·실패 건수
- 평균 및 상위 백분위 전송 지연
- 오류 유형별 발생 건수
- 재시도 횟수 분포
- `PROCESSING` 타임아웃 건수

알림 예시:

- 가장 오래된 메시지가 허용 지연을 초과함
- `FAILED` 메시지가 발생함
- 성공률이 일정 기준 아래로 떨어짐
- Outbox 테이블 크기가 임계값을 넘음

로그와 추적 정보에는 다음 값을 포함하는 것이 좋다.

- `message_id`
- `aggregate_id`
- `event_type`
- 재시도 횟수
- 외부 요청 추적 ID

---

## 24. 보안과 개인정보

Payload에 민감한 정보가 포함될 수 있다면 다음을 고려한다.

- 필요한 필드만 저장한다.
- DB 저장 시 암호화한다.
- 접근 권한을 제한한다.
- 로그에 Payload 전체를 출력하지 않는다.
- 보관 기간이 지나면 안전하게 삭제한다.
- 운영 화면에서 민감 값을 마스킹한다.
- 키 교체와 복호화 권한을 관리한다.

재현성을 위해 모든 데이터를 Outbox에 복제하는 것과 최소 정보 원칙 사이의 균형이 필요하다.

---

## 25. Outbox 패턴의 장점

- 내부 데이터와 전송 대상 생성 사이의 정합성을 보장한다.
- 외부 시스템 장애 중에도 메시지가 DB에 남는다.
- 재시도와 수동 재처리가 가능하다.
- 서버가 재시작돼도 미처리 작업을 복구할 수 있다.
- 전송 이력과 오류를 추적할 수 있다.
- 데이터 변경 트랜잭션에서 느린 외부 호출을 분리할 수 있다.

---

## 26. Outbox 패턴의 단점

- 추가 테이블과 Publisher가 필요하다.
- 최종 일관성을 받아들여야 한다.
- 중복 전달에 대비한 멱등성이 필요하다.
- 동시 Worker의 선점과 복구가 필요하다.
- 재시도와 실패 분류가 복잡해질 수 있다.
- 순서 보장이 필요한 경우 설계가 더 복잡해진다.
- 보관, 삭제, 인덱스, 모니터링 정책이 필요하다.
- Payload 스키마와 보안을 관리해야 한다.

---

## 27. 흔한 오해

### “Outbox를 쓰면 두 시스템은 항상 같은 상태다.”

아니다. 외부 반영 전까지 일시적인 불일치가 존재하며, 영구 오류가 나면 운영 조치 전까지 불일치가 계속될 수 있다.

### “Outbox를 쓰면 정확히 한 번만 전송된다.”

아니다. 보통 최소 한 번 전달을 구현하며 중복 가능성이 있다. 소비자 멱등성이 필요하다.

### “`SENT`이면 외부 처리가 반드시 완벽하다.”

Publisher가 받은 성공 응답이 통신 규약상 무엇을 뜻하는지에 따라 다르다. 단순 수신 확인인지, 상태 반영 완료인지 명확히 해야 한다.

### “Outbox 테이블만 만들면 끝난다.”

아니다. 재시도, 선점, 타임아웃 복구, 멱등성, 모니터링, 보관 정책까지 갖춰야 한다.

---

## 28. 설계 점검표

1. 내부 데이터와 Outbox가 같은 DB 트랜잭션에 참여하는가?
2. `message_id`가 고유하며 재전송에도 유지되는가?
3. 소비자는 중복 메시지를 안전하게 처리하는가?
4. 일시적 오류와 영구 오류를 구분하는가?
5. 백오프, 지터, 최대 재시도 정책이 있는가?
6. `PROCESSING` 상태에서 중단된 메시지를 복구하는가?
7. 여러 Worker가 메시지를 안전하게 선점하는가?
8. 같은 객체의 이벤트 순서가 필요한가?
9. Payload의 스키마 버전을 관리하는가?
10. 민감 정보 저장과 로그 정책이 적절한가?
11. 미전송 지연과 실패를 모니터링하는가?
12. 성공 메시지의 보관과 삭제 정책이 있는가?
13. 수동 재처리 절차가 있는가?
14. Publisher 장애와 재시작을 테스트했는가?
15. 외부 처리 성공 후 내부 상태 갱신 전에 중단되는 상황을 테스트했는가?

---

## 핵심 정리

Outbox 패턴의 핵심은 다음 문장으로 요약할 수 있다.

> 내부 데이터가 변경되는 순간, 외부로 전달해야 할 메시지도 같은 DB 트랜잭션으로 저장한다.

그 후 별도의 Publisher가 메시지를 전달하고 성공, 재시도, 실패 상태를 관리한다.

```text
내부 데이터 변경
+
Outbox 메시지 저장
        ↓ 같은 트랜잭션 커밋
Publisher가 전달
        ↓
성공 또는 재시도
```

Outbox는 두 시스템을 항상 즉시 일치시키는 기술이 아니다. 메시지 유실 가능성을 낮추고, 불일치를 **발견 가능하고 재처리 가능한 상태**로 만드는 패턴이다.

안전한 운영을 위해서는 다음 요소를 함께 설계해야 한다.

```text
Outbox
+ 재시도
+ 멱등성
+ 동시 처리 제어
+ 모니터링
+ 복구 절차
+ 보관 정책
```
