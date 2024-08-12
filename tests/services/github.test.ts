import 'dotenv/config';
import { describe, expect, it } from "vitest";
import { fetchCommits, fetchRepositoryDetails } from "../../src/core/services/github";

const owner = "chromium";
const repoName = "chromium";

describe("Query Github", () => {


    it("fetch repo data", async () => {
        const res = await fetchRepositoryDetails(owner, repoName);
        expect(res).toBeDefined();
        expect(res.name).toBe("chromium");
        expect(res.owner.login).toBe("chromium");
        expect(res.html_url).toBe("https://github.com/chromium/chromium");
        expect(res.description).toBeDefined();
        expect(typeof res.forks_count).toBe("number");
        expect(typeof res.stargazers_count).toBe("number");
        expect(typeof res.open_issues_count).toBe("number");
        expect(typeof res.watchers_count).toBe("number");
        expect(res.created_at).toBeDefined();
        expect(res.updated_at).toBeDefined();
    });

    it("fetch commit data", async () => {

        const { commits } = await fetchCommits(owner, repoName, {
            sinceDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        });

        expect(commits).toBeDefined();
        expect(Array.isArray(commits)).toBe(true);
        expect(commits.length).toBeGreaterThan(0);

        const firstCommit = commits[0];
        expect(firstCommit).toHaveProperty('sha');
        // expect(firstCommit).toHaveProperty('commit');
        expect(firstCommit).toHaveProperty('message');
        expect(firstCommit).toHaveProperty('author');
        expect(firstCommit).toHaveProperty('date');
        expect(firstCommit).toHaveProperty('url');

        expect(typeof firstCommit.sha).toBe('string');
        expect(typeof firstCommit.message).toBe('string');
        expect(typeof firstCommit.author).toBe('string');
        expect(firstCommit.url).toMatch(/^https:\/\/github\.com\//);
    });

});