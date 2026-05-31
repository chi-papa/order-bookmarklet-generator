/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RmsOrderData } from '../types';

export const mockOrders: RmsOrderData[] = [
  {
    orderDate: '2026/05/31 18:30:15',
    orderNumber: '254821-20260531-08170293',
    ordererName: '山田 太郎',
    ordererZip: '150-0002',
    ordererAddress: '東京都渋谷区渋谷2-24-12 渋谷スクランブルスクエア',
    recipientName: '山田 太郎',
    recipientZip: '150-0002',
    recipientAddress: '東京都渋谷区渋谷2-24-12 渋谷スクランブルスクエア',
    products: [
      {
        id: 'p1',
        name: 'ハイブリッド式大容量加湿器 静音 アロマオイル対応 ホワイト',
        itemNumber: 'humidifier-350w-white(KM-HR25)',
        quantity: 1,
        price: 5980
      }
    ]
  },
  {
    orderDate: '2026/05/31 15:12:45',
    orderNumber: '394851-20260531-02634810',
    ordererName: '佐藤 美咲',
    ordererZip: '530-0001',
    ordererAddress: '大阪府大阪市北区梅田3丁目1-1',
    recipientName: '鈴木 健二',
    recipientZip: '980-0021',
    recipientAddress: '宮城県仙台市青葉区中央1丁目1-1 仙台アパートメント 503号室',
    products: [
      {
        id: 'p2-1',
        name: 'メンズ ストレッチ スキニーデニムパンツ カジュアル インディゴ',
        itemNumber: 'denim-skinny-02(M-IND)',
        quantity: 2,
        price: 3980
      },
      {
        id: 'p2-2',
        name: '国産抗菌防臭コットンソックス 3足パック 吸汗 ブラック',
        itemNumber: 'socks-socks-blk(S-BLACK)',
        quantity: 1,
        price: 1200
      },
      {
        id: 'p2-3',
        name: 'ベーシック クルーネック 半袖Tシャツ ヘビーウェイト無地',
        itemNumber: 'tshirts-basic-wht（TSH-01）', // Mixed double-byte parens
        quantity: 3,
        price: 1500
      }
    ]
  },
  {
    orderDate: '2026/05/30 11:05:00',
    orderNumber: '193852-20260530-01928475',
    ordererName: '高橋 玲子',
    ordererZip: '460-0008',
    ordererAddress: '愛知県名古屋市中区栄3丁目1-1',
    recipientName: '高橋 玲子',
    recipientZip: '460-0008',
    recipientAddress: '愛知県名古屋市中区栄3丁目1-1',
    products: [
      {
        id: 'p3-1',
        name: '折りたたみ超軽量ヨガマット 6mm 水洗い可能 キャリングストラップ付（ピンク）',
        itemNumber: 'yoga-mat-pink［YOGA-06P］', // Brackets format
        quantity: 1,
        price: 2480
      }
    ]
  }
];
