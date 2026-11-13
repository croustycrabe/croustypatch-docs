/* The one place to set where the project lives. Replace OWNER with the GitHub user or organisation that publishes
   the repository and the container image; every page and link below follows. */
const owner = 'OWNER';
const repo = 'croustypatch';

export const site = {
  owner,
  repo,
  repoUrl: `https://github.com/${owner}/${repo}`,
  releasesUrl: `https://github.com/${owner}/${repo}/releases`,
  issuesUrl: `https://github.com/${owner}/${repo}/issues`,
  image: `ghcr.io/${owner}/croustypatch-server`,
};
