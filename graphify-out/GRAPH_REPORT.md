# Graph Report - wiki  (2026-05-19)

## Corpus Check
- Corpus is ~5,288 words - fits in a single context window. You may not need a graph.

## Summary
- 62 nodes · 124 edges · 12 communities
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.78)
- Token cost: 79,940 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_JavaScript 비동기-모듈|JavaScript 비동기-모듈]]
- [[_COMMUNITY_Promise & 비동기 진화|Promise & 비동기 진화]]
- [[_COMMUNITY_옵시디언 핵심 기능|옵시디언 핵심 기능]]
- [[_COMMUNITY_위키 색인 허브|위키 색인 허브]]
- [[_COMMUNITY_ORM & Prisma|ORM & Prisma]]
- [[_COMMUNITY_옵시디언 속성-태그|옵시디언 속성-태그]]
- [[_COMMUNITY_npm 설치 흐름|npm 설치 흐름]]
- [[_COMMUNITY_Node.js 의존성 관리|Node.js 의존성 관리]]
- [[_COMMUNITY_CSS 우선순위 소스|CSS 우선순위 소스]]
- [[_COMMUNITY_위키 운영 시스템|위키 운영 시스템]]
- [[_COMMUNITY_그래프 뷰 & 연결|그래프 뷰 & 연결]]
- [[_COMMUNITY_CSS 개념 (명시도-모듈)|CSS 개념 (명시도-모듈)]]

## God Nodes (most connected - your core abstractions)
1. `Wiki Index Catalog` - 23 edges
2. `Promise` - 8 edges
3. `Promise` - 8 edges
4. `위키링크 (Wikilink)` - 8 edges
5. `Callback` - 7 edges
6. `Graph View` - 7 edges
7. `옵시디언 (Obsidian)` - 7 edges
8. `async / await` - 6 edges
9. `ES Modules (import / export)` - 6 edges
10. `Synchronous vs Asynchronous (JavaScript)` - 6 edges

## Surprising Connections (you probably didn't know these)
- `ES Modules (import / export)` --semantically_similar_to--> `CSS Modules`  [INFERRED] [semantically similar]
  wiki/concepts/es-modules.md → wiki/concepts/css-modules.md
- `Obsidian Tags` --semantically_similar_to--> `Wikilink`  [INFERRED] [semantically similar]
  wiki/concepts/obsidian-tags.md → wiki/index.md
- `Promise` --semantically_similar_to--> `ORM (Object-Relational Mapping)`  [INFERRED] [semantically similar]
  wiki/concepts/promise.md → wiki/concepts/orm.md
- `흐름: npm 의존성 설치·동기화` --semantically_similar_to--> `흐름: Prisma 사용 워크플로우`  [INFERRED] [semantically similar]
  wiki/flows/npm-install-flow.md → wiki/flows/prisma-workflow.md
- `Obsidian Properties` --conceptually_related_to--> `Wiki (AI-Compiled Knowledge Base)`  [INFERRED]
  wiki/concepts/obsidian-properties.md → wiki/CLAUDE.md

## Hyperedges (group relationships)
- **Three Approaches to JavaScript Asynchrony** — callback_callback, index_promise, async_await_async_await [EXTRACTED 1.00]
- **npm Dependency Reproduction System** — node_modules_node_modules, npm_dependency_files_npm_dependency_files, index_npm_install_flow [EXTRACTED 1.00]
- **Obsidian Knowledge Management Toolset** — index_obsidian, index_wikilink, graph_view_graph_view, obsidian_tags_tags, obsidian_properties_properties [INFERRED 0.85]
- **JS 비동기 발전 흐름: Callback → Promise → async/await** — promise_callback, promise_promise, promise_async_await, js_async_evolution_js_async_evolution [EXTRACTED 0.95]
- **Prisma ORM 워크플로우 및 개념 군집** — prisma_prisma, orm_orm, orm_n_plus_1_problem, prisma_workflow_prisma_workflow [EXTRACTED 0.95]
- **npm 의존성 동기화 (package.json → lock → node_modules)** — npm_install_flow_npm_dependency_files, npm_install_flow_node_modules, npm_install_flow_npm_install_flow [EXTRACTED 0.85]

## Communities (12 total, 0 thin omitted)

### Community 0 - "JavaScript 비동기-모듈"
Cohesion: 0.40
Nodes (10): async / await, Callback, Callback Hell (Pyramid of Doom), Dynamic import(), ES Modules (import / export), JS Async Evolution Flow, js-async (Source Page), js-import-export (Source Page) (+2 more)

### Community 1 - "Promise & 비동기 진화"
Cohesion: 0.42
Nodes (9): 흐름: JS 비동기의 발전 (Callback → Promise → async/await), 소스: 비동기의 모든 것, ES Modules, 소스: JavaScript Import와 Export, async/await, Callback, ES Modules, JavaScript 비동기 (+1 more)

### Community 2 - "옵시디언 핵심 기능"
Cohesion: 0.57
Nodes (8): 소스: 옵시디언 기초 강의 (YouTube), 옵시디언 (Obsidian), Vault (보관소), 옵시디언 속성 (Properties), 옵시디언 태그, 옵시디언 웹 클리퍼 (Web Clipper), 그래프 뷰 (Graph View), 위키링크 (Wikilink)

### Community 3 - "위키 색인 허브"
Cohesion: 0.47
Nodes (6): ORM (Object-Relational Mapping), Prisma, prisma-orm (Source Page), Prisma Workflow, Wiki Index Catalog, N+1 Problem

### Community 4 - "ORM & Prisma"
Cohesion: 1.00
Nodes (5): N+1 Problem, ORM (Object-Relational Mapping), 소스: Prisma 필기, Prisma, 흐름: Prisma 사용 워크플로우

### Community 5 - "옵시디언 속성-태그"
Cohesion: 0.83
Nodes (4): obsidian-basics-video (Source Page), Web Clipper, Obsidian Properties, Obsidian Tags

### Community 6 - "npm 설치 흐름"
Cohesion: 0.83
Nodes (4): 소스: Node.js node_modules와 의존성 관리, node_modules, npm 의존성 파일들, 흐름: npm 의존성 설치·동기화

### Community 7 - "Node.js 의존성 관리"
Cohesion: 0.83
Nodes (4): nodejs-dependency-management (Source Page), npm install Flow, node_modules, npm Dependency Files (package.json / lock)

### Community 8 - "CSS 우선순위 소스"
Cohesion: 0.67
Nodes (3): 소스: CSS 참조 우선순위, CSS Modules, CSS 명시도 (Specificity)

### Community 9 - "위키 운영 시스템"
Cohesion: 1.00
Nodes (3): Ingest / Query / Lint Workflow, Wiki (AI-Compiled Knowledge Base), Wiki Log (Append-only)

### Community 10 - "그래프 뷰 & 연결"
Cohesion: 0.67
Nodes (3): Graph View, Obsidian, Wikilink

### Community 11 - "CSS 개념 (명시도-모듈)"
Cohesion: 1.00
Nodes (3): CSS Modules, CSS Specificity and Priority, css-cascade-priority (Source Page)

## Knowledge Gaps
- **4 isolated node(s):** `Prisma Workflow`, `js-import-export (Source Page)`, `prisma-orm (Source Page)`, `소스: JavaScript Import와 Export`
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Wiki Index Catalog` connect `위키 색인 허브` to `JavaScript 비동기-모듈`, `옵시디언 속성-태그`, `Node.js 의존성 관리`, `위키 운영 시스템`, `그래프 뷰 & 연결`, `CSS 개념 (명시도-모듈)`?**
  _High betweenness centrality (0.204) - this node is a cross-community bridge._
- **Why does `위키링크 (Wikilink)` connect `옵시디언 핵심 기능` to `Promise & 비동기 진화`, `ORM & Prisma`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `Promise` connect `Promise & 비동기 진화` to `옵시디언 핵심 기능`, `ORM & Prisma`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **What connects `Prisma Workflow`, `js-import-export (Source Page)`, `prisma-orm (Source Page)` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._