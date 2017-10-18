const { execute } = require('./utils/execution');
const { moveUpTop } = require('./utils');

module.exports = (() => {
  return {
    pile: () => {
      moveUpTop();
      execute('git add . -A');
    }
  };
})();
