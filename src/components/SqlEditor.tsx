import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Plus, 
  X, 
  Play, 
  Sparkles, 
  Code2, 
  Copy, 
  Check, 
  FileCode,
  Terminal
} from 'lucide-react';
import { QueryTab, DatabaseEnv } from '../types/sql';
import { SQL_KEYWORDS, SQL_FUNCTIONS } from '../utils/sqlFormatter';

interface SqlEditorProps {
  tabs: QueryTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
  onSqlChange: (id: string, newSql: string) => void;
  onExecute: (customSql?: string) => void;
  onFormat: () => void;
  isExecuting: boolean;
  currentDb: DatabaseEnv;
}

export const SqlEditor: React.FC<SqlEditorProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onSqlChange,
  onExecute,
  onFormat,
  isExecuting,
  currentDb
}) => {
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [selectedText, setSelectedText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionQuery, setSuggestionQuery] = useState('');
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

  // Auto-complete candidates pool (Keywords, Tables, Columns)
  const allSuggestions = useMemo(() => {
    const list: Array<{ label: string; type: 'keyword' | 'table' | 'column'; detail?: string }> = [];

    // Keywords
    SQL_KEYWORDS.forEach(kw => {
      list.push({ label: kw, type: 'keyword', detail: 'SQL 关键字' });
    });

    // Functions
    SQL_FUNCTIONS.forEach(fn => {
      list.push({ label: fn, type: 'keyword', detail: '内置聚合/标量函数' });
    });

    // Tables from current DB
    currentDb.tables.forEach(t => {
      list.push({ label: t.name, type: 'table', detail: t.comment });
      t.columns.forEach(col => {
        list.push({ label: col.name, type: 'column', detail: `${col.type} - ${col.comment}` });
      });
    });

    return list;
  }, [currentDb]);

  // Filter suggestions based on active typing
  const filteredSuggestions = useMemo(() => {
    if (!suggestionQuery || suggestionQuery.length < 2) return [];
    return allSuggestions
      .filter(s => s.label.toLowerCase().includes(suggestionQuery.toLowerCase()))
      .slice(0, 8);
  }, [allSuggestions, suggestionQuery]);

  // Handle textarea selection and cursor tracking
  const handleTextareaSelect = () => {
    if (!textareaRef.current) return;
    const text = textareaRef.current.value;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;

    // Line and Column
    const beforeCursor = text.substring(0, start);
    const lines = beforeCursor.split('\n');
    const currentLine = lines.length;
    const currentCol = lines[lines.length - 1].length + 1;
    setCursorPos({ line: currentLine, col: currentCol });

    // Selected text
    if (end > start) {
      setSelectedText(text.substring(start, end).trim());
    } else {
      setSelectedText('');
    }

    // Determine word before cursor for auto-complete
    const lastWordMatch = beforeCursor.match(/([a-zA-Z0-9_]+)$/);
    if (lastWordMatch && lastWordMatch[1].length >= 2) {
      setSuggestionQuery(lastWordMatch[1]);
      setShowSuggestions(true);
      setSelectedSuggestionIndex(0);
    } else {
      setShowSuggestions(false);
    }
  };

  // Keyboard shortcut handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Execute on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (selectedText) {
        onExecute(selectedText);
      } else {
        onExecute();
      }
      return;
    }

    // Format SQL on Alt+Shift+F
    if (e.altKey && e.shiftKey && (e.key === 'f' || e.key === 'F')) {
      e.preventDefault();
      onFormat();
      return;
    }

    // Handle Suggestions with Tab / Enter / Arrows
    if (showSuggestions && filteredSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev + 1) % filteredSuggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        applySuggestion(filteredSuggestions[selectedSuggestionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        return;
      }
    }

    // Handle Tab key insertion (2 spaces)
    if (e.key === 'Tab') {
      e.preventDefault();
      if (!textareaRef.current) return;
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const val = activeTab.sql;
      const newSql = val.substring(0, start) + '  ' + val.substring(end);
      onSqlChange(activeTab.id, newSql);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const applySuggestion = (item: { label: string }) => {
    if (!textareaRef.current) return;
    const text = activeTab.sql;
    const start = textareaRef.current.selectionStart;
    const beforeCursor = text.substring(0, start);
    const afterCursor = text.substring(start);
    const lastWordMatch = beforeCursor.match(/([a-zA-Z0-9_]+)$/);

    if (lastWordMatch) {
      const replaceStart = start - lastWordMatch[1].length;
      const newText = text.substring(0, replaceStart) + item.label + (item.label.includes('(') ? '' : ' ') + afterCursor;
      onSqlChange(activeTab.id, newText);
      setShowSuggestions(false);
      setTimeout(() => {
        if (textareaRef.current) {
          const newPos = replaceStart + item.label.length + 1;
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newPos;
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(activeTab.sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compute line count
  const linesCount = useMemo(() => {
    return Math.max(1, (activeTab?.sql || '').split('\n').length);
  }, [activeTab?.sql]);

  return (
    <div className="flex flex-col h-full bg-[#0d111a] border-b border-slate-800/80 relative">
      {/* Tab Navigation Header */}
      <div className="flex items-center justify-between bg-[#0a0e17] px-2 pt-1 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`group flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-t-md transition-all cursor-pointer border-t border-l border-r ${
                  isActive
                    ? 'bg-[#0d111a] text-slate-100 border-slate-700 font-semibold'
                    : 'bg-transparent text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/60'
                }`}
              >
                <FileCode className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                <span className="truncate max-w-[140px]">{tab.title}</span>
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            onClick={onNewTab}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
            title="新建查询 Tab"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tab Quick Tools */}
        <div className="flex items-center gap-1 pb-1">
          {selectedText && (
            <button
              onClick={() => onExecute(selectedText)}
              className="flex items-center gap-1 px-2 py-1 text-[11px] bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded transition-colors animate-pulse"
              title="仅执行当前鼠标高亮选中的 SQL 片段"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>执行选中 ({selectedText.length} 字符)</span>
            </button>
          )}

          <button
            onClick={copySql}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            title="复制整段 SQL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 relative flex min-h-0 overflow-hidden font-mono text-xs">
        {/* Line Numbers Gutter */}
        <div className="w-12 bg-[#090d15] text-slate-600 select-none py-2 text-right pr-3 shrink-0 border-r border-slate-800/60 leading-6">
          {Array.from({ length: linesCount }, (_, i) => i + 1).map((n) => (
            <div
              key={n}
              className={`${cursorPos.line === n ? 'text-blue-400 font-semibold' : ''}`}
            >
              {n}
            </div>
          ))}
        </div>

        {/* Textarea Code Input */}
        <div className="flex-1 relative h-full">
          <textarea
            ref={textareaRef}
            value={activeTab.sql}
            onChange={(e) => onSqlChange(activeTab.id, e.target.value)}
            onSelect={handleTextareaSelect}
            onKeyUp={handleTextareaSelect}
            onClick={handleTextareaSelect}
            onKeyDown={handleKeyDown}
            placeholder="输入 SQL 查询语句，例如: SELECT * from base_hospital_area_info;"
            spellCheck={false}
            className="w-full h-full p-2 bg-transparent text-slate-100 resize-none focus:outline-none font-mono text-xs leading-6 selection:bg-blue-600/35 selection:text-white"
          />

          {/* Autocomplete Suggestion Dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div 
              className="absolute left-6 top-8 z-30 bg-[#111827] border border-slate-700/80 rounded-lg shadow-2xl py-1 w-72 backdrop-blur-md"
            >
              <div className="px-2.5 py-1 text-[10px] text-slate-400 font-sans border-b border-slate-800 flex items-center justify-between">
                <span>智能代码补全 (Tab/Enter 采纳)</span>
                <span className="font-mono text-blue-400">↑↓ 选择</span>
              </div>
              {filteredSuggestions.map((item, index) => {
                const isSelected = index === selectedSuggestionIndex;
                return (
                  <div
                    key={item.label + index}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applySuggestion(item);
                    }}
                    className={`px-3 py-1.5 flex items-center justify-between cursor-pointer text-xs ${
                      isSelected ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                        item.type === 'keyword' 
                          ? 'bg-purple-900/40 text-purple-300' 
                          : item.type === 'table'
                          ? 'bg-blue-900/40 text-blue-300'
                          : 'bg-emerald-900/40 text-emerald-300'
                      }`}>
                        {item.type}
                      </span>
                      <span className="font-semibold truncate">{item.label}</span>
                    </div>
                    {item.detail && (
                      <span className={`text-[10px] truncate max-w-[120px] ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                        {item.detail}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Editor Status Bar */}
      <div className="h-6 bg-[#0a0e17] border-t border-slate-800/80 px-3 flex items-center justify-between text-[11px] text-slate-500 select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Terminal className="w-3 h-3 text-slate-400" />
            <span>MySQL 8.0 兼容方言</span>
          </span>
          <span>·</span>
          <span>按 <kbd className="font-mono bg-slate-800 px-1 py-0.2 rounded text-slate-300">Ctrl+↵</kbd> 执行</span>
          <span>·</span>
          <span>按 <kbd className="font-mono bg-slate-800 px-1 py-0.2 rounded text-slate-300">Shift+Alt+F</kbd> 格式化</span>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <span>行 {cursorPos.line}, 列 {cursorPos.col}</span>
          <span>·</span>
          <span>{activeTab.sql.length} 字符</span>
        </div>
      </div>
    </div>
  );
};
