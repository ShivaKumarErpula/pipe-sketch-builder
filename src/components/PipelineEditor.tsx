
import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  ConnectionMode,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, Trash2, RotateCcw, Layout, CheckCircle, XCircle } from 'lucide-react';
import dagre from 'dagre';
import { CustomNode } from './CustomNode';
import { validateDAG } from '../utils/dagValidation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const nodeTypes = {
  custom: CustomNode,
};

const PipelineEditorContent = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isValid, setIsValid] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [showAddNodeDialog, setShowAddNodeDialog] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');
  const reactFlowInstance = useReactFlow();
  const nodeIdCounter = useRef(1);

  // Validate DAG whenever nodes or edges change
  useEffect(() => {
    const validation = validateDAG(nodes, edges);
    setIsValid(validation.isValid);
    setValidationMessage(validation.message);
  }, [nodes, edges]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const selectedNodes = nodes.filter(node => node.selected);
        const selectedEdges = edges.filter(edge => edge.selected);
        
        if (selectedNodes.length > 0) {
          setNodes(nodes => nodes.filter(node => !node.selected));
          setEdges(edges => edges.filter(edge => 
            !selectedNodes.some(node => edge.source === node.id || edge.target === node.id)
          ));
          toast.success(`Deleted ${selectedNodes.length} node(s)`);
        }
        
        if (selectedEdges.length > 0) {
          setEdges(edges => edges.filter(edge => !edge.selected));
          toast.success(`Deleted ${selectedEdges.length} edge(s)`);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      // Validate connection rules
      if (params.source === params.target) {
        toast.error('Self-connections are not allowed');
        return;
      }

      // Check if connection already exists
      const existingEdge = edges.find(
        edge => edge.source === params.source && edge.target === params.target
      );
      if (existingEdge) {
        toast.error('Connection already exists');
        return;
      }

      const newEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}`,
        type: 'default',
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
        markerEnd: { type: 'arrowclosed' as const, color: '#6366f1' },
      };

      setEdges(eds => addEdge(newEdge, eds));
      toast.success('Connection created');
    },
    [edges, setEdges]
  );

  const addNode = () => {
    if (!newNodeName.trim()) {
      toast.error('Node name cannot be empty');
      return;
    }

    const newNode: Node = {
      id: `node-${nodeIdCounter.current}`,
      type: 'custom',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: { label: newNodeName.trim() },
    };

    setNodes(nodes => [...nodes, newNode]);
    nodeIdCounter.current += 1;
    setNewNodeName('');
    setShowAddNodeDialog(false);
    toast.success(`Node "${newNodeName}" added`);
  };

  const autoLayout = () => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'TB', nodesep: 100, ranksep: 100 });

    nodes.forEach(node => {
      dagreGraph.setNode(node.id, { width: 200, height: 80 });
    });

    edges.forEach(edge => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map(node => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 100,
          y: nodeWithPosition.y - 40,
        },
      };
    });

    setNodes(layoutedNodes);
    
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2 });
    }, 100);
    
    toast.success('Layout applied');
  };

  const clearAll = () => {
    setNodes([]);
    setEdges([]);
    nodeIdCounter.current = 1;
    toast.success('Pipeline cleared');
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pipeline Editor</h1>
            <p className="text-sm text-gray-600">Build and manage your data processing workflows</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Validation Status */}
            <div className="flex items-center gap-2">
              {isValid ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <Badge variant={isValid ? "default" : "destructive"}>
                {isValid ? "Valid DAG" : "Invalid DAG"}
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => setShowAddNodeDialog(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Node
              </Button>
              <Button
                onClick={autoLayout}
                variant="outline"
                size="sm"
                disabled={nodes.length < 2}
              >
                <Layout className="w-4 h-4 mr-2" />
                Auto Layout
              </Button>
              <Button
                onClick={clearAll}
                variant="outline"
                size="sm"
                disabled={nodes.length === 0}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          className="bg-gradient-to-br from-slate-50 to-blue-50"
        >
          <Controls className="bg-white shadow-lg border rounded-lg" />
          <Background color="#e2e8f0" gap={20} />
        </ReactFlow>

        {/* Validation Panel */}
        <div className="absolute top-4 left-4 z-10">
          <Card className="w-80 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isValid ? 'bg-green-500' : 'bg-red-500'}`} />
                DAG Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">{validationMessage}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Nodes:</span>
                  <span className="font-medium">{nodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Edges:</span>
                  <span className="font-medium">{edges.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Card className="w-96 shadow-xl">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                    <Plus className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Get Started</h3>
                  <p className="text-gray-600">
                    Click "Add Node" to create your first pipeline node, then connect them to build your workflow.
                  </p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>• Drag nodes to reposition</p>
                    <p>• Connect nodes by dragging from handles</p>
                    <p>• Press Delete to remove selected items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Add Node Dialog */}
      {showAddNodeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Add New Node</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nodeName">Node Name</Label>
                <Input
                  id="nodeName"
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  placeholder="Enter node name..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addNode();
                    if (e.key === 'Escape') setShowAddNodeDialog(false);
                  }}
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddNodeDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={addNode}>
                  Add Node
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export const PipelineEditor = () => {
  return (
    <ReactFlowProvider>
      <PipelineEditorContent />
    </ReactFlowProvider>
  );
};
