/* The one place to set where the project lives: the GitHub user or organisation that publishes the repository and
   the container image; every page and link follows. */
const owner = 'croustycrabe';
const repo = 'croustypatch';

export const site = {
  owner,
  repo,
  repoUrl: `https://github.com/${owner}/${repo}`,
  releasesUrl: `https://github.com/${owner}/${repo}/releases`,
  issuesUrl: `https://github.com/${owner}/${repo}/issues`,
  image: `ghcr.io/${owner}/croustypatch-server`,
};
