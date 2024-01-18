# npm パッケージの作成方法

github の npm レジストリを使って npm パッケージを公開してみたので備忘録として書いておきます。  
NPMJS に公開すると全世界的に公開されてしまいますが、github の npm レジストリの場合は公開範囲を制限できます。  
例えば monoworks の Organization 内でのみ公開等

## 最終的にできること

自分で公開した npm パッケージを npm で install して使いたい場所で import できます。

`npm i ito-mono/package`

import { myComponent } from '@ito-mono/package'

## やり方

vite でバンドル、トランスパイル、型定義ファイルの出力等全部できます。

### vite プロジェクトの立ち上げ

`npm create vite@latest`

### 型定義ファイル出力用のプラグインの install

`npm i -D vite-plugin-dts`

### 設定ファイルの編集

`vite.config.ts` の設定を編集してください。

```diff:vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
+ import { resolve } from "path";
+ import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
- plugins: [react()],
+ plugins: [react(), dts()],
+ build: {
+   lib: {
+     entry: resolve(__dirname, "src/index.ts"),
+     name: "index-dts",
+     fileName: "index",
+     formats: ["es"],
+   },
+   outDir: "../dist",
+   emptyOutDir: true,
  },
});

```

### ビルド

`npm run build` で `dist` が出力されれば成功です。

vite の開発環境と package とでディレクトリを分けておくと楽です。

## Publish の準備

### package.json の作成

パッケージをおいておくディレクトリで `npm init -y`
出来た `package.json` をいじります。

```json:package.json
{
  "name": "@ito-mono/package",  // パッケージ名 @{リポジトリ主}/{リポジトリ名}
  "version": "0.0.3",           // version 更新していない状態でpublishすると怒られる
  "description": "",
  "author": "T.Ito",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/ito-mono/package.git"  // githubのリポジトリURL
  },
  "main": "dist/index.js",    // エントリポイント
  "files": [                  // packageに含むファイルの一覧
    "dist"
  ],
  "types": "dist/index.d.ts", // 型定義ファイルのエントリポイント
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

### 公開用の CI を Github Actions で設定

`.github/workflows/` 配下に以下の `yml` を設置してください。

```yml:publishPackage.yml
name: Publish npm package

on:
  push:
    branches: ["master"]

defaults:
  run:
    working-directory: .

jobs:
  publish:
    runs-on: ubuntu-latest

    permissions:
      packages: write # GitHub Packagesへの書き込み権限が必要
      contents: read # リポジトリの内容の読み取り権限が必要

    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          registry-url: https://npm.pkg.github.com
      - name: Install → ビルドを行うためdevDependenciesもインストールする
        working-directory: dev
        run: npm install
      - name: Build
        working-directory: dev
        run: npm run build
      - name: publish npm package
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Publish

`master` ブランチにプッシュすると勝手に設定した Actions が走ってパッケージが公開されます。  
成功したら公開したパッケージ名で `npm install` が出来るようになっています！！！
