# Internal

> Overview of the code base of baldrick-broth

This document has been generated automatically by
[baldrick-doc-ts](https://github.com/flarebyte/baldrick-doc-ts)

## Diagram of the dependencies

```mermaid
classDiagram
class `basic-execution.ts`{
  - getPropertyList()
  - asStringOrBlank()
  - asAnyArray()
  - range()
  +basicCommandExecution()
  +basicCommandsExecution()
}
class `build-model.ts`{
  - jsonishSchema()
  +safeParseBuild()
  +getSchema()
  +unsafeParse()
}
class `client.ts`{
  +runClient()
  - deleteLog()
  - unsafeRunClient()
  - exitWithError()
}
class `coloration.ts`
class `commands-creator.ts`{
  - createTaskDescription()
  +createCommands()
}
class `create-task-action.ts`{
  - sleep()
  - interactivePrompt()
  - logTaskStatistics()
  - toOnResultFlags()
  - asJSONLog()
  - debugContext()
  - toCommandLineAction()
  - capitalizeWord()
  - toBatchStepAction()
  - makeMessage()
  +createTaskAction()
}
class `data-value-utils.ts`{
  +createDataId()
  +setDataValue()
  +withMemoryPrefix()
  +splitDataKey()
  - getSpecificDataProperty()
  - getDataProperty()
  +getSupportedProperty()
  +isFalsy()
  +isTruthy()
}
class `env-variables.ts`
class `execution.ts`{
  - getErrorMessage()
  - toStatus()
  - parseJson()
  - parseYaml()
  - prepareCsv()
  - parseCsv()
  - forceString()
  - executeShellCommandLine()
  - appendVarToFile()
  +executeCommandLine()
}
class `expand-batch.ts`{
  - getArray()
  - expandCommand()
  - mergeExpandedCommandLineInputs()
  - expandBatch0()
  - expandBatch1()
  - expandBatch2()
  +expandBatchStep()
}
class `field-validation.ts`{
  - isSingleLine()
  +safeParseField()
}
class `file-io.ts`{
  +readYaml()
}
class `format-message.ts`{
  +formatMessage()
}
class `id-generator.ts`{
  +IdGenerator()
}
class `index.ts`
class `is-ci.ts`
class `json-mask.d.ts`{
  - json_mask()
}
class `log-model.ts`
class `logging.ts`{
  - consoleLikeFormat()
  +currentTaskWarn()
  +replayLogToConsole()
}
class `railway.ts`{
  +succeed()
  +willFail()
  +withDefault()
  +map1()
  +andThen()
}
class `string-utils.ts`{
  - keepAlphaNumeric()
  +dasherizeTitle()
  +isStringArray()
}
class `templating.ts`{
  - createTemplate()
  +getExpandedName()
  +getStringFromTemplate()
  +getCommandLines()
  +getSingleCommandLine()
  - forceJson()
  - getTemplateData()
  - mergeExtraData()
  +mergeTemplateContext()
}
class `version.ts`
class `json-mask`{
  +json_mask()
}
class `./build-model.js`{
  +type Ctx()
  +type AnyCommand()
  +type AnyDataValue()
  +type BatchStepModel()
  +type onCommandFailure()
  +type onCommandSuccess()
  +RuntimeContext()
  +OnShellCommandFinish()
  +Ctx()
  +BatchStepModel()
  +type TaskModel()
  +type BuildModelValidation()
  +safeParseBuild()
  +type BuildModel()
  +AnyDataValue()
  +AnyCommand()
}
class `./coloration.js`{
  +coloration()
}
class `./data-value-utils.js`{
  +withMemoryPrefix()
  +splitDataKey()
  +getSupportedProperty()
  +createDataId()
  +setDataValue()
  +isTruthy()
  +isFalsy()
}
class `./log-model.js`{
  +type LogMessage()
}
class `./railway.js`{
  +willFail()
  +type Result()
  +succeed()
  +andThen()
}
class `./string-utils.js`{
  +dasherizeTitle()
  +isStringArray()
}
class `./templating.js`{
  +mergeTemplateContext()
  +getCommandLines()
  +getExpandedName()
  +getSingleCommandLine()
  +getStringFromTemplate()
}
class `zod`{
  +type z()
  +z()
}
class `./field-validation.js`{
  +stringy()
}
class `./format-message.js`{
  +type ValidationError()
  +formatMessage()
}
class `node:fs/promises`{
  +readFile()
  +fs()
  +writeFile()
}
class `commander`{
  +type Command()
  +Command()
}
class `./commands-creator.js`{
  +createCommands()
}
class `./env-variables.js`{
  +buildFilePath()
}
class `./file-io.js`{
  +readYaml()
}
class `./version.js`{
  +version()
}
class `chalk`{
  +Chalk()
}
class `./create-task-action.js`{
  +createTaskAction()
}
class `node:path`{
  +path()
}
class `listr2`{
  +type ListrTask()
  +type ListrTaskWrapper()
  +Listr()
}
class `./execution.js`{
  +type CommandLineInput()
  +executeCommandLine()
}
class `./expand-batch.js`{
  +expandBatchStep()
}
class `./logging.js`{
  +currentTaskLogger()
  +telemetryTaskRefLogger()
  +telemetryTaskLogger()
  +replayLogToConsole()
}
class `dot-prop`{
  +getProperty()
}
class `./id-generator.js`{
  +rootId()
  +IdGenerator()
}
class `execa`{
  +execaCommand()
}
class `yaml`{
  +YAML()
}
class `papaparse`{
  +CSV()
}
class `./basic-execution.js`{
  +basicCommandExecution()
}
class `fs/promises`{
  +appendFile()
}
class `winston`{
  +winston()
}
class `./is-ci.js`{
  +isCI()
}
class `handlebars`{
  +Handlebars()
}
`basic-execution.ts`-->`json-mask`
`basic-execution.ts`-->`./build-model.js`
`basic-execution.ts`-->`./coloration.js`
`basic-execution.ts`-->`./data-value-utils.js`
`basic-execution.ts`-->`./log-model.js`
`basic-execution.ts`-->`./railway.js`
`basic-execution.ts`-->`./string-utils.js`
`basic-execution.ts`-->`./templating.js`
`build-model.ts`-->`zod`
`build-model.ts`-->`./field-validation.js`
`build-model.ts`-->`./format-message.js`
`build-model.ts`-->`./railway.js`
`client.ts`-->`node:fs/promises`
`client.ts`-->`commander`
`client.ts`-->`./build-model.js`
`client.ts`-->`./commands-creator.js`
`client.ts`-->`./env-variables.js`
`client.ts`-->`./file-io.js`
`client.ts`-->`./format-message.js`
`client.ts`-->`./railway.js`
`client.ts`-->`./version.js`
`coloration.ts`-->`chalk`
`commands-creator.ts`-->`commander`
`commands-creator.ts`-->`./build-model.js`
`commands-creator.ts`-->`./coloration.js`
`commands-creator.ts`-->`./create-task-action.js`
`commands-creator.ts`-->`./version.js`
`create-task-action.ts`-->`node:path`
`create-task-action.ts`-->`listr2`
`create-task-action.ts`-->`./build-model.js`
`create-task-action.ts`-->`./execution.js`
`create-task-action.ts`-->`./expand-batch.js`
`create-task-action.ts`-->`./logging.js`
`create-task-action.ts`-->`./railway.js`
`create-task-action.ts`-->`./data-value-utils.js`
`create-task-action.ts`-->`./coloration.js`
`create-task-action.ts`-->`./string-utils.js`
`data-value-utils.ts`-->`dot-prop`
`data-value-utils.ts`-->`./build-model.js`
`data-value-utils.ts`-->`./id-generator.js`
`data-value-utils.ts`-->`./logging.js`
`execution.ts`-->`execa`
`execution.ts`-->`yaml`
`execution.ts`-->`papaparse`
`execution.ts`-->`./build-model.js`
`execution.ts`-->`./railway.js`
`execution.ts`-->`./data-value-utils.js`
`execution.ts`-->`./basic-execution.js`
`execution.ts`-->`./templating.js`
`execution.ts`-->`./logging.js`
`execution.ts`-->`./coloration.js`
`execution.ts`-->`fs/promises`
`expand-batch.ts`-->`./build-model.js`
`expand-batch.ts`-->`./templating.js`
`expand-batch.ts`-->`./data-value-utils.js`
`expand-batch.ts`-->`./execution.js`
`expand-batch.ts`-->`./field-validation.js`
`expand-batch.ts`-->`./railway.js`
`expand-batch.ts`-->`./string-utils.js`
`expand-batch.ts`-->`./id-generator.js`
`field-validation.ts`-->`zod`
`file-io.ts`-->`node:fs/promises`
`file-io.ts`-->`yaml`
`file-io.ts`-->`./railway.js`
`file-io.ts`-->`./build-model.js`
`format-message.ts`-->`zod`
`logging.ts`-->`node:fs/promises`
`logging.ts`-->`winston`
`logging.ts`-->`./coloration.js`
`logging.ts`-->`./is-ci.js`
`logging.ts`-->`./log-model.js`
`templating.ts`-->`handlebars`
`templating.ts`-->`./build-model.js`
`templating.ts`-->`./data-value-utils.js`
`templating.ts`-->`./id-generator.js`
```
