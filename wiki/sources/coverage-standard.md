---
type: source
tags: [testing, coverage, jacoco, vitest, quality, article]
updated: 2026-07-26
sources: ["raw/articles/커버리지 기준.md"]
---

# 소스: 커버리지 기준

- **원본**: `raw/articles/커버리지 기준.md`
- **유형**: 내부 문서 (SonarQube 커버리지 기준 문서)
- **클리핑**: 2026-07-21

## 맥락 (왜 저장했나)

**"테스트를 얼마나 해야 충분한가"에 대한 실무 기준선을 얻으려고.**
지금까지 위키에는 [[spring-security]]·[[jpa]] 같은 *만드는 법*은 쌓였는데, **만든 걸 검증하는 축**이 통째로 비어 있었다.
이 문서는 그 첫 페이지다.

특히 흥미로운 지점은 **Line 100%인데 Branch는 절반**인 상황 — [[short-circuit|쇼트 서킷]] 때문에
`&&` 뒤 조건이 평가조차 안 되는 경로가 생긴다는 것. 이미 위키에 있는 쇼트 서킷 개념이
전혀 다른 맥락(테스트 품질)에서 다시 튀어나온 게 이 소스의 재미다.

> 📌 범위 메모: 원본 URL은 사내 SonarQube 주소지만, 내용은 **Line/Branch 커버리지의 일반 개념**과
> 널리 쓰이는 관행(90/80, 인증 100%)이라 NoteWiki에 둔다. 회사 고유 규칙·시스템 정보는 담지 않는다.

## 핵심 주장 (Key Claims)

1. **커버리지 100% ≠ 버그 없음** — 코드가 실행은 됐어도 결과를 `assert`하지 않았을 수 있다.
2. **그래도 보는 이유는 비대칭성** — 높다고 좋은 건 아니지만, **낮으면 확실히 나쁘다**(테스트가 지나가 본 적조차 없다). 최소한의 안전망.
3. **Line과 Branch는 다른 것을 잰다** — 하나만 보면 반드시 놓치는 부분이 생긴다.
4. **한 줄에 조건이 여러 개면 Line은 거짓말을 한다** — `if (isVip && orderCount > 10)`은 테스트 2개로 Line 100%가 되지만, `(true, false)` 조합은 미검증으로 남는다.
5. **Branch 기준을 Line보다 낮게 잡는 이유** — 분기 조합은 조건 수에 따라 기하급수적(`&&`/`||` 3개면 최대 8가지). 100%에 맞추는 비용이 급격히 커진다.
6. **실무 목표는 "라인은 거의 다, 분기는 웬만큼"** — 두 지표에 **다른 임계치**를 둔다 (90% / 80%).
7. **Branch만 보는 것도 답이 아니다** — 분기 없는 단순 유틸(포맷터)은 Branch가 의미가 적고 Line으로 충분하다.
8. **결함 파급력으로 등급을 나눈다** — 인증·권한·감사는 분기 하나 누락이 "인증 우회"로 직결되므로 Line/Branch 모두 100%.
9. **리포트의 노란 줄이 신호** — "실행은 됐지만 분기 중 일부만 테스트됨". Line 100%에 안심하면 안 되는 증거.
10. **커버리지 기준은 설계 압력이기도 하다** — 조건 3개 이상 겹친 `if`는 분기를 쪼개 테스트 가능하게 리팩터링을 검토.

## 언급된 엔티티

- 도구: JaCoCo, Vitest(v8 coverage provider), SonarQube, Gradle, pnpm
- 지표: Line / Branch / Function / Statement Coverage
- 명령: `./gradlew test jacocoTestReport`, `./gradlew jacocoTestCoverageVerification`, `pnpm test:coverage`
- 리포트: `build/reports/jacoco/test/html/index.html`, `coverage/index.html`, `coverage/lcov.info`
- 기준 예시: 일반 Service/Controller 90%/80%, 핵심(인증·권한·감사) 100%/100%

## 다루는 개념 → 위키 매핑

| 원본 내용 | 위키 페이지 |
| --- | --- |
| 커버리지 정의·한계·Line vs Branch·등급 기준 | [[test-coverage]] (신규) |
| JaCoCo 측정 원리·태스크·리포트·임계치 강제 | [[jacoco]] (신규) |
| `&&`의 뒤 조건이 평가되지 않는 이유 | [[short-circuit]] (연결·보강) |
| 100% 기준을 요구하는 영역 | [[spring-security]] · [[jwt]] · [[jpa-auditing]] (연결) |
| 분기를 쪼개는 리팩터링의 근거 | [[solid-principles]] (연결) |

## 원본에 없어서 보강한 것

- **JaCoCo가 어떻게 측정하는가** — 바이트코드 계측(Java Agent + probe). 소스에 없는 분기가 리포트에 잡히는 이유까지.
- **두 Gradle 태스크의 역할 분리** — 리포트(정보)와 verification(게이트)이 왜 나뉘어 있나.
- **커버리지 측정 제외 대상** — DTO·Entity·생성 코드(QueryDSL Q클래스)는 분모만 키운다.
- **New Code Coverage** — 레거시 전체를 올리는 대신 "이번 변경분"에만 기준을 적용하는 실무 전략.
- **`lcov.info`의 의미** — 언어·도구 중립 교환 포맷이라 Java와 TS를 한 대시보드로 묶을 수 있다.

## 관련 페이지

- [[test-coverage]] · [[jacoco]] — 이 소스가 낳은 페이지
- [[short-circuit]] — 이 소스로 새 맥락(Branch Coverage)이 붙은 기존 페이지
- [[flyway-article]] — 같은 날 인제스트한 쌍
