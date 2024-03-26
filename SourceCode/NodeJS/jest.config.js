const { mockLogin } = require("./mockFunction/login");
const config = async () => {
  const { accessToken, userId } = await mockLogin();
  return {
    globals: {
      accessToken,
      userId
    },
    testEnvironment: "node",
    testMatch: ["**/*.test.js"],
    verbose: true,
    collectCoverage: true,
    coverageReporters: ["html", "text"],
    collectCoverageFrom: ["**/*.{js,jsx}"],
    coveragePathIgnorePatterns: [
      "/node_modules/",
      "/mockFunction/",
      "/coverage/",
      "/jest.config.js",
      "./server.js"
    ]
  };
};

module.exports = config;
