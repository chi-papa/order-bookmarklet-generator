/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { RmsOrderData, BookmarkletConfig } from '../types';
import { mockOrders } from '../utils/mockData';
import { simulateExtraction } from '../utils/bookmarkletGenerator';
import { ShoppingBag, ChevronRight, Copy, Check, Info, FileSpreadsheet, Send } from 'lucide-react';

interface RmsSimulatorProps {
  config: BookmarkletConfig;
}

export default function RmsSimulator({ config }: RmsSimulatorProps) {
  const [selectedOrderIndex, setSelectedOrderIndex] = useState<number>(0);
  const [activeOrder, setActiveOrder] = useState<RmsOrderData>(mockOrders[0]);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setActiveOrder(mockOrders[selectedOrderIndex]);
  }, [selectedOrderIndex]);

  // Run the data extraction simulator on the active mock order
  const { tsv, headers, rows } = simulateExtraction(activeOrder, config);

  const handleCopyTest = async () => {
    try {
      await navigator.clipboard.writeText(tsv);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Simulation Screen Control & Mock RMS Frame */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Order Selector */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">1. シミュレーション用の注文パターン</h3>
              <p className="text-xs text-slate-500">各種パターンの注文を用意しています。選択して挙動をテストできます。</p>
            </div>
            <div className="flex gap-2 mt-2">
              {mockOrders.map((order, idx) => (
                <button
                  key={idx}
                  id={`btn-order-${idx}`}
                  onClick={() => setSelectedOrderIndex(idx)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedOrderIndex === idx
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  パターン {idx + 1}
                  {order.products.length > 1 ? ' (複数個)' : ' (単一)'}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs mt-4">
            <div>
              <span className="text-slate-400 font-bold block mb-0.5">受注番号</span>
              <span className="font-mono text-slate-900 font-semibold">{activeOrder.orderNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block mb-0.5">購入者名</span>
              <span className="text-slate-900 font-semibold">{activeOrder.ordererName} 様</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block mb-0.5">商品数 / 合計個数</span>
              <span className="text-slate-900 font-semibold">
                {activeOrder.products.length} 品 / {activeOrder.products.reduce((acc, curr) => acc + curr.quantity, 0)} 個
              </span>
            </div>
          </div>
        </div>

        {/* Mock RMS Order Detail Interface */}
        <div className="bg-[#f8fafc] rounded-2xl border border-slate-250 overflow-hidden shadow-xs">
          {/* RMS Chrome header mimicking real app */}
          <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <span className="text-xs font-mono ml-2 text-slate-400 font-semibold tracking-wide">
                EC受注詳細システム（模擬シミュレーター・R-RMS様式対応）
              </span>
            </div>
            <div className="text-[10px] bg-slate-800 font-semibold text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md">
              SIMULATOR
            </div>
          </div>

          {/* Main Simulated Document Frame */}
          <div className="p-6 bg-white overflow-x-auto min-h-[380px]">
            {/* Header Table / Meta Box in RMS Style */}
            <div className="border border-slate-200 rounded-xl mb-6 text-xs shadow-2xs">
              <div className="bg-slate-50 border-b border-slate-200 font-bold text-[11px] text-slate-400 py-2 px-4 flex items-center justify-between">
                <div>楽天市場 操作店舗伝票：詳細ステータス</div>
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200 text-[9px]">
                  新規受付
                </span>
              </div>
              <div className="py-3 px-4 bg-white text-slate-600 leading-relaxed">
                <div className="pull-left flex flex-col gap-1.5 list-none">
                  <li className="font-mono text-slate-900 font-bold flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-500 font-sans font-bold text-[9px] px-1.5 py-0.5 rounded-sm">受注番号</span>
                    {activeOrder.orderNumber}
                  </li>
                  <li className="text-slate-600 flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-500 font-sans font-bold text-[9px] px-1.5 py-0.5 rounded-sm">注文日時</span>
                    {activeOrder.orderDate}
                  </li>
                </div>
              </div>
            </div>

            {/* Customer Details Box in RMS Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs">
              {/* Orderer Card */}
              <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 font-bold border-b border-slate-200 text-slate-800 flex items-center gap-1.5">
                  👤 注文者情報
                </div>
                <div className="p-4 leading-relaxed text-slate-600">
                  <div className="font-bold text-slate-900 text-sm mb-1 rms-content-order-details-contact-info-names">
                    {activeOrder.ordererName} 様
                  </div>
                  {/* .rms-content-order-details-contact-options wrapper block to mimic real RMS */}
                  <div className="rms-content-order-details-contact-options flex flex-col gap-1 mt-2 border-t border-slate-100 pt-2">
                    <div className="font-mono text-[11px] text-slate-400">〒{activeOrder.ordererZip}</div>
                    <div><span className="address text-slate-600">{activeOrder.ordererAddress}</span></div>
                    {activeOrder.ordererPhone && (
                      <div>連絡先: <span className="phone font-mono text-slate-900">{activeOrder.ordererPhone}</span></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recipient Card */}
              <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 font-bold border-b border-slate-200 text-slate-800 flex items-center gap-1.5">
                  📦 送付先（お届け先）情報
                </div>
                <div className="p-4 leading-relaxed text-slate-600">
                  <div className="font-bold text-slate-900 text-sm mb-1 rms-content-order-details-contact-info-names">
                    {activeOrder.recipientName} 様
                  </div>
                  {/* .rms-content-order-details-contact-options wrapper block representing recipient */}
                  <div className="rms-content-order-details-contact-options flex flex-col gap-1 mt-2 border-t border-slate-100 pt-2">
                    <div className="font-mono text-[11px] text-slate-400">〒{activeOrder.recipientZip}</div>
                    <div><span className="address text-slate-600">{activeOrder.recipientAddress}</span></div>
                    {activeOrder.recipientPhone && (
                      <div>連絡先: <span className="phone font-mono text-slate-900">{activeOrder.recipientPhone}</span></div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs mb-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                    <th className="py-2.5 px-4 border-r border-slate-200">商品名 / 商品番号</th>
                    <th className="py-2.5 px-4 text-center border-r border-slate-200 w-24">単価</th>
                    <th className="py-2.5 px-4 text-center border-r border-slate-200 w-16">個数</th>
                    <th className="py-2.5 px-4 text-right w-24">小計</th>
                  </tr>
                </thead>
                <tbody>
                  {activeOrder.products.map((p, idx) => (
                    <tr key={p.id} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 border-r border-slate-200 leading-relaxed">
                        <div className="font-bold text-slate-900 line-clamp-2">
                          {p.name}
                        </div>
                        <div className="flex flex-wrap gap-x-2 mt-1.5 items-center">
                          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono font-medium">
                            商品管理番号
                          </span>
                          <span className="font-mono text-indigo-600 font-bold text-[11px]">
                            {p.itemNumber}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center border-r border-slate-200 font-mono text-slate-600">
                        ¥{p.price.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center border-r border-slate-200 font-bold text-slate-900">
                        {p.quantity}個
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-900 font-semibold">
                        ¥{(p.price * p.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50/40 font-semibold border-t border-slate-200">
                    <td colSpan={2} className="py-2.5 px-4 border-r border-slate-200"></td>
                    <td className="py-2.5 px-4 text-center border-r border-slate-200 text-slate-700 text-[11px]">合計</td>
                    <td className="py-2.5 px-4 text-right font-mono text-indigo-600 font-bold text-sm">
                      ¥{activeOrder.products.reduce((acc, p) => acc + p.price * p.quantity, 0).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Note on manufacturer symbol extraction location */}
            <div className="mt-4 flex items-start gap-2 text-[10px] bg-indigo-50/30 border border-indigo-100 rounded-lg p-3 text-indigo-950">
              <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">メーカー記号抽出ポイント：</span>
                商品番号の末尾にある括弧内のコード（例：
                <span className="font-semibold font-mono bg-indigo-100 px-1 py-0.2 rounded text-indigo-900">
                  {activeOrder.products[0].itemNumber.match(/\(([^)]+)\)$/)?.[1] || 'KM-HR25'}
                </span>
                ）を、ブックマークレットが独自の正規表現パターンで自動走査して分離抽出します。
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Excel / Spreadsheet Clipboard Preview Column */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-4.5 h-4.5 text-indigo-600" />
                2. エクセル抽出プレビュー
              </h3>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                リアルタイム自動同期
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              上の注文データに対し、ブックマークレットを実行した際にコピーされる「エクセル完全対応列データ（タブ区切り）」の構造です。
            </p>

            {/* Interactive Grid Table Previews */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-5">
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs select-none">
                <span className="font-bold text-slate-800">セル分割イメージ</span>
                <span className="text-[10px] text-indigo-600 font-bold">
                  {config.format === 'multi-rows' ? '複数行形式 (1商品毎に1行)' : '単一行形式 (1注文1行)'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 overflow-x-auto">
                <table className="min-w-[450px] text-[11px] border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-800">
                      {headers.map((hdr, idx) => (
                        <th key={idx} className="py-1.5 px-2 font-bold text-left border border-slate-200 whitespace-nowrap">
                          {hdr}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-slate-50/50">
                        {row.map((cellValue, cellIdx) => (
                          <td key={cellIdx} className="py-1.5 px-2 border border-slate-200 font-mono max-w-[150px] truncate text-slate-600" title={cellValue}>
                            {cellValue || <span className="text-slate-300 italic">空欄</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Copy raw TSV Text Block */}
            <div className="mb-4">
              <span className="text-xs font-bold text-slate-700 block mb-1">コピーされる電文（Raw TSV Data）</span>
              <div className="relative">
                <textarea
                  readOnly
                  value={tsv}
                  rows={4}
                  className="w-full text-[11px] font-mono p-3 bg-slate-950 text-emerald-400 rounded-xl border border-slate-800 resize-none outline-hidden"
                />
                <div className="absolute bottom-2.5 right-2.5 text-[10px] text-slate-550 font-mono">
                  {tsv.length} 文字
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
            <button
              id="btn-copy-test"
              onClick={handleCopyTest}
              className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm ${
                copied
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-200'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 hover:shadow-indigo-200'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4.5 h-4.5" />
                  クリップボードにコピーしました！
                </>
              ) : (
                <>
                  <Copy className="w-4.5 h-4.5" />
                  Excel貼付を試す（テストデータをコピー）
                </>
              )}
            </button>
            <div className="text-center text-[10px] text-slate-400 leading-normal">
              ※クリックすると実コピーされます。エクセル等に適当にペーストして、列が自動で分かれていることを検証してみてください。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
