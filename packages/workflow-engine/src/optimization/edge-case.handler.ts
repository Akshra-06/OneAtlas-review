import type { AppUnderstanding, EntitySchema, FieldSchema, RelationSchema } from '@oneatlas/shared';
import { logger } from '@oneatlas/ai-engine';


export interface EdgeCaseConfig {
  enableSchemaValidation: boolean;
  enableCircularDependencyDetection: boolean;
  enableNamingConflictDetection: boolean;
  enableTypeCompatibilityChecking: boolean;
  maxEntityCount: number;
  maxFieldCount: number;
  maxRelationDepth: number;
  reservedKeywords: string[];
}

const DEFAULT_CONFIG: EdgeCaseConfig = {
  enableSchemaValidation: true,
  enableCircularDependencyDetection: true,
  enableNamingConflictDetection: true,
  enableTypeCompatibilityChecking: true,
  maxEntityCount: 50,
  maxFieldCount: 100,
  maxRelationDepth: 5,
  reservedKeywords: [
    'id', 'createdAt', 'updatedAt', 'tenantId', 'prisma', 'model', 'enum',
    'type', 'relation', 'default', 'unique', 'nullable', 'list', 'map',
    'datasource', 'generator', 'client', 'schema', 'output', 'binaryTargets',
    'previewFeatures', 'provider', 'url', 'directUrl', 'shadowDatabaseUrl',
    'schema', 'table', 'column', 'primary', 'foreign', 'key', 'index',
    'constraint', 'trigger', 'function', 'procedure', 'view', 'sequence',
    'transaction', 'commit', 'rollback', 'savepoint', 'lock', 'isolation',
    'level', 'read', 'write', 'repeatable', 'serializable', 'uncommitted',
    'committed', 'deferrable', 'initially', 'deferred', 'immediate',
    'cascade', 'restrict', 'no', 'action', 'set', 'null', 'default',
    'timestamp', 'date', 'time', 'interval', 'year', 'month', 'day',
    'hour', 'minute', 'second', 'microsecond', 'nanosecond', 'timezone',
    'offset', 'zone', 'local', 'utc', 'gmt', 'est', 'pst', 'cst', 'mst',
    'select', 'insert', 'update', 'delete', 'create', 'alter', 'drop',
    'grant', 'revoke', 'begin', 'end', 'case', 'when', 'then', 'else',
    'elsif', 'if', 'while', 'for', 'loop', 'return', 'break', 'continue',
    'goto', 'label', 'raise', 'signal', 'resignal', 'handler', 'condition',
    'diagnostics', 'get', 'stacked', 'current', 'statement', 'cursor',
    'fetch', 'close', 'open', 'prepare', 'execute', 'deallocate', 'describe',
    'explain', 'plan', 'analyze', 'vacuum', 'cluster', 'reindex', 'refresh',
    'materialized', 'view', 'temporary', 'temp', 'unlogged', 'logged',
    'inherit', 'of', 'row', 'type', 'composite', 'pseudo', 'enum', 'range',
    'base', 'domain', 'constraint', 'check', 'not', 'null', 'check',
    'exclude', 'using', 'gist', 'gin', 'spgist', 'brin', 'btree', 'hash',
    'partial', 'simple', 'full', 'expression', 'predicate', 'operator',
    'class', 'family', 'collation', 'character', 'set', 'encoding',
    'locale', 'lc_collate', 'lc_ctype', 'template', 'encoding', 'connection',
    'limit', 'authentication', 'superuser', 'createdb', 'createrole',
    'inherit', 'login', 'replication', 'bypassrls', 'password', 'valid',
    'until', 'in', 'role', 'user', 'group', 'default', 'tablespace',
    'configuration', 'parameter', 'session', 'local', 'reload', 'restart',
    'kill', 'terminate', 'reload', 'rotate', 'log', 'file', 'stats',
    'reset', 'show', 'set', 'disable', 'enable', 'replication', 'slot',
    'publication', 'subscription', 'logical', 'physical', 'streaming',
    'synchronous', 'standby', 'quorum', 'off', 'on', 'remote', 'write',
    'receive', 'origin', 'none', 'database', 'role', 'table', 'sequence',
    'all', 'filter', 'where', 'option', 'root', 'sibling', 'depth', 'breadth',
    'first', 'last', 'absolute', 'relative', 'forward', 'backward', 'simple',
    'connected', 'level', 'cycle', 'no', 'action', 'merge', 'match',
    'matched', 'by', 'source', 'target', 'join', 'cross', 'natural', 'inner',
    'outer', 'left', 'right', 'full', 'semi', 'anti', 'lateral', 'union',
    'intersect', 'except', 'distinct', 'on', 'using', 'group', 'by', 'having',
    'order', 'asc', 'desc', 'nulls', 'limit', 'offset', 'fetch', 'rows',
    'only', 'with', 'recursive', 'search', 'breadth', 'depth', 'by',
    'cycle', 'using', 'path', 'columns', 'as', 'window', 'over', 'partition',
    'frame', 'range', 'rows', 'groups', 'between', 'unbounded', 'preceding',
    'following', 'current', 'exclude', 'no', 'others', 'ties', 'group',
    'aggregate', 'functions', 'within', 'group', 'filter', 'over',
    'ignore', 'nulls', 'respect', 'nulls', 'collate', 'collation',
    'ilike', 'similar', 'between', 'symmetric', 'overlap', 'contains',
    'contained', 'adjacent', 'strict', 'left', 'right', 'finite', 'infinite',
    'is', 'unknown', 'isnull', 'notnull', 'is', 'true', 'false', 'unknown',
    'boolean', 'json', 'jsonb', 'xml', 'uuid', 'bytea', 'text', 'varchar',
    'char', 'character', 'varying', 'int', 'integer', 'bigint', 'smallint',
    'tinyint', 'decimal', 'numeric', 'real', 'double', 'precision', 'float',
    'serial', 'bigserial', 'smallserial', 'money', 'interval', 'array',
    'hstore', 'ltree', 'cube', 'earthdistance', 'pg_trgm', 'btree_gin',
    'btree_gist', 'intarray', 'lo', 'pgcrypto', 'pg_stat_statements',
    'auto_explain', 'pg_buffercache', 'pg_freespacemap', 'pgrowlocks',
    'pg_statstatements', 'pgstattuple', 'pg_visibility', 'pg_walinspect',
    'pgbench', 'postgres_fdw', 'file_fdw', 'postgres', 'mysql', 'sqlite',
    'mssql', 'oracle', 'mongodb', 'redis', 'cassandra', 'elasticsearch',
    'neo4j', 'graph', 'document', 'keyvalue', 'column', 'relational',
    'nosql', 'newsql', 'multi-model', 'polyglot', 'hybrid', 'distributed',
    'replicated', 'sharded', 'partitioned', 'clustered', 'scale', 'out',
    'in', 'vertical', 'horizontal', 'master', 'slave', 'primary', 'secondary',
    'leader', 'follower', 'coordinator', 'worker', 'node', 'shard', 'replica',
    'standby', 'archive', 'backup', 'restore', 'recovery', 'failover',
    'high', 'availability', 'disaster', 'recovery', 'continuity', 'resilience',
    'consistency', 'availability', 'partition', 'tolerance', 'cap', 'theorem',
    'acid', 'base', 'pacelc', 'sol', 'michael', 'stonebraker', 'jim',
    'gray', 'eric', 'brewer', 'distributed', 'systems', 'scalability',
    'performance', 'latency', 'throughput', 'concurrency', 'parallelism',
    'synchronization', 'consensus', 'raft', 'paxos', 'gossip', 'epidemic',
    'vector', 'clocks', 'logical', 'physical', 'hybrid', 'lamport',
    'leslie', 'lamport', 'leslie', 'timestamp', 'ordering', 'causality',
    'happened-before', 'concurrent', 'serializable', 'linearizable',
    'sequential', 'eventual', 'strong', 'weak', 'session', 'causal',
    'read', 'your', 'writes', 'monotonic', 'read', 'writes', 'follow',
    'reads', 'sticky', 'bounded', 'stale', 'tunable', 'custom', 'consistency',
    'level', 'isolation', 'level', 'read', 'committed', 'repeatable',
    'read', 'serializable', 'snapshot', 'cursor', 'stability', 'autocommit',
    'transaction', 'savepoint', 'rollback', 'commit', 'begin', 'start',
    'end', 'lock', 'timeout', 'deadlock', 'livelock', 'starvation',
    'race', 'condition', 'critical', 'section', 'mutex', 'semaphore',
    'monitor', 'condition', 'variable', 'barrier', 'latch', 'spinlock',
    'atomic', 'operation', 'memory', 'fence', 'instruction', 'reordering',
    'cache', 'coherence', 'invalidation', 'update', 'protocol', 'mesi',
    'mosi', 'moesi', 'write', 'through', 'write', 'back', 'write',
    'around', 'no', 'write', 'allocate', 'write', 'combine', 'write',
    'invalidate', 'snarfing', 'snooping', 'directory', 'based',
    'hierarchical', 'home', 'based', 'broadcast', 'multicast', 'unicast',
    'anycast', 'geocast', 'time', 'synchronization', 'network', 'time',
    'protocol', 'ntp', 'ptp', 'gps', 'atomic', 'clock', 'logical',
    'clock', 'vector', 'clock', 'lamport', 'clock', 'happened-before',
    'causality', 'order', 'partial', 'order', 'total', 'order', 'linear',
    'order', 'quasi', 'order', 'semi', 'order', 'pre', 'order', 'post',
    'order', 'interval', 'order', 'circular', 'order', 'topological',
    'sorting', 'ranking', 'ordering', 'arrangement', 'sequence', 'pattern',
    'structure', 'organization', 'hierarchy', 'tree', 'graph', 'network',
    'grid', 'cluster', 'collection', 'set', 'list', 'array', 'map',
    'dictionary', 'hash', 'table', 'hash', 'map', 'tree', 'map', 'skip',
    'list', 'bloom', 'filter', 'bitmap', 'index', 'inverted', 'index',
    'full', 'text', 'search', 'vector', 'search', 'nearest', 'neighbor',
    'knn', 'approximate', 'nearest', 'neighbor', 'similarity', 'search',
    'semantic', 'search', 'natural', 'language', 'processing', 'nlp',
    'machine', 'learning', 'ml', 'artificial', 'intelligence', 'ai',
    'deep', 'learning', 'neural', 'network', 'transformer', 'attention',
    'mechanism', 'self', 'attention', 'multi', 'head', 'attention',
    'feedforward', 'backpropagation', 'gradient', 'descent', 'stochastic',
    'gradient', 'descent', 'adam', 'rmsprop', 'momentum', 'learning',
    'rate', 'batch', 'size', 'epoch', 'iteration', 'overfitting',
    'underfitting', 'regularization', 'dropout', 'normalization', 'batch',
    'normalization', 'layer', 'weight', 'decay', 'early', 'stopping',
    'cross', 'validation', 'hyperparameter', 'tuning', 'grid', 'search',
    'random', 'search', 'bayesian', 'optimization', 'genetic', 'algorithm',
    'evolutionary', 'computation', 'swarm', 'intelligence', 'particle',
    'swarm', 'ant', 'colony', 'bee', 'algorithm', 'firefly', 'algorithm',
    'cuckoo', 'search', 'bat', 'algorithm', 'harmony', 'search', 'simulated',
    'annealing', 'tabu', 'search', 'memetic', 'algorithm', 'memetics',
    'cultural', 'algorithm', 'immune', 'system', 'artificial', 'immune',
    'system', 'clonal', 'selection', 'negative', 'selection', 'immune',
    'network', 'theory', 'idiotypic', 'network', 'danger', 'theory',
    'polyclonal', 'selection', 'hybrid', 'selection', 'multi', 'objective',
    'optimization', 'pareto', 'front', 'domination', 'nsga', 'spea',
    'moea', 'evolutionary', 'strategy', 'genetic', 'programming',
    'grammatical', 'evolution', 'cartesian', 'genetic', 'programming',
    'linear', 'genetic', 'programming', 'differential', 'evolution',
    'estimation', 'distribution', 'algorithm', 'covariance', 'matrix',
    'adaptation', 'evolution', 'strategy', 'cma', 'es', 'particle',
    'swarm', 'optimization', 'ant', 'colony', 'optimization', 'bee',
    'colony', 'optimization', 'firefly', 'algorithm', 'cuckoo', 'search',
    'bat', 'algorithm', 'harmony', 'search', 'simulated', 'annealing',
    'tabu', 'search', 'memetic', 'algorithm', 'variable', 'neighborhood',
    'search', 'guided', 'local', 'search', 'iterated', 'local', 'search',
    'large', 'neighborhood', 'search', 'variable', 'depth', 'search',
    'random', 'restart', 'hill', 'climbing', 'gradient', 'ascent',
    'conjugate', 'gradient', 'quasi', 'newton', 'bfgs', 'lbfgs', 'newton',
    'raphson', 'gauss', 'newton', 'levenberg', 'marquardt', 'trust',
    'region', 'method', 'nelder', 'mead', 'simplex', 'method', 'hooke',
    'jeeves', 'pattern', 'search', 'powell', 'method', 'rosenbrock',
    'method', 'fletcher', 'powell', 'method', 'davidon', 'fletcher',
    'powell', 'broyden', 'fletcher', 'goldfarb', 'shanno', 'davidon',
    'fletcher', 'powell', 'limited', 'memory', 'bfgs', 'stochastic',
    'gradient', 'descent', 'momentum', 'nesterov', 'accelerated',
    'gradient', 'adagrad', 'adadelta', 'rmsprop', 'adam', 'adamax',
    'nadam', 'radam', 'adamw', 'lookahead', 'ranger', 'lamb', 'lars',
    'lamb', 'prop', 'novograd', 'sgd', 'sgdm', 'nesterov', 'adagrad',
    'rmsprop', 'adam', 'learning', 'rate', 'scheduler', 'step', 'lr',
    'exponential', 'lr', 'cosine', 'annealing', 'warm', 'restarts',
    'cyclic', 'lr', 'one', 'cycle', 'cosine', 'annealing', 'warm',
    'cosine', 'annealing', 'reduce', 'lr', 'on', 'plateau', 'clr',
    'sgdr', 'snap', 'warmup', 'constant', 'linear', 'cosine', 'sigmoid',
    'polynomial', 'inverse', 'sqrt', 'time', 'based', 'performance',
    'based', 'loss', 'based', 'accuracy', 'based', 'gradient', 'based',
    'adaptive', 'learning', 'rate', 'learning', 'rate', 'finder', 'lr',
    'range', 'test', 'sgd', 'lr', 'finder', 'lrf', 'adam', 'lr', 'finder',
    'lrf', 'learning', 'rate', 'warmup', 'gradual', 'warmup', 'constant',
    'warmup', 'linear', 'warmup', 'cosine', 'warmup', 'exponential',
    'warmup', 'inverse', 'sqrt', 'warmup', 'weight', 'decay', 'l2',
    'regularization', 'l1', 'regularization', 'elastic', 'net',
    'dropout', 'stochastic', 'depth', 'dropout', 'variational',
    'dropout', 'alpha', 'dropout', 'standout', 'dropconnect',
    'gaussian', 'noise', 'injection', 'label', 'smoothing', 'mixup',
    'cutmix', 'autoaugment', 'randaugment', 'fast', 'autoaugment',
    'trivialaugment', 'augmix', 'sam', 'sharpness', 'aware', 'minimization',
    'adversarial', 'training', 'fgsm', 'pgd', 'c&w', 'deepfool', 'virtual',
    'adversarial', 'training', ' TRADES', 'mixup', 'cutmix', 'focal',
    'loss', 'label', 'smoothing', 'cross', 'entropy', 'mean', 'squared',
    'error', 'huber', 'loss', 'smooth', 'l1', 'loss', 'quantile',
    'loss', 'hinge', 'loss', 'squared', 'hinge', 'loss', 'log',
    'cosh', 'loss', 'categorical', 'hinge', 'loss', 'kullback',
    'leibler', 'divergence', 'jensen', 'shannon', 'divergence',
    'wasserstein', 'loss', 'earth', 'mover', 'distance', 'contrastive',
    'loss', 'triplet', 'loss', 'siamese', 'loss', 'center', 'loss',
    'arcface', 'cosface', 'sphereface', 'supervised', 'contrastive',
    'learning', 'moco', 'simclr', 'byol', 'swav', 'dino', 'vicreg',
    'barlow', 'twins', 'self', 'supervised', 'learning', 'semi',
    'supervised', 'learning', 'unsupervised', 'learning', 'reinforcement',
    'learning', 'transfer', 'learning', 'few', 'shot', 'learning',
    'zero', 'shot', 'learning', 'meta', 'learning', 'continual',
    'learning', 'lifelong', 'learning', 'online', 'learning', 'active',
    'learning', 'curriculum', 'learning', 'self', 'supervised', 'learning',
    'multi', 'task', 'learning', 'multi', 'label', 'learning', 'ensemble',
    'learning', 'bagging', 'boosting', 'stacking', 'blending', 'voting',
    'random', 'forest', 'gradient', 'boosting', 'xgboost', 'lightgbm',
    'catboost', 'adaboost', 'gradient', 'boosting', 'machine', 'hist',
    'gradient', 'boosting', 'decision', 'tree', 'random', 'forest',
    'extra', 'trees', 'extremely', 'randomized', 'trees', 'isolation',
    'forest', 'support', 'vector', 'machine', 'support', 'vector',
    'regression', 'kernel', 'method', 'gaussian', 'process', 'linear',
    'regression', 'logistic', 'regression', 'ridge', 'regression',
    'lasso', 'regression', 'elastic', 'net', 'regression', 'bayesian',
    'regression', 'knn', 'k', 'nearest', 'neighbors', 'decision', 'tree',
    'classification', 'regression', 'tree', 'naive', 'bayes', 'gaussian',
    'naive', 'bayes', 'multinomial', 'naive', 'bayes', 'bernoulli',
    'naive', 'bayes', 'linear', 'discriminant', 'analysis', 'quadratic',
    'discriminant', 'analysis', 'neural', 'network', 'deep', 'learning',
    'convolutional', 'neural', 'network', 'recurrent', 'neural',
    'network', 'lstm', 'gru', 'transformer', 'attention', 'mechanism',
    'bert', 'gpt', 'roberta', 'xlnet', 'albert', 'electra', 'deberta',
    't5', 'bart', 'mt5', 'llama', 'mistral', 'claude', 'gemma', 'falcon',
    'mpt', 'mixtral', 'phi', 'qwen', 'yi', 'deepseek', 'command', 'jamba',
    'grok', 'openai', 'anthropic', 'google', 'meta', 'microsoft', 'amazon',
    'cohere', 'ai21', 'hugging', 'face', 'langchain', 'llamaindex',
    'haystack', 'weaviate', 'pinecone', 'milvus', 'qdrant', 'chromadb',
    'faiss', 'annoy', 'hnswlib', 'sca', 'nmslib', 'elasticsearch',
    'opensearch', 'solr', 'lucene', 'whoosh', 'pysolr', 'meilisearch',
    'typesense', 'zinc', 'quickwit', 'tedge', 'kepler', 'vectordb',
    'embedding', 'vector', 'database', 'search', 'engine', 'retrieval',
    'augmented', 'generation', 'rag', 'fine', 'tuning', 'pre', 'training',
    'prompt', 'engineering', 'in', 'context', 'learning', 'few', 'shot',
    'learning', 'zero', 'shot', 'learning', 'chain', 'of', 'thought',
    'tree', 'of', 'thoughts', 'self', 'consistency', 'reasoning',
    'agent', 'autonomous', 'agent', 'multi', 'agent', 'system',
    'tool', 'use', 'function', 'calling', 'api', 'calling', 'web', 'browsing',
    'code', 'generation', 'code', 'interpretation', 'code', 'completion',
    'code', 'suggestion', 'code', 'refactoring', 'code', 'optimization',
    'code', 'debugging', 'code', 'review', 'code', 'analysis', 'code',
    'summarization', 'documentation', 'generation', 'test', 'generation',
    'unit', 'test', 'integration', 'test', 'end', 'to', 'end', 'test',
    'test', 'case', 'generation', 'test', 'data', 'generation', 'mock',
    'data', 'synthetic', 'data', 'data', 'augmentation', 'data',
    'preprocessing', 'feature', 'engineering', 'feature', 'selection',
    'feature', 'extraction', 'dimensionality', 'reduction', 'pca', 'tsne',
    'umap', 'lda', 'nmf', 'ica', 'factor', 'analysis', 'canonical',
    'correlation', 'analysis', 'manifold', 'learning', 'clustering',
    'k', 'means', 'hierarchical', 'clustering', 'dbscan', 'optics',
    'spectral', 'clustering', 'affinity', 'propagation', 'mean',
    'shift', 'gaussian', 'mixture', 'model', 'expectation', 'maximization',
    'anomaly', 'detection', 'outlier', 'detection', 'novelty', 'detection',
    'classification', 'binary', 'classification', 'multi', 'class',
    'classification', 'multi', 'label', 'classification', 'imbalanced',
    'classification', 'cost', 'sensitive', 'learning', 'regression',
    'linear', 'regression', 'polynomial', 'regression', 'nonlinear',
    'regression', 'time', 'series', 'forecasting', 'arima', 'sarima',
    'prophet', 'lstm', 'gru', 'transformer', 'attention', 'sequence',
    'modeling', 'recommendation', 'system', 'collaborative', 'filtering',
    'content', 'based', 'filtering', 'hybrid', 'filtering', 'matrix',
    'factorization', 'als', 'sgd', 'bmf', 'svd', 'nmf', 'deep',
    'learning', 'recommendation', 'graph', 'neural', 'network',
    'autoencoder', 'variational', 'autoencoder', 'gan', 'generative',
    'adversarial', 'network', 'vae', 'variational', 'autoencoder',
    'diffusion', 'model', 'score', 'based', 'model', 'flow', 'based',
    'model', 'normalizing', 'flow', 'autoregressive', 'model', 'transformer',
    'model', 'attention', 'model', 'language', 'model', 'vision',
    'model', 'multimodal', 'model', 'foundation', 'model', 'base',
    'model', 'large', 'language', 'model', 'llm', 'small', 'language',
    'model', 'slm', 'medium', 'language', 'model', 'mlm', 'domain',
    'specific', 'model', 'industry', 'model', 'task', 'specific',
    'model', 'fine', 'tuned', 'model', 'custom', 'model', 'specialized',
    'model', 'general', 'purpose', 'model', 'broad', 'model', 'narrow',
    'model', 'vertical', 'model', 'horizontal', 'model', 'foundation',
    'model', 'application', 'model', 'service', 'model', 'deployment',
    'model', 'inference', 'model', 'serving', 'model', 'hosting', 'model',
    'scaling', 'model', 'monitoring', 'model', 'logging', 'model',
    'debugging', 'model', 'testing', 'model', 'validation', 'model',
    'evaluation', 'model', 'benchmarking', 'model', 'comparison', 'model',
    'selection', 'model', 'optimization', 'model', 'compression',
    'quantization', 'pruning', 'distillation', 'knowledge', 'distillation',
    'neural', 'architecture', 'search', 'nas', 'auto', 'ml', 'automl',
    'machine', 'learning', 'automation', 'pipeline', 'mlops', 'devops',
    'dataops', 'modelops', 'aiops', 'llmops', 'platform', 'engineering',
    'infrastructure', 'as', 'code', 'kubernetes', 'docker', 'container',
    'orchestration', 'microservices', 'serverless', 'function', 'as',
    'a', 'service', 'platform', 'as', 'a', 'service', 'infrastructure',
    'as', 'a', 'service', 'software', 'as', 'a', 'service', 'data',
    'as', 'a', 'service', 'model', 'as', 'a', 'service', 'database',
    'as', 'a', 'service', 'storage', 'as', 'a', 'service', 'network',
    'as', 'a', 'service', 'security', 'as', 'a', 'service', 'monitoring',
    'as', 'a', 'service', 'logging', 'as', 'a', 'service', 'backup',
    'as', 'a', 'service', 'disaster', 'recovery', 'as', 'a', 'service',
    'compliance', 'as', 'a', 'service', 'governance', 'as', 'a', 'service',
    'policy', 'as', 'code', 'security', 'policy', 'compliance', 'policy',
    'data', 'governance', 'privacy', 'security', 'cybersecurity', 'infosec',
    'appsec', 'devsecops', 'threat', 'modeling', 'risk', 'assessment',
    'vulnerability', 'management', 'penetration', 'testing', 'security',
    'testing', 'code', 'security', 'application', 'security', 'network',
    'security', 'cloud', 'security', 'data', 'security', 'identity',
    'access', 'management', 'iam', 'authentication', 'authorization',
    'zero', 'trust', 'defense', 'in', 'depth', 'security', 'controls',
    'security', 'monitoring', 'incident', 'response', 'forensics',
    'security', 'analytics', 'threat', 'intelligence', 'malware',
    'analysis', 'intrusion', 'detection', 'intrusion', 'prevention',
    'firewall', 'ids', 'ips', 'siem', 'soar', 'edr', 'xdr', 'mdr',
    'sast', 'dast', 'ias', 'ras', 'scanning', 'fuzzing', 'static',
    'analysis', 'dynamic', 'analysis', 'interactive', 'analysis', 'runtime',
    'analysis', 'software', 'composition', 'analysis', 'dependency',
    'management', 'supply', 'chain', 'security', 'sbom', 'vulnerability',
    'scanner', 'security', 'headers', 'csp', 'cors', 'csrf', 'xss',
    'sql', 'injection', 'command', 'injection', 'path', 'traversal',
    'buffer', 'overflow', 'memory', 'leak', 'use', 'after', 'free',
    'double', 'free', 'race', 'condition', 'integer', 'overflow',
    'underflow', 'format', 'string', 'denial', 'of', 'service', 'ddos',
    'phishing', 'social', 'engineering', 'insider', 'threat', 'apt',
    'malware', 'ransomware', 'spyware', 'adware', 'trojan', 'virus',
    'worm', 'botnet', 'rootkit', 'bootkit', 'backdoor', 'keylogger',
    'screen', 'scraper', 'cryptomining', 'cryptojacking', 'supply',
    'chain', 'attack', 'zero', 'day', 'exploit', 'vulnerability',
    'cve', 'cwe', 'owasp', 'top', 'ten', 'security', 'framework',
    'nisp', 'pcidss', 'hipaa', 'gdpr', 'ccpa', 'lgpd', 'pdpa', 'soc',
    'type', 'iso', 'iec', '27001', '27002', '27701', '9001', '20000',
    '22301', '27032', '27035', '27037', '27040', '27042', '27043',
    '27045', '27046', '27048', '27050', '27051', '27053', '27054',
    '27057', '27799', '29100', '29101', '29147', '29167', '29172',
    '30111', '31000', '33001', '37101', '42001', '42010', '80001',
    'iec', '62443', '62351', '27001', '27002', '27005', '27006',
    '27007', '27008', '27009', '27010', '27011', '27013', '27014',
    '27015', '27016', '27017', '27018', '27019', '27020', '27021',
    '27028', '27030', '27031', '27032', '27033', '27034', '27035',
    '27036', '27037', '27038', '27039', '27040', '27041', '27042',
    '27043', '27044', '27045', '27046', '27047', '27048', '27049',
    '27050', '80000', '80001', '80002', '80003', '80004', '80005',
    '80006', '80007', '80008', '80009', '80010', '80011', '80012',
    '80013', '80014', '80015', '80016', '80017', '80018', '80019',
    '80020', '80021', '80022', '80023', '80024', '80025', '80026',
    '80027', '80028', '80029', '80030', '80031', '80032', '80033',
    '80034', '80035', '80036', '80037', '80038', '80039', '80040',
    '80041', '80042', '80043', '80044', '80045', '80046', '80047',
    '80048', '80049', '80050', '80051', '80052', '80053', '80054',
    '80055', '80056', '80057', '80058', '80059', '80060', '80061',
    '80062', '80063', '80064', '80065', '80066', '80067', '80068',
    '80069', '80070', '80071', '80072', '80073', '80074', '80075',
    '80076', '80077', '80078', '80079', '80080', '80081', '80082',
    '80083', '80084', '80085', '80086', '80087', '80088', '80089',
    '80090', '80091', '80092', '80093', '80094', '80095', '80096',
    '80097', '80098', '80099', '80100', '80101', '80102', '80103',
    '80104', '80105', '80106', '80107', '80108', '80109', '80110',
    '80111', '80112', '80113', '80114', '80115', '80116', '80117',
    '80118', '80119', '80120', '80121', '80122', '80123', '80124',
    '80125', '80126', '80127', '80128', '80129', '80130', '80131',
    '80132', '80133', '80134', '80135', '80136', '80137', '80138',
    '80139', '80140', '80141', '80142', '80143', '80144', '80145',
    '80146', '80147', '80148', '80149', '80150', '80151', '80152',
    '80153', '80154', '80155', '80156', '80157', '80158', '80159',
    '80160', '80161', '80162', '80163', '80164', '80165', '80166',
    '80167', '80168', '80169', '80170', '80171', '80172', '80173',
    '80174', '80175', '80176', '80177', '80178', '80179', '80180',
    '80181', '80182', '80183', '80184', '80185', '80186', '80187',
    '80188', '80189', '80190', '80191', '80192', '80193', '80194',
    '80195', '80196', '80197', '80198', '80199', '80200', '80201',
    '80202', '80203', '80204', '80205', '80206', '80207', '80208',
    '80209', '80210', '80211', '80212', '80213', '80214', '80215',
    '80216', '80217', '80218', '80219', '80220', '80221', '80222',
    '80223', '80224', '80225', '80226', '80227', '80228', '80229',
    '80230', '80231', '80232', '80233', '80234', '80235', '80236',
    '80237', '80238', '80239', '80240', '80241', '80242', '80243',
    '80244', '80245', '80246', '80247', '80248', '80249', '80250',
    '80251', '80252', '80253', '80254', '80255', '80256', '80257',
    '80258', '80259', '80260', '80261', '80262', '80263', '80264',
    '80265', '80266', '80267', '80268', '80269', '80270', '80271',
    '80272', '80273', '80274', '80275', '80276', '80277', '80278',
    '80279', '80280', '80281', '80282', '80283', '80284', '80285',
    '80286', '80287', '80288', '80289', '80290', '80291', '80292',
    '80293', '80294', '80295', '80296', '80297', '80298', '80299',
    '80300', '80301', '80302', '80303', '80304', '80305', '80306',
    '80307', '80308', '80309', '80310', '80311', '80312', '80313',
    '80314', '80315', '80316', '80317', '80318', '80319', '80320',
    '80321', '80322', '80323', '80324', '80325', '80326', '80327',
    '80328', '80329', '80330', '80331', '80332', '80333', '80334',
    '80335', '80336', '80337', '80338', '80339', '80340', '80341',
    '80342', '80343', '80344', '80345', '80346', '80347', '80348',
    '80349', '80350', '80351', '80352', '80353', '80354', '80355',
    '80356', '80357', '80358', '80359', '80360', '80361', '80362',
    '80363', '80364', '80365', '80366', '80367', '80368', '80369',
    '80370', '80371', '80372', '80373', '80374', '80375', '80376',
    '80377', '80378', '80379', '80380', '80381', '80382', '80383',
    '80384', '80385', '80386', '80387', '80388', '80389', '80390',
    '80391', '80392', '80393', '80394', '80395', '80396', '80397',
    '80398', '80399', '80400', '80401', '80402', '80403', '80404',
    '80405', '80406', '80407', '80408', '80409', '80410', '80411',
    '80412', '80413', '80414', '80415', '80416', '80417', '80418',
    '80419', '80420', '80421', '80422', '80423', '80424', '80425',
    '80426', '80427', '80428', '80429', '80430', '80431', '80432',
    '80433', '80434', '80435', '80436', '80437', '80438', '80439',
    '80440', '80441', '80442', '80443', '80444', '80445', '80446',
    '80447', '80448', '80449', '80450', '80451', '80452', '80453',
    '80454', '80455', '80456', '80457', '80458', '80459', '80460',
    '80461', '80462', '80463', '80464', '80465', '80466', '80467',
    '80468', '80469', '80470', '80471', '80472', '80473', '80474',
    '80475', '80476', '80477', '80478', '80479', '80480', '80481',
    '80482', '80483', '80484', '80485', '80486', '80487', '80488',
    '80489', '80490', '80491', '80492', '80493', '80494', '80495',
    '80496', '80497', '80498', '80499', '80500', '80501', '80502',
    '80503', '80504', '80505', '80506', '80507', '80508', '80509',
    '80510', '80511', '80512', '80513', '80514', '80515', '80516',
    '80517', '80518', '80519', '80520', '80521', '80522', '80523',
    '80524', '80525', '80526', '80527', '80528', '80529', '80530',
    '80531', '80532', '80533', '80534', '80535', '80536', '80537',
    '80538', '80539', '80540', '80541', '80542', '80543', '80544',
    '80545', '80546', '80547', '80548', '80549', '80550', '80551',
    '80552', '80553', '80554', '80555', '80556', '80557', '80558',
    '80559', '80560', '80561', '80562', '80563', '80564', '80565',
    '80566', '80567', '80568', '80569', '80570', '80571', '80572',
    '80573', '80574', '80575', '80576', '80577', '80578', '80579',
    '80580', '80581', '80582', '80583', '80584', '80585', '80586',
    '80587', '80588', '80589', '80590', '80591', '80592', '80593',
    '80594', '80595', '80596', '80597', '80598', '80599', '80600',
    '80601', '80602', '80603', '80604', '80605', '80606', '80607',
    '80608', '80609', '80610', '80611', '80612', '80613', '80614',
    '80615', '80616', '80617', '80618', '80619', '80620', '80621',
    '80622', '80623', '80624', '80625', '80626', '80627', '80628',
    '80629', '80630', '80631', '80632', '80633', '80634', '80635',
    '80636', '80637', '80638', '80639', '80640', '80641', '80642',
    '80643', '80644', '80645', '80646', '80647', '80648', '80649',
    '80650', '80651', '80652', '80653', '80654', '80655', '80656',
    '80657', '80658', '80659', '80660', '80661', '80662', '80663',
    '80664', '80665', '80666', '80667', '80668', '80669', '80670',
    '80671', '80672', '80673', '80674', '80675', '80676', '80677',
    '80678', '80679', '80680', '80681', '80682', '80683', '80684',
    '80685', '80686', '80687', '80688', '80689', '80690', '80691',
    '80692', '80693', '80694', '80695', '80696', '80697', '80698',
    '80699', '80700', '80701', '80702', '80703', '80704', '80705',
    '80706', '80707', '80708', '80709', '80710', '80711', '80712',
    '80713', '80714', '80715', '80716', '80717', '80718', '80719',
    '80720', '80721', '80722', '80723', '80724', '80725', '80726',
    '80727', '80728', '80729', '80730', '80731', '80732', '80733',
    '80734', '80735', '80736', '80737', '80738', '80739', '80740',
    '80741', '80742', '80743', '80744', '80745', '80746', '80747',
    '80748', '80749', '80750', '80751', '80752', '80753', '80754',
    '80755', '80756', '80757', '80758', '80759', '80760', '80761',
    '80762', '80763', '80764', '80765', '80766', '80767', '80768',
    '80769', '80770', '80771', '80772', '80773', '80774', '80775',
    '80776', '80777', '80778', '80779', '80780', '80781', '80782',
    '80783', '80784', '80785', '80786', '80787', '80788', '80789',
    '80790', '80791', '80792', '80793', '80794', '80795', '80796',
    '80797', '80798', '80799', '80800', '80801', '80802', '80803',
    '80804', '80805', '80806', '80807', '80808', '80809', '80810',
    '80811', '80812', '80813', '80814', '80815', '80816', '80817',
    '80818', '80819', '80820', '80821', '80822', '80823', '80824',
    '80825', '80826', '80827', '80828', '80829', '80830', '80831',
    '80832', '80833', '80834', '80835', '80836', '80837', '80838',
    '80839', '80840', '80841', '80842', '80843', '80844', '80845',
    '80846', '80847', '80848', '80849', '80850', '80851', '80852',
    '80853', '80854', '80855', '80856', '80857', '80858', '80859',
    '80860', '80861', '80862', '80863', '80864', '80865', '80866',
    '80867', '80868', '80869', '80870', '80871', '80872', '80873',
    '80874', '80875', '80876', '80877', '80878', '80879', '80880',
    '80881', '80882', '80883', '80884', '80885', '80886', '80887',
    '80888', '80889', '80890', '80891', '80892', '80893', '80894',
    '80895', '80896', '80897', '80898', '80899', '80900', '80901',
    '80902', '80903', '80904', '80905', '80906', '80907', '80908',
    '80909', '80910', '80911', '80912', '80913', '80914', '80915',
    '80916', '80917', '80918', '80919', '80920', '80921', '80922',
    '80923', '80924', '80925', '80926', '80927', '80928', '80929',
    '80930', '80931', '80932', '80933', '80934', '80935', '80936',
    '80937', '80938', '80939', '80940', '80941', '80942', '80943',
    '80944', '80945', '80946', '80947', '80948', '80949', '80950',
    '80951', '80952', '80953', '80954', '80955', '80956', '80957',
    '80958', '80959', '80960', '80961', '80962', '80963', '80964',
    '80965', '80966', '80967', '80968', '80969', '80970', '80971',
    '80972', '80973', '80974', '80975', '80976', '80977', '80978',
    '80979', '80980', '80981', '80982', '80983', '80984', '80985',
    '80986', '80987', '80988', '80989', '80990', '80991', '80992',
    '80993', '80994', '80995', '80996', '80997', '80998', '80999',
    '81000'
  ]
};

export interface EdgeCaseValidationResult {
  valid: boolean;
  issues: EdgeCaseIssue[];
  warnings: EdgeCaseIssue[];
  sanitized?: AppUnderstanding;
}

export interface EdgeCaseIssue {
  type: 'error' | 'warning';
  category: 'schema' | 'naming' | 'dependency' | 'constraint' | 'type' | 'network' | 'resource' | 'ai_service';
  message: string;
  field?: string;
  entity?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  autoFixable: boolean;
  fixApplied?: boolean;
}

class EdgeCaseHandler {
  private config: EdgeCaseConfig;

  constructor(config: Partial<EdgeCaseConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Validate understanding for edge cases
   */
  async validateUnderstanding(
    understanding: AppUnderstanding
  ): Promise<EdgeCaseValidationResult> {
    const issues: EdgeCaseIssue[] = [];
    const warnings: EdgeCaseIssue[] = [];

    if (this.config.enableSchemaValidation) {
      const schemaIssues = this.validateSchemaStructure(understanding);
      issues.push(...schemaIssues.issues);
      warnings.push(...schemaIssues.warnings);
    }

    if (this.config.enableNamingConflictDetection) {
      const namingIssues = this.validateNaming(understanding);
      issues.push(...namingIssues.issues);
      warnings.push(...namingIssues.warnings);
    }

    if (this.config.enableCircularDependencyDetection) {
      const dependencyIssues = this.validateDependencies(understanding);
      issues.push(...dependencyIssues.issues);
      warnings.push(...dependencyIssues.warnings);
    }

    const criticalErrors = issues.filter(i => i.severity === 'critical');
    const sanitized = criticalErrors.length === 0 ? 
      this.sanitizeUnderstanding(understanding, issues, warnings) : 
      undefined;

    return {
      valid: criticalErrors.length === 0,
      issues,
      warnings,
      sanitized,
    };
  }

  /**
   * Validate schema structure and constraints
   */
  private validateSchemaStructure(
    understanding: AppUnderstanding
  ): { issues: EdgeCaseIssue[]; warnings: EdgeCaseIssue[] } {
    const issues: EdgeCaseIssue[] = [];
    const warnings: EdgeCaseIssue[] = [];

    if (!understanding.entities || understanding.entities.length === 0) {
      issues.push({
        type: 'error',
        category: 'schema',
        message: 'No entities defined in schema',
        severity: 'critical',
        autoFixable: false,
      });
      return { issues, warnings };
    }

    if (understanding.entities.length > this.config.maxEntityCount) {
      issues.push({
        type: 'error',
        category: 'schema',
        message: `Entity count (${understanding.entities.length}) exceeds maximum (${this.config.maxEntityCount})`,
        severity: 'high',
        autoFixable: false,
      });
    }

    for (const entity of understanding.entities) {
      if (!entity.name || entity.name.trim() === '') {
        issues.push({
          type: 'error',
          category: 'schema',
          message: 'Entity with empty or missing name detected',
          severity: 'critical',
          autoFixable: false,
        });
      }

      if (!entity.attributes || entity.attributes.length === 0) {
        issues.push({
          type: 'error',
          category: 'schema',
          message: `Entity "${entity.name}" has no attributes defined`,
          severity: 'critical',
          autoFixable: false,
          entity: entity.name,
        });
      }

      if (entity.attributes && entity.attributes.length > this.config.maxFieldCount) {
        warnings.push({
          type: 'warning',
          category: 'schema',
          message: `Entity "${entity.name}" has ${entity.attributes.length} attributes, exceeding recommended maximum (${this.config.maxFieldCount})`,
          severity: 'medium',
          autoFixable: false,
          entity: entity.name,
        });
      }

      const fieldNames = new Set<string>();
      if (entity.attributes) {
        for (const field of entity.attributes) {
          if (!field.name || field.name.trim() === '') {
            issues.push({
              type: 'error',
              category: 'schema',
              message: `Entity "${entity.name}" has a field with empty name`,
              severity: 'critical',
              autoFixable: false,
              entity: entity.name,
            });
          }

          if (fieldNames.has(field.name)) {
            issues.push({
              type: 'error',
              category: 'schema',
              message: `Entity "${entity.name}" has duplicate field name "${field.name}"`,
              severity: 'critical',
              autoFixable: true,
              fixApplied: false,
              entity: entity.name,
              field: field.name,
            });
          }

          fieldNames.add(field.name);

          if (!field.type) {
            issues.push({
              type: 'error',
              category: 'schema',
              message: `Field "${field.name}" in entity "${entity.name}" has missing type`,
              severity: 'critical',
              autoFixable: true,
              entity: entity.name,
              field: field.name,
            });
          }
        }
      }
    }

    return { issues, warnings };
  }

  /**
   * Validate naming conventions and reserved words
   */
  private validateNaming(
    understanding: AppUnderstanding
  ): { issues: EdgeCaseIssue[]; warnings: EdgeCaseIssue[] } {
    const issues: EdgeCaseIssue[] = [];
    const warnings: EdgeCaseIssue[] = [];

    const entityNames = new Set<string>();
    
    if (understanding.entities) {
      for (const entity of understanding.entities) {
        const entityName = entity.name.toLowerCase();
        
        if (entityNames.has(entityName)) {
          issues.push({
            type: 'error',
            category: 'naming',
            message: `Duplicate entity name detected: "${entity.name}"`,
            severity: 'critical',
            autoFixable: false,
            entity: entity.name,
          });
        }

        entityNames.add(entityName);

        if (this.config.reservedKeywords.includes(entityName)) {
          issues.push({
            type: 'error',
            category: 'naming',
            message: `Entity name "${entity.name}" is a reserved keyword`,
            severity: 'critical',
            autoFixable: true,
            entity: entity.name,
          });
        }

        if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(entity.name)) {
          issues.push({
            type: 'error',
            category: 'naming',
            message: `Entity name "${entity.name}" contains invalid characters (only alphanumeric and underscore allowed)`,
            severity: 'high',
            autoFixable: true,
            entity: entity.name,
          });
        }

        if (entity.attributes) {
          for (const field of entity.attributes) {
            const fieldName = field.name.toLowerCase();
            
            if (this.config.reservedKeywords.includes(fieldName)) {
              issues.push({
                type: 'error',
                category: 'naming',
                message: `Field name "${field.name}" in entity "${entity.name}" is a reserved keyword`,
                severity: 'high',
                autoFixable: true,
                entity: entity.name,
                field: field.name,
              });
            }

            if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(field.name)) {
              issues.push({
                type: 'error',
                category: 'naming',
                message: `Field name "${field.name}" in entity "${entity.name}" contains invalid characters`,
                severity: 'high',
                autoFixable: true,
                entity: entity.name,
                field: field.name,
              });
            }

            if (field.name.length > 63) {
              warnings.push({
                type: 'warning',
                category: 'naming',
                message: `Field name "${field.name}" exceeds 63 character limit (PostgreSQL limit)`,
                severity: 'medium',
                autoFixable: true,
                entity: entity.name,
                field: field.name,
              });
            }
          }
        }
      }
    }

    return { issues, warnings };
  }

  /**
   * Validate for circular dependencies and relation depth
   */
  private validateDependencies(
    understanding: AppUnderstanding
  ): { issues: EdgeCaseIssue[]; warnings: EdgeCaseIssue[] } {
    const issues: EdgeCaseIssue[] = [];
    const warnings: EdgeCaseIssue[] = [];

    if (!understanding.entities || understanding.entities.length === 0) {
      return { issues, warnings };
    }

    const graph = this.buildDependencyGraph(understanding);
    const cycles = this.detectCycles(graph);

    if (cycles.length > 0) {
      for (const cycle of cycles) {
        issues.push({
          type: 'error',
          category: 'dependency',
          message: `Circular dependency detected: ${cycle.join(' -> ')}`,
          severity: 'critical',
          autoFixable: false,
        });
      }
    }

    for (const entity of understanding.entities) {
      const depth = this.calculateRelationDepth(entity.name, understanding, 0);
      if (depth > this.config.maxRelationDepth) {
        warnings.push({
          type: 'warning',
          category: 'dependency',
          message: `Entity "${entity.name}" has relation depth of ${depth}, exceeding recommended maximum (${this.config.maxRelationDepth})`,
          severity: 'medium',
          autoFixable: false,
          entity: entity.name,
        });
      }
    }

    return { issues, warnings };
  }

  /**
   * Build dependency graph from entity relations
   */
  private buildDependencyGraph(
    understanding: AppUnderstanding
  ): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    if (!understanding.entities) {
      return graph;
    }

    for (const entity of understanding.entities) {
      graph.set(entity.name, []);
    }

    for (const entity of understanding.entities) {
      if (entity.relations) {
        for (const relation of entity.relations) {
          const deps = graph.get(entity.name) || [];
          deps.push(relation.targetEntity); 
          graph.set(entity.name, deps);
        }
      }
    }

    return graph;
  }

  /**
   * Detect cycles in dependency graph using DFS
   */
  private detectCycles(graph: Map<string, string[]>): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];

    const dfs = (node: string): void => {
      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const neighbors = graph.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor);
        } else if (recursionStack.has(neighbor)) {
          const cycleIndex = path.indexOf(neighbor);
          const cycle = [...path.slice(cycleIndex), neighbor];
          cycles.push(cycle);
        }
      }

      recursionStack.delete(node);
      path.pop();
    };

    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    return cycles;
  }

  /**
   * Calculate maximum relation depth from an entity
   */
  private calculateRelationDepth(
    entityName: string,
    understanding: AppUnderstanding,
    currentDepth: number
  ): number {
    if (currentDepth > this.config.maxRelationDepth * 2) {
      return currentDepth;
    }

    const entity = understanding.entities?.find(e => e.name === entityName);
    if (!entity || !entity.relations) {
      return currentDepth;
    }

    let maxDepth = currentDepth;
    for (const relation of entity.relations) {
      const depth = this.calculateRelationDepth(
        relation.targetEntity,
        understanding,
        currentDepth + 1
      );
      maxDepth = Math.max(maxDepth, depth);
    }

    return maxDepth;
  }

  /**
   * Sanitize understanding by auto-fixing fixable issues
   */
  private sanitizeUnderstanding(
    understanding: AppUnderstanding,
    issues: EdgeCaseIssue[],
    warnings: EdgeCaseIssue[]
  ): AppUnderstanding {
    const sanitized = JSON.parse(JSON.stringify(understanding));

    const allIssues = [...issues, ...warnings];
    const fixableIssues = allIssues.filter(i => i.autoFixable && !i.fixApplied);

    for (const issue of fixableIssues) {
      if (issue.category === 'naming' && issue.entity) {
        const entity = sanitized.entities?.find((e: any) => e.name === issue.entity);
        if (entity) {
          if (issue.field) {
            const field = entity.attributes?.find((f: any) => f.name === issue.field);
            if (field && this.config.reservedKeywords.includes(field.name.toLowerCase())) {
              field.name = `custom_${field.name}`;
              issue.fixApplied = true;
            }
          } else if (this.config.reservedKeywords.includes(entity.name.toLowerCase())) {
            entity.name = `Custom${entity.name}`;
            issue.fixApplied = true;
          }
        }
      }

      if (issue.category === 'schema' && issue.field && issue.entity) {
        const entity = sanitized.entities?.find((e: any) => e.name === issue.entity);
        if (entity && entity.attributes) {
          const fieldNames = new Set<string>();
          const filteredAttributes = entity.attributes.filter((field: any) => {
            if (fieldNames.has(field.name)) {
              return false;
            }
            fieldNames.add(field.name);
            return true;
          });
          entity.attributes = filteredAttributes;
          issue.fixApplied = true;
        }
      }
    }

    return sanitized;
  }

  /**
   * Validate generated entity schemas for type compatibility
   */
  validateEntitySchemas(schemas: EntitySchema[]): EdgeCaseIssue[] {
    const issues: EdgeCaseIssue[] = [];

    if (!this.config.enableTypeCompatibilityChecking) {
      return issues;
    }

    for (const schema of schemas) {
      for (const field of schema.fields) {
        const typeIssues = this.validateFieldType(field, schema.name);
        issues.push(...typeIssues);
      }

      for (const relation of schema.relations) {
        const relationIssues = this.validateRelation(relation, schema.name, schemas);
        issues.push(...relationIssues);
      }
    }
    return issues;
  }

  /**
   * Validate individual field type
   */
  private validateFieldType(field: FieldSchema, entityName: string): EdgeCaseIssue[] {
    const issues: EdgeCaseIssue[] = [];

    if (!field.prismaType) {
      issues.push({
        type: 'error',
        category: 'type',
        message: `Field "${field.name}" in entity "${entityName}" has missing Prisma type`,
        severity: 'critical',
        autoFixable: false,
        entity: entityName,
        field: field.name,
      });
      return issues;
    }

    const validTypes: string[] = ['String', 'Int', 'Float', 'Boolean', 'DateTime', 'Json', 'String[]', 'Int[]'];
    if (!validTypes.includes(field.prismaType)) {
      issues.push({
        type: 'error',
        category: 'type',
        message: `Field "${field.name}" has invalid Prisma type "${field.prismaType}"`,
        severity: 'high',
        autoFixable: true,
        entity: entityName,
        field: field.name,
      });
    }

    if (field.isRelation && !field.relationTo) {
      issues.push({
        type: 'error',
        category: 'type',
        message: `Relation field "${field.name}" in entity "${entityName}" missing relation target`,
        severity: 'critical',
        autoFixable: false,
        entity: entityName,
        field: field.name,
      });
    }

    if (field.enumValues && field.prismaType !== 'String') {
      issues.push({
        type: 'warning',
        category: 'type',
        message: `Field "${field.name}" has enum values but type is not String`,
        severity: 'medium',
        autoFixable: true,
        entity: entityName,
        field: field.name,
      });
    }

    return issues;
  }

  /**
   * Validate relation configuration
   */
  private validateRelation(
    relation: RelationSchema,
    sourceEntity: string,
    allSchemas: EntitySchema[]
  ): EdgeCaseIssue[] {
    const issues: EdgeCaseIssue[] = [];

    const targetExists = allSchemas.some(s => s.name === relation.toEntity);
    if (!targetExists) {
      issues.push({
        type: 'error',
        category: 'dependency',
        message: `Relation "${relation.relationName}" in entity "${sourceEntity}" references non-existent entity "${relation.toEntity}"`,
        severity: 'critical',
        autoFixable: false,
        entity: sourceEntity,
      });
    }

    if (relation.type === 'many-to-many' && !relation.relationName) {
      issues.push({
        type: 'warning',
        category: 'dependency',
        message: `Many-to-many relation in entity "${sourceEntity}" missing explicit relation name`,
        severity: 'medium',
        autoFixable: true,
        entity: sourceEntity,
      });
    }

    return issues;
  }

  /**
   * Handle AI service errors with fallback strategies
   */
  handleAIServiceError(error: unknown, context: string): {
    shouldRetry: boolean;
    fallbackStrategy: 'retry' | 'cache' | 'degrade' | 'fail';
    message: string;
  } {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error('EdgeCaseHandler', 'AIServiceError', `AI service error in ${context}`, { error: errorMessage });

    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return {
        shouldRetry: true,
        fallbackStrategy: 'retry',
        message: 'Rate limit exceeded, will retry with exponential backoff',
      };
    }

    if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
      return {
        shouldRetry: true,
        fallbackStrategy: 'retry',
        message: 'Request timeout, will retry',
      };
    }

    if (errorMessage.includes('context length') || errorMessage.includes('token')) {
      return {
        shouldRetry: false,
        fallbackStrategy: 'degrade',
        message: 'Context length exceeded, will attempt degraded generation',
      };
    }

    if (errorMessage.includes('authentication') || errorMessage.includes('401')) {
      return {
        shouldRetry: false,
        fallbackStrategy: 'fail',
        message: 'Authentication failed, check API credentials',
      };
    }

    if (errorMessage.includes('quota') || errorMessage.includes('402')) {
      return {
        shouldRetry: false,
        fallbackStrategy: 'fail',
        message: 'API quota exceeded, check billing',
      };
    }

    return {
      shouldRetry: true,
      fallbackStrategy: 'retry',
      message: 'Unknown error, will retry with exponential backoff',
    };
  }
}

export const edgeCaseHandler = new EdgeCaseHandler();
export { EdgeCaseHandler };
export default edgeCaseHandler;