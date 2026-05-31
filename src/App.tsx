/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BookmarkletConfig } from './types';
import InstructiveFlow from './components/InstructiveFlow';
import BookmarkletConfigPanel from './components/BookmarkletConfigPanel';
import RmsSimulator from './components/RmsSimulator';
import PasteFieldSandbox from './components/PasteFieldSandbox';
import HtmlParserSandbox from './components/HtmlParserSandbox';
import { HelpCircle, Star, Sparkles, BookOpen, FileCheck } from 'lucide-react';

export default function App() {
  const [config, setConfig] = useState<BookmarkletConfig>({
    format: 'multi-rows',
    includeHeader: true,
    excludeEmptyRows: true,
    cleanProductName: true,
    manufacturerCodePattern: 'parentheses-jp'
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-16">
      {/* Visual Elegant Top Header Banner */}
      <header className="bg-white border-b border-slate-250 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/20 via-slate-50/30 to-indigo-50/20" />
        <div className="max-w-7xl mx-auto px-6 py-6 md:py-8 relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <div className="flex border-b border-indigo-100/60 pb-2 mb-3 w-fit items-center gap-1.5 text-xs text-indigo-700 font-bold bg-indigo-50/60 px-3 py-1 rounded-md border">
              <Sparkles className="w-3.5 h-3.5" />
              <span>店舗運営の集計・伝票入力を10倍速くする極小マクロ</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-indigo-100">EC</div>
              主要EC店舗・受注詳細コピー ブックマークレットジェネレーター
              <span className="text-xs font-mono font-medium bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-md select-none">
                v2.4.0
              </span>
            </h1>
            <p className="mt-3 text-sm text-slate-500 max-w-3xl leading-relaxed">
              主要ECモール（RMS店舗運営システムなど）の注文詳細画面から、<span className="font-semibold text-slate-700">注文日・受注番号・注文者名・送り先・複数の商品名・各個数・商品番号・末尾メーカーコード</span>などを
              ワンクリックで自動走査。Excel等にダイレクト貼り付け可能な「タブ区切りテキスト」に変換してクリップボードに格納するブックマークレットを瞬時に生成・動作検証できます。
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-semibold text-slate-400 font-mono">最終更新: 2026/05/31</span>
            <div className="h-4 w-[1px] bg-slate-200 hidden md:block"></div>
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              システム稼働中
            </span>
          </div>
        </div>
      </header>

      {/* Main Container Area */}
      <main className="max-w-7xl mx-auto px-6 mt-8 flex flex-col gap-8">
        
        {/* Toggle Bookmarks Bar Tip Callout */}
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 shadow-xs flex gap-4">
          <div className="p-2.5 bg-indigo-100 rounded-xl shrink-0 h-fit border border-indigo-200">
            <HelpCircle className="w-6 h-6 text-indigo-700" />
          </div>
          <div className="leading-relaxed">
            <span className="text-xs font-bold text-indigo-950 block mb-1">💡 重要な準備：ブラウザの「お気に入りバー（ブックマークバー）」を表示しておいてください</span>
            <div className="text-[11px] text-indigo-900/80 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-1">
              <div><strong className="text-indigo-950">● Chrome / Edge:</strong> ショートカット <kbd className="bg-white/85 border border-indigo-200 font-mono text-[10px] px-1 py-0.2 rounded-md shadow-2xs font-bold">Ctrl + Shift + B</kbd> (Macは <kbd className="bg-white/85 border border-indigo-200 font-mono text-[10px] px-1 py-0.2 rounded-md shadow-2xs font-bold">Cmd + Shift + B</kbd>) を押すと表示されます。</div>
              <div><strong className="text-indigo-950">● Mac Safari:</strong> メニューの「表示」➜「お気に入りバーを表示」を選択します。</div>
              <div><strong className="text-indigo-950">● スマホ / タブレット:</strong> 直接ドラッグできないため、本ページ下の「コードを直接コピー」を利用して作成してください。</div>
            </div>
          </div>
        </div>

        {/* Instructive Flow Guide */}
        <InstructiveFlow />

        {/* Configuration Panel and Sandbox Live Preview Table */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
          {/* Left Configurator Column */}
          <div className="xl:col-span-5 flex flex-col">
            <BookmarkletConfigPanel config={config} onChangeConfig={setConfig} />
          </div>

          <div className="xl:col-span-12">
            {/* Horizontal Line separating settings */}
            <div className="border-t border-slate-200" />
          </div>
        </div>

        {/* Dynamic Simulator Section */}
        <div className="bg-slate-100/40 border border-slate-200/50 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-6">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold font-mono">3</span>
            <h2 className="text-lg font-bold text-slate-800">受注画面エミュレーター（動作テスト）</h2>
          </div>
          <RmsSimulator config={config} />
        </div>

        {/* Interactive Clipboard Paste Verification Area */}
        <PasteFieldSandbox />

        {/* Direct HTML parser utility */}
        <HtmlParserSandbox config={config} />

        {/* Store Manager FAQ & Troubleshooting Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5 header-style">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            よくある質問とデバッグ（店長・管理者向けFAQ）
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed text-slate-500">
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <span className="text-indigo-600 font-bold">Q.</span>
                エクセル上でセルが分かれず、1つの枠にすべて貼り付いてしまいます
              </h3>
              <p>
                貼り付け先がエクセルの「セル内部の編集モード」になっている可能性があります。
                セルの枠線をダブルクリックしカーソルが点滅している状態で貼り付けるとセル内に1行でまとまってしまいます。
                <strong className="text-slate-700">セルの枠をシングルクリックのみした（セル全体が選択状態）で Ctrl + V</strong> を押してください。
              </p>
            </div>

            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <span className="text-indigo-600 font-bold">Q.</span>
                メーカー記号（商品番号）が正しく認識されません
              </h3>
              <p>
                このツールは商品番号の末尾にあるカッコ（例： <code className="bg-slate-150 px-1 py-0.5 rounded text-indigo-700 font-mono">item-code(ABC)</code> や <code className="bg-slate-150 px-1 py-0.5 rounded text-indigo-700 font-mono">コード［M-12］</code>）
                から抽出します。 カッコの種類が想定外の場合や、記号の後にスペースや文字が挟まっている場合は正しく切り分けることができません。
                最下部の「HTMLソース貼り付け解析器」に実際のコードを読み込んで、正規表現に引っかかっているか確認してください。
              </p>
            </div>

            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <span className="text-indigo-600 font-bold">Q.</span>
                1回でまとめて100件などの受注を一括コピーすることはできますか？
              </h3>
              <p>
                本ブックマークレットは、誤送信や特定漏れを防ぐため「現在開いている1注文の詳細画面」を巡回し、正確に細部をコピーする設計となっています。
                一括処理など管理一覧表型の画面はレイアウト構造が頻繁に変遷するため、詳細画面からワンクリックで抽出するほうが
                情報の取りこぼし（複数お届け先詳細、複数商品ごとのメーカー記号等）を完璧に抑え、誤配送などを未然に防げるため実務上極めて安全です。
              </p>
            </div>

            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <span className="text-indigo-600 font-bold">Q.</span>
                EC管理画面（R-RMSシステム等）のアップデート後に動かなくなったら？
              </h3>
              <p>
                管理画面のHTMLマークアップ構造が大幅に変更された場合に備え、
                最下部に「HTMLソース貼り付け解析器」をご用意しています。そちらに実際の画面HTMLをペーストし、即席抽出が可能かお試しください。
                もし抽出判定パターンの変更があった場合、本ツール内で追加のクラス定義や正規表現フィルターに設定を瞬時にマイグレーションできます。
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
