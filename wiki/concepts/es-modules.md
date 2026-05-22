---
type: concept
tags: [javascript, module]
updated: 2026-05-19
sources: ["raw/notes/JavaScript - Import와 export.md"]
---

# ES 모듈 (import / export)

## 한 줄 정의

JS 파일 간에 변수·함수·클래스를 **내보내고(export) 가져오는(import)** 표준 모듈 시스템.

## 왜 필요한가

코드를 파일 단위로 쪼개 재사용·캡슐화하려면, 무엇을 공개하고 무엇을 가져올지
명시하는 약속이 필요하다.

## Named Export vs Default Export

| | Named Export | Default Export |
|---|---|---|
| 개수 | 파일당 여러 개 | 파일당 **하나** |
| 내보내기 | `export const PI = 3.14` 또는 `export { PI, add }` | `export default function Button() {}` |
| 가져오기 | `import { PI } from "..."` — **중괄호 + 정확한 이름** | `import Button from "..."` — 중괄호 X, 이름 자유 |
| `as` 개명 | `import { add as sum }` | 가져올 때 이름 자체가 자유 |
| 쓰임새 | 라이브러리·유틸 함수 모음 | React 컴포넌트 등 파일의 주인공 |

## 동작 원리

엔진은 모듈을 `namedExports`와 `defaultExport`라는 **분리된 공간**으로 관리한다.
그래서 같은 클래스를 named와 default로 동시에 내보내도 충돌하지 않는다.

## 동적 import()

```jsx
const module = await import("./utils.js"); // 런타임에 필요할 때 로드
```

- 정적 `import`(파일 최상단·실행 전 동기 로드)와 달리, **함수처럼** 쓰고 런타임에 로드한다.
- **[[promise]]를 반환**한다 → `await` 또는 `.then()` 필요. Top-level await·에러 처리 필수.
- Default Export는 `.default` 프로퍼티로 접근. 같은 모듈은 캐싱된다.

## 관련 페이지

- [[node-modules]] — `import "react"` 같은 패키지명은 `node_modules`에서 해석된다.
- [[promise]] — 동적 `import()`의 반환 타입.
- [[css-modules]] — `import styles from "./x.module.css"`도 default import다.
- 출처: [[js-import-export]]
