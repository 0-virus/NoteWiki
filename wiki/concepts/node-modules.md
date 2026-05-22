---
type: concept
tags: [nodejs, npm]
updated: 2026-05-18
sources: ["raw/notes/Node.js - node_modules와 의존성 관리.md"]
---

# node_modules

## 한 줄 정의

프로젝트가 사용하는 패키지(의존성)가 실제로 설치되는 폴더.

## 왜 필요한가

프로젝트마다 필요한 패키지 버전이 다르다. `node_modules`를 프로젝트 루트에 두면
**프로젝트별로 의존성 버전을 격리**할 수 있다 — 파이썬의 가상환경과 같은 발상.

## 두 종류의 node_modules

| 위치 | 용도 |
|------|------|
| 프로젝트 루트의 `node_modules/` | 그 프로젝트 전용 의존성 |
| Node.js 설치 경로의 `node_modules/` | 전역 시스템(CLI 도구 등)용. 프로젝트와 별개 |

## 핵심 특징

- `npm install`을 실행하면 생성된다. 보통 수백 개의 패키지가 들어간다.
- 용량이 크고 재생성 가능하므로 **Git에 포함하지 않는다**(`.gitignore`).
- 대신 [[npm-dependency-files]]의 `package.json`·`package-lock.json`만 공유하면
  누구나 동일한 `node_modules`를 재현할 수 있다.

## 관련 페이지

- [[npm-dependency-files]] — node_modules를 무엇으로 재현하는가
- [[npm-install-flow]] — 설치·동기화 흐름
- [[es-modules]] — `import "패키지명"`은 node_modules에서 찾는다
- 출처: [[nodejs-dependency-management]]
