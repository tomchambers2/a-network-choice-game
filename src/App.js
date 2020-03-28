import React, { useState, useEffect, useRef } from "react";
import "./App.css";

import { Graph } from "react-d3-graph";
import faker from "faker";

const createRandomProperty = () => Math.floor(Math.random() * 10);

const createNpc = () => ({
  id: faker.name.firstName(),
  sociability: createRandomProperty(),
  likability: createRandomProperty()
});

const username = "You";

function App() {
  const [nodes, setNodes] = useState([
    { id: username },
    createNpc(),
    createNpc()
  ]);
  const [links, setlinks] = useState([
    { source: username, target: nodes[1].id },
    { source: username, target: nodes[2].id }
  ]);

  const addLink = (source, target) => {
    const newLink = {
      source: source,
      target: target
    };
    setlinks(prevLinks => [...prevLinks, newLink]);
  };

  const globalTurn = newLink => {
    if (newLink) addLink(username, newLink);
    setNodes(prevNodes => [...prevNodes, createNpc()]);
    nodes.filter(({ id }) => id !== username).map(npcTurn);
  };

  const npcTurn = node => {
    // link with one other node in the network that is nearby
    // find nearby networks (not implementing yet as nodes don't have locations)
    console.log(node.id, nodes, links);
    const acceptableNodes = nodes.filter(
      ({ id, likability }) =>
        likability > node.sociability &&
        id !== node.id &&
        links.findIndex(
          ({ source, target }) =>
            (source === node.id && target === id) ||
            (target === node.id && source === id)
        ) < 0
    );
    if (!acceptableNodes.length) console.log("no nodes for", node.id);
    if (!acceptableNodes.length) return;
    const chosenNode =
      acceptableNodes[Math.floor(Math.random() * acceptableNodes.length)];
    console.log("add", node.id, "to", chosenNode.id);
    addLink(node.id, chosenNode.id);
  };

  const totalSizeOfNetwork = origin => {
    let processedNodes = [];

    const nextLayer = (acc, nodeId) => {
      const connectionsOfNode = links
        .filter(({ source, target }) => source === nodeId || target === nodeId)
        .map(({ source, target }) => (source === nodeId ? target : source))
        .filter(id => id !== username)
        .filter(id => processedNodes.indexOf(id) < 0);

      processedNodes = [...processedNodes, ...connectionsOfNode];

      if (!connectionsOfNode.length) return acc;
      return connectionsOfNode.reduce(
        nextLayer,
        acc + connectionsOfNode.length
      );
    };

    return nextLayer(0, origin);
  };

  // remove a nodes connections

  useEffect(() => {
    const interval = setInterval(globalTurn, 10000);

    return () => clearInterval(interval.current);
  }, [globalTurn]);

  return (
    <div className="App">
      <p>
        Direct connections:
        {
          links.filter(
            ({ source, target }) => source === username || target === username
          ).length
        }
      </p>
      <p>Total network size: {totalSizeOfNetwork(username)}</p>
      <Graph
        id="graph-id"
        config={{
          d3: {
            // gravity: 100
          }
        }}
        data={{ nodes, links }}
        onClickNode={globalTurn}
      ></Graph>
    </div>
  );
}

export default App;
