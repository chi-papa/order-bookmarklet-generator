# EC Order Copy Bookmarklet Generator & Sandbox / 主要EC店舗受注データ抽出ジェネレーター

主要な EC モール（店舗運営管理システム様式等）の注文詳細画面から、売上集計や配送伝票の作成に必要な情報をワンクリックで走査・コピーし、Excel やスプレッドシートへダイレクトに貼り付け可能な「タブ区切りテキスト（TSV）」を生成するブックマークレットの作成・管理用フロントエンドアプリケーションです。

---

## 🌟 主な機能と特徴

1. **お好みで選べる 2 種類の出力フォーマット**
   - **複数行形式（実務推奨）**：1注文内に複数商品が含まれる場合、行を分けて個別に書き出します。集計や商品別のピッキングが圧倒的に容易になります。
   - **単一行形式**：1つの受注を1つの行に連結して出力します。1件1行で管理したい場合に最適です。

2. **細やかなデータクレンジング設定**
   - **表ヘッダーの有無（項目名）**：ドラッグして Excel に貼り付ける際、1行目の項目タイトル行を自動付与または省略可能です。
   - **末尾メーカー記号の分離・商品名の洗浄**：商品名末尾の括弧等に含まれる記号コード（メーカーコード、管理記号等）を、正規表現により自動検出・商品名から切り離して別列に仕分けます。

3. **ローカル模擬シミュレーター（安心のデバッグ環境）**
   - 実際の店舗管理画面にアクセスすることなく、様々なテスト注文パターン（単一商品、複数商品、長文、例外記号等）に対して、生成されたブックマークレットの抽出結果がスプレッドシートへどう貼り付けられるかを画面上でインタラクティブに検証できます。

4. **高度な代替手段：HTML ソースコード解析器（オフライン機能）**
   - セキュリティポリシーによりブックマークバーの改変やサードパーティスクリプトの実行が規制されている PC 端末でも利用できるよう、対象ページの HTML ソースコード（ページのソース）をそのままコピー＆ペーストするだけで、サーバー不要でブラウザ内で即座にテーブル抽出する逆解析機能を搭載。

---

## 🚀 GitHub Pages へのデプロイ方法

すでにリポジトリ内には `.github/workflows/deploy.yml`（GitHub Actions 自動デプロイ設定）が用意されています。Vercel や Netlify などの外部サービスを一切契約・連携することなく、無料かつ安全にセキュアな静的サイトとして公開可能です。

### デプロイ手順

1. **リポジトリを GitHub に作成・プッシュ**
   このコードベースを GitHub にプッシュします（`main` または `master` ブランチ）。

2. **GitHub Pages の設定変更**
   - 該当リポジトリの **Settings** ➜ **Pages** 画面へ移動します。
   - **Build and deployment** の **Source** 項目で、`Deploy from a branch` から **`GitHub Actions`** に切り替えます。

3. **自動ビルドと公開**
   - 次にコミットしてプッシュすると、GitHub Actions が自動起動して Vite アプリをビルドし、数分ほどで `https://<ユーザ名>.github.io/<リポジトリ名>/` に安全に公開されます。
   - `vite.config.ts` で `base: './'` の相対パス設定をしてありますので、パスずれを起こさず完璧に表示されます。

---

## 🛠️ 技術スタック

- **Frontend**: React 18 / TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Motion (motion/react)
- **Bundler**: Vite
- **Icons**: Lucide React
- **Hosting Compat**: GitHub Pages / Static Site Hosts

---

## 📄 ライセンス / License

このプロジェクトは **MIT ライセンス** のもとで公開されています。商用利用、カスタマイズ、改変、再配布が完全に無償で自由に行えます。

```text
The MIT License (MIT)

Copyright (c) 2026 EC Order Copier Project Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
