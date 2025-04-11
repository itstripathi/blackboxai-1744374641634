import React, { useEffect, useState } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTaxonomy } from '../contexts/TaxonomyContext';
import { useAuth } from '../contexts/AuthContext';

const TaxonomyNode = ({ node, level, onNodeSelect }) => {
  const { canPerformAction, moveNode, selectedNode } = useTaxonomy();
  const [isExpanded, setIsExpanded] = useState(false);

  const [{ isDragging }, drag] = useDrag({
    type: 'NODE',
    item: { id: node.id },
    canDrag: () => canPerformAction('move'),
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'NODE',
    drop: (item) => {
      if (item.id !== node.id) {
        moveNode(item.id, node.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedNode?.id === node.id;

  return (
    <div ref={drop} className="select-none">
      <div
        ref={drag}
        className={`flex items-center p-2 hover:bg-gray-50 cursor-pointer ${
          isSelected ? 'bg-primary-50 border-l-4 border-primary-500' : 'border-l-4 border-transparent'
        } ${isOver ? 'border-2 border-primary-500' : ''} ${
          isDragging ? 'opacity-50' : ''
        }`}
        style={{ marginLeft: `${level * 1.5}rem` }}
      >
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-6 text-gray-500 hover:text-gray-700"
          >
            <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'}`}></i>
          </button>
        )}
        {!hasChildren && <span className="w-6"></span>}
        <div
          onClick={() => onNodeSelect(node)}
          className="flex-1 flex items-center ml-2"
        >
          <span className="text-gray-900">{node.name}</span>
        </div>
      </div>
      {isExpanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TaxonomyNode
              key={child.id}
              node={child}
              level={level + 1}
              onNodeSelect={onNodeSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const NodeActions = () => {
  const { selectedNode, addNode, updateNode, deleteNode, canPerformAction } = useTaxonomy();
  const [isEditing, setIsEditing] = useState(false);
  const [nodeName, setNodeName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');

  useEffect(() => {
    if (selectedNode) {
      setNodeName(selectedNode.name);
    }
  }, [selectedNode]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateNode(selectedNode.id, { name: nodeName });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update node:', error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await addNode({
        name: newNodeName,
        parentId: selectedNode ? selectedNode.id : null
      });
      setIsAdding(false);
      setNewNodeName('');
    } catch (error) {
      console.error('Failed to add node:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      try {
        await deleteNode(selectedNode.id);
      } catch (error) {
        console.error('Failed to delete node:', error);
      }
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-lg font-serif font-bold text-gray-900 mb-4">
        {selectedNode ? 'Node Actions' : 'Taxonomy Actions'}
      </h2>

      {/* Add Node Form */}
      {canPerformAction('create') && (
        <div className="mb-6">
          {isAdding ? (
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  New Node Name
                </label>
                <input
                  type="text"
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  required
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Node
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setNewNodeName('');
                  }}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
                >
                  <i className="fas fa-times mr-2"></i>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 transform hover:scale-[1.02]"
            >
              <i className="fas fa-plus mr-2"></i>
              Add New Node
            </button>
          )}
        </div>
      )}

      {/* Selected Node Actions */}
      {selectedNode && (
        <div className="space-y-4">
          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Node Name
                </label>
                <input
                  type="text"
                  value={nodeName}
                  onChange={(e) => setNodeName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  required
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <i className="fas fa-save mr-2"></i>
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setNodeName(selectedNode.name);
                  }}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
                >
                  <i className="fas fa-times mr-2"></i>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Selected Node:</span>
                <span className="ml-2 text-gray-900">{selectedNode.name}</span>
              </div>
              <div className="flex space-x-2">
                {canPerformAction('update') && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    <i className="fas fa-edit mr-2"></i>
                    Edit
                  </button>
                )}
                {canPerformAction('delete') && (
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    <i className="fas fa-trash-alt mr-2"></i>
                    Delete
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TaxonomyTree = () => {
  const { nodes, fetchNodes, setSelectedNode } = useTaxonomy();

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-6">
          <i className="fas fa-sitemap text-primary-600 mr-2"></i>
          Taxonomy Hierarchy
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Node Actions Panel */}
          <div className="md:col-span-1">
            <NodeActions />
          </div>

          {/* Tree View */}
          <div className="md:col-span-2">
            <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
              <div className="space-y-2">
                {nodes.map((node) => (
                  <TaxonomyNode
                    key={node.id}
                    node={node}
                    level={0}
                    onNodeSelect={setSelectedNode}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default TaxonomyTree;
