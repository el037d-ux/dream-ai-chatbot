ALTER TABLE bot_nodes ADD COLUMN IF NOT EXISTS var_name VARCHAR(100) DEFAULT '';
ALTER TABLE bot_nodes ADD COLUMN IF NOT EXISTS validate BOOLEAN DEFAULT FALSE;
ALTER TABLE bot_nodes ADD COLUMN IF NOT EXISTS error_msg VARCHAR(500) DEFAULT '';
ALTER TABLE bot_nodes ADD COLUMN IF NOT EXISTS extra JSONB DEFAULT '{}';

ALTER TABLE bot_nodes DROP CONSTRAINT IF EXISTS bot_nodes_bot_id_node_id_key;
ALTER TABLE bot_nodes ADD CONSTRAINT bot_nodes_bot_id_node_id_key UNIQUE (bot_id, node_id);

ALTER TABLE bot_edges DROP CONSTRAINT IF EXISTS bot_edges_bot_id_edge_id_key;
ALTER TABLE bot_edges ADD CONSTRAINT bot_edges_bot_id_edge_id_key UNIQUE (bot_id, edge_id);
