import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const TaxonomyNode = ({ node, onDrop }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'NODE',
    item: { id: node.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'NODE',
    drop: (item) => onDrop(item.id, node.id),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`p-2 border rounded mb-2 ${isDragging ? 'opacity-50' : ''} ${
        isOver ? 'bg-blue-100' : 'bg-white'
      }`}
    >
      <div className="flex items-center justify-between">
        <span>{node.name}</span>
        <div className="flex space-x-2">
          <button className="text-blue-500 hover:text-blue-700">
            <i className="fas fa-edit"></i>
          </button>
          <button className="text-red-500 hover:text-red-700">
            <i className="fas fa-trash"></i>
          </button>
          <button className="text-green-500 hover:text-green-700">
            <i className="fas fa-plus"></i>
          </button>
        </div>
      </div>
      {node.children && node.children.length > 0 && (
        <div className="ml-4 mt-2">
          {node.children.map((child) => (
            <TaxonomyNode key={child.id} node={child} onDrop={onDrop} />
          ))}
        </div>
      )}
    </div>
  );
};

function TaxonomyTree() {
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    // Fetch nodes from API
    fetchNodes();
  }, []);

  const fetchNodes = async () => {
    try {
      const response = await fetch('/api/taxonomy');
      const data = await response.json();
      setNodes(data);
    } catch (error) {
      console.error('Error fetching nodes:', error);
    }
  };

  const handleDrop = async (draggedId, targetId) => {
    try {
      await fetch(`/api/taxonomy/${draggedId}/move`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parentId: targetId }),
      });
      fetchNodes(); // Refresh the tree
    } catch (error) {
      console.error('Error moving node:', error);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4">
        <div className="flex justify-between mb-4">
          <input
            type="text"
            placeholder="Search terms..."
            className="p-2 border rounded"
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Add New Term Type
          </button>
        </div>
        <div className="taxonomy-tree">
          {nodes.map((node) => (
            <TaxonomyNode key={node.id} node={node} onDrop={handleDrop} />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}

export default TaxonomyTree;
