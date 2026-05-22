---
type: concept
tags: [java, io, buffer, scanner]
updated: 2026-05-19
sources: ["raw/notes/Java의 버퍼.md"]
---

# 버퍼 (Buffer)

## 한 줄 정의

데이터를 **모아서 한 번에** 처리하려고 두는 임시 저장 공간. 입출력 속도 차이를
메우는 완충재다.

## 왜 필요한가

키보드 입력·네트워크 전송 속도는 CPU 처리 속도에 비해 **느리다**. 한 글자 들어올
때마다 CPU가 처리하면 CPU가 계속 대기해야 해서 비효율적이다.

```
버퍼 없음:  키 H → CPU,  키 e → CPU, ...   (CPU가 매번 대기)
버퍼 있음:  H e l l o \n → 버퍼에 모음 → 엔터 시 "Hello\n" 한 번에 CPU로
```

모았다가 한 번에 넘기면 CPU가 한가한 시간을 줄일 수 있다 — 이게 버퍼의 존재 이유.

## 입력 버퍼와 `Scanner`의 `nextLine()` 함정

`Scanner`는 입력 버퍼에서 읽은 만큼만 소비하고 **나머지는 버퍼에 남긴다.**

```java
// 사용자가 "Hello 123\n" 입력
String str = in.next();      // "Hello" 읽음 → 버퍼: [ 123\n]
int num    = in.nextInt();   // 123 읽음     → 버퍼: [\n]   ← 개행 잔류!
String line = in.nextLine(); // 남은 \n만 읽고 "" 반환     → 버퍼: []
```

`nextInt()`는 숫자만 가져가고 엔터(`\n`)를 버퍼에 남긴다. 바로 뒤의 `nextLine()`은
새 입력을 기다리는 대신 **남아 있던 `\n`을 읽어 빈 문자열 `""`** 을 돌려준다.
그래서 `Integer.parseInt("")`가 `NumberFormatException`을 던진다.

**해결:** `nextInt()` 뒤에 `nextLine()`을 한 번 더 호출해 버퍼를 비우거나,
처음부터 `nextLine()`으로만 읽는다.

## `Scanner` vs `BufferedReader`

|              | `Scanner`         | `BufferedReader`     |
| ------------ | ----------------- | -------------------- |
| 버퍼 크기    | 작음              | 큼 (기본 8192 byte)  |
| 속도         | 느림              | 빠름                 |
| 편의성       | 높음 (`nextInt` 등) | 낮음 (직접 파싱)    |
| 주 사용처    | 일반 코딩         | 알고리즘 대회        |

```java
BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
String line = br.readLine();          // 한 줄 통째로
int num = Integer.parseInt(line);     // 파싱은 직접
```

## 출력 버퍼와 flush

`System.out`도 출력 버퍼에 쌓아 뒀다가 내보낸다.

- `println` — `\n`을 만나면 **flush**(내보냄) → 바로 출력.
- `print` — 버퍼에만 쌓여 즉시 안 보일 수 있음.
- `flush()` — 버퍼에 남은 걸 강제로 내보냄.

## 결론

버퍼는 "모아서 한 번에"의 장치다. 그 대가로 **입력에선 잔류 데이터 문제**(nextLine
함정), **출력에선 flush 타이밍 문제**를 신경 써야 한다.

## 관련 페이지

- [[jvm-memory]] — 버퍼도 결국 메모리 공간
- 출처: [[java-buffer-note]]
