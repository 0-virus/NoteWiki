---
type: concept
tags: [testing, coverage, jacoco, gradle, java, ci]
updated: 2026-07-26
sources: ["raw/articles/커버리지 기준.md"]
---

# JaCoCo (Java Code Coverage)

## 한 줄 정의

**Java/Kotlin의 대표 [[test-coverage|커버리지]] 측정 도구.**
테스트 실행 중 어떤 코드가 실행됐는지 기록하고, 리포트를 만들고, **임계치 미달 시 빌드를 실패**시킨다.

## 어떻게 측정하는가 — 바이트코드 계측

JaCoCo는 소스 코드를 분석하는 게 아니라 **JVM 바이트코드에 계수기(probe)를 심는다.**

```
컴파일된 .class
     ↓ Java Agent가 클래스 로딩 시점에 개입
바이트코드 곳곳에 "여기 지나감" 기록 코드 삽입
     ↓ 테스트 실행
jacoco.exec (실행 흔적 바이너리)
     ↓ jacocoTestReport
HTML / XML / CSV 리포트
```

**왜 바이트코드인가**: 소스를 건드리지 않으므로 빌드 산출물이 오염되지 않고,
Java·Kotlin·Groovy 등 **JVM에서 도는 모든 언어에 그대로 적용**된다.
바이트코드의 분기 명령(`ifeq`, `tableswitch` 등)을 세기 때문에 Branch Coverage를 정확히 잡아낸다.

> 부작용: 소스에는 없는 분기가 리포트에 잡히기도 한다.
> 컴파일러가 만들어내는 코드(Kotlin의 null 체크, `equals` 자동 생성, 문자열 `switch` 등)가
> 바이트코드에 분기를 추가하기 때문. "내 코드엔 `if`가 없는데 Branch가 100%가 안 되네?"의 원인.

## 두 개의 태스크

```bash
./gradlew test jacocoTestReport            # 측정 + 리포트 생성
./gradlew jacocoTestCoverageVerification   # 임계치 미달 시 빌드 실패
```

역할이 명확히 갈린다.

| 태스크 | 역할 | 성격 |
| --- | --- | --- |
| `jacocoTestReport` | 사람이 볼 리포트 생성 | **정보 제공** — 실패하지 않음 |
| `jacocoTestCoverageVerification` | 기준 미달 시 **빌드 실패** | **강제(gate)** |

**왜 나눠져 있나**: 리포트는 개발 중 언제든 보고 싶지만, 빌드를 깨는 건 CI에서만 원하기 때문이다.
검증 태스크가 있어야 커버리지 기준이 "권고"가 아니라 **머지 조건**이 된다.

## 리포트 읽기

리포트 위치: `build/reports/jacoco/test/html/index.html`

HTML을 열면 각 줄 옆에 색이 표시된다.

- 🟢 **초록** — 커버됨
- 🔴 **빨강** — 실행 안 됨
- 🟡 **노랑** — **실행은 됐지만 분기 중 일부만 테스트됨** ★

노란 줄이 [[test-coverage]]에서 말한 "Line 100%인데 Branch는 절반"인 상태다.
**커버리지 리포트를 볼 때 가장 먼저 찾아야 할 색**.

## 임계치를 등급으로 나누기

`jacocoTestCoverageVerification`은 규칙(rule)을 여러 개 둘 수 있고,
**패키지 단위로 다른 기준**을 적용하는 게 실무 패턴이다.

| 구분 | Line | Branch |
| --- | --- | --- |
| 일반 Service / Controller | 90%+ | 80%+ |
| 핵심 비즈니스 (인증·권한·감사) | 100% | 100% |

100% 대상으로 흔히 지정하는 패키지 유형:

- `*.core.security.*` — JWT, SecurityFilterChain → [[spring-security]] · [[jwt]]
- `*.domain.auth.*` — 인증 도메인 → [[domain]]
- `*.domain.common.audit.*` — 감사 로그 → [[jpa-auditing]]

**왜 이 세 곳인가**: 조건 분기 하나만 놓쳐도 **"인증 우회"** 같은 심각한 결함으로 직결되기 때문이다.
반대로 일반 Service는 모든 분기를 다 테스트하는 비용이 이득보다 커지는 지점이 있어 80%로 현실적인 선을 둔다.

> **제외 대상도 중요하다**: DTO·Entity·설정 클래스·생성 코드(QueryDSL의 `Q` 클래스 등)는
> 로직이 없어서 커버리지 분모만 키운다. 보통 `excludes`로 뺀다. → [[querydsl]] · [[dto-vs-entity]]

## SonarQube 연동

JaCoCo의 XML 리포트를 SonarQube에 넘기면 커버리지가 **품질 게이트(Quality Gate)** 의 항목이 된다.
프론트의 Vitest lcov 리포트와 함께 올리면 한 대시보드에서 프로젝트 전체를 본다.

이때 실무적으로 더 중요해지는 개념이 **New Code Coverage(신규 코드 커버리지)** 다 —
레거시 전체를 90%로 올리는 건 비현실적이니, **"이번 PR에서 추가·변경된 줄"만** 기준을 적용한다.
전체 커버리지는 그러면 시간이 지나며 자연히 올라간다.

## 관련 페이지

- [[test-coverage]] — 상위 개념 (Line vs Branch, 왜 둘 다 보나)
- [[gradle]] — JaCoCo 플러그인을 붙이고 태스크를 실행하는 빌드 도구
- [[spring-security]] · [[jwt]] · [[jpa-auditing]] — 100% 기준을 적용하는 영역
- [[short-circuit]] — 바이트코드 분기가 늘어나는 원인 중 하나
- [[querydsl]] · [[dto-vs-entity]] — 커버리지 측정에서 보통 제외하는 코드
- 출처: [[coverage-standard]]
