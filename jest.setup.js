import '@testing-library/jest-dom'

// Mock CSS variables for testing
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: (prop) => {
      if (prop === '--positive-green') return '#198754'
      if (prop === '--negative-red') return '#dc3545'
      return ''
    },
  }),
})