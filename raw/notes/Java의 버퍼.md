### 예시: 이거 왜 이래?

```java
package ch02;

import java.util.Scanner;

public class ScannerDemo {

	public static void main(String[] args) {
		Scanner in = new Scanner(System.in);

		System.out.print("입력 해보쇼: ");
		int input = in.nextInt();
		System.out.printf("입력한 숫자: %d\n\n", input);

		System.out.print("문자열 입력하쇼: ");
		String str = in.nextLine();
		int intInput = Integer.parseInt(str);
		System.out.printf("입력한 문자: %d", intInput);

		System.out.print("1번 입력 실시: ");
		int x = in.nextInt();
		System.out.print("2번 입력 실시: ");
		int y = in.nextInt();
		System.out.printf("네놈이 입력한 %d와 %d의 곱은 %d다.", x, y, x * y);

	}

}
```

```
입력 해보쇼: 2
입력한 숫자: 2

문자열 입력하쇼: Exception in thread "main" java.lang.NumberFormatException: For input string: ""
	at java.base/java.lang.NumberFormatException.forInputString(NumberFormatException.java:67)
	at java.base/java.lang.Integer.parseInt(Integer.java:678)
	at java.base/java.lang.Integer.parseInt(Integer.java:786)
	at sample/ch02.ScannerDemo.main(ScannerDemo.java:16)
```

이 문제가 왜 발생하는지 알아보자.

### 버퍼(Buffer)

버퍼는 데이터를 임시로 저장해두는 메모리 공간이다. 키보드 입력이나 네트워크 전송 속도에 비해 CPU의 처리 속도가 너무 빨라 중간에 임시 저장 공간을 만들어 한 번에 효율적으로 처리하기 위해 필요하다.

**버퍼 O vs 버퍼 X**

- 버퍼 없음 - 키 입력마다 바로 CPU로 전달
  **키보드: H → CPU 처리**
  **키보드: e → CPU 처리**
  **키보드: l → CPU 처리**
  **키보드: l → CPU 처리**
  **키보드: o → CPU 처리 // CPU가 계속 대기해야 함, 비효율적**
- 버퍼 있음 - 모아서 한 번에 전달
  **키보드: H e l l o \n**
  → 버퍼: "Hello\n" → 엔터 치는 순간 CPU로 한 번에 전달 → 훨씬 효율적

**입력 버퍼 - Scanner**

```java
Scanner in = new Scanner(System.in);

// 사용자가 "Hello 123\n" 입력했다고 가정
// 버퍼 상태: [H][e][l][l][o][ ][1][2][3][\n]

String str = in.next();    // "Hello" 읽음
// 버퍼 상태: [ ][1][2][3][\n]  ← 나머지는 그대로 남아있음

int num = in.nextInt();    // 123 읽음
// 버퍼 상태: [\n]  ← \n 아직 남아있음

String line = in.nextLine(); // \n만 읽음 → "" 빈 문자열
// 버퍼 상태: []  ← 이제 비워짐
```

여기서 위의 에시 문제가 발생한다. 앞의 `nextInt()`로 입력값을 읽는 과정에서 숫자만 가져오고 엔터 키로 입력된 개행 문자(\n)는 잔류하게 된다. 이 상태에서 줄 단위로 읽는 `nextLine()`가 호출되면 새 입력을 기다리는 대신 버퍼에 남아있던 빈 문자열(\n)을 그냥 읽어버리는 것이다. 이러면 `str = ""`가 되고, `Integer.parseInt("")`니까 에러가 날 수밖에 없다.

해결 방법으로는 `nextInt()` 다음에 `nextLine()`으로 버퍼를 한 번 청소해주거나, 처음부터 `nextLine()`으로만 읽는 것이 있다.

**빠른 입력 - BufferedReader**

```java
import java.io.*;

BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

String line = br.readLine();  // 한 줄 통째로 읽음
int num = Integer.parseInt(line);
```

**Scanner vs BufferedReader**

|              | `Scanner`         | `BufferedReader`   |
| ------------ | ----------------- | ------------------ |
| 버퍼 크기    | 작음              | 큼 (8192byte 기본) |
| 속도         | 느림              | 빠름               |
| 편의성       | 높음 (nextInt 등) | 낮음 (직접 파싱)   |
| 주로 쓰는 곳 | 일반 코딩         | 알고리즘 대회      |

**출력 버퍼 - System.out**

```java
// println → 출력 버퍼에 쌓았다가 \n 만나면 flush (내보냄)
System.out.println("hello");  // 버퍼에 "hello\n" → \n 만나서 바로 출력

// print → 버퍼에만 쌓고 바로 출력 안 할 수도 있음
System.out.print("hello");    // 버퍼에 "hello" → 안 나올 수도 있음

// flush → 버퍼에 남은 거 강제로 출력
System.out.flush();           // 버퍼 비우면서 강제 출력
```

### 결론

버퍼는 **"모아서 한 번에"** 처리하는 임시 저장소이며, 입력에선 **잔류 데이터 문제**, 출력에선 **flush 타이밍 문제**를 신경써야 한다.
