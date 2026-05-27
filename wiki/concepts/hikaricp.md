---
type: concept
tags: [database, jdbc, spring, performance, library]
updated: 2026-05-27
sources: ["wiki/log.md#2026-05-27-hikaricp-query"]
---

# HikariCP

## 한 줄 정의

**JDBC [[connection-pool]]의 한 구현체.** 현재 가장 빠른 풀로 알려져 있고,
**Spring Boot 2.x 이후의 기본 DataSource**다.

## 이름의 유래

"Hikari(光)" = 일본어로 "빛". 빠르다는 의미를 담은 이름. 일본 개발자 Brett Wooldridge가
만들어 BSD 라이선스로 공개. 한국 SI/스타트업·글로벌 백엔드 모두 사실상 기본값.

## 왜 빠른가 — 다른 풀(C3P0, DBCP)과의 차이

| 최적화 | 내용 |
| --- | --- |
| **FastList** | Java `ArrayList` 대신 자체 List — `remove(Object)`가 뒤에서부터 스캔 (마지막에 빌린 게 가장 먼저 반납되는 패턴 가정) |
| **ConcurrentBag** | 자체 동시성 컬렉션 — 락 경합 최소화, ThreadLocal로 자기 빌린 Connection 우선 재획득 |
| **Bytecode 최적화** | JIT 친화적 짧은 메서드, 인라인 가능한 구조 |
| **불필요한 코드 제거** | C3P0가 100KB+인 데 비해 HikariCP는 ~140KB지만 hot path가 짧음 |

→ 결과: 벤치마크상 다른 풀 대비 **수 배 빠른 처리량**, **더 낮은 지연**. 자세한
비교는 공식 [HikariCP Wiki - Down the Rabbit Hole](https://github.com/brettwooldridge/HikariCP)
참조.

## Spring Boot에서의 위치 — "자동으로 깔리는 그것"

[[spring-boot]]의 자동 설정 원리 그대로 ([[spring-boot]] 참조):

1. `spring-boot-starter-jdbc` / `spring-boot-starter-data-jpa` /
   `mybatis-spring-boot-starter` 중 하나라도 의존성에 들어가면
2. 그 starter가 **`HikariCP`를 transitive dependency로 끌어옴**
3. Spring Boot Auto-config가 classpath의 HikariCP를 감지
4. `application.properties`의 `spring.datasource.*`만 보고
   **`HikariDataSource` Bean을 자동 등록**

→ 영균이 [[mybatis-practice-debugging]] 실습 시작 시 로그에 뜨던
`HikariPool-1 - Starting...` / `HikariPool-1 - Start completed.`이 바로 이 자동 등록의
결과. 영균이 명시적으로 의존성을 추가한 적 없는데도 깔려 있었던 이유.

## application.properties 설정

```properties
# DataSource 기본 (JDBC 4종)
spring.datasource.url=jdbc:mysql://localhost:3306/jwbook
spring.datasource.username=root
spring.datasource.password=1234
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Hikari 전용 튜닝 (전부 선택사항, 기본값으로 보통 충분)
spring.datasource.hikari.maximum-pool-size=10           # 최대 풀 크기 (기본 10)
spring.datasource.hikari.minimum-idle=10                # 최소 유휴 (기본 = max와 동일)
spring.datasource.hikari.connection-timeout=30000       # 빌리기 대기 (ms, 기본 30초)
spring.datasource.hikari.idle-timeout=600000            # 유휴 폐기 (ms, 기본 10분)
spring.datasource.hikari.max-lifetime=1800000           # 최대 수명 (ms, 기본 30분)
spring.datasource.hikari.leak-detection-threshold=60000 # 누수 경고 (ms, 기본 0=off)
```

→ 영균이 지금 쓰는 [[mybatis]] 설정에 `spring.datasource.*` 4줄만 적었던 그 자리에,
사실 위의 `hikari.*` 설정이 잠재적으로 다 노출되어 있다.

## `leakDetectionThreshold` — 영균이 알면 좋은 디버깅 기능

```properties
spring.datasource.hikari.leak-detection-threshold=60000   # 60초
```

켜두면, Connection을 빌린 지 60초가 지났는데도 반납이 안 된 경우 **스택 트레이스와 함께
경고 로그**가 뜬다.

```
Connection leak detection triggered for ...
        at com.example.MyService.brokenMethod(MyService.java:42)
```

→ "누가 close를 빠뜨렸는가"를 정확히 짚어준다. [[connection-pool]]에서 다룬
"가장 위험한 패턴 — 예외로 인한 누수"를 잡는 도구. 프로덕션에선 보통 켜둔다.

## 영균이 의식 못 한 채 이미 쓰고 있었다

- [[mybatis]] 실습 ([[mybatis-practice-debugging]]) 시점에 Spring Boot가 HikariCP를
  자동 등록 → 영균이 짠 `userMapper.findAll()` 호출 뒤에서 HikariCP가 풀에서 Connection을
  꺼내 줬다.
- 영균이 `close()` 코드를 안 짠 이유 = **MyBatis의 `SqlSession`이 close 호출 + HikariCP
  Proxy가 그것을 반납으로 변환** (책임 분리는 [[connection-pool]] 참조).
- 즉 영균은 이미 HikariCP를 **사용자**로서 써왔다. 이 페이지는 그것을 **인식**으로 끌어
  올리는 단계.

## 영균 학습 트리에서

- [[jdbc]] → [[connection-pool]] → **HikariCP** → [[spring-boot]] 자동 설정 → [[mybatis]]
  실습으로 이어지는 사슬의 한 매듭.
- 이 페이지를 알고 나면 Spring Boot 로그의 `HikariPool-1` 라인이 의미를 갖기 시작한다.
- 다음 가지: 트래픽이 늘어 [[scaling-a-web-app]] 단계에 들어가면 **풀 크기 튜닝**이 실제
  성능 이슈로 등장한다. 그때 이 페이지로 돌아오게 된다.

## 관련 페이지

- [[connection-pool]] — HikariCP가 구현하는 일반 개념, 누수의 두 얼굴
- [[jdbc]] — HikariCP가 재사용하는 그 Connection을 만드는 표준 API
- [[spring-boot]] — `HikariDataSource`를 자동 Bean으로 등록하는 주체
- [[mybatis]] — `spring.datasource.*` 설정으로 HikariCP를 받아 쓰는 사례
- 출처: [[mybatis-practice-debugging]] (의식 못 한 채 HikariCP 사용)
