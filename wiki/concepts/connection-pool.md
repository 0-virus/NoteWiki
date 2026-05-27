---
type: concept
tags: [database, jdbc, performance, infrastructure]
updated: 2026-05-27
sources: ["wiki/log.md#2026-05-27-hikaricp-query"]
---

# Connection Pool (커넥션 풀)

## 한 줄 정의

**DB Connection을 미리 N개 만들어 두고, 요청이 오면 빌려주고, 끝나면 돌려받는 자원 캐시.**
[[jdbc]]의 가장 비싼 비용(Connection 생성)을 재사용으로 회피하는 장치.

## 왜 필요한가 — Connection 하나의 진짜 비용

`DriverManager.getConnection(...)` 한 줄 뒤에서 실제로 일어나는 일:

```
1. TCP 3-way handshake          (네트워크 왕복)
2. TLS 핸드셰이크 (있다면)       (추가 왕복 + 암호 협상)
3. DB 인증 (username/password)   (서버 측 권한 조회)
4. 세션 변수 초기화·문자셋 협상  (Charset, timezone, autocommit)
```

→ 합쳐서 보통 **수십~수백 ms**. 한 페이지 요청마다 이걸 새로 하면 앱이 못 버틴다.

> 영균이 [[jdbc]] 단원에서 짠 코드는 학습용이라 이 비용이 안 보였다. 실무 트래픽 환경
> (초당 수백 요청)에 그대로 올리면 **DB 서버가 인증 처리로만 마비**된다.

## 풀의 동작 원리

```
[ 앱 코드 ]
   │ dataSource.getConnection()   ── ① 풀에서 "빌림"
   ▼
┌──────────────── Pool ────────────────┐
│  [Conn1] [Conn2] [Conn3] ... [ConnN] │  ← 미리 만들어둔 물리 Connection
└──────────────────────────────────────┘
   ▲
   │ conn.close()                  ── ② "닫는 게 아니라 반납"
[ 앱 코드 ]
```

핵심 트릭: 풀이 빌려주는 건 **물리 Connection을 감싼 Proxy 래퍼**다. 사용자 코드가
`conn.close()`를 부르면, 래퍼가 그것을 가로채서 **풀에 반환**한다. 물리 Connection은
계속 살아 있다.

## 핵심 설정값

| 설정 | 의미 | 트레이드오프 |
| --- | --- | --- |
| `maximumPoolSize` | 풀이 보유할 최대 Connection 수 | 너무 크면 DB 과부하, 작으면 대기 |
| `minimumIdle` | 평소 유지할 최소 유휴 Connection | 트래픽 급증 대비 vs 메모리 |
| `connectionTimeout` | 빌리려고 기다리는 최대 시간 | 짧으면 빠른 실패, 길면 사용자 대기 |
| `idleTimeout` | 유휴 Connection 폐기까지 시간 | DB의 wait_timeout보다 짧아야 안전 |
| `maxLifetime` | Connection 1개의 최대 수명 | DB 재시작·네트워크 단절 회복용 |

> 흔한 오해: "풀 크기는 크면 클수록 좋다" — 틀렸다. DB는 동시 연결당 메모리·CPU를
> 쓴다. 보통 **CPU 코어 수 × 2 + 디스크 스핀들 수** 정도가 출발점이라는 가이드가 있다
> (HikariCP 공식 문서의 권장). 100, 200으로 잡으면 오히려 느려진다.

## 누수의 두 얼굴 — 풀을 써도 누수는 사라지지 않는다

**"`close()` 안 부르면 새는 거 아니냐"는 직관은 [[jdbc]]·풀 환경 모두에서 옳다.**
새는 자원의 종류만 다르다.

| 환경 | close() 안 부르면 | 한도 | 증상 |
| --- | --- | --- | --- |
| **JDBC 직접** | 물리 Connection이 안 닫힘 | DB 서버의 `max_connections` (MySQL 기본 151) | DB가 "Too many connections" 거부 |
| **풀 사용** | 풀에 반납이 안 됨 | `maximumPoolSize` (Hikari 기본 10) | `Connection is not available, request timed out` |

→ **풀이 오히려 더 빨리 터진다** (10 vs 151). 그래서 풀 환경의 누수는 디버깅 측면에선
조기 발견이 쉽다. 하지만 책임이 가벼워지진 않는다.

### 가장 위험한 패턴 — 예외로 인한 누수

```java
Connection conn = dataSource.getConnection();   // 빌림
someService.doStuff(conn);                      // 예외!
conn.close();                                   // 도달 못 함 → 영영 안 돌아옴
```

→ 해법: **`try-with-resources`** 가 사실상 강제다.

```java
try (Connection conn = dataSource.getConnection()) {
    // ... 예외가 나도 JDK가 finally에서 close() 호출 보장
}
```

## CP의 책임 vs CP가 안 하는 일

영균이 한 번 헷갈렸다가 정리한 핵심:

| 영역 | 풀의 책임 | 풀이 안 하는 것 |
| --- | --- | --- |
| Connection **생성·재사용** | ✅ | |
| 동시 Connection **수 한도** | ✅ | |
| 죽은 Connection **검증·교체** | ✅ | |
| **누수 감지** (옵션) | ✅ `leakDetectionThreshold` | |
| `close()` **호출** | ❌ | 사용자 코드 / `try-with-resources` / `JdbcTemplate` / `@Transactional` |

→ **CP의 본질은 "재사용"** 이지 "관리 대행"이 아니다. close 호출 책임은 여전히 호출
코드(또는 그 위 추상화 계층)에 있다. 둘은 분리된 책임이다.

## 영균이 close 코드를 안 보는 진짜 이유

[[mybatis]] 실습에서 영균이 직접 `close()`를 짜지 않은 건 풀 덕이 아니다. 풀 **위에**
있는 계층이 대신 부르고 있다:

| 누가 close()를 부르나 | 어떻게 |
| --- | --- |
| `try-with-resources` | JDK 문법이 finally 자동 생성 |
| `JdbcTemplate` | Spring 라이브러리가 try-finally 내장 |
| MyBatis `SqlSession` | `@Transactional` 끝에서 자동 |

→ Spring·MyBatis의 자원 관리 추상화가 **close를 호출** → 풀의 Proxy가 그것을 **반납으로
변환** → 물리 Connection이 다음 요청에 재사용된다. 두 계층이 협력하는 그림.

## 영균 학습 트리에서

- [[jdbc]] 단원에서 손으로 `close()`를 짰던 그 행위가, 풀 환경에선 **다른 의미**가 된다는
  점을 짚는 페이지. JDBC를 먼저 손에 익혀야 풀의 가치가 보인다.
- [[mybatis]]·[[spring-boot]] 실습 ([[mybatis-practice-debugging]]) 당시 영균이 의식
  못 한 채 이미 [[hikaricp]]를 쓰고 있었다 — Spring Boot가 자동 등록.
- 다음 단계는 [[hikaricp]] 페이지에서 구현체 디테일로.

## 관련 페이지

- [[jdbc]] — 풀이 재사용하는 그 Connection을 만드는 표준 API
- [[hikaricp]] — 가장 널리 쓰이는 Connection Pool 구현체, Spring Boot 기본
- [[spring-boot]] — `spring.datasource.*` 설정만으로 풀을 자동 등록
- [[mybatis]] — DataSource로 풀을 받아 SqlSession을 띄움
- 출처: [[servlet-jdbc-debugging]] (영균의 JDBC close 디버깅), [[mybatis-practice-debugging]] (의식 못 한 채 풀 사용)
