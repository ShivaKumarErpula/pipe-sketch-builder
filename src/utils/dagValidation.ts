
import { Node, Edge } from '@xyflow/react';

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export const validateDAG = (nodes: Node[], edges: Edge[]): ValidationResult => {
  // Check minimum nodes requirement
  if (nodes.length < 2) {
    return {
      isValid: false,
      message: 'Pipeline needs at least 2 nodes to be valid'
    };
  }

  // Check if all nodes are connected
  const connectedNodeIds = new Set<string>();
  edges.forEach(edge => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  const unconnectedNodes = nodes.filter(node => !connectedNodeIds.has(node.id));
  if (unconnectedNodes.length > 0) {
    return {
      isValid: false,
      message: `${unconnectedNodes.length} node(s) are not connected to any edges`
    };
  }

  // Check for cycles using DFS
  const adjacencyList = new Map<string, string[]>();
  nodes.forEach(node => {
    adjacencyList.set(node.id, []);
  });

  edges.forEach(edge => {
    const neighbors = adjacencyList.get(edge.source) || [];
    neighbors.push(edge.target);
    adjacencyList.set(edge.source, neighbors);
  });

  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const hasCycle = (nodeId: string): boolean => {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor)) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  };

  // Check for cycles starting from each unvisited node
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (hasCycle(node.id)) {
        return {
          isValid: false,
          message: 'Pipeline contains cycles - DAG must be acyclic'
        };
      }
    }
  }

  // Check for self-loops
  const selfLoops = edges.filter(edge => edge.source === edge.target);
  if (selfLoops.length > 0) {
    return {
      isValid: false,
      message: 'Self-connections (loops) are not allowed'
    };
  }

  return {
    isValid: true,
    message: 'Pipeline is a valid DAG with proper connections'
  };
};
