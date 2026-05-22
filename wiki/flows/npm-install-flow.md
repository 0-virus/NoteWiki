---
type: flow
tags: [nodejs, npm]
updated: 2026-05-18
sources: ["raw/notes/Node.js - node_modules와 의존성 관리.md"]
---

# 흐름: npm 의존성 설치·동기화

## 흐름 한눈에

```
package.json  →  package-lock.json  →  node_modules/
 (무엇이 필요)     (정확히 어떤 버전)      (실제 설치 결과)
```

사람은 `package.json`만 손대고, 나머지는 `npm`이 위 흐름대로 만들어낸다.

## npm install 프로세스

```
npm install
 │
 ├─ node_modules/.package-lock.json 과 package-lock.json 비교
 │   ├─ 일치 → "up to date" (스킵, ~1초)
 │   └─ 불일치 ↓
 ├─ package-lock.json 기반으로 패키지 다운로드
 └─ node_modules/ 생성 + .package-lock.json 갱신
```

## 협업 시나리오 (왜 lock 파일이 핵심인가)

- **개발자 A**가 `npm install axios` → `package.json`·`package-lock.json` 갱신,
  Git에 두 파일을 커밋(`node_modules`는 `.gitignore`로 제외).
- **개발자 B**가 `git clone` 후 `npm install` → `package-lock.json`의 정확한 버전대로
  설치 → **A와 100% 동일한 환경**.
- 이후 A가 패키지를 추가하고 push하면, B는 `git pull` + `npm install`로
  바뀐 패키지만 동기화된다.

`package.json`만 있고 lock 파일이 없으면, 설치 시점에 따라 버전이 갈려 버그가 난다.

## npm install vs npm ci

| | `npm install` | `npm ci` |
|---|---|---|
| 용도 | 일상 개발 | CI/CD |
| 동작 | lock 없으면 만들고, package.json도 갱신 | lock만 보고 설치, `node_modules` 삭제 후 재설치 |
| 특징 | 유연 | 더 빠르고 정확, package.json 수정 안 함 |

## 관련 페이지

- [[npm-dependency-files]] — 세 파일 각각의 역할
- [[node-modules]] — 흐름의 최종 산출물
- 출처: [[nodejs-dependency-management]]
