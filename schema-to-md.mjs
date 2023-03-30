#!/usr/bin/env zx

const fs = require('node:fs');

const schemaPath = 'spec/snapshots/build-model/get-schema--schema.json';
const markdownPath = 'SCHEMA.md';
const title = 'baldrick-broth';

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

const pad = (count) => ' '.repeat(count * 2);

function getProperties(obj, level, kind) {
  let content = '';
  for (const [key, value] of Object.entries(obj)) {
    const levelType =
      typeof value.type === 'undefined' ? '' : ` (${value.type})`;
    const description = value.description || '_';
    const ref = value['$ref'] || '';
    content += `${pad(
      level
    )}- ${kind} ${key}${levelType}: ${ref}${description}\n`;
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
        content += getProperties(oneOf, level + 1, '>>>');
      }
    }
    if (value.anyOf) {
      for (const oneOf of value.anyOf) {
        content += getProperties(oneOf, level + 1, '->>');
      }
    }
  }

  return content;
}

const markdownProps = getProperties(schema.definitions, 0, '');
const markdown = `# Schema for ${title}

${markdownProps}
`;

fs.writeFileSync(markdownPath, markdown);
