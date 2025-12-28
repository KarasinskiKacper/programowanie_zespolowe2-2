import { decrement, increment, incrementByAmount } from "@/store/slices/counterSlice";
import { useAppDispatch, useAppSelector } from "@/store/store";


export default function HomePage() {
  const dispatch = useAppDispatch();
  const counter = useAppSelector((state) => state.counter.value);

  return (
	<div className="">
	  <h1>Counter: {counter}</h1>
	  <button onClick={() => dispatch(increment())}>Increment</button>
	  <button onClick={() => dispatch(decrement())}>Decrement</button>
	  <button onClick={() => dispatch(incrementByAmount(5))}>Increment by 5</button>
	</div>
  );
}
