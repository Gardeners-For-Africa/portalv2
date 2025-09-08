# Testing Guide

This directory contains all tests for the web application using Vitest and React Testing Library.

## Setup

The testing setup includes:
- **Vitest**: Fast unit test runner
- **React Testing Library**: Testing utilities for React components
- **jsdom**: DOM environment for testing
- **@testing-library/jest-dom**: Custom matchers for DOM testing

## Running Tests

```bash
# Run all tests once
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with UI
yarn test:ui

# Run tests with coverage
yarn test:coverage
```

## Test Structure

```
src/test/
├── components/          # Component tests
├── utils/              # Test utilities and helpers
├── setup.ts           # Global test setup
└── README.md          # This file
```

## Writing Tests

### Basic Component Test

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from '../../components/ui/button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })
})
```

### Test with Providers

For components that need React Router or React Query:

```tsx
import { render, screen } from '../utils/test-utils'
import { describe, it, expect } from 'vitest'
import MyComponent from '../../components/MyComponent'

describe('MyComponent', () => {
  it('renders with providers', () => {
    render(<MyComponent />)
    // Your test assertions here
  })
})
```

## Test Utilities

### Custom Render Function

Use `render` from `../utils/test-utils` for components that need:
- React Router (BrowserRouter)
- React Query (QueryClient)
- Other global providers

### Mocking

```tsx
import { vi } from 'vitest'

// Mock a function
const mockFn = vi.fn()

// Mock a module
vi.mock('../../lib/api', () => ({
  fetchData: vi.fn(() => Promise.resolve({ data: 'test' }))
}))
```

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the user sees and does
2. **Use Semantic Queries**: Prefer `getByRole`, `getByLabelText`, etc.
3. **Keep Tests Simple**: One test should verify one behavior
4. **Use Descriptive Names**: Test names should explain what's being tested
5. **Mock External Dependencies**: Don't make real API calls in tests

## Coverage

The test coverage is configured to exclude:
- `node_modules/`
- `src/test/`
- `**/*.d.ts`
- `**/*.config.*`
- `dist/` and `build/`

## Common Patterns

### Testing Form Interactions

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

it('handles form submission', async () => {
  const user = userEvent.setup()
  render(<MyForm />)
  
  await user.type(screen.getByLabelText('Email'), 'test@example.com')
  await user.click(screen.getByRole('button', { name: 'Submit' }))
  
  expect(screen.getByText('Success!')).toBeInTheDocument()
})
```

### Testing Async Operations

```tsx
it('loads data on mount', async () => {
  render(<DataComponent />)
  
  expect(screen.getByText('Loading...')).toBeInTheDocument()
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument()
  })
})
```

### Testing Error States

```tsx
it('displays error message on failure', async () => {
  vi.spyOn(api, 'fetchData').mockRejectedValueOnce(new Error('API Error'))
  
  render(<DataComponent />)
  
  await waitFor(() => {
    expect(screen.getByText('Error: API Error')).toBeInTheDocument()
  })
})
```
