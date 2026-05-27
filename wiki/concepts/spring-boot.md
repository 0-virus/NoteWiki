---
type: concept
tags: [spring, spring-boot]
updated: 2026-05-21
sources: ["raw/notes/Spring Framework.md"]
---

# Spring Boot

## 한 줄 정의

**"그냥 실행되는(just run) 상용급 Spring 애플리케이션"을 쉽게 만들도록 도와주는 도구.**
Spring을 대체한 게 아니라, Spring을 **편하게 쓰게 해주는 위 계층**이다.

## Spring 그대로 쓸 때의 고통

순수 Spring 프로젝트를 하나 만들려면:
- `pom.xml`에 의존성 수십 개를 직접 명시 (버전·호환성도 직접 챙겨야 함).
- Tomcat 같은 [[servlet-container]] WAS를 따로 설치하고 `.war`로 배포.
- `web.xml`·`servlet-context.xml`·`root-context.xml` 등 XML 설정 다발.
- DataSource·ViewResolver 등을 일일이 Bean으로 등록 ([[connection-pool]]도 직접 골라 붙여야).

Spring Boot는 이걸 **컨벤션·자동 설정**으로 줄인다.

## 4가지 핵심 가치

| 가치                | 의미                                                      |
| ------------------- | --------------------------------------------------------- |
| **Stand-alone**     | `.jar` 하나로 실행 — Tomcat을 따로 설치할 필요 없음       |
| **Production-ready** | 헬스체크·메트릭·로깅 같은 운영 기능을 기본 제공          |
| **자동 의존성 관리** | "starter" 패키지 하나 추가하면 관련 라이브러리·버전 일괄 |
| **XML 설정 제로**   | `application.properties`/`yml`만으로 설정 끝              |

## 내장 WAS — 가장 직관적인 차이

Spring + Tomcat 시절:

```
1. Tomcat 설치 → 2. .war 빌드 → 3. Tomcat의 webapps/에 배포 → 4. Tomcat 실행
```

Spring Boot:

```
1. .jar 빌드 → 2. java -jar app.jar
```

`.jar` 안에 Tomcat이 통째로 들어 있다 (`spring-boot-starter-tomcat`).
`java -jar`가 곧 Tomcat을 띄우는 명령이 된다 — 그래서 "stand-alone".

> ⚠️ 운영상으로는 **[[reverse-proxy]] 뒤에 두는 게 보통**이다.
> `java -jar`로 띄운 Spring Boot 앱 앞에 [[nginx]]를 둬서 TLS·정적 파일·로드 밸런싱을 위임.
> → [[scaling-a-web-app]]

## 자동 설정 (Auto-configuration)

`spring-boot-starter-web`을 추가하면 — Spring MVC, 내장 Tomcat, Jackson(JSON 직렬화), Validation이 한 번에 활성화되고, [[spring-bean]]들이 자동으로 등록된다.

원리: classpath에 어떤 라이브러리가 있는지 보고, "있으면 켜라"는 조건부 설정(`@ConditionalOnClass` 등)이 동작한다. 개발자는 **필요할 때만 덮어쓴다**.

> 예: `spring-boot-starter-jdbc`나 `mybatis-spring-boot-starter`를 넣기만 해도
> [[hikaricp]]가 transitive로 따라 들어오고, `spring.datasource.*` 설정만 보고
> `HikariDataSource`가 Bean으로 자동 등록된다. 영균이 [[mybatis]] 실습 로그에서 본
> `HikariPool-1 - Starting...`이 이 자동 설정의 결과.

## 프로젝트 구조 — 최소

```
src/main/java/.../SampleApplication.java     ← main 클래스 (@SpringBootApplication)
src/main/resources/application.properties    ← 환경 설정
build.gradle 또는 pom.xml                    ← 빌드 명세
```

`application.properties` 예시:
```properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/mydb
spring.jpa.hibernate.ddl-auto=update
```

## 프로젝트 생성 방법

- **Spring Initializr** (`start.spring.io`): 웹 UI에서 의존성 골라 zip 다운로드. IntelliJ Community에서도 사용.
- **IntelliJ Ultimate / STS**: IDE 안에서 마법사로 직접 생성.

영균의 환경: JDK 17 + IntelliJ Ultimate(부트캠프 할인 코드) + Postman.

## Maven vs Gradle — 어느 쪽?

Spring Initializr에서 둘 다 고를 수 있다. 최근 추세는 [[gradle]] — 빠른 빌드 + 가독성. 자세한 비교는 [[maven]]·[[gradle]] 페이지.

## 영균 학습 트리에서

- [[servlet-container]] 학습 때 "Tomcat을 따로 설치하고 `.war`를 올렸다"의 그 Tomcat이, Spring Boot에선 `.jar` 안에 들어와 있다.
- 따라서 [[servlet-to-spring-mvc]]의 표에 적힌 **"Tomcat 따로 설치 + .war → 내장 Tomcat + .jar"**의 오른쪽이 곧 Spring Boot.

## 관련 페이지

- [[spring-framework]] — Spring Boot가 감싸는 본체
- [[servlet-container]] — Spring Boot가 내장하는 Tomcat
- [[hikaricp]] · [[connection-pool]] — `spring.datasource.*`로 자동 등록되는 DB 풀
- [[maven]] · [[gradle]] — 빌드 도구
- [[reverse-proxy]] · [[nginx]] · [[scaling-a-web-app]] — 운영 시 앞단에 둘 인프라
- 출처: [[spring-framework-1-note]]
