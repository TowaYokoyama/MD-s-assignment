# タスク管理アプリケーション

FastAPI（バックエンド）とNext.js（フロントエンド）で構築された、シンプルなタスク管理アプリケーションです。

## 主な機能

- タスクの作成、読み取り、更新、削除 (CRUD)
- ステータス（pending, in_progress, completed）によるタスクのフィルタリング

## 最終的な構成（アーキテクチャ）

このアプリケーションは、以下のクラウドサービスを連携させて動作するように構築しました。

- **フロントエンド**:
  - **フレームワーク**: Next.js (React)
  - **ホスティング**: Vercel

- **バックエンド**:
  - **フレームワーク**: FastAPI (Python)
  - **ホスティング**: Fly.io (Dockerコンテナとしてデプロイ)

- **データベース**:
  - **種類**: Redis
  - **ホスティング**: Fly.io (Fly Redis)

## ローカル開発環境でのセットアップ

### 1. バックエンド (FastAPI)

ローカル環境でバックエンドを動かす場合の手順です。

```bash
# backend ディレクトリに移動
cd backend

# Pythonの仮想環境を作成
python -m venv venv

# 仮想環境を有効化 (Windowsの場合)
.\venv\Scripts\Activate

# 必要なライブラリをインストール
pip install -r requirements.txt

# FastAPIサーバーを起動
# (このコマンドを実行するには、ローカルでRedisが起動している必要があります)
uvicorn app.main:app --reload
```

APIは `http://127.0.0.1:8000` で利用可能になります。

### 2. フロントエンド (Next.js)

ローカル環境でフロントエンドを動かす場合の手順です。

```bash
# frontend ディレクトリに移動
cd frontend

# 必要なライブラリをインストール
npm install

# 開発サーバーを起動
npm run dev
```

フロントエンドは `http://localhost:3000` で利用可能になります。

## 開発者の感想

フロント
next.js
バックエンド
fastapi
データベース
redis
はまったところ dockerのデプロイ(使わなかった)corsのエラー テストコード(pytest) postgres(sqlalchemy) 


