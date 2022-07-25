import { z } from "zod"

export const schema = z.object({
  engine: z.object({
    defaultShell: z.string(),
    telemetry: z.object({ verbosity: z.string(), filepath: z.string() })
  }),
  binaries: z.object({
    sh: z.object({
      description: z.string(),
      motivation: z.string(),
      homepage: z.string(),
      shell: z.object({ run: z.string(), diagnosis: z.string() })
    }),
    elm: z.object({
      description: z.string(),
      motivation: z.string(),
      homepage: z.string(),
      shell: z.object({ run: z.string(), diagnosis: z.string() })
    }),
    whisker: z.object({
      description: z.string(),
      motivation: z.string(),
      homepage: z.string(),
      shell: z.object({ run: z.string(), diagnosis: z.string() })
    })
  }),
  variables: z.object({
    githubAccount: z.string(),
    projectName: z.string(),
    copyright: z.object({ holder: z.string(), startYear: z.number() }),
    license: z.string(),
    project_yaml: z.string(),
    project_schema: z.string(),
    generate_sh: z.string(),
    colors: z.array(z.string()),
    animals: z.array(z.string())
  }),
  domains: z.object({
    test: z.object({
      title: z.string(),
      description: z.string(),
      tasks: z.object({
        generate: z.object({
          title: z.string(),
          description: z.string(),
          motivation: z.string(),
          visibility: z.string(),
          parameters: z.object({ only: z.object({ description: z.string() }) }),
          steps: z.array(
            z.union([
              z.object({ task: z.string() }),
              z.object({
                shell: z.object({
                  bin: z.string(),
                  title: z.string(),
                  if: z.string(),
                  unless: z.string(),
                  each: z.object({ color: z.string() }),
                  run: z.string(),
                  failSilently: z.boolean()
                })
              })
            ])
          ),
          finally: z.array(z.object({ task: z.string() }))
        })
      })
    })
  })
})
