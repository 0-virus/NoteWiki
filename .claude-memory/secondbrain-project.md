---
name: secondbrain-project
description: "NoteWiki — \"AI를 위한 세컨드 브레인\" 프로젝트의 목적과 운영 원칙"
metadata: 
  node_type: memory
  type: project
  originSessionId: 938f2476-c062-4e01-a23c-e653c14d2034
---

NoteWiki는 박영균의 "AI를 위한 세컨드 브레인". 흩어진 개발 필기(현재 노션+GitHub md)를 맥락에 맞춰 즉시 꺼내주는 "AI 색인 도구"가 목표. 핵심 Pain Point: 필기를 다시 찾는 비용이 새로 검색하는 비용보다 크고, 필기 간 연관 짓기가 어려움.

전체 맥락은 `My Context Summary.md`(2026-05-18 인터뷰 종합) 참조.

구조: Karpathy의 LLM Wiki 패턴 적용. 3계층 = `raw/`(불변 원본, AI 수정 금지; articles·lectures·practice·notes·assets), `wiki/`(AI가 컴파일; concepts·flows·sources + index.md·log.md), `Output/`(최종 산출물). 운영 규칙은 루트 CLAUDE.md + 각 폴더 하위 CLAUDE.md에 있음. 3대 작업: Ingest/Query/Lint.

노트 작성/AI 운영 원칙:
- 원리 우선: "무엇"보다 "왜 동작/왜 선택"을 설명.
- 연결 중심: 모든 노트는 링크형 태그로 연결, 기술의 자연스러운 사용 흐름(예: Tomcat→Servlet→Spring MVC)을 드러냄.
- 형태: 주제별 자유 형식 + 링크형 태그 필수, 출력은 md/html.
- 맥락 적응: 학습 중인지 실무 중인지에 따라 설명 깊이·적용법 조정.
- 성장하는 구조: 새 지식은 기존 노트를 대체하지 않고 새 가지로 추가.

관련: [[user-profile]]
