/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookmarkletConfig, RmsOrderData } from '../types';

/**
 * Generates the clean browser-executable Javascript string for the Bookmarklet.
 * It's wrapped in `javascript:(function(){...})()` and properly URI-encoded.
 */
export function generateBookmarkletCode(config: BookmarkletConfig): string {
  // We'll write the raw script first.
  // We make it resilient to both the old and new RMS order detail interfaces,
  // search by common class selectors, and text keyword labels as fallbacks.
  
  const rawJs = `
(function() {
  // --- 1. Utility functions ---
  function cleanText(text) {
    if (!text) return '';
    return text.replace(/\\s+/g, ' ').replace(/^[\\s　]+|[\\s　]+$/g, '').trim();
  }

  // Find elements by checking their innerText/textContent for key-labels
  function findValueByLabel(keywords, container) {
    var root = container || document;
    var elements = root.querySelectorAll('td, th, span, div, label, td *, th *, p');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var txt = el.textContent || '';
      for (var k = 0; k < keywords.length; k++) {
        var keyword = keywords[k];
        if (txt.indexOf(keyword) !== -1) {
          // If label contains the keyword, check adjacent cell or parent-sibling or extract from the text itself
          // Let's check if there is an exact match or trailing colon
          var match = txt.match(new RegExp(keyword + '\\\\s*[:：\\\\s]\\\\s*(.*)', 'i'));
          if (match && match[1] && cleanText(match[1]).length > 0) {
            return cleanText(match[1]);
          }
          // Check sibling elements (common in tables or divs)
          if (el.nextElementSibling) {
            var sibTxt = el.nextElementSibling.textContent || '';
            if (cleanText(sibTxt).length > 0) return cleanText(sibTxt);
          }
          // Sibling of parent TD
          if (el.tagName === 'TH' && el.parentElement) {
            var tds = el.parentElement.querySelectorAll('td');
            if (tds.length > 0) {
              return cleanText(tds[0].textContent);
            }
          }
        }
      }
    }
    return '';
  }

  // --- 2. Extract Header Info ---
  
  // 1) Order Number (受注番号)
  var orderNumber = '';
  var orderEl = document.querySelector('.pull-left li');
  if (orderEl) {
    orderNumber = cleanText(orderEl.textContent);
    var cleanNo = orderNumber.match(/(\d+-\d+-\d+)/);
    if (cleanNo) orderNumber = cleanNo[1];
  }
  if (!orderNumber) {
    var bodyText = document.body.innerText || '';
    var orderNoMatch = bodyText.match(/(\\d+-2\\d{7}-\\d+)/);
    if (orderNoMatch) {
      orderNumber = orderNoMatch[1];
    } else {
      orderNumber = findValueByLabel(['受注番号', '注文番号', '注文ID']);
    }
  }
  
  // 2) Order Date (注文日)
  var orderDate = '';
  var orderDateEl = document.querySelector('.pull-left li + li');
  if (orderDateEl) {
    var dateTxt = cleanText(orderDateEl.textContent);
    var cleanDt = dateTxt.match(/(20\\d{2}[/年]\\d{1,2}[/月]\\d{1,2}[日]?\\s*\\d{1,2}:\\d{1,2})/);
    if (cleanDt) orderDate = cleanDt[1];
  }
  if (!orderDate) {
    var bodyText = document.body.innerText || '';
    var dateMatch = bodyText.match(/(20\\d{2}[/年]\\d{1,2}[/月]\\d{1,2}[日]?\\s*\\d{1,2}:\\d{1,2})/);
    if (dateMatch) {
      orderDate = cleanText(dateMatch[1]);
    } else {
      orderDate = findValueByLabel(['注文日', '注文日時', '受注日時', '受付日時']);
    }
  }
  if (!orderDate) {
    // try to fallback to any date format
    var simpleDateMatch = bodyText.match(/(20\\d{2}[/\\-\\.]\\d{1,2}[/\\-\\.]\\d{1,2})/);
    if (simpleDateMatch) orderDate = simpleDateMatch[1];
  }

  // 3) Orderer Name (注文者)
  var ordererName = '';
  var nameEls = document.querySelectorAll('.rms-content-order-details-contact-info-names');
  if (nameEls && nameEls.length > 0) {
    ordererName = cleanText(nameEls[0].textContent).replace(/様.*$/, '').trim();
  }
  if (!ordererName) {
    var ordererSection = findValueByLabel(['注文者情報', '注文者']);
    if (ordererSection) {
      ordererName = ordererSection.split(/[\\r\\n]/)[0].replace(/様.*$/, '').trim();
    }
  }
  if (!ordererName) {
    var el = document.querySelector('.orderer-name, [class*="orderer"] .name, [class*="customer"] .name');
    if (el) ordererName = cleanText(el.textContent);
  }
  if (!ordererName) {
    ordererName = findValueByLabel(['注文者様', '注文者氏名', '注文者']);
    if (ordererName) {
      ordererName = ordererName.split(/[（\\(,\\s]/)[0].replace(/様$/, '');
    }
  }

  // 4) Recipient / Destination Address/Name (送り先 / お届け先)
  var recipientName = '';
  var recipientAddress = '';
  var recipientPhone = '';

  var wrapper = document.querySelector('.rms-row-wrapper');
  if (wrapper) {
    var recEl = wrapper.querySelector('.rms-content-order-details-contact-info-names');
    if (recEl) recipientName = cleanText(recEl.textContent).replace(/様.*$/, '').trim();
    
    var addrEl = wrapper.querySelector('.address');
    if (addrEl) recipientAddress = cleanText(addrEl.textContent);
    
    var phoneEl = wrapper.querySelector('.phone');
    if (phoneEl) recipientPhone = cleanText(phoneEl.textContent);
  }

  if (!recipientName) {
    var recipientDest = findValueByLabel(['送付先', 'お届け先', '配送先']);
    if (recipientDest) {
      var lines = recipientDest.split(/[\\r\\n]/).map(line => cleanText(line)).filter(Boolean);
      recipientName = lines[0] || '';
      if (recipientName.match(/^[\\d〒\\-]/)) {
        recipientName = lines.find(line => !line.match(/^[\\d〒〒\\-\\s]+$/) && line.indexOf('様') !== -1) || lines[1] || '';
      }
      recipientName = recipientName.replace(/様.*$/, '').trim();
      
      if (lines.length > 1) {
        recipientAddress = lines.slice(1).join(' ').replace(recipientPhone, '').trim();
      }
    }
  }
  if (!recipientName) {
    var el = document.querySelector('.recipient-name, .delivery-name, [class*="recipient"] .name, [class*="delivery"] .name');
    if (el) recipientName = cleanText(el.textContent);
  }
  if (!recipientName) {
    recipientName = findValueByLabel(['送付先氏名', 'お届け先名', 'お届け先様', 'お届け先氏名']);
    if (recipientName) {
      recipientName = recipientName.split(/[（\\(,\\s]/)[0].replace(/様$/, '');
    }
  }
  if (!recipientName) {
    recipientName = ordererName;
  }

  if (!recipientAddress) {
    var el = document.querySelector('.recipient-address, .delivery-address, [class*="recipient"] .address, [class*="delivery"] .address, .address');
    if (el) recipientAddress = cleanText(el.textContent);
  }
  if (!recipientAddress) {
    recipientAddress = findValueByLabel(['送付先住所', 'お届け先住所', '住所']);
  }

  if (!recipientPhone) {
    var el = document.querySelector('.recipient-phone, .delivery-phone, [class*="recipient"] .phone, [class*="delivery"] .phone, .phone');
    if (el) recipientPhone = cleanText(el.textContent);
  }
  if (!recipientPhone) {
    recipientPhone = findValueByLabel(['送付先電話番号', 'お届け先電話番号', '電話番号', '電話', 'TEL', 'tel']);
  }

  // --- 3. Extract Products & Quantities ---
  var products = [];
  
  // Let's scan for item blocks. Rakuten RMS orders display items inside specific table templates.
  // We check for table rows or cards that host the items.
  // Method 1: Check elements containing item names, codes, and quantity
  var itemRows = document.querySelectorAll('tr.item, tr[class*="item"], tr[class*="product"], div[class*="item-box"], .order-item, .order-product-table tr');
  
  if (itemRows.length > 0) {
    itemRows.forEach(function(row) {
      // Avoid header row
      if (row.textContent.indexOf('商品名') !== -1 && row.textContent.indexOf('単価') !== -1) return;
      
      var nameEl = row.querySelector('.item-name, [class*="itemName"], [class*="item-title"], td:first-child a, th a');
      var codeEl = row.querySelector('.item-code, [class*="itemCode"], [class*="item-number"], .product-code');
      var qtyEl = row.querySelector('.item-qty, [class*="quantity"], [class*="qty"], td:last-child');
      
      var name = nameEl ? cleanText(nameEl.textContent) : '';
      var code = codeEl ? cleanText(codeEl.textContent) : '';
      var qtyStr = qtyEl ? cleanText(qtyEl.textContent) : '';
      
      // If we don't have explicit classes, scan cell contents
      if (!name && row.cells && row.cells.length >= 2) {
        // Find best match cells
        for (var j = 0; j < row.cells.length; j++) {
          var cellTxt = cleanText(row.cells[j].textContent);
          if (cellTxt && j === 0) name = cellTxt;
          else if (cellTxt.match(/^[a-zA-Z0-9\\-_\\(\\)\\（\\）]+$/) && !code) code = cellTxt;
          else if (cellTxt.match(/^\\d+個?$/) || (j === row.cells.length - 1 && cellTxt.match(/^\\d+$/))) {
            qtyStr = cellTxt;
          }
        }
      }
      
      if (name) {
        products.push({ name: name, code: code, qty: qtyStr });
      }
    });
  }

  // Method 2: Fallback to scanning all tables on the page for standard RMS order table structures
  if (products.length === 0) {
    var tables = document.querySelectorAll('table');
    tables.forEach(function(tbl) {
      var isOrderTable = false;
      var qtyIndex = -1, nameIndex = -1, codeIndex = -1;
      
      // Look at headers
      var ths = tbl.querySelectorAll('th, td.header, tr:first-child td');
      ths.forEach(function(h, idx) {
        var txt = cleanText(h.textContent);
        if (txt.indexOf('商品名') !== -1 || txt.indexOf('商品コード') !== -1) {
          isOrderTable = true;
        }
        if (txt.indexOf('商品名') !== -1 || txt.indexOf('商品') !== -1) nameIndex = idx;
        if (txt.indexOf('商品番号') !== -1 || txt.indexOf('商品コード') !== -1 || txt.indexOf('管理番号') !== -1) codeIndex = idx;
        if (txt.indexOf('個数') !== -1 || txt.indexOf('数量') !== -1) qtyIndex = idx;
      });
      
      if (isOrderTable) {
        var rows = tbl.querySelectorAll('tr');
        rows.forEach(function(r) {
          // Skip header row
          if (r.querySelector('th') || r.textContent.indexOf('商品名') !== -1) return;
          
          var cells = r.querySelectorAll('td');
          if (cells.length > 0) {
            var name = nameIndex !== -1 && cells[nameIndex] ? cleanText(cells[nameIndex].textContent) : '';
            var code = codeIndex !== -1 && cells[codeIndex] ? cleanText(cells[codeIndex].textContent) : '';
            var qty = qtyIndex !== -1 && cells[qtyIndex] ? cleanText(cells[qtyIndex].textContent) : '1';
            
            // If code is not explicitly indexed, check if name has a code block next to it
            if (!code && nameIndex !== -1 && cells[nameIndex + 1]) {
              var possibleCode = cleanText(cells[nameIndex + 1].textContent);
              if (possibleCode.match(/^[A-Za-z0-9\\-_\\(\\)\\（\\）]+$/)) {
                code = possibleCode;
              }
            }
            
            if (name) {
              products.push({ name: name, code: code, qty: qty });
            }
          }
        });
      }
    });
  }

  // Method 3: Parse standard new RMS panel structure
  if (products.length === 0) {
    // RMS has products list in individual card boxes
    var itemBoxes = document.querySelectorAll('[class*="item-container"], [class*="goods-info"], [class*="product-row"]');
    itemBoxes.forEach(function(box) {
      var nameEl = box.querySelector('[class*="itemName"], [class*="item-title"], .goods-name');
      var codeEl = box.querySelector('[class*="itemCode"], [class*="item-number"], .goods-code');
      var qtyEl = box.querySelector('[class*="item-qty"], [class*="quantity"], .goods-count');
      
      if (nameEl) {
        var name = cleanText(nameEl.textContent);
        var code = codeEl ? cleanText(codeEl.textContent) : '';
        var qty = qtyEl ? cleanText(qtyEl.textContent) : '1';
        products.push({ name: name, code: code, qty: qty });
      }
    });
  }

  // Ensure we have at least 1 mock product if scraped nothing but labels are present
  if (products.length === 0) {
    // If no tables, look for a div containing "商品" or standard checkout items
    var singleItemName = findValueByLabel(['商品名']);
    var singleItemQty = findValueByLabel(['個数', '数量']) || '1';
    var singleItemCode = findValueByLabel(['商品番号', '商品コード', '管理番号']);
    if (singleItemName) {
      products.push({ name: singleItemName, code: singleItemCode, qty: singleItemQty });
    }
  }

  // If literally nothing found, try to alert user or provide mock
  if (products.length === 0) {
    alert('⚠️ 注文商品情報が見つかりませんでした。RMSの注文詳細画面を開いているか確認してください。');
    return;
  }

  // --- 4. Process and format Manufacturer Code (メーカー記号) ---
  // A manufacturer code is usually in parentheses inside the item code (e.g., "shampoo-abc(M-33)") or sometimes inside the item name.
  function parseManufacturerCode(code, name) {
    if (!code) code = name || '';
    
    // Pattern config mappings
    var patterns = [
      // 1. Double-byte / Japanese parentheses: （メーカー記号） or （J-88）
      /［([^［］]+)］$/, // brackets
      /（([^（）]+)）$/, // jp parens
      /\\(([^\\)]+)\\)$/, // en parens
      /\\(([^\\)]+)\\)[^()]*$/, // near end of string
      /（([^（）]+)）[^（）]*$/ // near end of string
    ];

    // Pick patterns based on preference
    for (var i = 0; i < patterns.length; i++) {
      var match = code.match(patterns[i]);
      if (match && match[1]) {
        return cleanText(match[1]);
      }
    }
    
    // Fallback: search in name itself if item code has nothing
    for (var i = 0; i < patterns.length; i++) {
      var match = name.match(patterns[i]);
      if (match && match[1]) {
        return cleanText(match[1]);
      }
    }
    
    return ''; // empty if not found
  }

  // Clean elements and process numbers
  products.forEach(function(p) {
    p.qtyVal = parseInt(p.qty.replace(/[^0-9]/g, '')) || 1;
    p.manufacturerCode = parseManufacturerCode(p.code, p.name);
    
    // Clean product name if option is toggled (e.g. remove HTML fragments or brackets)
    if (${config.cleanProductName}) {
      p.name = p.name.replace(/\\s*\\[[^\\]]+\\]/g, '') // remove brackets
                     .replace(/\\s*（[^（）]+）$/g, '') // remove manufacturer code from name
                     .replace(/\\s*\\([^\\)]+\\)$/g, ''); // remove manufacturer code from name
    }
  });

  // --- 5. Generate Output Grid Text (for Excel) ---
  var rows = [];
  
  // Headers (Optional)
  if (${config.includeHeader}) {
    rows.push(['注文日', '受注番号', '注文者', '送り先（お届け先）', '送り先住所', '送り先電話番号', '商品名', '注文個数', 'メーカー記号（商品記号）'].join('\\t'));
  }

  var isMultiRows = ${config.format === 'multi-rows'};

  if (isMultiRows) {
    // 1 row per product item
    products.forEach(function(p) {
      if (${config.excludeEmptyRows} && !p.name) return;
      rows.push([
        orderDate || '',
        orderNumber || '',
        ordererName || '',
        recipientName || '',
        recipientAddress || '',
        recipientPhone || '',
        p.name || '',
        p.qtyVal,
        p.manufacturerCode || ''
      ].join('\\t'));
    });
  } else {
    // Single row: [Date, Number, Orderer, Recipient, Address, Phone, Item1_Name, Item1_Qty, Item1_Mfg, Item2_Name, Item2_Qty, Item2_Mfg...]
    var colData = [
      orderDate || '',
      orderNumber || '',
      ordererName || '',
      recipientName || '',
      recipientAddress || '',
      recipientPhone || ''
    ];
    
    products.forEach(function(p, idx) {
      colData.push(p.name || '');
      colData.push(p.qtyVal);
      colData.push(p.manufacturerCode || '');
    });
    
    rows.push(colData.join('\\t'));
  }

  var finalTsv = rows.join('\\n');

  // --- 6. Copy to Clipboard ---
  // Modern navigator.clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(finalTsv).then(onSuccess, onFailure);
  } else {
    // Standard textarea fallback
    var textarea = document.createElement('textarea');
    textarea.value = finalTsv;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      var successful = document.execCommand('copy');
      if (successful) onSuccess();
      else onFailure();
    } catch (err) {
      onFailure();
    }
    document.body.removeChild(textarea);
  }

  function onSuccess() {
    showClipboardToast('✅ 注文情報をコピーしました！\\nエクセルなどのセルを選択して貼り付け（Ctrl+V）をしてください。\\n(' + products.length + '個の商品レコード)');
  }

  function onFailure() {
    alert('❌ コピーに失敗しました。お使いのブラウザの設定でクリップボードの書き込み制限がかかっている可能性があります。');
  }

  // --- 7. Nice user feedback banner overlay on target page ---
  function showClipboardToast(msg) {
    // Remove if there is an existing toast to avoid overlays piling up
    var existing = document.getElementById('rms-copier-toast');
    if (existing) existing.remove();

    var div = document.createElement('div');
    div.id = 'rms-copier-toast';
    div.style.position = 'fixed';
    div.style.top = '24px';
    div.style.right = '24px';
    div.style.backgroundColor = '#1e293b';
    div.style.color = '#ffffff';
    div.style.padding = '16px 24px';
    div.style.borderRadius = '12px';
    div.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
    div.style.zIndex = '999999';
    div.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    div.style.fontSize = '14px';
    div.style.lineHeight = '1.6';
    div.style.border = '1px solid #334155';
    div.style.transition = 'all 0.3s ease-in-out';
    div.style.textAlign = 'left';

    var pre = document.createElement('pre');
    pre.textContent = msg;
    pre.style.margin = '0 0 12px 0';
    pre.style.fontFamily = 'inherit';
    pre.style.whiteSpace = 'pre-wrap';
    div.appendChild(pre);

    var closeBtn = document.createElement('button');
    closeBtn.textContent = '閉じる';
    closeBtn.style.backgroundColor = '#e2e8f0';
    closeBtn.style.color = '#0f172a';
    closeBtn.style.border = 'none';
    closeBtn.style.padding = '6px 12px';
    closeBtn.style.borderRadius = '6px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontSize = '12px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.float = 'right';
    closeBtn.onclick = function() { div.remove(); };
    div.appendChild(closeBtn);

    document.body.appendChild(div);

    // Fade away after 6 seconds
    setTimeout(function() {
      if (div.parentNode) {
        div.style.opacity = '0';
        div.style.transform = 'translateY(-20px)';
        setTimeout(function() {
          if (div.parentNode) div.remove();
        }, 300);
      }
    }, 6000);
  }
})();
  `.trim();

  // Clean spacing and make it safe for bookmark content
  const minimizedJs = rawJs
    .replace(/\/\/.*$/gm, '') // Remove single line comments
    .replace(/\s+/g, ' ') // Collapse whitespaces
    .trim();

  return `javascript:${encodeURIComponent(minimizedJs)}`;
}

/**
 * Executes a simulated copy on mock data inside our app container to let the user see what is placed in their clipboard.
 */
export function simulateExtraction(order: RmsOrderData, config: BookmarkletConfig): { tsv: string; headers: string[]; rows: string[][] } {
  const headers = config.includeHeader 
    ? (config.format === 'multi-rows' 
        ? ['注文日', '受注番号', '注文者', '送り先（お届け先）', '送り先住所', '送り先電話番号', '商品名', '注文個数', 'メーカー記号（商品記号）']
        : ['注文日', '受注番号', '注文者', '送り先（お届け先）', '送り先住所', '送り先電話番号', ...order.products.flatMap((_, idx) => [`商品名${idx+1}`, `注文個数${idx+1}`, `メーカー記号${idx+1}`])])
    : [];

  const gridRows: string[][] = [];

  // Helper matching standard manufacturer parsing
  function parseMfgCode(itemNumber: string, name: string): string {
    const raw = itemNumber || name || '';
    // Look for parentheses or brackets
    const bMatch = raw.match(/［([^［］]+)］$/);
    if (bMatch) return bMatch[1].trim();
    const jMatch = raw.match(/（([^（）]+)）$/);
    if (jMatch) return jMatch[1].trim();
    const eMatch = raw.match(/\(([^)]+)\)$/);
    if (eMatch) return eMatch[1].trim();
    const looseMatch = raw.match(/\(([^)]+)\)[^()]*$/);
    if (looseMatch) return looseMatch[1].trim();
    const jpLooseMatch = raw.match(/（([^（）]+)）[^（）]*$/);
    if (jpLooseMatch) return jpLooseMatch[1].trim();
    return '';
  }

  const processedProducts = order.products.map(p => {
    let name = p.name;
    const code = p.itemNumber;
    const mfg = parseMfgCode(code, name);
    if (config.cleanProductName) {
      name = name.replace(/\s*\[[^\]]+\]/g, '')
                 .replace(/\s*（[^（）]+）$/g, '')
                 .replace(/\s*\([^)]+\)$/g, '');
    }
    return { name, qty: p.quantity, mfg };
  });

  if (config.format === 'multi-rows') {
    processedProducts.forEach(p => {
      if (config.excludeEmptyRows && !p.name) return;
      gridRows.push([
        order.orderDate,
        order.orderNumber,
        order.ordererName,
        order.recipientName,
        order.recipientAddress || '',
        order.recipientPhone || '',
        p.name,
        String(p.qty),
        p.mfg
      ]);
    });
  } else {
    const rowValues = [
      order.orderDate,
      order.orderNumber,
      order.ordererName,
      order.recipientName,
      order.recipientAddress || '',
      order.recipientPhone || ''
    ];
    processedProducts.forEach(p => {
      rowValues.push(p.name);
      rowValues.push(String(p.qty));
      rowValues.push(p.mfg);
    });
    gridRows.push(rowValues);
  }

  const outputLines: string[] = [];
  if (config.includeHeader && headers.length > 0) {
    outputLines.push(headers.join('\t'));
  }
  gridRows.forEach(row => {
    outputLines.push(row.join('\t'));
  });

  return {
    tsv: outputLines.join('\n'),
    headers,
    rows: gridRows
  };
}
