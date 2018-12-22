# LDAP Password Change UI

LDAP サーバにパスワード変更リクエストを送信するためのシンプルな UI です。

## 環境変数の設定

LDAP サーバの接続情報は、以下の環境変数を設定します。

- LDAP_HOST
- LDAP_PORT
- LDAP_BIND_DN

### 例

```bash
export LDAP_HOST='example.com'
export LDAP_PORT='389'
export LDAP_BIND_DN='uid=%s,ou=user,dc=example,dc=com'
# %s にユーザIDを設定するため、%s を含める必要があります。
```

## 実行

```bash
# 環境変数設定後
go get -u github.com/nnuma/ldap-passwd-ui
cd $GOPATH/src/github.com/nnuma/ldap-passwd-ui
go run main.go
```

## 注意

### SSL 通信

SSL 通信（LDAPS、HTTPS）には対応していません。LDAP Password Change UI は LDAP サーバと同一ホストで実行することを想定しています。また、UI 上で入力したパスワードも暗号化されないので、別途 SSL プロキシを立てるなどセキュリティの対策が必要です。

### IE

IE には対応していません。IE で UI を表示すると IE をサポートしていない旨のメッセージが表示されます。

