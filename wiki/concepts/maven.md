---
type: concept
tags: [java, build-tool, maven]
updated: 2026-05-21
sources: ["raw/notes/Spring Framework.md"]
---

# Maven

## 한 줄 정의

**Java 프로젝트의 빌드 + 의존성 관리 + 배포를 자동화하는 표준 도구.** XML 기반.

## 무엇이 "빌드"인가

> **빌드**: 소스 코드(`.java`) → 실행 가능한 형태(`.jar` / `.war`)로 변환하는 과정. 컴파일·테스트·패키징·배포가 모두 포함된다.

이걸 사람이 매번 손으로 하면 — 의존성 라이브러리 다운로드·버전 맞추기·컴파일·테스트·압축이 모두 수동. Maven이 이 전 과정을 명세대로 자동화한다.

## pom.xml — 프로젝트 명세

Maven 프로젝트의 핵심 파일은 루트의 `pom.xml` (Project Object Model).

```xml
<project>
  <groupId>com.example</groupId>
  <artifactId>my-app</artifactId>
  <version>1.0-SNAPSHOT</version>

  <dependencies>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-core</artifactId>
      <version>5.3.26</version>
    </dependency>
  </dependencies>
</project>
```

이걸로 Maven은:
- 의존성 라이브러리를 **Maven Central**에서 자동 다운로드.
- 의존성의 의존성(추이적)까지 자동 해결.
- 버전 호환성을 한 곳에서 관리.

## 단점 — Gradle이 등장한 이유

- **XML 가독성이 떨어진다.** 의존성 5~6개만 돼도 100줄 넘어간다.
- 종속적 라이브러리 설정이 복잡해질수록 더 비대해진다.
- 빌드 속도가 [[gradle]]보다 느리다 (보통 10~100배 차이).

## Maven vs Gradle 한눈에

| 항목 | Maven | [[gradle]] |
| ---- | ----- | ---------- |
| 명세 파일 | `pom.xml` | `build.gradle` |
| 언어 | XML | Groovy/Kotlin DSL |
| 가독성 | 낮음 | 높음 |
| 속도 | 느림 | 빠름 (10~100×) |
| 학습곡선 | 평이 | Groovy 문법 부담 |
| 점유율 | 높음 (전통 표준) | 신규 프로젝트 우세 |

## 영균 학습 트리에서

- 부트캠프에서 만나는 프로젝트는 둘 다 가능 — Spring Initializr에서 고를 수 있다.
- 기존 회사 코드를 받으면 Maven인 경우가 많다 (한국 SI 현장은 아직 Maven 비중 큼).
- 새 프로젝트는 [[gradle]]을 추천하는 추세지만, 둘 다 **"의존성 명세 파일을 읽고 라이브러리를 자동으로 가져온다"**는 핵심 동작은 같다.

## 관련 페이지

- [[gradle]] — Maven을 대체하는 신규 표준
- [[spring-boot]] — Maven/Gradle 둘 다 지원 (Spring Initializr에서 선택)
- 출처: [[spring-framework-1-note]]
