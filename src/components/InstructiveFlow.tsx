/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MousePointerClick, FileDigit, ClipboardCopy, FileSpreadsheet } from 'lucide-react';

export default function InstructiveFlow() {
  const steps = [
    {
      num: '1',
      title: 'ブックマークレットを登録する',
      icon: <MousePointerClick className="w-6 h-6 text-indigo-600" />,
      desc: '下部の生成ボタンをクリックするか、登録用リンクをお使いのブラウザの「ブックマークバー（お気に入りバー）」にドラッグ＆ドロップして保存します。'
    },
    {
      num: '2',
      title: '受注詳細画面を開く（R-RMS等の対象ページ）',
      icon: <FileDigit className="w-6 h-6 text-indigo-600" />,
      desc: '対象のEC店舗システム（受注管理・運営画面等）にログインし、取り込みたい注文の「受注詳細」画面、または個別明細ページを開きます。'
    },
    {
      num: '3',
      title: 'ブックマークレットをクリックする',
      icon: <ClipboardCopy className="w-6 h-6 text-indigo-600" />,
      desc: '詳細画面を開いた状態で、登録したブックマーク（お気に入り）をクリックします。画面上部に「コピー完了」のポップアップが出現します。'
    },
    {
      num: '4',
      title: 'エクセル等に貼り付ける',
      icon: <FileSpreadsheet className="w-6 h-6 text-indigo-600" />,
      desc: 'ExcelやGoogleスプレッドシートを開き、貼り付けたいセルを選択して「Ctrl + V（MacはCmd + V）」を押すだけで、各項目が別々のセルに整列して貼り付きます！'
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
      <h2 className="text-lg font-bold text-slate-950 mb-6 flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-black font-mono">?</span>
        使い方の流れ（わずか4ステップ）
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
        {steps.map((step, idx) => (
          <div key={idx} className="relative flex flex-col items-start bg-slate-50 p-5 rounded-2xl border border-slate-200">
            {idx < steps.length - 1 && (
              <div className="hidden md:block absolute top-[40%] -right-4 -translate-y-1/2 z-10 font-bold text-slate-300">
                ➔
              </div>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                {step.icon}
              </div>
              <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-md bg-slate-900 text-white uppercase tracking-wider">
                STEP 0{step.num}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1.5">{step.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
