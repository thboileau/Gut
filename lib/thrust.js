const _ = require('lodash');

const {
  getCurrentBranch, getBranchInfo
} = require('./utils/branches');
const { execute } = require('./utils/execution');
const { getRemotes } = require('./utils');

module.exports = (() => {
  const ARGUMENTS = {
    REMOTE: {
      name: 'remote',
      alias: 'r',
      describe: 'The remote to push to. Not needed if the branch was already pushed',
      type: 'string'
    }
  };

  return {
    thrust: yargs => {
      const remotes = getRemotes();
      const remotesAsString = `[ ${_.join(remotes, ', ')} ]`;
      const args = yargs
        .usage('usage: $0 thrust [options]')
        .option(ARGUMENTS.REMOTE.name, ARGUMENTS.REMOTE)
        .coerce(ARGUMENTS.REMOTE.name, argument => {
          if (!_.includes(remotes, argument)) {
            throw Error(`The remote you specified is unknown. You can add remotes with 'git remote add'.\nCurrent remotes: ${remotesAsString}`.red);
          }

          return argument;
        })
        .help()
        .argv;

      const currentBranch = getCurrentBranch();
      const targetRemote = args[ ARGUMENTS.REMOTE.name ];

      if (targetRemote) {
        execute(`git push --set-upstream '${targetRemote}' '${currentBranch}'`);
        return;
      }

      const currentBranchRemote = getBranchInfo(getCurrentBranch(), 'remote'); // TODO: argument remote should be variabelized
      if (currentBranchRemote) {
        execute('git push');
      } else if (_.size(remotes) === 1) {
        execute(`git push --set-upstream '${remotes[ 0 ]}' '${currentBranch}'`);
      } else {
        throw Error(`Too many remotes available, can't push if the target remote is not specified.\nCurrent remotes: ${remotesAsString}`);
      }
    }
  };
})();
