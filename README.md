# ジェスチャーBOX

日本語のジェスチャーゲーム。お題の抽選・ヒント・制限時間に対応しています。
GitHub Pages版はブラウザーだけで動作し、サーバーやデータベースは不要です。

## お題を増やす

1. VS Codeで `lib/お題.ts` を開きます。
2. `groups` 内のカテゴリーに `|新しいお題` を追加します。例：`犬|猫|ウサギ|ハムスター`。
3. `actors` と `actions` を増やすと「だれが × なにを」の難しいお題が組み合わせで増えます。
4. 保存し、ソース管理で「コミットとプッシュ」を実行します。
5. GitHubのActionsで「Publish Gesture BOX」が成功すると、公開サイトに反映されます。

引用符や `.split("|")` は残してください。同じ難易度の重複や空のお題はテストが検出し、公開を止めます。表示件数は自動計算されます。追加したお題にはカテゴリーに応じたヒントが表示されます。

画面のフォームで追加したお題は、その端末・ブラウザーのlocalStorageに保存されます。別の端末や利用者には共有されず、ブラウザーのサイトデータを消すと削除されます。全員に配信するお題は `lib/お題.ts` から追加してください。

## GitHub Pagesの初回設定

このリポジトリ `keppy4-droid/gesture-box` の Settings → Pages → Build and deployment → Source で **GitHub Actions** を選びます。
現在のプランで非公開リポジトリのPagesが使えない場合は、リポジトリの公開または対応するGitHubプランが必要です。

初回はActions → Publish Gesture BOX → Run workflowを実行します。その後はmainへのプッシュで自動公開されます。
公開成功後の標準URLは `https://keppy4-droid.github.io/gesture-box/` です。

## ローカルで起動

Node.js 24とnpmを用意して実行します。

```sh
npm ci
npm run dev
```

ローカルURL：`http://127.0.0.1:5173/gesture-box/`

```sh
npm test
npm run build
npm run preview
```

公開用ファイルは `dist-pages/` に生成されます。Pagesのフォルダー名を変更する場合は `vite.pages.config.ts` のbaseを変更します。

## 主なファイル

- `lib/お題.ts`：全員に配信するお題
- `lib/hints.ts`：演じ方のヒント
- `app/page.tsx`、`app/globals.css`：画面とデザイン
- `hooks/`：タイマー、ブラウザー保存、ブラウザー連携
- `lib/browser-prompts.ts`：ブラウザー保存と入力確認
- `index.html`、`app/main.tsx`、`vite.pages.config.ts`：Pages版の入口とビルド設定
- `.github/workflows/pages.yml`：テストと自動公開

以前のSites版は既存ZIPと履歴から確認できます。Pages版にサーバー・データベースは不要です。ローカルに保存されていたデータベースは移行元フォルダーに残し、変更しません。


