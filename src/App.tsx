import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DatabaseEnv, QueryTab, QueryResult, QueryParams, QueryHistoryItem } from './types/sql';
import { INITIAL_DATABASES, executeSqlQuery } from './data/mockDatabases';
import { formatSql } from './utils/sqlFormatter';
import { HeaderBar } from './components/HeaderBar';
import { SidebarExplorer } from './components/SidebarExplorer';
import { SqlEditor } from './components/SqlEditor';
import { ResultsGrid } from './components/ResultsGrid';
import { CellDetailModal } from './components/CellDetailModal';
import { QueryHistoryModal } from './components/QueryHistoryModal';
import { SnippetsModal } from './components/SnippetsModal';
import { GripHorizontal } from 'lucide-react';

export default function App() {
  const [databases, setDatabases] = useState<DatabaseEnv[]>(INITIAL_DATABASES);
  // Default to 试医预发 (shiyipre) to match user's screenshot exactly
  const [currentDb, setCurrentDb] = useState<DatabaseEnv>(INITIAL_DATABASES[0]);
  const [isRefreshingDbs, setIsRefreshingDbs] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Default query tabs matching user screenshot
  const [tabs, setTabs] = useState<QueryTab[]>([
    {
      id: 'tab-1',
      title: 'base_hospital_area_info.sql',
      sql: 'SELECT * from base_hospital_area_info;'
    }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');

  // Query execution parameters matching user screenshot (maxRows: 500, timeoutMs: 15000, queryCount: true)
  const [params, setParams] = useState<QueryParams>({
    maxRows: 500,
    timeoutMs: 15000,
    queryCount: true
  });

  const [isExecuting, setIsExecuting] = useState(false);
  const [apiKey, setApiKey] = useState('eb_sec_7a819b224f114c09');

  // Initial result loaded immediately to match screenshot state!
  const [result, setResult] = useState<QueryResult | null>({
    status: 'success',
    columns: [
      'id',
      'hospital_area_id',
      'hospital_area_parent_id',
      'hospital_area_name',
      'hospital_area_name_py',
      'hospital_area_name_wb',
      'hospital_area_status',
      'hospital_area_sort',
      'hospital_id',
      'general_hospital',
      'add_by',
      'add_name',
      'add_time',
      'upd_by',
      'upd_name',
      'upd_time'
    ],
    rows: [
      {
        id: 1,
        hospital_area_id: '08E7E87031414E0AB9A127DE9D56A146',
        hospital_area_parent_id: '08E7E87031414E0AB9A127DE9D56A146',
        hospital_area_name: '浙江省杭州市第一人民医院',
        hospital_area_name_py: null,
        hospital_area_name_wb: null,
        hospital_area_status: false,
        hospital_area_sort: null,
        hospital_id: 'd132a63484a84513836f7315edc605ca',
        general_hospital: true,
        add_by: '76EC0211649E47978FB2D3074F6D1E92',
        add_name: '系统',
        add_time: '2024-03-12 10:24:18',
        upd_by: '76EC0211649E47978FB2D3074F6D1E92',
        upd_name: '超级管理员',
        upd_time: '2024-11-05 18:02:44'
      }
    ],
    durationMs: 300,
    internalMs: 209,
    gatewayMs: 82,
    totalCount: 1,
    executedSql: 'SELECT * from base_hospital_area_info;',
    timestamp: '14:22:08',
    hospitalName: '试医预发',
    hospitalCode: 'shiyipre'
  });

  const [history, setHistory] = useState<QueryHistoryItem[]>([
    {
      id: 'h-init',
      hospitalId: 'shiyipre',
      hospitalName: '试医预发',
      hospitalCode: 'shiyipre',
      sql: 'SELECT * from base_hospital_area_info;',
      durationMs: 300,
      internalMs: 209,
      gatewayMs: 82,
      rowCount: 1,
      timestamp: '14:22:08',
      status: 'success'
    }
  ]);

  // Modals state
  const [activeModal, setActiveModal] = useState<'history' | 'snippets' | null>(null);
  const [inspectedCell, setInspectedCell] = useState<{ colName: string; value: any } | null>(null);

  // Resizable vertical split between SQL editor and results table
  const [splitRatio, setSplitRatio] = useState<number>(38); // 38% top, 62% bottom
  const isDraggingSplitRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tab management
  const handleSelectTab = (id: string) => {
    setActiveTabId(id);
  };

  const handleCloseTab = (id: string) => {
    if (tabs.length <= 1) return;
    const remaining = tabs.filter(t => t.id !== id);
    setTabs(remaining);
    if (activeTabId === id) {
      setActiveTabId(remaining[remaining.length - 1].id);
    }
  };

  const handleNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: QueryTab = {
      id: newId,
      title: `查询_${tabs.length + 1}.sql`,
      sql: 'SELECT * from base_department_info LIMIT 20;'
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
  };

  const handleSqlChange = (id: string, newSql: string) => {
    setTabs(prev =>
      prev.map(t => (t.id === id ? { ...t, sql: newSql, isModified: true } : t))
    );
  };

  // Format SQL
  const handleFormat = () => {
    const currentTab = tabs.find(t => t.id === activeTabId);
    if (!currentTab) return;
    const formatted = formatSql(currentTab.sql);
    handleSqlChange(currentTab.id, formatted);
  };

  // Clear current tab SQL
  const handleClear = () => {
    handleSqlChange(activeTabId, '');
  };

  // Table double-click from sidebar to query
  const handleTableQueryClick = (tableName: string) => {
    const newSql = `SELECT * from ${tableName} LIMIT 50;`;
    const tabExists = tabs.find(t => t.title === `${tableName}.sql`);
    if (tabExists) {
      setActiveTabId(tabExists.id);
      handleExecute(newSql);
    } else {
      const newId = `tab-${Date.now()}`;
      const newTab: QueryTab = {
        id: newId,
        title: `${tableName}.sql`,
        sql: newSql
      };
      setTabs([...tabs, newTab]);
      setActiveTabId(newId);
      setTimeout(() => {
        handleExecute(newSql);
      }, 50);
    }
  };

  // Run SQL Execution
  const handleExecute = useCallback(async (customSql?: string) => {
    const currentTab = tabs.find(t => t.id === activeTabId);
    const sqlToRun = customSql || currentTab?.sql || '';

    if (!sqlToRun.trim()) return;

    setIsExecuting(true);
    try {
      const queryRes = await executeSqlQuery(currentDb, sqlToRun, params);
      setResult(queryRes);

      // Append to history
      const historyItem: QueryHistoryItem = {
        id: `hist-${Date.now()}`,
        hospitalId: currentDb.id,
        hospitalName: currentDb.name,
        hospitalCode: currentDb.code,
        sql: sqlToRun,
        durationMs: queryRes.durationMs,
        internalMs: queryRes.internalMs,
        gatewayMs: queryRes.gatewayMs,
        rowCount: queryRes.rows.length,
        timestamp: queryRes.timestamp,
        status: queryRes.status,
        errorMsg: queryRes.error
      };
      setHistory(prev => [historyItem, ...prev.slice(0, 49)]);
    } catch (err: any) {
      setResult({
        status: 'error',
        columns: [],
        rows: [],
        durationMs: 0,
        internalMs: 0,
        gatewayMs: 0,
        error: err.message || '网关通信超时或未知异常',
        executedSql: sqlToRun,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
        hospitalName: currentDb.name,
        hospitalCode: currentDb.code
      });
    } finally {
      setIsExecuting(false);
    }
  }, [activeTabId, tabs, currentDb, params]);

  // Refresh databases
  const handleRefreshDatabases = () => {
    setIsRefreshingDbs(true);
    setTimeout(() => {
      // Simulate pinging clusters
      setDatabases(prev =>
        prev.map(d => ({
          ...d,
          pingMs: Math.max(10, Math.floor(d.pingMs + (Math.random() * 8 - 4)))
        }))
      );
      setIsRefreshingDbs(false);
    }, 600);
  };

  // Select Snippet into current tab
  const handleSelectSnippet = (sql: string) => {
    handleSqlChange(activeTabId, sql);
  };

  // Dragging split pane divider
  const handleMouseDownSplit = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingSplitRef.current = true;
    document.addEventListener('mousemove', handleMouseMoveSplit);
    document.addEventListener('mouseup', handleMouseUpSplit);
  };

  const handleMouseMoveSplit = useCallback((e: MouseEvent) => {
    if (!isDraggingSplitRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const percentage = Math.min(80, Math.max(20, (offsetY / rect.height) * 100));
    setSplitRatio(percentage);
  }, []);

  const handleMouseUpSplit = useCallback(() => {
    isDraggingSplitRef.current = false;
    document.removeEventListener('mousemove', handleMouseMoveSplit);
    document.removeEventListener('mouseup', handleMouseUpSplit);
  }, [handleMouseMoveSplit]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0b0f17] text-slate-100 overflow-hidden font-sans">
      {/* Top Header & Execution Toolbar */}
      <HeaderBar
        currentDb={currentDb}
        params={params}
        onParamsChange={setParams}
        onExecute={() => handleExecute()}
        onFormat={handleFormat}
        onClear={handleClear}
        isExecuting={isExecuting}
        historyCount={history.length}
        onOpenHistory={() => setActiveModal('history')}
        onOpenSnippets={() => setActiveModal('snippets')}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
      />

      {/* Main Workspace with Sidebar and Query Pane */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Sidebar: Databases and Table Schema Explorer */}
        <SidebarExplorer
          databases={databases}
          currentDb={currentDb}
          onSelectDb={(db) => {
            setCurrentDb(db);
          }}
          onRefresh={handleRefreshDatabases}
          isRefreshing={isRefreshingDbs}
          onTableQueryClick={handleTableQueryClick}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Center Main Panel (Split between SQL Editor and Results) */}
        <main ref={containerRef} className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
          {/* Top Half: SQL Editor */}
          <div style={{ height: `${splitRatio}%` }} className="min-h-[120px] shrink-0">
            <SqlEditor
              tabs={tabs}
              activeTabId={activeTabId}
              onSelectTab={handleSelectTab}
              onCloseTab={handleCloseTab}
              onNewTab={handleNewTab}
              onSqlChange={handleSqlChange}
              onExecute={handleExecute}
              onFormat={handleFormat}
              isExecuting={isExecuting}
              currentDb={currentDb}
            />
          </div>

          {/* Draggable Divider */}
          <div
            onMouseDown={handleMouseDownSplit}
            className="h-2 bg-[#0a0e17] hover:bg-blue-600/50 cursor-row-resize flex items-center justify-center transition-colors border-y border-slate-800/80 group shrink-0 select-none z-10"
            title="拖拽调节编辑器与结果表格区域比例"
          >
            <div className="w-10 h-1 rounded-full bg-slate-700 group-hover:bg-blue-300 transition-colors" />
          </div>

          {/* Bottom Half: Results Grid & Metrics */}
          <div style={{ height: `${100 - splitRatio}%` }} className="flex-1 min-h-[140px] overflow-hidden">
            <ResultsGrid
              result={result}
              isExecuting={isExecuting}
              onInspectCell={(colName, value) => setInspectedCell({ colName, value })}
            />
          </div>
        </main>
      </div>

      {/* Modals */}
      <CellDetailModal
        cell={inspectedCell}
        onClose={() => setInspectedCell(null)}
      />

      <QueryHistoryModal
        isOpen={activeModal === 'history'}
        onClose={() => setActiveModal(null)}
        history={history}
        onSelectQuery={(sql) => handleSqlChange(activeTabId, sql)}
        onClearHistory={() => setHistory([])}
      />

      <SnippetsModal
        isOpen={activeModal === 'snippets'}
        onClose={() => setActiveModal(null)}
        onSelectSnippet={handleSelectSnippet}
      />
    </div>
  );
}
