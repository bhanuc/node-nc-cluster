var assert = require("assert"),
    cluster = require('./../index.js'),
    assert = require('assert');

describe('nc-cluster', function () {
  it('should implement init', function () {
    assert.equal(typeof cluster.init, 'function');
  });
  it('should implement resize', function () {
    assert.equal(typeof cluster.concurrency, 'function');
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

  describe('functionality', function () {
    before(function (done) {
      //console.log('initializing...');
      this.timeout(12000);
      cluster.concurrency({
        min: 4,
        max: 4
      });
      //console.log(require('util').inspect(cluster._config));
      cluster.init({
        exec: __dirname + "/worker.js"
        //silent: true
      });
      
      function check() {
        var size = cluster.size();
        //console.log('Object.keys(require("cluster").workers).length: ' + Object.keys(require('cluster').workers).length);
        //console.log('size: ' + size);
        if (size === 4 && Object.keys(require('cluster').workers).length === size) {
          done();
        } else {
          setTimeout(check, 100);
        }
      }
      check();
    });
    after(function (done) {
      //console.log('shutting down (by force)...');
      this.timeout(12000);
      cluster.quit({
        force: true
      });
      function check() {
        var size = cluster.size();
        //console.log('shutdown, Object.keys(require("cluster").workers).length: ' + Object.keys(require('cluster').workers).length);
        //console.log('shutdown, size: ' + size);
        if (size === 0 && Object.keys(require('cluster').workers).length === size) {
          done();
        } else {
          setTimeout(check, 100);
        }
      }
      check();
    });
    it('#size()', function () {
      assert.equal(cluster.size(), 4);
    });
    it('#restart', function (done) {
      //console.log('restart');
      this.timeout(50000);
      var startTime = new Date().getTime();

      cluster.restart();
      function check() {
        var workers = cluster.workers(),
            restartCount = 0,
            uptime = (new Date().getTime()) - startTime;
        
        workers.forEach(function (worker) {
          if (worker.uptime() < uptime) {
            ++restartCount;
          }
        });
        //console.log('restartCount: ' + restartCount);
        if (restartCount === 4) {
          done();
        } else {
          setTimeout(check, 100);
        }
      }
      check();
    });
  });
});

