import 'dotenv/config';
import { and, eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { authorCommitCounts, db, NewCommit } from "../../src/core/database/schema";
import { clearAllCommits, getAllCommitsInRepo, getAuthorsByCommitCount, updateCommitCounts, updateCommitsInRepo } from "../../src/core/services/commit";
import { fetchCommits } from '../../src/core/services/github';
import { getRepository } from "../../src/core/services/repository";

const owner = "chromium";
const repoName = "chromium";

describe("Commit Service", () => {
    const testRepoFullName = `${owner}/${repoName}`;
    let newCommits: NewCommit[] = []
    beforeAll(async () => {
        // Ensure the repository exists in the database
        await getRepository(owner, repoName);
        newCommits = (await fetchCommits(owner, repoName, {
            sinceDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        })).commits;
        await updateCommitsInRepo(newCommits);
    });


    afterAll(async () => {
        // Clear test data after each test
        await getRepository(owner, repoName);
        newCommits = (await fetchCommits(owner, repoName, {
            sinceDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        })).commits;
        await updateCommitsInRepo(newCommits);
    });

    it("should fetch and update commits in repo", async () => {
        const limit = 100
        const { commits: fetchedCommits } = await getAllCommitsInRepo(testRepoFullName, 1, limit);
        if (newCommits.length > limit) {
            expect(fetchedCommits.length).toBe(limit);
        } else {
            expect(fetchedCommits.length).toBe(limit);
        }
    });

    it("should get authors by commit count", async () => {
        const { authors } = await getAuthorsByCommitCount(testRepoFullName);
        expect(authors).toBeDefined();
        expect(authors.length).toBeGreaterThan(0);
        expect(authors[0]).toHaveProperty('author');
        expect(authors[0]).toHaveProperty('commitCount');
        expect(authors[0].commitCount).toBeGreaterThan(0);
    });

    it("should update author commit counts", async () => {
        const authorCommits = new Map([
            ['Author1', 5],
            ['Author2', 3],
        ]);
        await updateCommitCounts(testRepoFullName, authorCommits);

        const result = await db.select().from(authorCommitCounts).where(eq(authorCommitCounts.repository_full_name, testRepoFullName));
        // Delete Author1 and Author2 after this
        await db.delete(authorCommitCounts).where(and(eq(authorCommitCounts.repository_full_name, testRepoFullName), eq(authorCommitCounts.author, 'Author1'))).execute();
        await db.delete(authorCommitCounts).where(and(eq(authorCommitCounts.repository_full_name, testRepoFullName), eq(authorCommitCounts.author, 'Author2'))).execute();
        expect(result.length).toBe(2);
        expect(result.find(r => r.author === 'Author1')?.commit_count).toBe(5);
        expect(result.find(r => r.author === 'Author2')?.commit_count).toBe(3);

    });

    it("should clear all commits", async () => {
        await clearAllCommits(testRepoFullName);
        const { commits: fetchedCommits } = await getAllCommitsInRepo(testRepoFullName);
        expect(fetchedCommits.length).toBe(0);
    });
});

