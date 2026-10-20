import React, { useState } from 'react';
import { X, Copy, Check, Eye } from 'lucide-react';

interface CellDetailModalProps {
  cell: { colName: string; value: any } | null;
  onClose: () => void;
}

export const CellDetailModal: React.FC<CellDetailModalProps> = ({ cell, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!cell) return null;

  const strValue = cell.value === null ? 'NULL' : typeof cell.value === 'object' ? JSON.stringify(cell.value, null, 2) : String(cell.value);

  const handleCopy = () => {
    navigator.clipboard.writeText(strValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-[#111827] border border-slate-700 rounded-xl w-full max-w-lg p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white font-mono">
              字段详情: <span className="text-blue-400">{cell.colName}</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>数据类型: <span className="text-slate-200 font-mono">{cell.value === null ? 'NULL' : typeof cell.value}</span></span>
            <span className="font-mono">长度: {strValue.length} 字符</span>
          </div>

          <div className="bg-[#090d15] border border-slate-800 rounded-lg p-3 max-h-60 overflow-y-auto">
            <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap break-all selection:bg-blue-600/30">
              {strValue}
            </pre>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-[11px] text-slate-500">
            支持完整复制包含格式的字段原值
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-md transition-colors"
            >
              关闭
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-md shadow transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制' : '复制原值'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
