const path = require('path');

const { execute } = require('./utils/execution');
const { SCRIPTS_PATH } = require('./utils');

module.exports = (() => {
  return {
    install: () => {
      const scriptsPath = SCRIPTS_PATH;
      const pushbPopbScriptPath = path.resolve(__dirname, '../shell/pushbPopb.sh');

      execute(`mkdir -p ${scriptsPath}`);
      execute(`cp ${pushbPopbScriptPath} ${scriptsPath}`);
    }
  };
})();
