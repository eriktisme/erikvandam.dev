import { Config } from 'jest'

const config: Config = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  clearMocks: true,
  resetMocks: true,
  coverageDirectory: 'coverage',
  roots: ['<rootDir>'],
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
  },
  testMatch: ['**/*.test.ts'],
}

export default config
