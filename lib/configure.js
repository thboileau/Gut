const _ = require('lodash');
const {
  statSync, writeFileSync
} = require('fs');
const { dirname } = require('path');

const {
  print, execute
} = require('./utils/execution');
const { promisifiedPrompt } = require('./utils/prompt');
const { GLOBAL_OPTIONS_FILE_PATH } = require('./utils');

module.exports = (() => {
  const saveConfigurationOnDisk = (gutOptions) => {
    writeFileSync(GLOBAL_OPTIONS_FILE_PATH, `${JSON.stringify(gutOptions, null, 2)}\n`, 'utf8');
    print('Your configuration is saved. You can change it anytime by running \'gut configure\'.\n'.green);
  };

  const promptForgePath = (gutOptions) => {
    const promptOptions = {
      validator: dirPath => {
        try {
          statSync(dirPath);
          return dirPath;
        } catch (error) {
          throw Error(`No directory found at ${dirPath}`.red);
        }
      }
    };

    return promisifiedPrompt('Type your git repositories folder', promptOptions)
      .then(forgePath => {
        _.set(gutOptions, 'repositoriesPath', forgePath);
        return gutOptions;
      });
  };

  const promptGithubUsername = (gutOptions) => {
    return promisifiedPrompt('Type your GitHub account username', {})
      .then(githubUsername => {
        _.set(gutOptions, 'accounts.github', githubUsername);
        return gutOptions;
      });
  };

  const writeConfiguration = () => {
    execute(`mkdir -p ${dirname(GLOBAL_OPTIONS_FILE_PATH)}`);

    const gutOptions = {
      preferredGitServer: 'github'
    };

    return promptGithubUsername(gutOptions)
      .then(gutOptionsWithGithubUsername => promptForgePath(gutOptionsWithGithubUsername))
      .then(saveConfigurationOnDisk);
  };

  return {
    initializeConfiguration: () => {
      print('Looks like it\'s the first time you use Gut. Let\'s configure it first!');
      return writeConfiguration();
    },
    changeConfiguration: () => {
      print('Let\'s change your Gut configuration!');
      writeConfiguration();
    }
  };
})();
