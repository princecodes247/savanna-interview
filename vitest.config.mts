import { defineConfig } from "vitest/config"
export default defineConfig({
    test: {
        testTimeout: 10000, // Extend test timeout to 10 seconds
        hookTimeout: 10000
    }
})