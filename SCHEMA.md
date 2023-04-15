# Schema for baldrick-broth

-   baldrick-broth-schema (object): Settings for a baldrick-broth file
-   ◆ engine (object): Settings for the baldrick-broth engine
    -   ◆ telemetry (object): Preferences for telemetry
        -   ◆ name (string): \_
        -   ◆ verbosity (string): \_
        -   ◆ filepath (string): A relative path to a file
-   ◆ workflows (object): A collection of related tasks and processes that
    achieve a specific goal
    -   ◇ title (string): A brief and descriptive title for this workflow
    -   ◇ description (string): A detailed explanation of the purpose and
        function of this workflow
    -   ◇ tasks (object): A list of individual tasks that make up this workflow
        -   ◇ name (string): A unique identifier for this task
        -   ◇ title (string): A brief and descriptive title for this workflow
        -   ◇ description (string): A detailed explanation of the purpose and
            function of this workflow
        -   ◇ motivation (string): The reason why this task is necessary within the
            context of the workflow
        -   ◇ links (array): A list of relevant resources and references related to
            this task
            -   ○ title (string): A brief and descriptive title for this workflow
            -   ○ url (string): A https link to a webpage
        -   ◇ parameters (array): A list of configurable options for this task
            -   ○ description (string): A detailed explanation of the purpose and
                function of this workflow
            -   ○ flags (string): \_
            -   ○ default (string): \_
        -   ◇ main (object): The primary script or command to be executed for this
            task
            -   ◆ name (string): Name of the step with either: unknown: Describe any
                unknown or uncertain aspects of the process (should not pick this)
                main: Describe the main step of the process before: Describe a step
                that need to be taken before the process begins after: Describe a step
                that need to be taken after the process is completed
            -   ◆ if (string): A conditional statement that determines whether or not
                this script or command should be executed
            -   ◆ each (array): An array of values to be iterated over, with each
                iteration executing the script or command with the current value as an
                input
                -   ○ name (string): The name of the variable to be used as an input to the
                    script or command during each iteration
                -   ○ values (string): The variable to the array of values to be iterated
                    over
            -   ◆ commands (array): A list of batch shell scripts to run
                -   ⁘ object: Get a property using a dot prop path
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ value (string): A conditional statement that determines whether or
                        not this script or command should be executed
                -   ⁘ object: Process on a list of strings
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ value (string): A conditional statement that determines whether or
                        not this script or command should be executed
                    -   ◆ onSuccess (string): Options for the transforming the resulting array
                        of string with either: sort: Sorts the array of strings in ascending
                        order. unique: Removes any duplicate strings from the array. filled:
                        Removes any empty or undefined elements from the array. reverse:
                        Reverses the order of the elements in the array.
                    -   ◆ filters (array): A list of filters on strings
                        -   ○ if (string): A conditional statement that determines whether or not
                            the string should be kept with either: starts-with: Match items that
                            start with a specific value ends-with: Match items that end with a
                            specific value contains: Match items that contain a specific value
                            equals: Match items that are equal to a specific value not starts-with:
                            Match items that do not start with a specific value not ends-with:
                            Match items that do not end with a specific value not contains: Match
                            items that do not contain a specific value not equals: Match items that
                            are not equal to a specific value
                        -   ○ anyOf (array): A list of references to match against
                -   ⁘ object: Concatenate several arrays together
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ values (array): \_
                -   ⁘ object: Split a string into multiple strings
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ separator (string): A separator to split the string
                    -   ◆ value (string): A conditional statement that determines whether or
                        not this script or command should be executed
                -   ⁘ object: Split a string into multiple lines
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ value (string): A conditional statement that determines whether or
                        not this script or command should be executed
                -   ⁘ object: Return true if at least one of values is truthy
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ values (array): \_
                -   ⁘ object: Return true if at least one of values is falsy
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ values (array): \_
                -   ⁘ object: Return true if all the values are truthy
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ values (array): \_
                -   ⁘ object: Return true if all the values are falsy
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ values (array): \_
                -   ⁘ object: Return the opposite boolean value
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ value (string): A conditional statement that determines whether or
                        not this script or command should be executed
                -   ⁘ object: Generate a range of numbers
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ start (integer): The number to start the range with
                    -   ◆ end (integer): The number at the end of the range
                    -   ◆ step (integer): A step to increment the range, usually 1
                -   ⁘ object: Invert keys and values into a new object
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ value (string): A conditional statement that determines whether or
                        not this script or command should be executed
                -   ⁘ object: Uses JSON mask to select parts of the json object
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ value (string): A conditional statement that determines whether or
                        not this script or command should be executed
                    -   ◆ mask (string): JSON mask to select parts of the json object
                -   ⁘ object: Uses JSON mask to select parts of the json object
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ template (string): Resolve the handlebars template as a atring.
                        <https://handlebarsjs.com/guide/>
                -   ⁘ object: Prompt that takes user input and returns a string
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ message (string): A short message that will display in the prompt
                -   ⁘ object: Prompt that returns true or false
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ message (string): A short message that will display in the prompt
                -   ⁘ object: Prompt that takes user input, hides it from the terminal, and
                    returns a string
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ message (string): A short message that will display in the prompt
                -   ⁘ object: Prompt that allows the user to select from a list of options
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ message (string): A short message that will display in the prompt
                    -   ◆ select (string): A conditional statement that determines whether or
                        not this script or command should be executed
                -   ⁘ object: Prompt that allows the user to choose an option
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ message (string): A short message that will display in the prompt
                    -   ◆ choices (array): \_
                -   ⁘ object: Step where data is appended to a file
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ value (string): A conditional statement that determines whether or
                        not this script or command should be executed
                    -   ◆ filename (string): The name of the file to which data will be
                        appended
                -   ⁘ object: Step where data is written to a file
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ value (string): A conditional statement that determines whether or
                        not this script or command should be executed
                    -   ◆ filename (string): The name of the file to which data will be written
                -   ⁘ object: Configuration for the batch shell script
                    -   ◆ name (string): A short name that could be used a key or variable
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ a (string): \_
                    -   ◆ onFailure (array): List of flags to describe the default behavior in
                        case of failure
                    -   ◆ onSuccess (array): List of flags to describe the default behavior in
                        case of success
                    -   ◆ if (string): A conditional statement that determines whether or not
                        this script or command should be executed
                    -   ◆ stdin (string): A conditional statement that determines whether or
                        not this script or command should be executed
                    -   ◆ run (string): A line of shell script
                    -   ◆ multiline (boolean): Should the run command spread on multiple lines
        -   ◇ before (object): A batch of shell commands to run
            -   ◆ name (string): Name of the step with either: unknown: Describe any
                unknown or uncertain aspects of the process (should not pick this)
                main: Describe the main step of the process before: Describe a step
                that need to be taken before the process begins after: Describe a step
                that need to be taken after the process is completed
            -   ◆ if (string): A conditional statement that determines whether or not
                this script or command should be executed
            -   ◆ each (array): An array of values to be iterated over, with each
                iteration executing the script or command with the current value as an
                input
                -   ○ name (string): The name of the variable to be used as an input to the
                    script or command during each iteration
                -   ○ values (string): The variable to the array of values to be iterated
                    over
            -   ◆ commands (array): A list of batch shell scripts to run
                -   ⁘ object: Get a property using a dot prop path
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ value (string): A conditional statement that determines whether or
                        not this script or command should be executed
                -   ⁘ object: Process on a list of strings
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ value (string): A conditional statement that determines whether or
                        not this script or command should be executed
                    -   ◆ onSuccess (string): Options for the transforming the resulting array
                        of string with either: sort: Sorts the array of strings in ascending
                        order. unique: Removes any duplicate strings from the array. filled:
                        Removes any empty or undefined elements from the array. reverse:
                        Reverses the order of the elements in the array.
                    -   ◆ filters (array): A list of filters on strings
                        -   ○ if (string): A conditional statement that determines whether or not
                            the string should be kept with either: starts-with: Match items that
                            start with a specific value ends-with: Match items that end with a
                            specific value contains: Match items that contain a specific value
                            equals: Match items that are equal to a specific value not starts-with:
                            Match items that do not start with a specific value not ends-with:
                            Match items that do not end with a specific value not contains: Match
                            items that do not contain a specific value not equals: Match items that
                            are not equal to a specific value
                        -   ○ anyOf (array): A list of references to match against
                -   ⁘ object: Concatenate several arrays together
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ values (array): \_
                -   ⁘ object: Split a string into multiple strings
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ separator (string): A separator to split the string
                    -   ◆ value (string): A conditional statement that determines whether or
                        not this script or command should be executed
                -   ⁘ object: Split a string into multiple lines
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ value (string): A conditional statement that determines whether or
                        not this script or command should be executed
                -   ⁘ object: Return true if at least one of values is truthy
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ values (array): \_
                -   ⁘ object: Return true if at least one of values is falsy
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ values (array): \_
                -   ⁘ object: Return true if all the values are truthy
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ values (array): \_
                -   ⁘ object: Return true if all the values are falsy
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ values (array): \_
                -   ⁘ object: Return the opposite boolean value
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ value (string): A conditional statement that determines whether or
                        not this script or command should be executed
                -   ⁘ object: Generate a range of numbers
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ start (integer): The number to start the range with
                    -   ◆ end (integer): The number at the end of the range
                    -   ◆ step (integer): A step to increment the range, usually 1
                -   ⁘ object: Invert keys and values into a new object
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ value (string): A conditional statement that determines whether or
                        not this script or command should be executed
                -   ⁘ object: Uses JSON mask to select parts of the json object
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ value (string): A conditional statement that determines whether or
                        not this script or command should be executed
                    -   ◆ mask (string): JSON mask to select parts of the json object
                -   ⁘ object: Uses JSON mask to select parts of the json object
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ template (string): Resolve the handlebars template as a atring.
                        <https://handlebarsjs.com/guide/>
                -   ⁘ object: Prompt that takes user input and returns a string
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ message (string): A short message that will display in the prompt
                -   ⁘ object: Prompt that returns true or false
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ message (string): A short message that will display in the prompt
                -   ⁘ object: Prompt that takes user input, hides it from the terminal, and
                    returns a string
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ message (string): A short message that will display in the prompt
                -   ⁘ object: Prompt that allows the user to select from a list of options
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ message (string): A short message that will display in the prompt
                    -   ◆ select (string): A conditional statement that determines whether or
                        not this script or command should be executed
                -   ⁘ object: Prompt that allows the user to choose an option
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ message (string): A short message that will display in the prompt
                    -   ◆ choices (array): \_
                -   ⁘ object: Step where data is appended to a file
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ value (string): A conditional statement that determines whether or
                        not this script or command should be executed
                    -   ◆ filename (string): The name of the file to which data will be
                        appended
                -   ⁘ object: Step where data is written to a file
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ value (string): A conditional statement that determines whether or
                        not this script or command should be executed
                    -   ◆ filename (string): The name of the file to which data will be written
                -   ⁘ object: Configuration for the batch shell script
                    -   ◆ name (string): A short name that could be used a key or variable
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ a (string): \_
                    -   ◆ onFailure (array): List of flags to describe the default behavior in
                        case of failure
                    -   ◆ onSuccess (array): List of flags to describe the default behavior in
                        case of success
                    -   ◆ if (string): A conditional statement that determines whether or not
                        this script or command should be executed
                    -   ◆ stdin (string): A conditional statement that determines whether or
                        not this script or command should be executed
                    -   ◆ run (string): A line of shell script
                    -   ◆ multiline (boolean): Should the run command spread on multiple lines
        -   ◇ after (object): A batch of shell commands to run
            -   ◆ name (string): Name of the step with either: unknown: Describe any
                unknown or uncertain aspects of the process (should not pick this)
                main: Describe the main step of the process before: Describe a step
                that need to be taken before the process begins after: Describe a step
                that need to be taken after the process is completed
            -   ◆ if (string): A conditional statement that determines whether or not
                this script or command should be executed
            -   ◆ each (array): An array of values to be iterated over, with each
                iteration executing the script or command with the current value as an
                input
                -   ○ name (string): The name of the variable to be used as an input to the
                    script or command during each iteration
                -   ○ values (string): The variable to the array of values to be iterated
                    over
            -   ◆ commands (array): A list of batch shell scripts to run
                -   ⁘ object: Get a property using a dot prop path
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ value (string): A conditional statement that determines whether or
                        not this script or command should be executed
                -   ⁘ object: Process on a list of strings
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ value (string): A conditional statement that determines whether or
                        not this script or command should be executed
                    -   ◆ onSuccess (string): Options for the transforming the resulting array
                        of string with either: sort: Sorts the array of strings in ascending
                        order. unique: Removes any duplicate strings from the array. filled:
                        Removes any empty or undefined elements from the array. reverse:
                        Reverses the order of the elements in the array.
                    -   ◆ filters (array): A list of filters on strings
                        -   ○ if (string): A conditional statement that determines whether or not
                            the string should be kept with either: starts-with: Match items that
                            start with a specific value ends-with: Match items that end with a
                            specific value contains: Match items that contain a specific value
                            equals: Match items that are equal to a specific value not starts-with:
                            Match items that do not start with a specific value not ends-with:
                            Match items that do not end with a specific value not contains: Match
                            items that do not contain a specific value not equals: Match items that
                            are not equal to a specific value
                        -   ○ anyOf (array): A list of references to match against
                -   ⁘ object: Concatenate several arrays together
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ values (array): \_
                -   ⁘ object: Split a string into multiple strings
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ separator (string): A separator to split the string
                    -   ◆ value (string): A conditional statement that determines whether or
                        not this script or command should be executed
                -   ⁘ object: Split a string into multiple lines
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ value (string): A conditional statement that determines whether or
                        not this script or command should be executed
                -   ⁘ object: Return true if at least one of values is truthy
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ values (array): \_
                -   ⁘ object: Return true if at least one of values is falsy
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ values (array): \_
                -   ⁘ object: Return true if all the values are truthy
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ values (array): \_
                -   ⁘ object: Return true if all the values are falsy
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ values (array): \_
                -   ⁘ object: Return the opposite boolean value
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ value (string): A conditional statement that determines whether or
                        not this script or command should be executed
                -   ⁘ object: Generate a range of numbers
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ start (integer): The number to start the range with
                    -   ◆ end (integer): The number at the end of the range
                    -   ◆ step (integer): A step to increment the range, usually 1
                -   ⁘ object: Invert keys and values into a new object
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ value (string): A conditional statement that determines whether or
                        not this script or command should be executed
                -   ⁘ object: Uses JSON mask to select parts of the json object
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ value (string): A conditional statement that determines whether or
                        not this script or command should be executed
                    -   ◆ mask (string): JSON mask to select parts of the json object
                -   ⁘ object: Uses JSON mask to select parts of the json object
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ template (string): Resolve the handlebars template as a atring.
                        <https://handlebarsjs.com/guide/>
                -   ⁘ object: Prompt that takes user input and returns a string
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ message (string): A short message that will display in the prompt
                -   ⁘ object: Prompt that returns true or false
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ message (string): A short message that will display in the prompt
                -   ⁘ object: Prompt that takes user input, hides it from the terminal, and
                    returns a string
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ message (string): A short message that will display in the prompt
                -   ⁘ object: Prompt that allows the user to select from a list of options
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ message (string): A short message that will display in the prompt
                    -   ◆ select (string): A conditional statement that determines whether or
                        not this script or command should be executed
                -   ⁘ object: Prompt that allows the user to choose an option
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ message (string): A short message that will display in the prompt
                    -   ◆ choices (array): \_
                -   ⁘ object: Step where data is appended to a file
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ value (string): A conditional statement that determines whether or
                        not this script or command should be executed
                    -   ◆ filename (string): The name of the file to which data will be
                        appended
                -   ⁘ object: Step where data is written to a file
                    -   ◆ a (string): \_
                    -   ◆ name (string): A short name that could be used a key or variable for
                        the step
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ value (string): A conditional statement that determines whether or
                        not this script or command should be executed
                    -   ◆ filename (string): The name of the file to which data will be written
                -   ⁘ object: Configuration for the batch shell script
                    -   ◆ name (string): A short name that could be used a key or variable
                    -   ◆ title (string): A brief and descriptive title for this workflow
                    -   ◆ description (string): A detailed explanation of the purpose and
                        function of this workflow
                    -   ◆ motivation (string): The reason why this task is necessary within the
                        context of the workflow
                    -   ◆ links (array): A list of relevant resources and references related to
                        this task
                        -   ○ title (string): A brief and descriptive title for this workflow
                        -   ○ url (string): A https link to a webpage
                    -   ◆ a (string): \_
                    -   ◆ onFailure (array): List of flags to describe the default behavior in
                        case of failure
                    -   ◆ onSuccess (array): List of flags to describe the default behavior in
                        case of success
                    -   ◆ if (string): A conditional statement that determines whether or not
                        this script or command should be executed
                    -   ◆ stdin (string): A conditional statement that determines whether or
                        not this script or command should be executed
                    -   ◆ run (string): A line of shell script
                    -   ◆ multiline (boolean): Should the run command spread on multiple lines
