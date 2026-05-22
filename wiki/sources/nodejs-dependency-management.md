---
type: source
tags: [nodejs, npm]
updated: 2026-05-18
sources: ["raw/notes/Node.js - node_modules와 의존성 관리.md"]
---

# 소스: Node.js node_modules와 의존성 관리

> 원본: `raw/notes/Node.js - node_modules와 의존성 관리.md` — 직접 작성 필기(노션 이전분).

## 맥락 (왜 기록했나)

Vite로 React 프로젝트를 세팅하다 모듈 에러를 만나, `node_modules`·`package.json`·
`package-lock.json`·`node_modules/.package-lock.json`의 차이를 추적한 노트.

## 핵심 요약

- `node_modules/`는 프로젝트 전용 의존성 폴더. 시스템 전역 `node_modules`와 별개 (파이썬 가상환경과 유사).
- `package.json`: 메타데이터 + **직접 설치한** 패키지를 버전 범위(`^`, `~`)로 기록. Git 포함.
- `package-lock.json`: 전체 의존성 트리의 **정확한 버전**을 잠금. npm 자동 관리. Git 포함. → 재현 가능한 설치 보장.
- `node_modules/.package-lock.json`: 실제 설치 상태 캐시. 일치하면 `npm install`을 스킵 → 속도. Git 무시.
- `npm ci`는 lock 파일만 보고 `node_modules`를 지우고 재설치 — CI/CD용.

## 위키 반영

- [[node-modules]] — 의존성 격리 폴더
- [[npm-dependency-files]] — package.json / lock 파일들의 역할
- [[npm-install-flow]] — 의존성 동기화 흐름
