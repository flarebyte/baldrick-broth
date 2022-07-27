export interface BrothDomain{
  domain: string;
  description: string;
  commands: BrothCommand[];
}
export interface BrothCommand {
  task: string;

  description: string;
}

export const getDomains = (): BrothDomain[] => [
  {
    domain: 'test',
    description: 'Desc for test',
    commands: [
      {
        task: 'generate',
        description: 'Desc for test generate',
      },
      {
        task: 'generate2',
        description: 'Desc for test generate2',
      },
    ]
  },
  {
    domain: 'test2',
    description: 'Desc for test2',
    commands: [
      {
        task: 'reset',
        description: 'Desc for test reset',
      },
    ]
  },
];
