/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BookmarkletConfig } from '../types';
import { Code, Play, Check, Copy, AlertCircle, Sparkles, FileText } from 'lucide-react';

interface HtmlParserSandboxProps {
  config: BookmarkletConfig;
}

interface ParsedProduct {
  name: string;
  code: string;
  qty: number;
  mfgCode: string;
}

interface ParsedOrderResult {
  orderNumber: string;
  orderDate: string;
  ordererName: string;
  recipientName: string;
  products: ParsedProduct[];
}

export default function HtmlParserSandbox({ config }: HtmlParserSandboxProps) {
  const [htmlInput, setHtmlInput] = useState<string>('');
  const [parsedResult, setParsedResult] = useState<ParsedOrderResult | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const testSamples = {
    simple: `
      <div class="order-detail-container">
        <table>
          <tr><th>受注番号</th><td>887722-20260531-99887766</td></tr>
          <tr><th>注文日時</th><td>2026/05/31 19:22:00</td></tr>
          <tr><th>注文者氏名</th><td>東 京太郎 様</td></tr>
          <tr><th>送付先氏名</th><td>北 海道美 様</td></tr>
        </table>
        <table class="item-table">
          <thead>
            <tr><th>商品名</th><th>商品番号</th><th>個数</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>お中元 特選国産ジュース詰め合わせパック</td>
              <td>juice-gift-sum(SP-GIFT-A)</td>
              <td>2</td>
            </tr>
            <tr>
              <td>高級和菓子 竹籠10種セット</td>
              <td>wagashi-ten-05（WAG-PREM）</td>
              <td>1</td>
            </tr>
          </tbody>
        </table>
      </div>
    `
  };

  const handleLoadSample = () => {
    setHtmlInput(testSamples.simple.trim());
    setErrorStatus(null);
  };

  const handleParse = () => {
    if (!htmlInput.trim()) {
      setErrorStatus('HTMLソースコードが空欄です。');
      return;
    }

    try {
      setErrorStatus(null);
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlInput, 'text/html');

      // Helper for cleaning strings
      const clean = (txt: string) => {
        if (!txt) return '';
        return txt.replace(/\s+/g, ' ').replace(/^[\s　]+|[\s　]+$/g, '').trim();
      };

      // Search for specific labels
      const findVal = (keywords: string[]) => {
        const elements = doc.querySelectorAll('td, th, span, div, label, td *, p, a');
        for (let i = 0; i < elements.length; i++) {
          const el = elements[i];
          const txt = el.textContent || '';
          for (let k = 0; k < keywords.length; k++) {
            const key = keywords[k];
            if (txt.indexOf(key) !== -1) {
              const match = txt.match(new RegExp(key + '\\s*[:：\\s]\\s*(.*)', 'i'));
              if (match && match[1] && clean(match[1]).length > 0) {
                return clean(match[1]);
              }
              if (el.nextElementSibling) {
                const sub = clean(el.nextElementSibling.textContent || '');
                if (sub.length > 0) return sub;
              }
              if (el.tagName === 'TH' && el.parentElement) {
                const tds = el.parentElement.querySelectorAll('td');
                if (tds.length > 0) {
                  return clean(tds[0].textContent || '');
                }
              }
            }
          }
        }
        return '';
      };

      // Extract Order Number
      let orderNumber = '';
      const orderNoMatch = htmlInput.match(/(\d+-2\d{7}-\d+)/);
      if (orderNoMatch) {
         orderNumber = orderNoMatch[1];
      } else {
         orderNumber = findVal(['受注番号', '注文番号', '注文ID']);
      }

      // Extract Order Date
      let orderDate = '';
      const dateMatch = htmlInput.match(/(20\d{2}[/年]\d{1,2}[/月]\d{1,2}[日]?\s*\d{1,2}:\d{1,2})/);
      if (dateMatch) {
         orderDate = clean(dateMatch[1]);
      } else {
         orderDate = findVal(['注文日', '注文日時', '受注日時', '受付日時']);
      }
      if (!orderDate) {
        const fall = htmlInput.match(/(20\d{2}[/\-\.]\d{1,2}[/\-\.]\d{1,2})/);
        if (fall) orderDate = fall[1];
      }

      // Extract Customer Names
      let ordererName = '';
      const ordererSec = findVal(['注文者情報', '注文者']);
      if (ordererSec) {
        ordererName = ordererSec.split(/[\r\n]/)[0].replace(/様.*$/, '').trim();
      }
      if (!ordererName) {
        const el = doc.querySelector('.orderer-name, [class*="orderer"] .name, [class*="customer"] .name');
        if (el) ordererName = clean(el.textContent || '');
      }
      if (!ordererName) {
        ordererName = findVal(['注文者様', '注文者氏名', '注文者']);
        if (ordererName) ordererName = ordererName.split(/[（\(,\s]/)[0].replace(/様$/, '');
      }

      let recipientName = '';
      const rcvSec = findVal(['送付先', 'お届け先', '配送先']);
      if (rcvSec) {
        const lines = rcvSec.split(/[\r\n]/).map(l => clean(l)).filter(Boolean);
        recipientName = lines[0] || '';
        if (recipientName.match(/^[\d〒\-]/)) {
          recipientName = lines.find(l => !l.match(/^[\d〒\-\s]+$/) && l.indexOf('様') !== -1) || lines[1] || '';
        }
        recipientName = recipientName.replace(/様.*$/, '').trim();
      }
      if (!recipientName) {
        const el = doc.querySelector('.recipient-name, .delivery-name, [class*="recipient"] .name, [class*="delivery"] .name');
        if (el) recipientName = clean(el.textContent || '');
      }
      if (!recipientName) {
        recipientName = findVal(['送付先氏名', 'お届け先名', 'お届け先様', 'お届け先氏名']);
        if (recipientName) recipientName = recipientName.split(/[（\(,\s]/)[0].replace(/様$/, '');
      }
      if (!recipientName) recipientName = ordererName; // fallback

      // Extract Items
      const products: ParsedProduct[] = [];

      // Look at table rows
      const rows = doc.querySelectorAll('tr, div[class*="item-box"], .order-item, [class*="goods-info"]');
      rows.forEach(row => {
        if (row.textContent && (row.textContent.indexOf('商品名') !== -1 && row.textContent.indexOf('個数') !== -1)) return; // skip header

        const nameEl = row.querySelector('.item-name, [class*="itemName"], [class*="item-title"], td:first-child a, th a, .goods-name');
        const codeEl = row.querySelector('.item-code, [class*="itemCode"], [class*="item-number"], .product-code, .goods-code');
        const qtyEl = row.querySelector('.item-qty, [class*="quantity"], [class*="qty"], td:last-child, .goods-count');

        let name = nameEl ? clean(nameEl.textContent || '') : '';
        let code = codeEl ? clean(codeEl.textContent || '') : '';
        let qtyStr = qtyEl ? clean(qtyEl.textContent || '') : '';

        // fallback scan for table elements
        if (!name && (row as HTMLTableRowElement).cells && (row as HTMLTableRowElement).cells.length >= 2) {
          const cells = (row as HTMLTableRowElement).cells;
          for (let j = 0; j < cells.length; j++) {
            const cellTxt = clean(cells[j].textContent || '');
            if (cellTxt && j === 0) name = cellTxt;
            else if (cellTxt.match(/^[a-zA-Z0-9\-_]+$/) && !code) code = cellTxt;
            else if (cellTxt.match(/^\d+個?$/) || (j === cells.length - 1 && cellTxt.match(/^\d+$/))) {
              qtyStr = cellTxt;
            }
          }
        }

        if (name) {
          const qty = parseInt(qtyStr.replace(/[^0-9]/g, '')) || 1;
          
          // parse manufacturer code from code
          const fullText = code || name;
          let mfgCode = '';
          const bMatch = fullText.match(/［([^［］]+)］$/);
          const jMatch = fullText.match(/（([^（）]+)）$/);
          const eMatch = fullText.match(/\(([^)]+)\)$/);
          const looseMatch = fullText.match(/\(([^)]+)\)[^()]*$/);
          const jpLooseMatch = fullText.match(/（([^（）]+)）[^（）]*$/);

          if (bMatch) mfgCode = bMatch[1].trim();
          else if (jMatch) mfgCode = jMatch[1].trim();
          else if (eMatch) mfgCode = eMatch[1].trim();
          else if (looseMatch) mfgCode = looseMatch[1].trim();
          else if (jpLooseMatch) mfgCode = jpLooseMatch[1].trim();

          // clean product name option
          if (config.cleanProductName) {
            name = name.replace(/\s*\[[^\]]+\]/g, '')
                       .replace(/\s*（[^（）]+）$/g, '')
                       .replace(/\s*\([^)]+\)$/g, '');
          }

          products.push({ name, code, qty, mfgCode });
        }
      });

      // Special fallback if parsed absolutely no products
      if (products.length === 0) {
        const singleName = findVal(['商品名']);
        const singleCode = findVal(['商品番号', '商品コード', '管理番号']);
        const singleQty = parseInt((findVal(['個数', '数量']) || '1').replace(/[^0-9]/g, '')) || 1;
        if (singleName) {
          let mfgCode = '';
          const fullText = singleCode || singleName;
          const match = fullText.match(/\(([^)]+)\)/);
          if (match) mfgCode = match[1];
          products.push({ name: singleName, code: singleCode, qty: singleQty, mfgCode });
        }
      }

      if (products.length === 0) {
        setErrorStatus('解析できませんでした。HTMLソース内に商品項目テーブル、または「商品名」「個数」というキーワードが見つかりません。');
        setParsedResult(null);
      } else {
        setParsedResult({
          orderNumber,
          orderDate,
          ordererName,
          recipientName,
          products
        });
      }
    } catch (e: any) {
      setErrorStatus(`解析エラー: ${e?.message || '不明なエラーです'}`);
      setParsedResult(null);
    }
  };

  const handleCopyParsedTsv = async () => {
    if (!parsedResult) return;
    
    const rowsArr: string[] = [];
    if (config.includeHeader) {
      if (config.format === 'multi-rows') {
        rowsArr.push(['注文日', '受注番号', '注文者', '送り先（お届け先）', '商品名', '注文個数', 'メーカー記号（商品記号）'].join('\t'));
      } else {
        const hdrs = ['注文日', '受注番号', '注文者', '送り先（お届け先）'];
        parsedResult.products.forEach((_, i) => {
          hdrs.push(`商品名${i+1}`, `注文個数${i+1}`, `メーカー記号${i+1}`);
        });
        rowsArr.push(hdrs.join('\t'));
      }
    }

    if (config.format === 'multi-rows') {
      parsedResult.products.forEach(p => {
        rowsArr.push([
          parsedResult.orderDate,
          parsedResult.orderNumber,
          parsedResult.ordererName,
          parsedResult.recipientName,
          p.name,
          String(p.qty),
          p.mfgCode
        ].join('\t'));
      });
    } else {
      const vals = [
        parsedResult.orderDate,
        parsedResult.orderNumber,
        parsedResult.ordererName,
        parsedResult.recipientName
      ];
      parsedResult.products.forEach(p => {
        vals.push(p.name);
        vals.push(String(p.qty));
        vals.push(p.mfgCode);
      });
      rowsArr.push(vals.join('\t'));
    }

    try {
      await navigator.clipboard.writeText(rowsArr.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      alert('クリップボードに書き込めませんでした。保護設定を確認してください。');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100">
          <Code className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-md font-bold text-slate-900">【高度な機能】本番RMS画面のHTMLソース貼り付け解析器</h2>
          <p className="text-xs text-slate-500">ブックマークレットを使わずに、実際のRMS受注画面の「ページのソース」をそっくりコピペしてエクセル行に瞬時に逆変換できます。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        {/* Input box */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center text-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <FileText className="w-4 h-4 text-slate-400" />
              対象画面のHTMLソース
            </h3>
            <button
              onClick={handleLoadSample}
              className="text-indigo-600 font-bold hover:underline cursor-pointer"
            >
              サンプルHTMLを読み込む
            </button>
          </div>
          <textarea
            value={htmlInput}
            onChange={(e) => setHtmlInput(e.target.value)}
            placeholder="楽天RMSなどの詳細画面で「右クリック → ページのソースを表示」または「Ctrl + U」を押して、表示された全コードをコピーしてここに貼り付けてください..."
            rows={10}
            className="w-full text-xs font-mono p-4 bg-slate-50 rounded-xl border border-slate-200 outline-hidden focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all resize-none"
          />
          <button
            onClick={handleParse}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
          >
            <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            HTMLソースコードを解析する
          </button>
        </div>

        {/* Results area */}
        <div className="flex flex-col h-full justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">解析結果プレビュー</h3>
            {errorStatus && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-150 flex gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorStatus}</span>
              </div>
            )}

            {!parsedResult && !errorStatus && (
              <div className="h-[210px] bg-slate-50 rounded-xl border border-dashed border-slate-250 flex flex-col items-center justify-center p-6 text-center">
                <Sparkles className="w-8 h-8 text-indigo-300 mb-2" />
                <p className="text-xs text-slate-400 font-medium">
                  左にHTMLを読み込み「解析する」ボタンをクリックすると、ここにエクセル出力内容がマップされます。
                </p>
              </div>
            )}

            {parsedResult && (
              <div className="flex flex-col gap-4">
                {/* Meta Summary */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold block">受注番号</span>
                    <span className="font-mono font-bold text-slate-900">{parsedResult.orderNumber ? parsedResult.orderNumber : '(検出不可: 手動補正推奨)'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold block">日時</span>
                    <span className="font-mono font-bold text-slate-900">{parsedResult.orderDate ? parsedResult.orderDate : '(日時なし)'}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-slate-400 text-[10px] font-bold block">注文者</span>
                    <span className="font-bold text-slate-900">{parsedResult.ordererName ? `${parsedResult.ordererName}様` : '(検出不可)'}</span>
                  </div>
                  <div className="mt-2 font-semibold">
                    <span className="text-slate-400 text-[10px] font-bold block">送り先（お届け先）</span>
                    <span className="text-slate-900">{parsedResult.recipientName ? `${parsedResult.recipientName}様` : '(注文者と同一)'}</span>
                  </div>
                </div>

                {/* Items Extracted List */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 p-2 border-b border-slate-200 text-[10px] font-bold text-slate-550 uppercase tracking-widest">
                    検出された商品リスト（{parsedResult.products.length}点）
                  </div>
                  <div className="max-h-[140px] overflow-y-auto divide-y divide-slate-100 text-xs">
                    {parsedResult.products.map((p, i) => (
                      <div key={i} className="p-3 bg-white flex justify-between items-start gap-4 hover:bg-slate-50/30">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 truncate" title={p.name}>{p.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap">商品コード: {p.code || 'なし'}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-bold text-slate-900">{p.qty}個</div>
                          {p.mfgCode && (
                            <div className="mt-1">
                              <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded-md">
                                メーカー記号: {p.mfgCode}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {parsedResult && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={handleCopyParsedTsv}
                className={`w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all ${
                  copied ? 'ring-4 ring-emerald-100' : ''
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    解析結果をコピーしました！Excelに貼り付けできます
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    解析結果データ（Excel貼付用TSV）をコピー
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
