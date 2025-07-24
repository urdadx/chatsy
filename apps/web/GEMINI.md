# Gemini Agent Instructions

- Do not run the `npm run build` command unless explicitly asked to.
- This project uses tanstack start, so make sure every code you write conforms to tanstack starts paradigm
- Always use tanstack query for handling API integrations with the UI components
- Stop asking to run the linter after finishing a task
- Always use pnpm to install packages, like so `pnpm install <package_name>` 
- Whenever you want to create an API endpoint, check text-source.ts file in the api directory for context on how to create it