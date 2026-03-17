/* eslint-disable no-console */
/**
 * Terminates the application process immediately with an error state.
 * * This utility prints a formatted error message to `stderr`, followed by
 * an optional list of bulleted details, then exits the process with code 1.
 *
 * @param message - A high-level description of the error.
 * @param details - An optional array of strings providing extra context or steps to fix the error.
 * * @returns This function never returns as it terminates the Node.js process.
 * * @example
 * if (!process.env.DATABASE_URL) {
 * fatal("Database connection failed", ["Check if .env file exists", "Verify DB credentials"]);
 * }
 */
export default function fatal(message: string, details?: string[]): never {
    console.error(`\n❌ ${message} ❌\n`);

    if (details?.length) {
        for (const line of details) {
            console.error(`  • ${line}`);
        }
    }
    console.error('');
    process.exit(1);
}
