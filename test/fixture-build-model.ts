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

const createCommand = (name: string) => ({
  run: `${name} {{whisker}} render {{project_yaml}} {{generate_hbs}} {{generate_sh}} {{color}}`,
  name: `${name}{{color}}`,
  onSuccess: ['trim'],
  onFailure: ['exit'],
});
const createShellStep = (name: string) => ({
  a: 'shell',
  name,
  title: `Run ${name} shell step`,

  commands: [createCommand('cat')],
});

const varStep = (name: string) => ({
  a: 'var',

  name,
  title: `Set variable ${name}`,
  value: `model.${name}`,
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

          parameters: {
            only: {
              description: 'only run this',
              flags: '-p, --pizza-type <type>',
            },
          },
          steps: [varStep('githubAccount'), createShellStep('calculate')],
          finally: [createShellStep('finish')],
        },
      },
    },
  },
};
