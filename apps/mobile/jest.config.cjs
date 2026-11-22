module.exports = {
  preset: 'jest-expo',
  resolver: require.resolve('react-native-reanimated/jest/resolver'),
  testMatch: ['<rootDir>/tests/components/**/*.test.tsx', '<rootDir>/tests/navigation/**/*.test.tsx'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
};
