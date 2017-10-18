const { prompt } = require('promptly');

module.exports = (() => {
  const promisifiedPrompt = (message, options) => {
    return new Promise((resolve, reject) => {
      prompt(message, options, (error, value) => {
        return error
          ? reject(error)
          : resolve(value);
      });
    });
  };

  const yesNoPrompt = (message, callback) => {
    const options = {
      default: 'n',
      validator: choice => choice === 'y'
    };
    prompt(`${message} (y/n)`, options, (error, value) => {
      if (error) {
        throw error;
      }

      callback(value);
    });
  };

  return {
    yesNoPrompt,
    promisifiedPrompt
  };
})();
