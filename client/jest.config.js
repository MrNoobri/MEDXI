export default {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/ui/shared/__tests__/setup.js"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  transform: {
    "^.+\\.(js|jsx)$": ["babel-jest", { presets: ["@babel/preset-react"] }],
  },
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
  collectCoverageFrom: [
    "src/ui/**/*.{js,jsx}",
    "!src/ui/**/__tests__/**",
    "!src/ui/**/index.js",
  ],
};
