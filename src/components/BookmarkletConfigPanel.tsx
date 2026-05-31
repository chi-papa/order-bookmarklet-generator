/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BookmarkletConfig, ExportFormat } from '../types';
import { generateBookmarkletCode } from '../utils/bookmarkletGenerator';
import { Settings, Bookmark, Copy, Check, FileSpreadsheet, LayoutGrid, Eye, EyeOff } from 'lucide-react';

interface BookmarkletConfigPanelProps {
  config: BookmarkletConfig;
  onChangeConfig: (newConfig: BookmarkletConfig) => void;
}

export default function BookmarkletConfigPanel({ config, onChangeConfig }: BookmarkletConfigPanelProps) {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showJsSource, setShowJsSource] = useState<boolean>(false);

  const bookmarkletUrl = generateBookmarkletCode(config);

  const handleToggleFormat = (format: ExportFormat) => {
    onChangeConfig({ ...config, format });
  };

  const handleToggleHeader = () => {
    onChangeConfig({ ...config, includeHeader: !config.includeHeader });
  };

  const handleToggleCleanName = () => {
    onChangeConfig({ ...config, cleanProductName: !config.cleanProductName });
  };

  const handleCopyLinkCode = async () => {
    try {
      await navigator.clipboard.writeText(bookmarkletUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs flex flex-col justify-between h-full">
      {/* Settings Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          コピー設定とブックマークレットの作成
        </h2>

        {/* Configurations list */}
        <div className="flex flex-col gap-6">
          {/* Export Layout Grid Format */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">貼り付け形式の選択</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Option 1: Multi rows */}
              <button
                id="btn-format-multi-rows"
                onClick={() => handleToggleFormat('multi-rows')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  config.format === 'multi-rows'
                    ? 'border-indigo-600 bg-indigo-50/30 text-indigo-900 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50/50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <LayoutGrid className="w-4.5 h-4.5 shrink-0 text-indigo-600" />
                  <span className="text-xs font-bold">複数行形式（推奨）</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  1注文に複数商品がある場合、商品ごとに新しい行として出力します。発送管理や集計が圧倒的に容易になります。
                </p>
              </button>

              {/* Option 2: Single row */}
              <button
                id="btn-format-single-row"
                onClick={() => handleToggleFormat('single-row')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  config.format === 'single-row'
                    ? 'border-indigo-600 bg-indigo-50/30 text-indigo-900 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50/50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileSpreadsheet className="w-4.5 h-4.5 shrink-0 text-indigo-600" />
                  <span className="text-xs font-bold">単一行形式</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  複数商品を含めて右向きに連結し、1つの注文を必ず1つの行として出力します。1件1行で管理したい場合に適しています。
                </p>
              </button>
            </div>
          </div>

          {/* Additional Options */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">詳細書き出し設定</h3>
            <div className="flex flex-col gap-4 py-1 border-t border-slate-100 divide-y divide-slate-100">
              {/* Headers Toggle */}
              <div className="flex items-center justify-between pt-4">
                <div className="pr-4">
                  <span className="text-xs font-bold text-slate-800 block">一行目に項目名（ヘッダー）を含める</span>
                  <span className="text-[10px] text-slate-400 leading-normal">注文日、受注番号、などの列のタイトルを含めてコピーします。</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    id="chk-include-header"
                    checked={config.includeHeader}
                    onChange={handleToggleHeader}
                    className="sr-only peer animate-none"
                  />
                  <div className="w-9 h-5 bg-slate-200 hover:bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Product Name Cleaning */}
              <div className="flex items-center justify-between pt-4">
                <div className="pr-4">
                  <span className="text-xs font-bold text-slate-800 block">商品名から末尾のメーカー記号等を自動で取り除く</span>
                  <span className="text-[10px] text-slate-400 leading-normal">メーカーコードが商品名末尾の（）内に重複している時に、商品名側を綺麗にカットします。</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    id="chk-clean-product"
                    checked={config.cleanProductName}
                    onChange={handleToggleCleanName}
                    className="sr-only peer animate-none"
                  />
                  <div className="w-9 h-5 bg-slate-200 hover:bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bookmarklet Action buttons */}
      <div className="mt-8 bg-[#f8fafc] rounded-2xl border border-slate-200 p-6 flex flex-col gap-4 text-center">
        <div>
          <span className="text-xs font-bold text-slate-800 block mb-1">完成したブックマークレット</span>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            下のボタンをマウスでクリックしたまま、お使いのブラウザの「お気に入りバー（ブックマークバー）」へドラッグ＆ドロップして配置してください。
          </p>
        </div>

        {/* Drag and Drop Link Target */}
        <div className="flex justify-center my-1 select-none">
          <a
            href={bookmarkletUrl}
            id="bookmarklet-drag-link"
            onClick={(e) => {
              // Prevent standard click navigating
              e.preventDefault();
              alert('💡 このボタンは「ブックマークバー」にドラッグ＆ドロップして登録するボタンです。\n\nまたは下の「コードをコピー」でコードを取得し、お気に入りのURL欄に貼り付けて作成することもできます。');
            }}
            className="px-6 py-4 rounded-xl bg-indigo-600 font-bold text-white text-sm flex items-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200/50 cursor-grab active:cursor-grabbing hover:-translate-y-0.5 border-2 border-indigo-400 border-dashed"
            title="ドラッグ＆ドロップして登録する"
          >
            <Bookmark className="w-5 h-5 fill-white text-white shrink-0 animate-pulse" />
            RMS受注コピー 🌟
          </a>
        </div>

        {/* Copy code alternate */}
        <div className="flex gap-2">
          <button
            onClick={handleCopyLinkCode}
            id="btn-copy-code"
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              copiedLink
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                コピー完了！
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                コードを直接コピー
              </>
            )}
          </button>

          {/* Show full source */}
          <button
            onClick={() => setShowJsSource(!showJsSource)}
            className="px-3 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-500 hover:text-slate-700 cursor-pointer transition-all"
            title="コードを確認する"
          >
            {showJsSource ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Expanded source code display */}
        {showJsSource && (
          <div className="mt-2 text-left">
            <span className="text-[10px] font-bold text-slate-500 block mb-1">書き込まれるJSコードマニフェスト</span>
            <pre className="max-h-[150px] overflow-auto p-3 bg-slate-900 rounded-lg text-[9px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
              {bookmarkletUrl}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
