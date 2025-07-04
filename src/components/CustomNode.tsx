
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';

export const CustomNode = memo(({ data, selected }: NodeProps) => {
  return (
    <Card className={`
      min-w-[200px] transition-all duration-200 cursor-pointer
      ${selected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}
      bg-white border-2 border-gray-200 hover:border-gray-300
    `}>
      <div className="p-4">
        <div className="flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-3" />
          <span className="font-medium text-gray-900 text-sm">
            {data.label}
          </span>
        </div>
      </div>

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 border-2 border-gray-400 bg-white hover:border-blue-500 hover:bg-blue-100 transition-colors"
        style={{ left: -6 }}
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 border-2 border-gray-400 bg-white hover:border-blue-500 hover:bg-blue-100 transition-colors"
        style={{ right: -6 }}
      />
    </Card>
  );
});

CustomNode.displayName = 'CustomNode';
