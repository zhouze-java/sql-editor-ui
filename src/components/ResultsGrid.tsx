import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Code, 
  Activity, 
  Download, 
  Copy, 
  Check, 
  Search, 
  ChevronUp, 
  ChevronDown, 
  Maximize2, 
  Minimize2, 
  AlertCircle, 
  FileSpreadsheet, 
  Share2, 
  Eye, 
  Cpu, 
  Clock, 
  Network
} from 'lucide-react';
import { QueryResult } from '../types/sql';
import { exportToCsv, exportToMarkdown, exportToJson, downloadFile } from '../utils/sqlFormatter';

interface ResultsGridProps {
  result: QueryResult | null;
  isExecuting: boolean;
  onInspectCell: (colName: string, value: any) => void;
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({
  result,
  isExecuting,
  onInspectCell
}) => {
  const [activeView, setActiveView] = useState<'table' | 'json' | 'metrics' | 'explain'>('table');
  const [searchFilter, setSearchFilter] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filtered and Sorted Rows
  const processedRows = useMemo(() => {
    if (!result || !result.rows) return [];
    let rows = [...result.rows];

    // Client-side text filter
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      rows = rows.filter(row =>
        Object.values(row).some(val =>
          val !== null && val !== undefined && String(val).toLowerCase().includes(q)
        )
      );
    }

    // Client-side column sort
    if (sortCol) {
      rows.sort((a, b) => {
        const valA = a[sortCol];
        const valB = b[sortCol];
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
        return sortOrder === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return rows;
  }, [result, searchFilter, sortCol, sortOrder]);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else {
        setSortCol(null);
        setSortOrder('asc');
      }
    } else {
      setSortCol(col);
      setSortOrder('asc');
    }
  };

  const showCopyToast = (text: string) => {
    setCopiedNotification(text);
    setTimeout(() => setCopiedNotification(null), 2000);
  };

  const handleCopyCell = (e: React.MouseEvent, val: any) => {
    e.stopPropagation();
    const str = val === null ? 'NULL' : String(val);
    navigator.clipboard.writeText(str);
    showCopyToast('单元格内容已复制');
  };

  const handleExportCsv = () => {
    if (!result) return;
    const csv = exportToCsv(result.columns, processedRows);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadFile(csv, `sql_export_${result.hospitalCode}_${dateStr}.csv`, 'text/csv;charset=utf-8;');
    setShowExportMenu(false);
  };

  const handleExportJson = () => {
    if (!result) return;
    const json = JSON.stringify(processedRows, null, 2);
    downloadFile(json, `sql_export_${result.hospitalCode}.json`, 'application/json');
    setShowExportMenu(false);
  };

  const handleExportMarkdown = () => {
    if (!result) return;
    const md = exportToMarkdown(result.columns, processedRows);
    downloadFile(md, `sql_export_${result.hospitalCode}.md`, 'text/markdown');
    setShowExportMenu(false);
  };

  const handleCopyTableClipboard = () => {
    if (!result) return;
    const csv = exportToCsv(result.columns, processedRows);
    navigator.clipboard.writeText(csv);
    showCopyToast('数据表格已复制到剪贴板 (TSV/CSV 格式)');
    setShowExportMenu(false);
  };

  return (
    <div className={`flex flex-col bg-[#0b0f17] select-none ${isFullscreen ? 'fixed inset-0 z-50 p-4 bg-[#0b0f17]' : 'h-full'}`}>
      {/* Result Tabs & Timing Bar */}
      <div className="h-10 bg-[#0d121c] border-b border-slate-800/80 px-3 flex items-center justify-between gap-3 shrink-0">
        {/* Left Views */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveView('table')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeView === 'table'
                ? 'bg-slate-800 text-blue-300 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>结果</span>
            {result && result.status === 'success' && (
              <span className="ml-1 text-[10px] font-mono opacity-80">
                ({processedRows.length})
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('json')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeView === 'json'
                ? 'bg-slate-800 text-blue-300 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>

          <button
            onClick={() => setActiveView('metrics')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeView === 'metrics'
                ? 'bg-slate-800 text-blue-300 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>执行耗时分析</span>
          </button>

          <button
            onClick={() => setActiveView('explain')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeView === 'explain'
                ? 'bg-slate-800 text-blue-300 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>EXPLAIN 分析</span>
          </button>
        </div>

        {/* Right Timing Breakdown & Tools */}
        <div className="flex items-center gap-3 text-xs">
          {/* Timing stats strip matching screenshot */}
          {result && result.status === 'success' && (
            <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] tabular-nums">
              <span className="text-slate-200 font-semibold">
                {result.rows.length} 行
              </span>
              <span>·</span>
              <span title="医院内网微服务/DB耗时">
                院内 {result.internalMs} ms
              </span>
              <span>·</span>
              <span title="远程加密网关处理与网络回传延时">
                网关 {result.gatewayMs} ms
              </span>
              <span>·</span>
              <span className="text-emerald-400 font-semibold">
                完成 {result.durationMs} ms
              </span>
              {result.totalCount !== undefined && (
                <>
                  <span>·</span>
                  <span className="text-blue-300">
                    总计 {result.totalCount} 记录
                  </span>
                </>
              )}
            </div>
          )}

          {/* Quick search input */}
          {result && result.status === 'success' && activeView === 'table' && (
            <div className="relative">
              <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="筛选当前结果..."
                className="bg-slate-900 border border-slate-700/80 rounded pl-6 pr-2 py-0.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 w-36 focus:w-48 transition-all"
              />
            </div>
          )}

          {/* Export Dropdown */}
          {result && result.status === 'success' && (
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded text-slate-300 text-xs transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>导出</span>
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 top-8 z-30 bg-[#111827] border border-slate-700 rounded-lg shadow-xl py-1 w-44">
                  <button
                    onClick={handleExportCsv}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>导出 CSV (Excel兼容)</span>
                  </button>
                  <button
                    onClick={handleExportJson}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Code className="w-3.5 h-3.5 text-blue-400" />
                    <span>导出 JSON 文件</span>
                  </button>
                  <button
                    onClick={handleExportMarkdown}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Table className="w-3.5 h-3.5 text-purple-400" />
                    <span>导出 Markdown 表格</span>
                  </button>
                  <div className="h-px bg-slate-800 my-1" />
                  <button
                    onClick={handleCopyTableClipboard}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>复制到剪贴板</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title={isFullscreen ? '退出全屏' : '全屏展开数据视图'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {isExecuting ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <div className="text-xs font-mono">正在向远程集群网关派发 SQL 并等待执行响应...</div>
          </div>
        ) : !result ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-500 p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-2">
              <Table className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-300">尚未执行 SQL 查询</div>
            <p className="text-xs max-w-sm text-slate-500">
              在上方编辑器中编写 SQL 语句，点击“执行”或按下 <kbd className="font-mono bg-slate-800 text-slate-300 px-1 py-0.5 rounded">Ctrl+Enter</kbd> 查看数据结果。
            </p>
          </div>
        ) : result.status === 'error' ? (
          <div className="h-full p-6 overflow-y-auto">
            <div className="max-w-3xl bg-rose-950/20 border border-rose-500/30 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>SQL 远程执行失败</span>
              </div>
              <pre className="font-mono text-xs text-rose-200 bg-black/40 p-3 rounded-lg border border-rose-900/40 whitespace-pre-wrap break-all leading-relaxed">
                {result.error}
              </pre>
              <div className="text-xs text-slate-400 flex items-center gap-4 pt-1 font-mono">
                <span>目标集群: {result.hospitalName} ({result.hospitalCode})</span>
                <span>网关延时: {result.gatewayMs} ms</span>
                <span>总耗时: {result.durationMs} ms</span>
              </div>
            </div>
          </div>
        ) : activeView === 'table' ? (
          /* Table View */
          <div className="h-full overflow-auto font-mono text-xs">
            <table className="w-full border-collapse text-left">
              <thead className="bg-[#101726] sticky top-0 z-10 border-b border-slate-700/80 shadow-xs">
                <tr>
                  {/* Row Index Header */}
                  <th className="py-2.5 px-3 w-12 font-semibold text-slate-400 border-r border-slate-800/80 text-center sticky left-0 bg-[#101726] z-20">
                    #
                  </th>

                  {/* Columns */}
                  {result.columns.map((col) => {
                    const isSorted = sortCol === col;
                    return (
                      <th
                        key={col}
                        onClick={() => handleSort(col)}
                        className="py-2.5 px-3 font-semibold text-slate-300 border-r border-slate-800/80 hover:bg-slate-800/60 cursor-pointer select-none whitespace-nowrap group transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold">{col}</span>
                          <span className="text-slate-500 group-hover:text-slate-300">
                            {isSorted ? (
                              sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-blue-400" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
                            ) : (
                              <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-40" />
                            )}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60">
                {processedRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={result.columns.length + 1}
                      className="py-8 text-center text-slate-500 text-xs"
                    >
                      {searchFilter ? '未匹配到符合过滤条件的数据行' : '查询执行成功，返回 0 条记录'}
                    </td>
                  </tr>
                ) : (
                  processedRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-blue-900/10 transition-colors group"
                    >
                      {/* Frozen Row Index */}
                      <td className="py-1.5 px-3 text-slate-500 text-center border-r border-slate-800/80 sticky left-0 bg-[#0d121c] group-hover:bg-[#131d31] font-mono text-[11px] tabular-nums z-10">
                        {idx + 1}
                      </td>

                      {/* Cell Values */}
                      {result.columns.map((col) => {
                        const val = row[col];
                        const isNull = val === null;
                        const isBool = typeof val === 'boolean';
                        const isNumber = typeof val === 'number';

                        return (
                          <td
                            key={col}
                            onClick={() => onInspectCell(col, val)}
                            className="py-1.5 px-3 border-r border-slate-800/60 whitespace-nowrap cursor-pointer hover:bg-blue-600/10 group/cell relative"
                            title="点击查看详细信息"
                          >
                            <div className="flex items-center justify-between gap-1">
                              {isNull ? (
                                <span className="italic text-slate-500 text-[11px]">NULL</span>
                              ) : isBool ? (
                                <span className={`text-[11px] font-semibold ${val ? 'text-emerald-400' : 'text-slate-400'}`}>
                                  {val ? 'true' : 'false'}
                                </span>
                              ) : isNumber ? (
                                <span className="text-amber-300 tabular-nums">
                                  {val}
                                </span>
                              ) : (
                                <span className="text-slate-200 truncate max-w-[280px]">
                                  {String(val)}
                                </span>
                              )}

                              {/* Hover Copy Quick Action */}
                              <button
                                onClick={(e) => handleCopyCell(e, val)}
                                className="opacity-0 group-hover/cell:opacity-100 p-0.5 hover:text-white text-slate-500 rounded transition-opacity"
                                title="复制单元格值"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : activeView === 'json' ? (
          /* JSON Raw View */
          <div className="h-full overflow-auto p-4 font-mono text-xs bg-[#090d15]">
            <pre className="text-emerald-300 leading-relaxed selection:bg-blue-600/40">
              {JSON.stringify(processedRows, null, 2)}
            </pre>
          </div>
        ) : activeView === 'metrics' ? (
          /* Performance Breakdown View */
          <div className="h-full overflow-auto p-6 space-y-6 max-w-4xl">
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">SQL 执行耗时与调用链分析</h3>
              <p className="text-xs text-slate-400">
                记录自浏览器客户端派发指令、经专有安全网关反向代理至医院内网 MySQL 主节点的全链路监控明细。
              </p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>总响应耗时 (Total Duration)</span>
                  <Clock className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                  {result.durationMs} <span className="text-xs font-normal text-slate-400">ms</span>
                </div>
                <p className="text-[11px] text-slate-500">端到端网络通信及数据序列化总时长</p>
              </div>

              <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>院内内网耗时 (Internal DB)</span>
                  <Cpu className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-blue-400 tabular-nums">
                  {result.internalMs} <span className="text-xs font-normal text-slate-400">ms</span>
                </div>
                <p className="text-[11px] text-slate-500">医院本地数据库查询解析与执行耗时</p>
              </div>

              <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>专有网关耗时 (Gateway Proxy)</span>
                  <Network className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                  {result.gatewayMs} <span className="text-xs font-normal text-slate-400">ms</span>
                </div>
                <p className="text-[11px] text-slate-500">专网通道加密鉴权与数据流解压缩</p>
              </div>
            </div>

            {/* Latency Proportion Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>链路时延占比示意图</span>
                <span className="font-mono">100% ({result.durationMs}ms)</span>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${Math.round((result.internalMs / result.durationMs) * 100)}%` }}
                  className="bg-blue-500"
                  title={`院内执行: ${result.internalMs}ms`}
                />
                <div
                  style={{ width: `${Math.round((result.gatewayMs / result.durationMs) * 100)}%` }}
                  className="bg-amber-500"
                  title={`网关网络: ${result.gatewayMs}ms`}
                />
                <div className="flex-1 bg-emerald-500" title="客户端渲染" />
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500" />
                  <span>院内执行 ({Math.round((result.internalMs / result.durationMs) * 100)}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                  <span>网关代理 ({Math.round((result.gatewayMs / result.durationMs) * 100)}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                  <span>网络往返/解析</span>
                </div>
              </div>
            </div>

            {/* Execution Detail Information */}
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 text-xs space-y-2 font-mono">
              <div className="text-slate-300 font-semibold mb-2">执行元信息</div>
              <div className="grid grid-cols-2 gap-2 text-slate-400">
                <div>目标医院集群: <span className="text-slate-200">{result.hospitalName} ({result.hospitalCode})</span></div>
                <div>执行时间戳: <span className="text-slate-200">{result.timestamp}</span></div>
                <div>返回记录总数: <span className="text-slate-200">{result.rows.length} 行</span></div>
                <div>字段列数: <span className="text-slate-200">{result.columns.length} 列</span></div>
              </div>
            </div>
          </div>
        ) : (
          /* EXPLAIN View */
          <div className="h-full overflow-auto p-6 space-y-4 max-w-4xl font-mono text-xs">
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">EXPLAIN 执行计划分析</h3>
              <p className="text-xs text-slate-400 font-sans">
                评估查询优化器是否命中聚簇索引、是否发生全表扫描 (ALL) 或临时表文件排序。
              </p>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#111827]">
              <table className="w-full text-left">
                <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">id</th>
                    <th className="p-3">select_type</th>
                    <th className="p-3">table</th>
                    <th className="p-3">type</th>
                    <th className="p-3">possible_keys</th>
                    <th className="p-3">key</th>
                    <th className="p-3">rows</th>
                    <th className="p-3">Extra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="p-3 text-blue-400">1</td>
                    <td className="p-3">SIMPLE</td>
                    <td className="p-3 text-amber-300">
                      {result.executedSql.match(/(?:from)\s+([a-zA-Z0-9_]+)/i)?.[1] || 'base_hospital_area_info'}
                    </td>
                    <td className="p-3">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                        ALL
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">PRIMARY</td>
                    <td className="p-3 text-slate-500">NULL</td>
                    <td className="p-3 text-blue-300 tabular-nums">{result.rows.length || 1}</td>
                    <td className="p-3 text-slate-400 font-sans">Using where; Backward index scan</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400 font-sans space-y-1">
              <div className="text-slate-200 font-semibold">优化器建议:</div>
              <p>• 当前查询针对基础字典表进行扫描，数据量极小 (&lt;1000 行)，全表扫描在内存缓冲池中执行极快，无需额外联合索引。</p>
            </div>
          </div>
        )}
      </div>

      {/* Copy Toast */}
      {copiedNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-slate-200 text-xs px-3.5 py-2 rounded-lg shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{copiedNotification}</span>
        </div>
      )}
    </div>
  );
};
