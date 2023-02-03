# Yandex Cloud Serverless GraphQL Subscriptions
Example on how to implement a basic GraphQL subscriptions using Yandex Cloud Serverless ecosystem

# Setup
Resources required:
- YDB
- 3 Cloud functions
- Api Gateway

## Infrastructure
As of now WebSocket and YDB features are not supported by YC's `terraform` or `serverless`, so we are to create resources manually.

- Create a folder
- Create a service-account
- [Create](https://cloud.yandex.ru/docs/functions/operations/function/function-create) `graphql-websocket-connect` function
- [Create](https://cloud.yandex.ru/docs/functions/operations/function/function-create) `graphql-websocket-message` function
- [Create](https://cloud.yandex.ru/docs/functions/operations/function/function-create) `graphql-websocket-disconnect` function
- [Create](https://cloud.yandex.ru/docs/ydb/operations/manage-database#create-db) a YDB database in a serverless mode
- [Create](https://cloud.yandex.ru/docs/api-gateway/operations/api-gw-create) Api Gateway with config similar to this:
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
Note that function_ids and service_account_id should be replaced with corresponding data

## Development
- Install packages using `npm install`
- [Install](https://cloud.yandex.ru/docs/cli/quickstart) Yandex Cloud CLI (yc)
- [Authenticate](https://cloud.yandex.ru/docs/cli/quickstart#initialize) in yc
- Save OAuth token
- Fill .env file accordingly to .example.env
- Execute `npm dev`

# Code generation and tools
This project uses several tools:
### graphql-codegen
Production solution to generate typescript and resolver definitions from GraphQL Schema
### esbuild
One of the fastest Typescript to Javascript compilers
### ydb-codegen
WIP project to simplify working with Yandex Database
### serverless
Plugin for esbuild which makes development process faster