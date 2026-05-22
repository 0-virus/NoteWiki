---
type: concept
tags: [nodejs, npm]
updated: 2026-05-18
sources: ["raw/notes/Node.js - node_modules와 의존성 관리.md"]
---

# npm 의존성 파일 (package.json / lock 파일)

## 한 줄 정의

`node_modules`를 **언제·어디서나 똑같이 재현**하기 위한 세 개의 기록 파일.

## 세 파일의 역할

| 파일 | 내용 | 관리 주체 | Git |
|------|------|-----------|-----|
| `package.json` | 프로젝트 메타데이터 + **직접 설치한** 패키지를 버전 범위로 기록 | 사람(자동 갱신도 됨) | 포함 |
| `package-lock.json` | **전체 의존성 트리**의 정확한 버전 잠금 | npm 자동 | 포함 |
| `node_modules/.package-lock.json` | 실제 설치된 상태의 캐시 | npm 자동 | 무시 |

## 왜 lock 파일이 필요한가

`package.json`은 버전을 **범위**로 적는다:

```json
"react": "^18.3.1"   // 18.3.1 이상 ~ 19.0.0 미만
"react": "~18.3.1"   // 18.3.1 이상 ~ 18.4.0 미만
"react": "18.3.1"    // 정확히 18.3.1
```

범위만 있으면 설치 시점에 따라 개발자마다 다른 버전이 깔려 버그가 난다.
`package-lock.json`이 **정확한 버전**을 박아두어 모두가 동일한 환경을 갖는다.

`node_modules/.package-lock.json`은 "이미 올바르게 설치됨"을 빠르게 판별해
불필요한 재설치를 건너뛴다(첫 설치 30초 → 이후 1초 `up to date`).

## 관련 페이지

- [[node-modules]] — 이 파일들이 재현하려는 대상
- [[npm-install-flow]] — `npm install`과 `npm ci`가 이 파일들을 쓰는 흐름
- 출처: [[nodejs-dependency-management]]
