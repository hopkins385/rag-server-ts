# Contributing to RAG Server TypeScript

Thank you for your interest in contributing to the RAG Server TypeScript project! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

Before creating an issue, please:

1. **Search existing issues** to avoid duplicates
2. **Use a clear and descriptive title**
3. **Provide detailed information** including:
    - Steps to reproduce the issue
    - Expected vs actual behavior
    - Environment details (Node.js version, OS, etc.)
    - Relevant logs or error messages

### Suggesting Features

We welcome feature suggestions! Please:

1. **Check existing feature requests** first
2. **Describe the problem** your feature would solve
3. **Explain your proposed solution** in detail
4. **Consider alternative solutions** and their trade-offs

### Pull Requests

1. **Fork the repository** and create a new branch
2. **Follow the development setup** instructions in the README
3. **Make your changes** with clear, focused commits
4. **Add tests** for new functionality
5. **Update documentation** as needed
6. **Run the test suite** to ensure nothing is broken
7. **Submit a pull request** with a clear description

## 🛠️ Development Setup

### Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose
- Git

### Local Development

1. Fork and clone the repository:

    ```bash
    git clone https://github.com/your-username/rag-server-ts.git
    cd rag-server-ts
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up environment variables:

    ```bash
    cp .env.example .env
    # Edit .env with your configuration
    ```

4. Start the development environment:

    ```bash
    # Start supporting services
    docker-compose up -d qdrant tika

    # Start the development server
    npm run dev
    ```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Quality

Before submitting a pull request, please ensure:

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Fix auto-fixable lint issues
npm run lint:fix

# Format code
npm run format
```

## 📝 Coding Standards

### TypeScript Guidelines

- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Avoid `any` type - use proper typing

### Code Style

- Use Prettier for code formatting
- Follow ESLint rules
- Use async/await over Promises
- Prefer functional programming patterns
- Keep functions small and focused

### Git Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:

```
feat(api): add document embedding endpoint
fix(search): resolve similarity threshold bug
docs(readme): update installation instructions
```

## 🏗️ Project Structure

```
src/
├── app.ts                 # Express application setup
├── index.ts              # Application entry point
├── config.ts             # Configuration management
├── connectors/           # External service integrations
├── controllers/          # HTTP request handlers
├── interfaces/           # TypeScript type definitions
├── middlewares/          # Express middleware functions
├── routes/              # API route definitions
├── schemas/             # Input validation schemas
├── services/            # Business logic
└── utils/               # Utility functions and helpers
```

### Adding New Features

When adding new features:

1. **Create appropriate tests** in the `__tests__` directory
2. **Add input validation** using Zod schemas
3. **Update API documentation** in the README
4. **Follow existing patterns** for consistency
5. **Consider error handling** and edge cases

### Database Migrations

When making database schema changes:

1. Create migration scripts if needed
2. Update relevant interfaces and types
3. Test with both empty and populated databases
4. Document any breaking changes

## 🧪 Testing Guidelines

### Test Structure

- **Unit tests**: Test individual functions and classes
- **Integration tests**: Test API endpoints and service interactions
- **E2E tests**: Test complete user workflows

### Test Files

- Place tests in `__tests__` directories alongside source files
- Use descriptive test names that explain the scenario
- Group related tests using `describe` blocks
- Use `beforeEach`/`afterEach` for test setup/cleanup

### Mock Guidelines

- Mock external dependencies (APIs, databases)
- Use Jest mocks for consistent behavior
- Avoid mocking the code under test
- Keep mocks simple and focused

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for public APIs
- Include parameter and return type documentation
- Provide usage examples for complex functions
- Document any side effects or assumptions

### API Documentation

- Update README.md for new endpoints
- Include request/response examples
- Document error responses
- Explain authentication requirements

## 🔒 Security Considerations

- Never commit API keys or secrets
- Validate all user inputs
- Use environment variables for configuration
- Follow security best practices for Express.js
- Report security vulnerabilities privately

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

## ❓ Questions?

If you have questions about contributing:

1. Check existing documentation
2. Search closed issues and pull requests
3. Create a new issue with the "question" label
4. Join our community discussions

Thank you for contributing to the RAG Server TypeScript project! 🚀
