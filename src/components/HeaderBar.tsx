import React, { useState } from 'react';
import { 
  Play, 
  Sparkles, 
  Trash2, 
  History, 
  BookMarked, 
  KeyRound, 
  Settings, 
  Check, 
  Clock,
  Layers,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { DatabaseEnv, QueryParams } from '../types/sql';

interface HeaderBarProps {
  currentDb: DatabaseEnv;
  params: QueryParams;
  onParamsChange: (params: QueryParams) => void;
  onExecute: () => void;
  onFormat: () => void;
  onClear: () => void;
  isExecuting: boolean;
  historyCount: number;
  onOpenHistory: () => void;
  onOpenSnippets: () => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentDb,
  params,
  onParamsChange,
  onExecute,
  onFormat,
  onClear,
  isExecuting,
  historyCount,
  onOpenHistory,
  onOpenSnippets,
  apiKey,
  onApiKeyChange
}) => {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [keySavedToast, setKeySavedToast] = useState(false);

  const getEnvBadge = () => {
    switch (currentDb.env) {
      case 'prod':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            生产环境 (只读)
          </span>
        );
      case 'pre':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
            预发环境
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
            测试环境
          </span>
        );
    }
  };

  const handleSaveKey = () => {
    onApiKeyChange(tempKey);
    setShowKeyModal(false);
    setKeySavedToast(true);
    setTimeout(() => setKeySavedToast(false), 2000);
  };

  return (
    <header className="h-14 bg-[#0d131f] border-b border-slate-800/80 px-4 flex items-center justify-between gap-4 select-none shrink-0 z-20">
      {/* Zone 1: Brand & Active Cluster Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-inner shadow-white/20">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            ebei-remote-sql
          </span>
        </div>

        <span className="text-slate-600 hidden sm:inline">/</span>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-slate-200 truncate">
            {currentDb.name}
          </span>
          <span className="text-xs font-mono text-slate-400">
            ({currentDb.code})
          </span>
          {getEnvBadge()}
        </div>
      </div>

      {/* Zone 2: Query Control Toolbar */}
      <div className="flex items-center gap-2">
        {/* Run Button */}
        <button
          onClick={onExecute}
          disabled={isExecuting}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold text-white transition-all shadow-sm ${
            isExecuting
              ? 'bg-emerald-600/60 cursor-not-allowed opacity-80'
              : 'bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] shadow-emerald-900/40 hover:shadow-emerald-900/60'
          }`}
          title="执行查询 (Ctrl+Enter 或 ⌘+Enter)"
        >
          {isExecuting ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span>{isExecuting ? '执行中...' : '执行'}</span>
          <span className="text-[10px] opacity-75 font-mono hidden md:inline bg-emerald-700/60 px-1 py-0.5 rounded">
            Ctrl+↵
          </span>
        </button>

        {/* Max Rows Input */}
        <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-md px-2 py-1 text-xs">
          <span className="text-slate-400 mr-1.5 whitespace-nowrap">maxRows</span>
          <select
            value={params.maxRows}
            onChange={(e) => onParamsChange({ ...params, maxRows: Number(e.target.value) })}
            className="bg-transparent text-slate-200 font-mono focus:outline-none cursor-pointer"
          >
            <option value={100} className="bg-slate-900">100</option>
            <option value={500} className="bg-slate-900">500</option>
            <option value={1000} className="bg-slate-900">1000</option>
            <option value={5000} className="bg-slate-900">5000</option>
          </select>
        </div>

        {/* Timeout Input */}
        <div className="hidden lg:flex items-center bg-slate-900/90 border border-slate-700/80 rounded-md px-2 py-1 text-xs">
          <span className="text-slate-400 mr-1.5 whitespace-nowrap">timeoutMs</span>
          <input
            type="number"
            value={params.timeoutMs}
            onChange={(e) => onParamsChange({ ...params, timeoutMs: Number(e.target.value) })}
            className="w-14 bg-transparent text-slate-200 font-mono focus:outline-none text-right"
            step={1000}
            min={1000}
            max={60000}
          />
        </div>

        {/* Query Count Toggle */}
        <label className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/70 border border-slate-700/80 rounded-md text-xs text-slate-300 cursor-pointer hover:bg-slate-800/80 transition-colors">
          <input
            type="checkbox"
            checked={params.queryCount}
            onChange={(e) => onParamsChange({ ...params, queryCount: e.target.checked })}
            className="rounded border-slate-700 text-blue-600 focus:ring-0 focus:ring-offset-0 bg-slate-950 w-3.5 h-3.5 cursor-pointer"
          />
          <span className="whitespace-nowrap">查询 Count</span>
        </label>

        <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

        {/* Format SQL */}
        <button
          onClick={onFormat}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 rounded-md transition-colors"
          title="美化 SQL 语句 (Shift+Alt+F)"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">格式化</span>
        </button>

        {/* Snippets / Templates */}
        <button
          onClick={onOpenSnippets}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 rounded-md transition-colors"
          title="常用 SQL 模板库"
        >
          <BookMarked className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">模板库</span>
        </button>

        {/* Query History */}
        <button
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 rounded-md transition-colors relative"
          title="执行历史记录"
        >
          <History className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">历史</span>
          {historyCount > 0 && (
            <span className="px-1 py-0.2 text-[10px] font-mono bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
              {historyCount}
            </span>
          )}
        </button>

        {/* Clear */}
        <button
          onClick={onClear}
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/40 rounded-md transition-colors"
          title="清空当前编辑器"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Zone 3: API Key & System Auth */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => {
            setTempKey(apiKey);
            setShowKeyModal(true);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-md text-xs text-slate-300 transition-colors"
        >
          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline font-mono">
            {apiKey ? `API Key: ${apiKey.slice(0, 4)}••••` : '配置 API Key'}
          </span>
          <span className="md:hidden">Key</span>
        </button>
      </div>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-semibold text-white">远程网关鉴权配置</h3>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-400 leading-relaxed">
                输入您的专有网关令牌 (Gateway API Token) 以连接医院内网微服务与远程数据库代理网关。
              </p>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  API Key / Access Token
                </label>
                <input
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="ebei_sec_••••••••••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>网关直连协议安全验证</span>
                </div>
                <p>请求均经由专有网关反向代理，支持跨医院内网安全审计与慢SQL拦截。</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-md transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveKey}
                className="px-4 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-md shadow transition-colors"
              >
                保存鉴权配置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {keySavedToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs px-3 py-2 rounded-lg shadow-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>API Key 配置已更新生效</span>
        </div>
      )}
    </header>
  );
};
