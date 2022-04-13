#!/usr/bin/env node

'use strict';

const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split('.');
const major = semver[0];

if (major < 12) {
  console.error(
    'Обновите NodeJS до версии 12+. Текущая версия: ' + currentNodeVersion
  );
  process.exit(1);
}

const { init } = require('./createRgsApp');

init();
