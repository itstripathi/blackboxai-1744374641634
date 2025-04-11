import React, { createContext, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const TaxonomyContext = createContext(null);

export const useTaxonomy = () => {
  const context = useContext(TaxonomyContext);
  if (!context) {
    throw new Error('useTaxonomy must be used within a TaxonomyProvider');
  }
  return context;
};

export const TaxonomyProvider = ({ children }) => {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const { hasPermission } = useAuth();

  const fetchNodes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/taxonomy');
      setNodes(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch taxonomy nodes');
      console.error('Error fetching nodes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addNode = async (nodeData) => {
    try {
      setError(null);
      const response = await axios.post('/api/taxonomy', nodeData);
      await fetchNodes(); // Refresh the tree
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add node');
      throw err;
    }
  };

  const updateNode = async (nodeId, updates) => {
    try {
      setError(null);
      const response = await axios.put(`/api/taxonomy/${nodeId}`, updates);
      await fetchNodes(); // Refresh the tree
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update node');
      throw err;
    }
  };

  const deleteNode = async (nodeId) => {
    try {
      setError(null);
      await axios.delete(`/api/taxonomy/${nodeId}`);
      await fetchNodes(); // Refresh the tree
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete node');
      throw err;
    }
  };

  const moveNode = async (nodeId, newParentId) => {
    try {
      setError(null);
      const response = await axios.put(`/api/taxonomy/${nodeId}/move`, {
        parentId: newParentId
      });
      await fetchNodes(); // Refresh the tree
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to move node');
      throw err;
    }
  };

  const searchNodes = async (query) => {
    try {
      setError(null);
      const response = await axios.get('/api/taxonomy/search', {
        params: { query }
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Search failed');
      throw err;
    }
  };

  const getNodePath = useCallback((nodeId) => {
    const findPath = (nodes, targetId, path = []) => {
      for (const node of nodes) {
        if (node.id === targetId) {
          return [...path, node];
        }
        if (node.children?.length) {
          const childPath = findPath(node.children, targetId, [...path, node]);
          if (childPath) return childPath;
        }
      }
      return null;
    };

    return findPath(nodes, nodeId) || [];
  }, [nodes]);

  const canPerformAction = useCallback((action, node = null) => {
    switch (action) {
      case 'create':
        return hasPermission(['admin', 'node_manager']);
      case 'update':
        return hasPermission(['admin', 'node_manager', 'node_lead']);
      case 'delete':
        return hasPermission(['admin']);
      case 'move':
        return hasPermission(['admin', 'node_manager']);
      default:
        return false;
    }
  }, [hasPermission]);

  const value = {
    nodes,
    loading,
    error,
    selectedNode,
    setSelectedNode,
    fetchNodes,
    addNode,
    updateNode,
    deleteNode,
    moveNode,
    searchNodes,
    getNodePath,
    canPerformAction
  };

  return (
    <TaxonomyContext.Provider value={value}>
      {children}
    </TaxonomyContext.Provider>
  );
};

export default TaxonomyContext;
