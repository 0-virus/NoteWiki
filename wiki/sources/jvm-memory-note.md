---
type: source
tags: [java, jvm, memory]
updated: 2026-05-19
sources: ["raw/notes/JVM의 메모리 할당.md"]
---

# 소스: JVM의 메모리 할당

> 원본: `raw/notes/JVM의 메모리 할당.md` — 직접 작성 필기(노션 이전분).
> `StaticInstanceVarDemo` 예제 코드를 9단계로 추적하며 메모리 흐름을 정리한 노트.

## 맥락 (왜 기록했나)

부트캠프 Java 학습 중 정리한 **실무 대비 자산**. 영균은 이 노트들을 "독립된 Java
기본기"로 본다 — WAS 학습의 부속이 아니라, Java 언어 자체를 단단히 다지는 가지.

## 핵심 요약

- JVM 메모리는 **Method Area**(클래스 메타·바이트코드·static), **Heap**(`new` 객체·
  인스턴스 변수), **Stack**(메서드 프레임·지역변수·참조변수)으로 나뉜다.
- static 변수 초기화는 **클래스 로딩 시점**(main 실행 전)에 일어난다.
- 메서드 바이트코드는 static이든 instance든 Method Area에 **1벌만** 존재.
- 인스턴스 메서드는 Stack 프레임의 `this`로 각자 다른 Heap 객체를 참조 → 같은
  코드가 객체별로 다르게 동작.

## 위키 반영

- [[jvm-memory]] — 3대 영역과 객체 하나의 메모리 흐름
- [[static-keyword]] — Method Area에 사는 클래스 멤버 (같은 예제 공유)
