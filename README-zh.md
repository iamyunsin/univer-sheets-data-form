<p align="center">
  <a href="./LICENSE.txt">
      <img src="https://img.shields.io/github/license/iamyunsin/univer-sheets-data-form" alt="GitHub License" />
  </a>
  <a href="https://github.com/iamyunsin/univer-sheets-data-form/actions/workflows/build.yml">
      <img src="https://img.shields.io/github/actions/workflow/status/iamyunsin/univer-sheets-data-form/build.yml" alt="GitHub Workflow Status" />
  </a>
</p>

<p align="center">
    English
    |
    <a href="./README-zh.md">简体中文</a>

</p>

# 数据表单插件

数据表单插件是与Univer Sheets协同工作的，它提供便捷的方式配置数据源和绑定关系，并根据数据源和绑定关系将表格中的数据组织成结构化数据以提供给后端程序分析或展示。

支持多种数据类型和自定义数据校验规则，以及通过后端配置选项数据以供选择等等。

所有以前需要单独开发页面表单才能为用户提供的数据填报和数据分析，通过该插件，让你能够直接在Univer Sheets中完成。

## 快速开始

### 安装依赖

```bash
// 使用pnpm
pnpm add univer-sheet-data-form

// 使用npm
npm i univer-sheet-data-form

// 使用npm
npm i univer-sheet-data-form

// 使用yarn
yarn add univer-sheet-data-form
```

### 初始化

```ts
import { UniverSheetsDataFormPlugin } from '../src'

...

univer.registerPlugin(UniverSheetsDataFormPlugin);
```

### API说明

// TODO: 编写API说明文档

##