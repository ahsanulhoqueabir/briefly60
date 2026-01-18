# Project Instructions for GitHub Copilot

- Design should be mobile first and responsive, ensuring usability across various device sizes.
- Follow consistent coding styles and conventions throughout the project to maintain code quality.
- Favor clear and descriptive variable and function names to enhance code readability. maintain datbase variable naming conventions consistently throughout the project.
- Maintain modularity by breaking down complex functions into smaller, reusable components.
- Ensure proper error handling and validation for user inputs, especially in financial transactions.
- When dealing with financial data, prioritize security and data integrity. Implement necessary checks to prevent unauthorized access or data corruption.
- Use comments judiciously to explain complex logic, but avoid over-commenting obvious code.
- Ensure that the code is optimized for performance, particularly in areas involving data retrieval and manipulation.
- Use shadcn/ui for components and styling.
- Dont modify `global.css` directly. Instead extend it using shadcn/ui conventions.
- Dont use gradient classes directly. Instead use `bg-linear-to-r` etc. as per shadcn/ui conventions. and try to avoid gradients unless necessary.

## File-Specific Instructions

- All types should be in `types` folder. naming will be `auth.types.ts`, `profile.types.ts` etc.
- All hooks should be in `hooks` folder. naming will be `use-auth.ts`, `use-profile.ts` etc.
- All utility functions should be in `utils` folder.
- All components should be in `components` folder. Each component should have its own folder with the component file and its styles.
- State management logic should be in `context` folder using Zustand/Context API.

## Naming Conventions:

- file name -> kebab-case
- class name -> PascalCase
- function name -> camelCase
- constant name -> UPPER_SNAKE_CASE
- variable name -> underscore_case
- types and interfaces -> PascalCase
