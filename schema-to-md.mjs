#!/usr/bin/env zx
// @ts-check
const fs = require('node:fs');
const { argv } = require('node:process');
const minimist = require('minimist');

const args = minimist(argv.slice(2));
const {
  schema: actualSchemaPath,
  md: actualMarkdownPath,
  title: actualTitle,
} = args;
console.log(actualSchemaPath, actualMarkdownPath, actualTitle, args);

const schemaPath = actualSchemaPath || 'model.schema.json';
const markdownPath = actualMarkdownPath || 'SCHEMA.md';
const title = actualTitle || 'baldrick-todo';
const schemaContent = fs.readFileSync(schemaPath, 'utf8');
const schema = JSON.parse(schemaContent);

const singleLineDescription = (description) =>
  description.replaceAll('\n', ' ');

const getObjectAtPath = (ref) => {
  return ref.split('/').reduce(function (o, x) {
    return o[x];
  }, schema);
};

const isObject = (value) =>
  typeof value === 'object' &&
  value !== null &&
  value !== undefined &&
  !Array.isArray(value);

const isArray = (value) =>
  typeof value === 'object' && value !== null && Array.isArray(value);

function removeRefs(obj) {
  if (isObject(obj)) {
    for (const [key, value] of Object.entries(obj)) {
      if (key === '$ref') {
        const refPath = value.replaceAll('#/', '');
        const refValue = getObjectAtPath(refPath);
        Object.assign(obj, refValue);
      }
      removeRefs(value);
    }
  }
  if (isArray(obj)) {
    for (const value of obj) {
      removeRefs(value);
    }
  }
}

const pad = (count) => ' '.repeat(count * 2);

function getOneOfAny(value, level, kind) {
  let content = '';
  if (value.anyOf) {
    for (const oneOf of value.anyOf) {
      content += getOneOfAny(oneOf, level + 1, kind);
    }
  } else if (typeof value.type !== 'undefined') {
    const description = singleLineDescription(value.description || '_');
    content += `${pad(level)}- ⁘ ${value.type}: ${description}\n`;
    if (value.properties) {
      content += getProperties(value.properties, level + 1, '◆');
    }

    if (value.additionalProperties) {
      content += getProperties(
        value.additionalProperties.properties,
        level + 1,
        '◇'
      );
    }
  }
  return content;
}

function getProperties(obj, level, kind) {
  let content = '';
  for (const [key, value] of Object.entries(obj)) {
    const levelType =
      typeof value.type === 'undefined' ? '' : ` (${value.type})`;
    const description = singleLineDescription(value.description || '_');
    content += `${pad(level)}- ${kind} ${key}${levelType}: ${description}\n`;
    if (value.properties) {
      content += getProperties(value.properties, level + 1, '◆');
    }

    if (value.additionalProperties) {
      content += getProperties(
        value.additionalProperties.properties,
        level + 1,
        '◇'
      );
    }
    if (value.items?.properties) {
      content += getProperties(value.items.properties, level + 1, '○');
    }
    if (value.items?.anyOf) {
      for (const oneOf of value.items?.anyOf) {
        content += getOneOfAny(oneOf, level + 1, '?');
      }
    }
  }

  return content;
}

const definitions = removeRefs(schema.definitions);

const markdownProps = getProperties(schema.definitions, 0, '');
const markdown = `# Schema for ${title}

${markdownProps}
`;

fs.writeFileSync(markdownPath, markdown);
