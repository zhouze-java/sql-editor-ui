import React, { useState } from 'react';
import { X, BookMarked, ArrowUpRight, Search, Tag } from 'lucide-react';
import { QuerySnippet } from '../types/sql';
import { QUERY_SNIPPETS } from '../data/mockDatabases';

interface SnippetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSnippet: (sql: string) => void;
}

export const SnippetsModal: React.FC<SnippetsModalProps> = ({
  isOpen,
  onClose,
  onSelectSnippet
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('全部');

  if (!isOpen) return null;

  const categories = ['全部', '基础表查询', '字典维护', '统计汇总', '性能与排查'];

  const filtered = QUERY_SNIPPETS.filter((s) => {
    const matchesCat = activeCategory === '全部' || s.category === activeCategory;
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sql.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-[#111827] border border-slate-700 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">
              医院业务与运维 SQL 模板库
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Categories */}
        <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900/40 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索模板名称、语句或关键字..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Snippets List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              未搜索到匹配的模板语句
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="bg-[#090d15] border border-slate-800 hover:border-slate-700 rounded-lg p-3.5 transition-colors space-y-2.5 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      · {item.category}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onSelectSnippet(item.sql);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors shadow-xs"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>插入并切换</span>
                  </button>
                </div>

                <p className="text-xs text-slate-400">
                  {item.description}
                </p>

                <pre className="font-mono text-xs text-blue-300 bg-black/40 p-2.5 rounded border border-slate-800/80 overflow-x-auto">
                  {item.sql}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
