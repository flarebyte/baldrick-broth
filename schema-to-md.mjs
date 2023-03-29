#!/usr/bin/env zx

const fs = require('node:fs');

const schemaPath = 'spec/snapshots/build-model/get-schema--schema.json';
const markdownPath = 'SCHEMA.md';

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

const pad = (count) => ' '.repeat(count * 2);

function getProperties(obj, level) {
  let properties = '';
  for (const [key, value] of Object.entries(obj)) {
    console.log(key);
    const description = value.description || '_';
    properties += `${pad(level)}- ${key}: ${description}\n`;
    if (value.properties) {
      properties += getProperties(value.properties, level + 1);
    }

    if (value.additionalProperties) {
      properties += getProperties(
        value.additionalProperties.properties,
        level + 1
      );
    }
  }

  return properties;
}

const markdownProps = getProperties(schema.definitions, 0);
const markdown = `# Schema

${markdownProps}
`;

fs.writeFileSync(markdownPath, markdown);
