import React, { useState } from "react";
import "./App.css";

import { Sigma, RandomizeNodePositions, RelativeSize } from "react-sigma";
import faker from "faker";

function App() {
  const [nodes, setNodes] = useState([
    { id: "n1", label: "You", x: 5, y: 0, size: 20 },
    { id: "n2", label: faker.name.firstName(), x: 5, y: 0, size: 20 },
    { id: "n3", label: faker.name.firstName(), x: 5, y: 0, size: 20 }
  ]);
  const [edges, setEdges] = useState([]);

  const [counter, setCounter] = useState(10);

  const addEdge = (edges, target) => {
    console.log({ counter });
    const edgesCopy = [...edges];
    console.log({ edges });
    const newEdge = {
      id: `e${edges.length + 1}`,
      source: "n1",
      target: target
    };
    console.log(newEdge);
    edgesCopy.push(newEdge);
    setEdges([...edgesCopy]);
  };

  console.log({ edges });

  return (
    <div className="App">
      {counter}
      <button onClick={() => setCounter(counter + 1)}>hit me</button>
      <Sigma
        style={{
          width: "700px",
          height: "700px",
          border: "10px solid black",
          position: "relative"
        }}
        graph={{ nodes, edges }}
        settings={{ drawEdges: true, clone: false }}
        onClickNode={({
          data: {
            node: { id }
          }
        }) => {
          console.log("counter", counter);
          addEdge(edges, id);
        }}
      >
        <RandomizeNodePositions />
      </Sigma>
    </div>
  );
}

export default App;
