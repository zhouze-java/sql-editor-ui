import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  RefreshCw, 
  ChevronRight, 
  ChevronDown, 
  Table, 
  Key, 
  FileCode, 
  Server, 
  CheckCircle2, 
  Sparkles,
  Info,
  ChevronLeft
} from 'lucide-react';
import { DatabaseEnv, TableSchema } from '../types/sql';

interface SidebarExplorerProps {
  databases: DatabaseEnv[];
  currentDb: DatabaseEnv;
  onSelectDb: (db: DatabaseEnv) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onTableQueryClick: (tableName: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const SidebarExplorer: React.FC<SidebarExplorerProps> = ({
  databases,
  currentDb,
  onSelectDb,
  onRefresh,
  isRefreshing,
  onTableQueryClick,
  isCollapsed,
  onToggleCollapse
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({
    'base_hospital_area_info': true // expanded by default
  });

  const filteredDatabases = databases.filter(db =>
    db.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    db.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTables = currentDb.tables.filter(t =>
    t.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
    t.comment.toLowerCase().includes(tableSearch.toLowerCase())
  );

  const toggleTableExpand = (tableName: string) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-[#0d131f] border-r border-slate-800/80 flex flex-col items-center py-3 select-none justify-between shrink-0">
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={onToggleCollapse}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="展开侧边栏"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs" title={`当前环境: ${currentDb.name}`}>
            {currentDb.code.slice(0, 2).toUpperCase()}
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="p-2 text-slate-500 hover:text-slate-300 rounded-lg transition-colors"
          title="刷新医院环境列表"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-72 bg-[#0d131f] border-r border-slate-800/80 flex flex-col h-full select-none shrink-0 transition-all">
      {/* Header with Title and Collapse button */}
      <div className="p-3 pb-2 border-b border-slate-800/60 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-slate-400 tracking-wider">DATABASES</div>
          <div className="text-[11px] text-slate-500">单击切换当前医院/集群</div>
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          title="折叠侧边栏"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Database Search */}
      <div className="px-3 pt-2.5 pb-1.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索医院或代码..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-md pl-8 pr-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Database List */}
      <div className="px-2 py-1 max-h-48 overflow-y-auto space-y-1">
        {filteredDatabases.map((db) => {
          const isSelected = db.id === currentDb.id;
          return (
            <button
              key={db.id}
              onClick={() => onSelectDb(db)}
              className={`w-full text-left p-2.5 rounded-lg transition-all border flex items-center justify-between ${
                isSelected
                  ? 'bg-blue-600/15 border-blue-500/40 text-blue-100 shadow-xs'
                  : 'bg-slate-900/40 border-transparent text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      db.env === 'prod' ? 'bg-rose-500' : db.env === 'pre' ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                  />
                  <span className="text-xs font-semibold truncate">{db.name}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 pl-3.5">
                  {db.code}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono text-slate-500 block">
                  {db.pingMs}ms
                </span>
                {isSelected && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 ml-auto mt-0.5" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-800/80 my-1 mx-3" />

      {/* Table Schema Explorer for selected Database */}
      <div className="flex-1 flex flex-col min-h-0 px-3 pt-1">
        <div className="flex items-center justify-between pb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Server className="w-3.5 h-3.5 text-blue-400" />
            <span>表结构字典 ({currentDb.tables.length})</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {currentDb.databaseName}
          </span>
        </div>

        {/* Filter table names */}
        <div className="relative mb-2">
          <input
            type="text"
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            placeholder="过滤数据表..."
            className="w-full bg-slate-900/60 border border-slate-800/80 rounded px-2.5 py-1 text-[11px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Tables Tree */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 pb-2">
          {filteredTables.map((tbl) => {
            const isExpanded = !!expandedTables[tbl.name];
            return (
              <div key={tbl.name} className="border border-slate-800/60 rounded-md bg-slate-900/30 overflow-hidden">
                {/* Table Header Row */}
                <div 
                  className="flex items-center justify-between px-2 py-1.5 hover:bg-slate-800/50 cursor-pointer group"
                  onClick={() => toggleTableExpand(tbl.name)}
                >
                  <div className="flex items-center gap-1.5 min-w-0 pr-1">
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                    <Table className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="text-xs font-mono font-medium text-slate-200 truncate" title={tbl.name}>
                      {tbl.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTableQueryClick(tbl.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 text-[10px] bg-blue-600/30 hover:bg-blue-600 text-blue-200 rounded transition-all"
                      title="快速生成 SELECT * 查询"
                    >
                      查询
                    </button>
                    <span className="text-[10px] font-mono text-slate-500">
                      ~{tbl.estimatedRows}
                    </span>
                  </div>
                </div>

                {/* Table Columns if expanded */}
                {isExpanded && (
                  <div className="bg-slate-950/40 border-t border-slate-800/60 px-2 py-1.5 text-[11px] space-y-1">
                    <div className="text-[10px] text-slate-400 pb-0.5 font-sans">
                      {tbl.comment}
                    </div>
                    {tbl.columns.map((col) => (
                      <div 
                        key={col.name}
                        className="flex items-center justify-between py-0.5 px-1 rounded hover:bg-slate-800/40 text-slate-300 font-mono text-[11px]"
                      >
                        <div className="flex items-center gap-1 truncate pr-1">
                          {col.isPrimary ? (
                            <span title="Primary Key 主键">
                              <Key className="w-3 h-3 text-amber-400 shrink-0" />
                            </span>
                          ) : (
                            <span className="w-3 inline-block" />
                          )}
                          <span className={col.isPrimary ? 'text-amber-300 font-semibold truncate' : 'text-slate-300 truncate'}>
                            {col.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {col.type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer bar */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/50 flex items-center justify-between text-xs">
        <span className="text-slate-400 text-[11px]">
          已加载 {databases.length} 家医院环境
        </span>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors text-xs border border-slate-700/60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          <span>刷新</span>
        </button>
      </div>
    </aside>
  );
};
