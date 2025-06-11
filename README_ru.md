# Подписки GraphQL на базе Yandex Cloud Serverless

Пример реализации базовых подписок GraphQL с использованием экосистемы Yandex Cloud Serverless

# Настройка

Необходимые ресурсы:
- база данных YDB;
- 3 функции Cloud Functions;
- API-шлюз.

## Инфраструктура

На данный момент `terraform` и `serverless` в YC не поддерживают WebSocket и YDB, поэтому создание ресурсов и выполнение миграции необходимо осуществлять вручную.

- Создайте каталог.
- Создайте сервисный аккаунт. Для удобства назначьте этому сервисному аккаунту роль `admin` на каталог. В продакшн-среде необходимо использовать более гранулярную роль.
- [Создайте](https://yandex.cloud/en/docs/functions/operations/function/function-create) функцию `graphql-websocket-connect`.
- [Создайте](https://yandex.cloud/en/docs/functions/operations/function/function-create) функцию `graphql-websocket-message`.
- [Создайте](https://yandex.cloud/en/docs/functions/operations/function/function-create) функцию `graphql-websocket-disconnect`.
- [Создайте](https://yandex.cloud/en/docs/ydb/operations/manage-database#create-db) базу данных YDB в бессерверном режиме.
- В консоли базы данных последовательно выполните SQL-запросы из [/src/migrations/](/src/migrations/).
- [Создайте](https://yandex.cloud/en/docs/api-gateway/operations/api-gw-create) API-шлюз с конфигурацией, аналогичной следующей:
```yaml
openapi: 3.0.0
info:
  title: Sample API
  version: 1.0.0
paths:
  /:
    x-yc-apigateway-websocket-connect:
      x-yc-apigateway-integration:
        type: cloud_functions
        function_id: <graphql-websocket-connect id>
        tag: $latest
        service_account_id: <service-account id>
    x-yc-apigateway-websocket-message:
      x-yc-apigateway-integration:
        type: cloud_functions
        function_id: <graphql-websocket-message id>
        tag: $latest
        service_account_id: <service-account id>
    x-yc-apigateway-websocket-disconnect:
      x-yc-apigateway-integration:
        type: cloud_functions
        function_id: <graphql-websocket-disconnect id>
        tag: $latest
        service_account_id: <service-account id>
```
`function_ids` и `service_account_id` необходимо заменить на соответствующие значения.
Имя функции можно задать любое при условии сохранения идентификаторов. В продакшн-среде настройку рекомендуется выполнять с использованием Terraform и CI-скриптов.

## Разработка

- Установите пакеты с помощью `npm ci`.
- Создайте сервисный аккаунт с ролью не ниже `functions.editor`.
- Создайте и сохраните [авторизованный ключ](https://yandex.cloud/en/docs/iam/operations/authorized-key/create) для этого аккаунта.
- Подготовьте и заполните файл `.env` в корне репозитория по примеру [`example.env`](/example.env).
- Выполните команду `npm dev`.

Данная команда загрузит функции в облако и активирует режим отслеживания изменений для разработки.

## Тестирование

После развертывания для тестирования запросов и подписок GraphQL можно использовать [Apollo Studio Sandbox Explorer](https://studio.apollographql.com/sandbox/explorer).

# Генерация кода и инструменты

В этом проекте используются различные инструменты, некоторые из которых можно считать нестандартными:

### `graphql-codegen`

Продакшн-решение для генерации типов TypeScript и определений резолверов из схемы данных GraphQL.

### `esbuild`

Один из самых быстрых инструментов для компиляции TypeScript в JavaScript.

### `ydb-codegen`

Проект в стадии разработки для упрощения взаимодействия с Yandex Database.

### `serverless-esbuild`

Плагин для `esbuild`, ускоряющий процесс разработки.
