import React from 'react';
import { X, History, Play, Trash2, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { QueryHistoryItem } from '../types/sql';

interface QueryHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: QueryHistoryItem[];
  onSelectQuery: (sql: string) => void;
  onClearHistory: () => void;
}

export const QueryHistoryModal: React.FC<QueryHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectQuery,
  onClearHistory
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-[#111827] border border-slate-700 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">
              执行历史记录 ({history.length})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 px-2 py-1 hover:bg-rose-950/30 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>清空历史</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              暂无历史执行记录
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="bg-[#090d15] border border-slate-800 hover:border-slate-700 rounded-lg p-3 transition-colors space-y-2 group"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    {item.status === 'success' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    )}
                    <span className="font-semibold text-slate-200">{item.hospitalName}</span>
                    <span className="font-mono text-slate-500">({item.hospitalCode})</span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-slate-500">{item.timestamp}</span>
                    <span className="text-emerald-400">{item.durationMs}ms</span>
                    <span className="text-blue-400">{item.rowCount} 行</span>
                  </div>
                </div>

                <pre className="font-mono text-xs text-slate-300 bg-black/40 p-2.5 rounded border border-slate-800/80 overflow-x-auto">
                  {item.sql}
                </pre>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => {
                      onSelectQuery(item.sql);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded transition-colors"
                  >
                    <ArrowUpRight className="w-3 h-3" />
                    <span>载入编辑器</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
