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
  /*
  describe('#indexOf()', function () {
    before(function (done) {
      cluster.init();
    });
    it('should return -1 when the value is not present', function () {
      assert.equal(-1, [1, 2, 3].indexOf(5));
      assert.equal(-1, [1, 2, 3].indexOf(0));
    })
  })*/
})