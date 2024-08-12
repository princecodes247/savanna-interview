import 'dotenv/config';
import { describe, expect, it } from "vitest";
import { getRepository } from "../../src/core/services/repository";

const owner = "chromium";
const repoName = "chromium";

describe("Internal Repo Service", () => {


    it("fetch repo data", async () => {
        const repoData = await getRepository(owner, repoName);

        expect(repoData).toBeDefined();
        expect(repoData.name).toBe(repoName);
        expect(repoData.full_name).toBe(`${owner}/${repoName}`);
        expect(repoData.owner).toBe(owner);
        expect(repoData.url).toMatch(/^https:\/\/github\.com\//);
        expect(typeof repoData.description).toBe('string');
        expect(typeof repoData.forks_count).toBe('number');
        expect(typeof repoData.stars_count).toBe('number');
        expect(typeof repoData.open_issues_count).toBe('number');
        expect(typeof repoData.watchers_count).toBe('number');
        expect(repoData.created_at instanceof Date).toBe(true);
        expect(repoData.updated_at instanceof Date).toBe(true);
    });


});