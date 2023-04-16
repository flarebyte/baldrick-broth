# Usage

## Workflows

### Simple task

Here are some steps you can follow to write a command:

1.  Create a `baldrick-broth.yaml` file at the root of your project.

2.  Start by defining a workflow that describes the tasks you want to
    perform.

3.  Define a task that describes the command you want to run.

4.  Define a command that describes the specific command you want to run.

5.  Add any additional parameters or options that are required for your
    command.

Here’s an example of how you could write a command in YAML:

```yaml
workflows:
  test:
    # Use a descriptive title for your workflow
    title: Test the library
    # Provide a brief description of what your workflow does
    description: Test the library for defects
    tasks:
      jest:
        # Use a descriptive title for your task
        title: Run the unit tests with Jest
        # Provide a detailed description of what your task does
        description: Use the Jest framework to run unit tests
        # Explain why this task is important
        motivation: Detect weaknesses early
        # Include any relevant links that might be helpful for users
        links:
          - title: Jest is a JavaScript Testing Framework
            url: https://jestjs.io/
        main:
          commands:
            - title: Test all test files in test folder
              # Use a descriptive command name
              run: yarn jest
            - title: Test all test files in demo folder
              run: yarn jest demo/
```

Good practices:

-   Use descriptive titles and descriptions for your workflows and tasks.
-   Explain why each workflow and task is important.
-   Include any relevant links that might be helpful for users.
-   Use descriptive command names.
-   Provide detailed descriptions of what each command does.

### Task Conditional logic

To add conditional logic in YAML, you can use an if statement inside of your
build task list. Here’s an example of how you could add conditional logic to
your YAML file:

```YAML
- name: has-pest-files
  title: Check if there are any pest files
  run: find . -type f -name *.pest.yaml
  onSuccess:
    - save
    - silent
- a: every-truthy
  name: should-run-pest
  title: Is this a PR and is there some pest files
  values:
    - data.has-pest-files
    - runtime.parameters.pullRequest
- name: pest
  title: Run the integration pest tests
  if: data.should-run-pest
  run: npx baldrick-broth@latest test pest
```

In this example, the if attribute checks the boolean value of the variable in
the context and runs the pest step only if it’s true.

The benefits of being able to add conditional logic include:

-   More control over your build process.
-   The ability to run certain steps only when certain conditions are met.
-   The ability to skip certain steps when they’re not needed.

A list of functions that are supported:

| Name         | Title                                            | Other fields                                                                                                                                                                                                                                                                                                 |
| ------------ | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| get-property | Get a property using a dot prop path             |                                                                                                                                                                                                                                                                                                              |
| string-array | Process on a list of strings                     | Options for the transforming the resulting array of string with either: sort: Sorts the array of strings in ascending order. unique: Removes any duplicate strings from the array. filled: Removes any empty or undefined elements from the array. reverse: Reverses the order of the elements in the array. |
| concat-array | Concatenate several arrays together              |                                                                                                                                                                                                                                                                                                              |
| split-string | Split a string into multiple strings             | A separator to split the string                                                                                                                                                                                                                                                                              |
| split-lines  | Split a string into multiple lines               |                                                                                                                                                                                                                                                                                                              |
| some-truthy  | Return true if at least one of values is truthy  |                                                                                                                                                                                                                                                                                                              |
| some-falsy   | Return true if at least one of values is falsy   |                                                                                                                                                                                                                                                                                                              |
| every-truthy | Return true if all the values are truthy         |                                                                                                                                                                                                                                                                                                              |
| every-falsy  | Return true if all the values are falsy          |                                                                                                                                                                                                                                                                                                              |
| not          | Return the opposite boolean value                |                                                                                                                                                                                                                                                                                                              |
| range        | Generate a range of numbers                      | The number to start the range with, The number at the end of the range, A step to increment the range, usually 1                                                                                                                                                                                             |
| invert-title | Invert keys and values into a new title          |                                                                                                                                                                                                                                                                                                              |
| mask-title   | Uses JSON mask to select parts of the json title | JSON mask to select parts of the json title                                                                                                                                                                                                                                                                  |
