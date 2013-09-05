module.exports = (function () {

  function init(options) {
    //options.force to force a fast restart
  }
  function resize(size, options, cb) {
    //options.force to force a fast resize
  }
  function restart(size, options, cb) {
    //options.force to force a fast restart
  }
  function quit(size, options, cb) {
    //options.force to force a fast quit
  }

  return {
    init: init,
    resize: resize,
    restart: restart,
    quit: quit
  };

})();