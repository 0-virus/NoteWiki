---
type: source
tags: [javascript, module]
updated: 2026-05-18
sources: ["raw/notes/JavaScript - Import와 export.md"]
---

# 소스: JavaScript Import와 Export

> 원본: `raw/notes/JavaScript - Import와 export.md` — 직접 작성 필기(노션 이전분).

## 핵심 요약

- **Export**: 한 파일의 변수·함수·클래스를 다른 파일에서 쓸 수 있게 내보내기. **Import**: 그것을 가져오기.
- **Named Export**: 이름 지정 내보내기. 가져올 때 `{ }` 필수, 정확한 이름. `as`로 개명 가능. 라이브러리·유틸에 적합.
- **Default Export**: 파일당 하나. `{ }` 없이, 원하는 이름으로 가져옴. React 컴포넌트 등에 적합.
- 동작 원리: 엔진은 `namedExports`와 `defaultExport`를 **분리된 공간**으로 관리 → 같은 이름이어도 충돌 없음.
- 동적 `import()`: 런타임에 필요할 때 로드, **Promise 반환**. Top-level await·에러 처리 필요. 같은 모듈은 캐싱됨.

## 위키 반영

- [[es-modules]] — ES 모듈 시스템 (named/default/동적 import)
