﻿module.exports = (function () {
  var utility = require('utility-methods');

  function Worker() {
    //console.log('worker spawned');
    var worker = require('cluster').fork();

    worker.on('online', this._onlineEvent.bind(this));
    worker.on('listening', this._listeningEvent.bind(this));
    worker.on('disconnect', this._disconnectEvent.bind(this));
    worker.on('exit', this._exitEvent.bind(this));
    this._worker = worker;
    this._data = {
      created: new Date().getTime()
    };
  }

  Worker.prototype = {
    _onlineEvent: function () {
      //console.log('online event');
      this._data.online = true;
      var cb = this._data.onOnline;
      return (cb && cb());
    },
    _listeningEvent: function () {
      this._data.listening = true
      var cb = this._data.onListening;
      return (cb && cb());
    },
    _disconnectEvent: function () {
      this._data.disconnected = true;
      var cb = this._data.onDisconnected;
      return (cb && cb());
    },
    _exitEvent: function () {
      this._data.exit = true;
      this._data.online = false;
      this._data.disconnected = true;
      this._worker = null;
      var uptime = (new Date().getTime()) - this._data.created;
      this._data.created = uptime;
      var cb = this._data.onExit;
      return (cb && cb());
    },
    isAlive: function() {
      return !!this._worker; //process exists or will soon be, but may not has been online yet.
    },
    isOnline: function () {
      return !!this._data.online; // the worker is actually running
    },
    isListening: function () {
      return !!this._data.listening;
    },
    isDisconnected: function () {
      return !!this._data.disconnected;
    },
    kill: function(ms) {
      var worker = this._worker;
      if(ms === 0) { //hhihi
        //console.log('worker killed immediately.');
        worker.kill();

      } else {
        //console.log('worker gracefully killed.');
        var cb = utility.createTimedHandler(ms, function (err) {
          worker.kill();
        });
        worker.once('disconnect', cb);
        worker.disconnect();
      }
     this._worker = null;
    },
    uptime: function () {
      var uptime = this._data.created;
      if (this.isAlive()) {
        uptime = (new Date().getTime()) - this._data.created;
      }
      return uptime;
    },
    onOnline: function(cb) {
      this._data.onOnline = cb;
    },
    onListening: function(cb) {
      this._data._onListening = cb;
    },
    onDisconnected: function(cb) {
      this._data._onDisconnected = cb;
    },
    onExit: function (cb) {
      this._data._onExit = cb;
    },
    id: function () {
      if (this._worker) {
        return this._worker.id;
      }
      return null;
    }
  };

  function Cluster() {
    this._config = {
      concurrency: {
        min: 1, //Allways [min] workers online.
        max: Object.keys(require('os').cpus()).length, // Max numbers of workers online
      },
      worker: {
        //timeout: 1000, //if a worker takes more than [timeout] to response, will it automatically be killed.
        shutdownTime: 5000 // ms to the worker will be killed by force automatically.
      },
      gc: {
        speed: 1000 //delay between gc
      }
    };
    this._data = {};
    this._workers = [];
  }

  Cluster.prototype = {
    _gc: function () {
      //console.log('GC()');
      var workersAlive = [],
          config = this._config,
          restart = this._data.restart,
          killCount = 0;

      this._workers.forEach(function (worker) {
        if (!worker.isAlive()) {
          return;
        }
        if (!worker.isOnline() && config.worker.timeout < worker.uptime()) {
          // worker is not responding
          worker.kill(0);
          ++killCount;
          return;
        }
        if(restart) {
          var maxUptime = (new Date().getTime()) - restart.initialized;
          if (maxUptime <= worker.uptime()) {
            var ms = restart.force ? 0 : config.worker.shutdownTime;
            //console.log('ms: ' + ms);
            worker.kill(ms);
            ++killCount;
            restart = null; // gc() will be re-run automatically when worker dies to setup a new worker anyways.
            return;
          }
        }
        workersAlive.push(worker);
      });

      if (restart) {
        this._data.restart = null;
      }
      if (workersAlive.length < config.concurrency.min) {
        var worker = new Worker(),
            gc = this._gc.bind(this);
        worker.onExit(gc);
        worker.onOnline(gc);
        workersAlive.push(worker);
      }
      else if(killCount === 0 && config.concurrency.max < workersAlive.length) {
        var worker = workersAlive.shift();
        if (worker) {
          //console.log('concurrency.max < workersAlive.length, ms: ' + 0);
          worker.kill(config.worker.shutdownTime);
        }
      }
      // may add
      this._workers = workersAlive;
    },

    init: function (options) {
      //options.force to force a fast restart
      require('cluster').setupMaster(options);
      var self = this;
      
      function runGC() {
        self._gc();
        setTimeout(runGC, self._config.gc.speed);
      }
      runGC();
    },
    concurrency: function (options) {
      //options.force to force a fast resize
      // add a task queue to utility-methods
      if (options) {
        for (var option in options) {
          if (options.hasOwnProperty(option)) {
            this._config.concurrency[option] = options[option];
          }
        }
      }
    },
    worker: function (options) {
      //options.force to force a fast resize
      // add a task queue to utility-methods
      if (options) {
        for (var option in options) {
          if (options.hasOwnProperty(option)) {
            this._config.worker[option] = options[option];
          }
        }
      }
    },
    gc: function (options) {
      //options.force to force a fast resize
      // add a task queue to utility-methods
      if (options) {
        for (var option in options) {
          if (options.hasOwnProperty(option)) {
            this._config.gc[option] = options[option];
          }
        }
      }
    },
    restart: function restart(options) {
      //options.force to force a fast restart
      options = options || {};
      options.initialized = (new Date().getTime());
      this._data.restart = options;
    },
    quit: function quit(options) {
      //options.force to force a fast quit
      this.concurrency({
        min: 0,
        max: 0
      });
      return this.restart(options);
    },
    size: function (options) {
      return this._workers.length;
    },
    workers: function () {
      return this._workers.concat([]);
    }
  };
  
  
  var obj = new Cluster();
  

  return obj;

})();