import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

import { Graph } from "react-d3-graph";
import faker from "faker";

const createRandomProperty = () => Math.floor(Math.random() * 10);

const createNpc = () => {
  const good = Math.random() > 0.5 ? true : false;
  return {
    id: faker.name.firstName(),
    sociability: createRandomProperty(),
    likability: createRandomProperty(),
    good,
    color: good ? "green" : "red"
  };
};

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
  const [control, setControl] = useState("connect");

  const linksRef = useRef(links);
  const nodesRef = useRef(nodes);

  useEffect(() => {
    nodesRef.current = nodes;
    linksRef.current = links;
  }, [nodes, links]);

  const addLink = (source, target) => {
    const newLink = {
      source: source,
      target: target
    };
    setlinks(prevLinks => {
      const newLinks = [...prevLinks, newLink];
      linksRef.current = newLinks;
      return newLinks;
    });
  };

  const addUserLink = target => {
    if (
      linksRef.current.find(
        ({ source: linkSource, target: linkTarget }) =>
          (linkSource === username && linkTarget === target) ||
          (linkTarget === username && linkSource === target)
      )
    )
      return;
    addLink(username, target);
  };

  const globalTurn = newLink => {
    if (newLink) addLink(username, newLink);
    if (nodesRef.current.length <= 30)
      setNodes(prevNodes => {
        const newNodes = [...prevNodes, createNpc()];
        nodesRef.current = newNodes;
        return newNodes;
      });
    nodesRef.current.filter(({ id }) => id !== username).map(npcTurn);
  };

  const memoizedGlobalTurn = useCallback(() => globalTurn(), [nodes]);

  const npcTurn = node => {
    // link with one other node in the network that is nearby
    // find nearby networks (not implementing yet as nodes don't have locations)
    const acceptableNodes = nodesRef.current.filter(
      ({ id, likability }) =>
        likability > node.sociability &&
        id !== node.id &&
        linksRef.current.findIndex(
          ({ source, target }) =>
            (source === node.id && target === id) ||
            (target === node.id && source === id)
        ) < 0
    );

    if (!acceptableNodes.length) return;
    const chosenNode =
      acceptableNodes[Math.floor(Math.random() * acceptableNodes.length)];
    addLink(node.id, chosenNode.id);
  };

  const totalSizeOfNetwork = (origin, customFilter) => {
    let processedNodes = [];

    const nextLayer = (acc, nodeId) => {
      const connectionsOfNode = links
        .filter(({ source, target }) => source === nodeId || target === nodeId)
        .map(({ source, target }) => (source === nodeId ? target : source))
        .filter(id => id !== username)
        .filter(id => processedNodes.indexOf(id) < 0);

      const customFilteredConnections = customFilter
        ? connectionsOfNode
            .map(nodeId => nodes.find(({ id }) => id === nodeId))
            .filter(customFilter)
            .map(node => node.id)
        : connectionsOfNode;

      processedNodes = [...processedNodes, ...connectionsOfNode];

      if (!connectionsOfNode.length) return acc;
      return connectionsOfNode.reduce(
        nextLayer,
        acc + customFilteredConnections.length
      );
    };

    return nextLayer(0, origin);
  };

  const removeNodeConnections = node => {
    const newLinks = linksRef.current.filter(
      ({ source, target }) => !(source === node || target === node)
    );
    linksRef.current = newLinks;
    setlinks(newLinks);
  };

  useEffect(() => {
    const interval = setInterval(memoizedGlobalTurn, 10000);

    return () => clearInterval(interval);
  }, []);

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
      <p>
        Good nodes in your network:{" "}
        {totalSizeOfNetwork(username, node => node.good)}
      </p>
      <p>
        Evil nodes in your network:{" "}
        {totalSizeOfNetwork(username, node => !node.good)}
      </p>
      <div className="Controls">
        <div
          className={`Connect ${control === "connect" && "active"}`}
          onClick={() => setControl("connect")}
        >
          CONNECT
        </div>{" "}
        <div
          className={`Destroy ${control === "destroy" && "active"}`}
          onClick={() => setControl("destroy")}
        >
          DESTROY
        </div>
      </div>
      <Graph
        id="graph-id"
        config={{
          d3: {
            // gravity: 100
          }
        }}
        data={{ nodes, links }}
        // onClickNode={memoizedGlobalTurn}
        onClickNode={
          control === "connect" ? addUserLink : removeNodeConnections
        }
      ></Graph>
    </div>
  );
}

export default App;
