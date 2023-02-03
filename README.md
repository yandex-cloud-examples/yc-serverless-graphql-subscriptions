# Yandex Cloud Serverless GraphQL Subscriptions
Example on how to implement a basic GraphQL subscriptions using Yandex Cloud Serverless ecosystem

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

# Infrastructure
Resources required:
- YDB
- 2 Cloud functions
- Api Gateway