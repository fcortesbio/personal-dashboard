/**
 * Fetch user's repositories from GitHub API
 * Returns: repo name, description, URL, last updated, and profile link
 */

const GITHUB_API_BASE = "https://api.github.com";

/**
 * Get repositories for a GitHub user
 * @param {string} username - GitHub username
 * @param {number} limit - Number of repos to fetch (default 5)
 * @param {string} [token] - Optional GitHub access token for private repos and higher rate limit
 * @returns {Promise<Object>} - Object with repos array and profile URL
 * @throws {Error} - If API request fails
 */
export async function getRepositories(username, limit = 5, token = null) {
  if (!username) {
    throw new Error("GitHub username is required");
  }

  if (limit < 1 || limit > 100) {
    throw new Error("Limit must be between 1 and 100");
  }

  try {
    const url = `${GITHUB_API_BASE}/users/${username}/repos?sort=updated&per_page=${limit}&type=owner`;
    const headers = {
      "Accept": "application/vnd.github.v3+json",
    };

    // Add authorization header if token provided
    if (token) {
      headers["Authorization"] = `token ${token}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`GitHub user "${username}" not found`);
      }
      if (response.status === 403) {
        throw new Error("GitHub API rate limit exceeded");
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const repos = await response.json();

    // Transform API response to dashboard format
    const transformedRepos = repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description || "No description",
      url: repo.html_url,
      updated_at: repo.updated_at,
      language: repo.language,
      stars: repo.stargazers_count,
    }));

    return {
      username,
      profile_url: `https://github.com/${username}`,
      repositories: transformedRepos,
      fetched_at: new Date().toISOString(),
    };
  } catch (err) {
    throw new Error(`Failed to fetch GitHub repositories: ${err.message}`);
  }
}
