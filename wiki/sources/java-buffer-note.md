---
type: source
tags: [java, io, buffer, scanner]
updated: 2026-05-19
sources: ["raw/notes/Java의 버퍼.md"]
---

# 소스: Java의 버퍼

> 원본: `raw/notes/Java의 버퍼.md` — 직접 작성 필기(노션 이전분).
> `Scanner`의 `nextLine()`이 `NumberFormatException`을 내는 실제 에러에서 출발한 노트.

## 맥락 (왜 기록했나)

부트캠프 Java 학습 중 정리한 **실무 대비 자산**. `ScannerDemo` 실습에서 만난
`NumberFormatException: For input string: ""` 에러의 원인을 버퍼 개념으로 파고든 기록.

## 핵심 요약

- 버퍼 = 입출력 속도와 CPU 속도 차이를 메우려 "모아서 한 번에" 처리하는 임시 공간.
- `Scanner`의 `nextInt()`는 숫자만 읽고 개행(`\n`)을 버퍼에 남긴다. 직후 `nextLine()`이
  그 `\n`을 읽어 빈 문자열 `""`를 반환 → `Integer.parseInt("")` 예외.
- 해결: `nextInt()` 뒤 `nextLine()`로 버퍼 청소, 또는 처음부터 `nextLine()`만 사용.
- `Scanner`(편하지만 느림) vs `BufferedReader`(빠르지만 직접 파싱, 알고리즘 대회용).
- 출력 버퍼: `println`은 `\n`에서 flush, `print`는 즉시 안 나올 수 있음.

## 위키 반영

- [[java-buffer]] — 버퍼의 원리, nextLine 함정, Scanner vs BufferedReader
