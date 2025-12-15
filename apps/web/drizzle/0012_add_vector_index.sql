-- Add HNSW index for efficient vector similarity search on knowledge table
-- This significantly improves search performance for embeddings

-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create HNSW index for cosine distance operations on knowledge embeddings
-- HNSW (Hierarchical Navigable Small World) is optimal for high-dimensional vector search
-- m=16 is a good default for the number of connections per layer
-- ef_construction=64 balances index build time and search quality
CREATE INDEX IF NOT EXISTS knowledge_embedding_idx 
ON knowledge 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Add index on chatbotId for faster filtering
CREATE INDEX IF NOT EXISTS knowledge_chatbot_id_idx 
ON knowledge (chatbot_id);

-- Add composite index for common query pattern
CREATE INDEX IF NOT EXISTS knowledge_chatbot_source_idx 
ON knowledge (chatbot_id, source);
