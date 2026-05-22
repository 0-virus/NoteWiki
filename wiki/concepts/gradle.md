---
type: concept
tags: [java, build-tool, gradle]
updated: 2026-05-21
sources: ["raw/notes/Spring Framework.md"]
---

# Gradle

## 한 줄 정의

**Maven을 대체하는 빌드 자동화 도구.** Groovy(또는 Kotlin) 기반 스크립트로 빌드를 정의 — XML이 아니다.

## build.gradle — 프로젝트 명세

```groovy
plugins {
    id 'org.springframework.boot' version '3.2.0'
    id 'java'
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}
```

같은 내용을 [[maven]] `pom.xml`로 쓰면 XML 태그가 빽빽하게 들어차 30~40줄이 된다. Gradle은 코드 한 줄로 끝.

## 왜 빠른가

- **증분 빌드(Incremental Build)**: 바뀐 파일만 다시 컴파일.
- **빌드 캐시**: 이전 결과를 재활용.
- **데몬 프로세스**: JVM 워밍업 비용을 한 번만 지불.

결과: Maven 대비 **보통 10~100배** 빠른 빌드.

## 단점

- **메모리를 많이 쓴다** (데몬 프로세스 유지).
- **Groovy 문법을 알아야** 복잡한 빌드 로직을 짤 수 있다. (간단한 의존성 추가는 Maven보다 쉬움, 그러나 커스텀이 들어가면 학습 부담.)
- 한국 SI 현장에는 아직 Maven이 많아서 두 도구 다 익혀두면 좋다.

## Maven vs Gradle

| 항목 | [[maven]] | Gradle |
| ---- | --------- | ------ |
| 가독성 | 낮음 | 높음 |
| 속도 | 느림 | 빠름 |
| 진입장벽 | 평이 | Groovy 부담 |
| 메모리 | 적음 | 많음 |
| 점유율 | 전통 표준 | 신규 우세 |

## 영균 학습 트리에서

- Spring Initializr에서 새 프로젝트 만들 때 Gradle을 고르는 게 보통 정답.
- 대규모 프로젝트일수록 가독성·속도 차이가 더 크게 벌어진다.
- 다만 회사 코드 받았는데 Maven이라고 당황할 필요 X — "의존성 명세 파일 형식만 다른 같은 도구".

## 관련 페이지

- [[maven]] — Gradle이 대체하려는 전통 표준
- [[spring-boot]] — Gradle/Maven 둘 다 지원
- 출처: [[spring-framework-1-note]]
