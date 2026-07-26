---
source_type: "article"
title: "[DB] Flyway 란 무엇일까?"
url: "https://co-meow.tistory.com/entry/DB-Flyway-%EB%9E%80-%EB%AC%B4%EC%97%87%EC%9D%BC%EA%B9%8C"
author:
  - "코냥이"
site: "tistory.com"
published: 2024-01-01
clipped: 2026-07-26
description: "💡 Flyway 란? Flyway : 데이터베이스 형상 관리를 위한 오픈 소스 데이터베이스 마이그레이션 툴이다. * 형상 관리(Software Configuration Management) - 소프트웨어의 변경 사항을 체계적으로 추적하고 통제하는 것 * 데이터베이스 마이그레이션 툴 - 데이터베이스의 변경 사항을 추적하고 업데이트나 롤백을 쉽게할 수 있도록 하는 도구 소스 코드의 이력을 Git으로 관리하듯, 데이터베이스 이력을 Flyway로 관리한다고 생각하면 이해하기 쉽다 ! ✔️ 데이터베이스 형상 관리의 장점 데이터베이스 스키마(Schema) 변경 이력이 남는다. 데이터베이스에서 문제가 발생했을 때, 데이터베이스를 수정한 변경 이력이 남아있으면 문제의 원인을 파악할 수 있어서 문제 해결에 도움이 된다..."
tags:
  - "clippings/article"
---
**목차**

## 💡 Flyway 란?

---

> **Flyway**  
> : 데이터베이스 형상 관리를 위한 오픈 소스 **데이터베이스 마이그레이션 툴** 이다.  
>   
> \* 형상 관리(Software Configuration Management) - 소프트웨어의 변경 사항을 체계적으로 추적하고 통제하는 것  
> \* 데이터베이스 마이그레이션 툴 - 데이터베이스의 변경 사항을 추적하고 업데이트나 롤백을 쉽게할 수 있도록 하는 도구

소스 코드의 이력을 Git으로 관리하듯, 데이터베이스 이력을 Flyway로 관리한다고 생각하면 이해하기 쉽다!

### ✔️ 데이터베이스 형상 관리의 장점

1. **데이터베이스 스키마(Schema) 변경 이력이 남는다.**
	- 데이터베이스에서 문제가 발생했을 때, 데이터베이스를 수정한 변경 이력이 남아있으면 문제의 원인을 파악할 수 있어서 문제 해결에 도움이 된다.
2. **데이터베이스 변경 작업을 안전하게 할 수 있다.**
	- 코드를 통해 스키마를 변경함으로써 변경 중에 발생할 수 있는 작업자의 실수가 줄어들고, 배포 시에 스키마를 변경하는 자동화도 가능하다.

### ✔️ 데이터베이스 마이그레이션의 필요성

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FBm5yv%2FbtsCX4i2HyS%2FAAAAAAAAAAAAAAAAAAAAAJNkc236bW0TlhM-ZYWgsAslbie9Z3twtCGB6d_GH9pl%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1785509999%26allow_ip%3D%26allow_referer%3D%26signature%3D6OXIA%252Bira49dzWK%252FDTJrT5d5Aes%253D)

출처: Flyway 공식 사이트

프로젝트를 진행하면 위 그림처럼 **데이터베이스가 여러 환경(Ex. 로컬/테스트/운영 환경)에 존재** 하게 된다.

각자의 로컬 환경에서 개발을 하게 되면 엔티티의 구조가 변경되고, 이로 인해 데이터베이스 스키마도 변경되어야 한다.

예를 들어, JPA를 사용하는 환경에서 엔티티 구조가 변경되면 이 변경 사항을 다른 배포 환경에 적용해야 한다.

개발이나 테스트 단계에서는 Hibernate에서 제공하는 ddl-auto 설정을 통해 반영할 수 있겠지만, 실제 운영 환경에서는 불가능하다.

운영 환경에 적용하기 위해서는 ALTER TABLE 과 같은 DDL을 사용해야 한다.

```sql
ALTER TABLE student ADD COLUMN number VARCHAR(20) NOT NULL;
```

하지만, 위의 방법은 **실수가 발생하기 쉽고, 형상 관리가 어렵다** 는 문제점이 존재한다.

이러한 문제점을 해결하기 위해 데이터베이스 마이그레이션 툴인 Flyway를 사용하는 것이다.

## 💡 Flyway 동작 방식

---

1\. Flyway가 ******schema\_version****** 테이블(Flyway가 데이터베이스의 상태를 추적하는 테이블)을 찾고, 존재하지 않다면 **테이블을 생성** 한다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FcsbNG6%2FbtsCSzYDFGo%2FAAAAAAAAAAAAAAAAAAAAAFe-7GcDNmWsrWmuLuAWUYKP1mQvgWQ9qDfvW4o19A-w%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1785509999%26allow_ip%3D%26allow_referer%3D%26signature%3Dl%252FLOec9F%252F6AyfhTADCD99Sh1MVs%253D)

출처: Flyway 공식 사이트

2\. 마이그레이션을 위해 SQL이나 Java로 작성된 마이그레이션 스크립트를 찾아 **버전 순서대로 마이그레이션을 진행** 한다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2Fc65w01%2FbtsCP5X9NXf%2FAAAAAAAAAAAAAAAAAAAAAPWWI6vSWZw69HCGuGUseIugwLmB8YyRabXUttoGZ5dd%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1785509999%26allow_ip%3D%26allow_referer%3D%26signature%3DhI49k6o0SuJ6eZYIdiUrGzD4q98%253D)

출처: Flyway 공식 사이트

3\. 마이그레이션이 적용된 후, ***schema\_version*** 테이블이 업데이트 된다.

## 💡 Flyway 마이그레이션 파일명 규칙

---

> Flyway는 **마이그레이션 대상 파일명** 과 **경로** 로 파일을 구분하고 스캔한다.  
> \* 기본 경로: /resources/db/migration (설정으로 변경 가능)  
>   
> 
> \* Prefix: V(버전 마이그레이션), U(취소 마이그레이션), R(반복 마이그레이션)
> 
> \* Version: 버전 마이그레이션에만 사용되며, 숫자와 점, 언더바 조합으로 구성된다.
> 
> \* Separator: Description을 구분하기 위한 구분자로, 반드시 underscore를 2개 사용해야 한다. (\_\_)
> 
> \* Description: 해당 파일을 설명한다.
> 
> \* Suffix: 확장자로,.sql 이 기본 값이다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FcLoFd0%2FbtsCQqA8X0g%2FAAAAAAAAAAAAAAAAAAAAAGhQ8G_sJGOsv8DNeXvYdi6_2sdZuhWrYC2r8-98fBhd%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1785509999%26allow_ip%3D%26allow_referer%3D%26signature%3DeDcOfwBddF3HZ3qs%252FMeOJpWcCts%253D)

출처: Flyway 공식 사이트

#### ✔️ Versioned Migrations

> 마이그레이션 스크립트의 최신 버전과 현재 데이터베이스의 스키마 버전을 비교하면서 마이그레이션 스크립트를 순차적으로 실행한다. 최신 버전의 숫자보다 작은 숫자로 마이그레이션 스크립트를 추가하면, 해당 마이그레이션 스크립트는 무시된다.  
>   
> 즉, 마이그레이션 스크립트를 추가할 때, 항상 최신 버전보다 큰 숫자로 버전을 설정해야 한다.

#### ✔️ Undo Migrations

> Flyway의 유료 버전에서만 사용이 가능하며, 상황에 따라 Undo Migrations 기능의 사용이 위험할 수 있기 때문에 주의해서 사용해야 한다.

#### ✔️ Repeatable Migrations

> 모든 마이그레이션 스크립트가 실행된 이후에 실행되는 스크립트로, Repeatable Migrations 끼리는 description 순서대로 실행된다. 한 번 실행이 되고, 이후에 스크립트가 변경되어 체크섬이 변경되면 실행된다.

## 💡 Flyway 예제

---

본 포스팅에서는 SpringBoot, Docker, MySQL을 사용한 예제를 작성한다.

### 1\. Flyway 실습 환경 구축 (Docker 사용)

**1.1 *docker-compose.yml* 파일 생성**

```shell
version: '3.6'
services:
  mysql:
    container_name: flyway-mysql
    image: mysql:8.0
    platform: linux/amd64
    volumes:
      - ./my.cnf:/etc/mysql/my.cnf
    environment:
      - MYSQL_ROOT_PASSWORD=root
      - MYSQL_DATABASE=flyway
      - MYSQL_USER=flywaytest
      - MYSQL_PASSWORD=flywaytest
    ports:
      - 3306:3306
    command: ['mysqld', '--character-set-server=utf8mb4', '--collation-server=utf8mb4_unicode_ci']
```

MySQL 컨테이너를 띄우기 위해 *docker-compose.yml* 파일을 생성 후, 위와 같이 작성한다.

**1-2. build.gradle 의존성 추가**

```shell
implementation 'org.flywaydb:flyway-mysql'
```

### 2\. DataSource 설정

```shell
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://127.0.0.1:3306/flyway?useSSL=false&allowPublicKeyRetrieval=true
    username: flywaytest
    password: flywaytest
```

Spring Boot는 **DataSource 설정으로 Flyway를 자동 연결** 하기 때문에 *application.yml* 에 DataSource 관련 설정을 한다.

\* MySql 8.0 이상부터는 url 뒤에?useSSL=false&allowPublicKeyRetrieval=true 을 붙여주어야 에러가 나지 않는다...!!

### 3\. Flyway 활성화

```yaml
spring:
  datasource:
   ...

  flyway:
    enabled: true
```

*application.yml* 에 Flyway 활성화 설정을 한다.

### 4\. 마이그레이션 스크립트 작성

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2Fc7YhWy%2FbtsCTCVdyCS%2FAAAAAAAAAAAAAAAAAAAAAIc8zxfkPXsPqSuvi6HVNvkcvpX0RLlQiZxDG5FacqEF%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1785509999%26allow_ip%3D%26allow_referer%3D%26signature%3DDtyC5sJAHqdNZVezLc%252BqJf3PPCk%253D)

해당 경로에 작성한다!

```sql
CREATE TABLE member (
    studentId BIGINT AUTO_INCREMENT,
    studentName VARCHAR(10),
    studentEmail VARCHAR(50),
    PRIMARY KEY (studentId)
);
```

파일명에 언더스코어(\_\_) 가 2개 사용됨을 주의하자!!

### 5\. 프로젝트 실행하기

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FdvIfyY%2FbtsCTAJQq5c%2FAAAAAAAAAAAAAAAAAAAAACjZRSYodYC-05Bl3yL5R9jYVoRjWKgS4dMQpOxfX6Sz%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1785509999%26allow_ip%3D%26allow_referer%3D%26signature%3DTlaiyQRQpWFmVIVHsGf6fnzg5Cc%253D)

프로젝트를 실행해보면 Flyway가

데이터베이스의 상태를 추적하는 테이블인 flyway\_schema\_history와 member 테이블이 생성된 것을 확인할 수 있다.

### 출처

- [달록의 데이터베이스 마이그레이션을 위한 Flyway 적용기](https://hudi.blog/dallog-flyway/)
- [(Spring Boot) flyway 데이터 마이그레이션 설정 방법](https://wildeveloperetrain.tistory.com/210)

**긴 글 읽어주셔서 감사합니다 🍀**

**잘못 작성된 내용은 피드백 주시면 반영하겠습니다 😎**

#### 'Database' 카테고리의 다른 글

| [\[DB\] RDBMS와 NoSQL 사용하기](https://co-meow.tistory.com/entry/DB-RDBMS%EC%99%80-NoSQL-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0) (0) | 2024.02.01 |
| --- | --- |

1. [💡 Flyway 란?](#%F0%9F%92%A1%20Flyway%20%EB%9E%80%3F-1)
2. [✔️ 데이터베이스 형상 관리의 장점](#%E2%9C%94%EF%B8%8F%20%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4%20%ED%98%95%EC%83%81%20%EA%B4%80%EB%A6%AC%EC%9D%98%20%EC%9E%A5%EC%A0%90-1)
3. [✔️ 데이터베이스 마이그레이션의 필요성](#%E2%9C%94%EF%B8%8F%20%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4%20%EB%A7%88%EC%9D%B4%EA%B7%B8%EB%A0%88%EC%9D%B4%EC%85%98%EC%9D%98%20%ED%95%84%EC%9A%94%EC%84%B1-1)
4. [💡 Flyway 동작 방식](#%F0%9F%92%A1%20Flyway%20%EB%8F%99%EC%9E%91%20%EB%B0%A9%EC%8B%9D-1)
5. [💡 Flyway 마이그레이션 파일명 규칙](#%F0%9F%92%A1%20Flyway%20%EB%A7%88%EC%9D%B4%EA%B7%B8%EB%A0%88%EC%9D%B4%EC%85%98%20%ED%8C%8C%EC%9D%BC%EB%AA%85%20%EA%B7%9C%EC%B9%99-1)
6. [💡 Flyway 예제](#%F0%9F%92%A1%20Flyway%20%EC%98%88%EC%A0%9C-1)
7. [1\. Flyway 실습 환경 구축 (Docker 사용)](#1.%20Flyway%20%EC%8B%A4%EC%8A%B5%20%ED%99%98%EA%B2%BD%20%EA%B5%AC%EC%B6%95%20\(Docker%20%EC%82%AC%EC%9A%A9\)-1)
8. [2\. DataSource 설정](#2.%20DataSource%20%EC%84%A4%EC%A0%95-1)
9. [4\. 마이그레이션 스크립트 작성](#4.%20%EB%A7%88%EC%9D%B4%EA%B7%B8%EB%A0%88%EC%9D%B4%EC%85%98%20%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8%20%EC%9E%91%EC%84%B1-1)
10. [5\. 프로젝트 실행하기](#5.%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8%20%EC%8B%A4%ED%96%89%ED%95%98%EA%B8%B0-1)
11. [출처](#%EC%B6%9C%EC%B2%98-1)

---

## 💭 내 메모
<!-- 클리핑 후 직접 작성 — 왜 저장했나 · 핵심 takeaway · 궁금한 점. 인제스트 시 이 메모를 우선 반영한다. -->
