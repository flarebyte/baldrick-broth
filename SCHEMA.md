# Schema

- baldrick-broth-schema: Settings for a baldrick-broth file
  - engine: Settings for the baldrick-broth engine
    - telemetry: Preferences for telemetry
      - name: _
      - verbosity: _
      - filepath: A relative path to a file
  - model: Any JSON document without null values
  - workflows: _
    - title: A short title that summarizes this section of script
    - description: The main purpose of this section of script
    - tasks: _
      - name: _
      - title: _
      - description: The main purpose of this section of script
      - motivation: The main reason why this section of script is needed
      - links: A list of useful links
      - parameters: _
      - main: A batch of shell commands to run
        - name: _
        - if: A condition that must be satisfied to enable the batch
        - each: The same batch will be run multiple times for each loop
        - commands: A list of batch shell scripts to run
      - before: A batch of shell commands to run
      - after: A batch of shell commands to run

