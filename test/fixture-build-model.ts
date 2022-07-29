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
export const buildModelExample = {
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

          flags: ['private'],
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
