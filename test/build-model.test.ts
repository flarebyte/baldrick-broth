import { safeParseBuild } from '../src/build-model';

const createBinary = (name: string) => ({
  title: `Title of ${name}`,
  description: `Description of ${name}`,
  motivation: `Motivation of ${name}`,
  homepage: `https://website.com/${name}`,
  shell: {
    run: name,
    diagnosis: `${name} --version`,
  },
});

const createShellStep = (name: string) => ({
  a: 'shell',
  bin: 'sh',
  title: `Run ${name} {project_yaml}`,
  if: `-f {{generate_hbs}} ${name}`,
  unless: '-f .pause ${name}',
  run: '{{whisker}} render {{project_yaml}} {{generate_hbs}} {{generate_sh}} {{color}}',
  flags: ['silent:fail'],
});
const example = {
  engine: {
    defaultShell: 'sh',
    telemetry: {
      verbosity: 'off',
      filepath: 'logs/telemetry.csv',
    },
  },
  binaries: {
    sh: createBinary('sh'),
    elm: createBinary('elm'),
  },
  model: {
    githubAccount: 'github-account-fixme',
    projectName: 'project-name-fixme',
    copyright: {
      holder: 'copyright-holder-fixme',
      startYear: 2022,
    },
    license: 'BSD3',
    project_yaml: 'script/data/project.yaml',
    project_schema: './script/schema/project.schema.json',
    generate_sh: 'script/generate.sh',
    colors: ['green', 'orange', 'blue'],
    animals: ['cat', 'dog'],
  },
  workflows: {
    test: {
      title: 'Test your library',
      description: 'Test your library for defects',
      tasks: {
        generate: {
          title: 'Generate code',
          description: 'Generate code',
          motivation: 'Generate code',
          visibility: 'public',
          parameters: {
            only: {
              description: 'only run this',
            },
          },
          steps: [
            {
              a: 'task',
              task: 'reset',
            },
            {
              a: 'task',
              task: 'log-time',
            },
            createShellStep('calculate'),
          ],
          finally: [
            {
              a: 'task',
              task: 'cleanup',
            },
          ],
        },
      },
    },
  },
};

describe('build-model', () => {
  it('should fail if model is empty', () => {
    const actual = safeParseBuild(example);
    expect(actual).toMatchInlineSnapshot(`
      Object {
        "status": "valid",
        "value": Object {
          "binaries": Object {
            "elm": Object {
              "description": "Description of elm",
              "homepage": "https://website.com/elm",
              "motivation": "Motivation of elm",
              "shell": Object {
                "diagnosis": "elm --version",
                "run": "elm",
              },
              "title": "Title of elm",
            },
            "sh": Object {
              "description": "Description of sh",
              "homepage": "https://website.com/sh",
              "motivation": "Motivation of sh",
              "shell": Object {
                "diagnosis": "sh --version",
                "run": "sh",
              },
              "title": "Title of sh",
            },
          },
          "engine": Object {
            "defaultShell": "sh",
            "telemetry": Object {
              "filepath": "logs/telemetry.csv",
              "verbosity": "off",
            },
          },
          "model": Object {
            "animals": Array [
              "cat",
              "dog",
            ],
            "colors": Array [
              "green",
              "orange",
              "blue",
            ],
            "copyright": Object {
              "holder": "copyright-holder-fixme",
              "startYear": 2022,
            },
            "generate_sh": "script/generate.sh",
            "githubAccount": "github-account-fixme",
            "license": "BSD3",
            "projectName": "project-name-fixme",
            "project_schema": "./script/schema/project.schema.json",
            "project_yaml": "script/data/project.yaml",
          },
          "workflows": Object {
            "test": Object {
              "description": "Test your library for defects",
              "tasks": Object {
                "generate": Object {
                  "description": "Generate code",
                  "finally": Array [
                    Object {
                      "a": "task",
                      "task": "cleanup",
                    },
                  ],
                  "motivation": "Generate code",
                  "parameters": Object {
                    "only": Object {
                      "description": "only run this",
                    },
                  },
                  "steps": Array [
                    Object {
                      "a": "task",
                      "task": "reset",
                    },
                    Object {
                      "a": "task",
                      "task": "log-time",
                    },
                    Object {
                      "a": "shell",
                      "bin": "sh",
                      "flags": Array [
                        "silent:fail",
                      ],
                      "if": "-f {{generate_hbs}} calculate",
                      "run": "{{whisker}} render {{project_yaml}} {{generate_hbs}} {{generate_sh}} {{color}}",
                      "title": "Run calculate {project_yaml}",
                      "unless": "-f .pause \${name}",
                    },
                  ],
                  "title": "Generate code",
                },
              },
              "title": "Test your library",
            },
          },
        },
      }
    `);
  });
});
