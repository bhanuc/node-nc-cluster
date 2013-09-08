var assert = require("assert"),
    cluster = require('./index.js'),
    assert = require('assert');

describe('nc-cluster', function () {
  it('should implement init', function () {
    assert.equal(typeof cluster.init, 'function');
  });
  it('should implement resize', function () {
    assert.equal(typeof cluster.resize, 'function');
  });
  it('should implement restart', function () {
    assert.equal(typeof cluster.restart, 'function');
  });
  it('should implement quit', function () {
    assert.equal(typeof cluster.quit, 'function');
  });
  it('should implement size', function () {
    assert.equal(typeof cluster.size, 'function');
  });
  it('should implement size', function () {
    assert.equal(typeof cluster.size, 'function');
  });


  describe('functionality', function () {
    before(function (done) {
      cluster.init({
        exec: "worker.js",
        silent: true
      }, done);
    });
    after(function (done) {
      cluster.quit({
        force: true
      }, done);
    });
    it('test', function () {

    });
  });
});

