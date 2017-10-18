const _ = require('lodash');
const { homedir } = require('os');
const {
  statSync, readFileSync
} = require('fs');
const resolvePath = require('path').resolve;

const { execute } = require('./utils/execution');
const { initializeConfiguration } = require('./configure');

module.exports = (() => {
  const GIT_SERVERS_PRESET = {
    github: {
      getRepositoryUrl: (owner, repository) => {
        return `git@github.com:${owner}/${repository}.git`;
      }
    }
  };

  const REPOSITORY_OPTION_DEFAULTS = {
    commitMessageSuffixTemplate: ''
  };

  const GLOBAL_OPTIONS_FILE_PATH = resolvePath(homedir(), '.config', 'gut', 'gut-config.json');

  const SCRIPTS_PATH = resolvePath(homedir(), '.config', 'gut');

  const REPOSITORY_OPTIONS_FILE_NAME = '.gut-config.json';

  const configureGutIfNeeded = () => {
    const gutOptionsPath = GLOBAL_OPTIONS_FILE_PATH;
    try {
      statSync(gutOptionsPath);
      return new Promise((resolve) => resolve(JSON.parse(readFileSync(gutOptionsPath, 'utf8'))));
    } catch (err) {
      return initializeConfiguration();
    }
  };

  const getTopLevel = () => {
    const unsanitizedTopLevel = execute('git rev-parse --show-toplevel');
    return _.replace(unsanitizedTopLevel, /\n/, '');
  };

  const moveUpTop = () => {
    process.chdir(getTopLevel());
  };

  const isDirty = () => {
    try {
      execute('git diff --no-ext-diff --quiet --exit-code');
      return false;
    } catch (error) {
      return true;
    }
  };

  const hasStagedChanges = () => {
    try {
      execute('git diff-index --cached --quiet HEAD --');
      return false;
    } catch (error) {
      return true;
    }
  };

  const hasUnstagedChanges = () => {
    try {
      execute('[ -n "$(git ls-files --others --exclude-standard)" ]');
      return true;
    } catch (error) {
      return false;
    }
  };

  const getRepositoryOption = optionName => {
    const topLevelDirectory = getTopLevel();

    let result;
    try {
      const repositoryFileName = resolvePath(topLevelDirectory, REPOSITORY_OPTIONS_FILE_NAME);
      statSync(repositoryFileName);
      const repositoryOptions = JSON.parse(readFileSync(repositoryFileName, 'utf8'));
      result = repositoryOptions[ optionName ];
    } catch (err) {
      result = REPOSITORY_OPTION_DEFAULTS[ optionName ];
    }

    if (!result) {
      throw Error(`Option ${optionName} is not specified in the repository's options.`.red);
    }

    return result;
  };

  const getRemotes = () => {
    const remotesAsString = execute('git remote show');
    return _(remotesAsString.split('\n'))
      .reject(remote => _.isEmpty(remote))
      .value();
  };

  const getGitServer = (serverName) => {
    if (!_.has(GIT_SERVERS_PRESET, serverName)) {
      throw Error(`Server ${serverName} not configured. Please make sure it is not being implemented and create an issue.`);
    }

    return GIT_SERVERS_PRESET[ serverName ];
  };

  return {
    GIT_SERVERS_PRESET,
    GLOBAL_OPTIONS_FILE_PATH,
    SCRIPTS_PATH,
    REPOSITORY_OPTIONS_FILE_NAME,

    configureGutIfNeeded,
    getRepositoryOption,

    moveUpTop,

    isDirty,
    hasStagedChanges,
    hasUnstagedChanges,

    getRemotes,

    getGitServer
  };
})();
