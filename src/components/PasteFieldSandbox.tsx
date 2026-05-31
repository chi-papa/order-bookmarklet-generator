/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, ClipboardEvent } from 'react';
import { Clipboard, Grid, FileSpreadsheet, Trash2 } from 'lucide-react';

export default function PasteFieldSandbox() {
  const [pastedData, setPastedData] = useState<string[][]>([]);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    if (!text) return;

    // Parse Tab-Separated Data
    const rows = text.split(/\r?\n/).filter(line => line.trim() !== '');
    const grid = rows.map(row => row.split('\t'));
    setPastedData(grid);
  };

  const handleClear = () => {
    setPastedData([]);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
            <Clipboard className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-md font-bold text-slate-900">📋 エクセル貼り付けシミュレーション（検証ゾーン）</h2>
            <p className="text-xs text-slate-500">コピーしたデータを下の入力欄に貼り付け（Ctrl + V）て、Excelと同じようにセルごとに分かれるか確認できます。</p>
          </div>
        </div>
        {pastedData.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Trash2 className="w-4 h-4" />
            データをクリア
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Paste Area */}
        <div className="lg:col-span-4 flex flex-col">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 block">貼り付け用テキストエリア</span>
          <div className="relative flex-1 min-h-[140px]">
            <textarea
              onPaste={handlePaste}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="ここにフォーカスを合わせて「Ctrl + V」（Macは「Cmd + V」）でペーストしてください。"
              className={`w-full h-full p-4 text-xs bg-slate-50 border rounded-xl resize-none outline-hidden transition-all duration-250 flex items-center justify-center text-center leading-relaxed ${
                isFocused
                  ? 'bg-emerald-50/10 border-emerald-500 ring-4 ring-emerald-500/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            />
            {isFocused && (
              <span className="absolute top-2.5 right-2.5 text-[9px] bg-emerald-500 text-white font-mono px-1.5 rounded p-0.5 select-none animate-pulse font-bold">
                貼り付け待機中...
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Spreadsheet Parser */}
        <div className="lg:col-span-8 flex flex-col">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1">
            <Grid className="w-4 h-4 text-slate-400" />
            Excel貼付後のプレビュー（セル割付け状態）
          </span>
          
          {pastedData.length === 0 ? (
            <div className="flex-1 min-h-[140px] bg-slate-50 rounded-xl border border-dashed border-slate-250 flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <FileSpreadsheet className="w-8 h-8 text-emerald-200 mb-2" />
              <p className="text-xs font-medium">
                左側の枠内にコピーしたデータをペーストすると、<br />ここに分割表（Excelのワークシート表現）が作成されます。
              </p>
            </div>
          ) : (
            <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs max-h-[220px] overflow-auto">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-100 divide-x divide-slate-200 border-b border-slate-200 text-slate-500 font-mono">
                    <th className="p-1 px-2 text-center w-8 bg-slate-150">#</th>
                    {pastedData[0] && pastedData[0].map((_, colIdx) => (
                      <th key={colIdx} className="p-1.5 px-3 text-center bg-slate-150">
                        {String.fromCharCode(65 + (colIdx % 26))}列
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {pastedData.map((row, rowIdx) => (
                    <tr key={rowIdx} className="divide-x divide-slate-200 hover:bg-emerald-50/10 transition-all">
                      <td className="p-1 px-2 font-mono font-bold text-center bg-slate-50 border-r border-slate-200 text-slate-400 w-8 select-none">
                        {rowIdx + 1}
                      </td>
                      {row.map((cellText, cellIdx) => (
                        <td key={cellIdx} className="p-2 px-3 font-sans text-slate-700 bg-white hover:bg-slate-50 min-w-[100px] truncate" title={cellText}>
                          {cellText ? (
                            cellText
                          ) : (
                            <span className="text-slate-300 italic">空欄</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
