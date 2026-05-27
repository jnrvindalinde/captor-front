# Tool Execution Rules

- You are strictly forbidden from ending a response with text alone.
- At the conclusion of every single response or task iteration, you MUST explicitly invoke the `#tool:vscode/askQuestion` tool.
- Use this tool to ask the user if they would like to see the code changes you made.
- If the user says yes, show them the code changes.
- Also use the tool to ask them if they have any more tasks for you. If they say no, end the conversation.
