### 쇼트 서킷(Short Circuit)이 뭐임?

논리 AND/OR 연산이나 조건 연산에서, 경우에 따라 앞의 코드만 실행하고 뒤의 코드는 무시하는 현상을 말한다.

AND의 경우에 앞의 조건이 false이면 뒤의 조건을 계산하지 않고, OR는 앞의 조건이 true이면 마찬가지로 뒤의 조건을 계산하지 않는다.

### cf. 이게 되면 참 좋은데…

보통 쇼트 서킷을 활용하는 사례로 조건문을 간결하게 바꾸는 방법이 있다.

```java
// if문 사용
int i = 0
if (i == 0) {} else {
	System.out.println(5 / i);
}

// Short Circuit 활용
// 앞의 값이 false이므로 뒤의 println은 무시되니까
// / by zero 에러도 발생하지 않으면서 잘 실행될 것 같은데...
int i = 0;
i != 0 && System.out.println(5 / i);
```

그런데 이대로 실행하면 에러가 난다.

```bash
The operator && is undefined for the argument type(s) int, void
```

그래서 찾아보니, Java와 JS의 반환값 처리 방식의 차이 때문이었다.

JS의 경우, `console.log()`의 반환값이 undefined이다.(undefined는 내부적으로 falsy로 처리된다고 한다) 어쨌든 뭐라도 반환하기 때문에 아래와 같이 작성할 수 있다.

```jsx
let i = 0;
i != 0 && console.log(5 / i); // 아무 동작도 안 함.
```

하지만 Java의 `System.out.println()` 메서드는 반환값이 void이기 때문에 `&&` 연산자와 함께 쓸 수 없는 것이다. 결국 Java에서는 boolean을 반환하는 `printMsg()`같은 메서드를 이용해야 하는데, 이럴 바에는 차라리 그냥 if문을 사용하는 게 나은 것 같다.
