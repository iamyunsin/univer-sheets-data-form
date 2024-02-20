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
# Data form plugin

The data form plug-in works in conjunction with Univer Sheets. It provides a convenient way to configure data sources and binding relationships, and organizes the data in the table into structured data based on the data sources and binding relationships to provide to back-end programs for analysis or exhibit.

Supports multiple data types and custom data validation rules, as well as configuring option data through the backend for selection, etc.

All the data filling and data analysis that previously required the development of separate page forms to provide users with data can be completed directly in Univer Sheets through this plug-in.

## Quick start


### Installation

```bash
// use pnpm
pnpm add univer-sheet-data-form

// use npm
npm i univer-sheet-data-form

// use npm
npm i univer-sheet-data-form

// use yarn
yarn add univer-sheet-data-form
```

```ts
import { UniverSheetsDataFormPlugin } from '../src'

...

univer.registerPlugin(UniverSheetsDataFormPlugin);
```

### API Documents

