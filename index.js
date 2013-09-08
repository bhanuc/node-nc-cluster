module.exports = (function () {
  var utility = require('utility-methods'),
      cluster = require('cluster');

  function Worker() {
    var worker = cluster.fork();

    worker.on('online', this._onlineEvent.bind(this));
    worker.on('listening', this._listeningEvent.bind(this));
    worker.on('disconnect', this._disconnectEvent.bind(this));
    worker.on('exit', this._exitEvent.bind(this));
    this._worker = worker;
    this._data = {
      created: 0
    };
  }

  Worker.prototype = {
    _onlineEvent: function () {
      this._data.online = true;
      this._data.created = new Date().getTime();
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
      worker.kill(); //after [ms] ms should the process be force to exit, but we does not implement it yet.
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
      this.data._onOnline = cb;
    },
    onListening: function(cb) {
      this.data._onListening = cb;
    },
    onDisconnected: function(cb) {
      this.data._onDisconnected = cb;
    },
    onExit: function (cb) {
      this.data._onExit = cb;
    }
  };

  function Cluster() {
    var cluster = require('cluster'),
        utility = require('utility-methods');

    this._cluster = cluster;
    this._utility = utility;
    this._config = {
      concurrency: {
        min: 1, //Allways [min] workers online.
        max: Object.keys(require('os').cpus()).length, // Max numbers of workers online
      },
      worker: {
        //timeout: 1000, //if a worker takes more than [timeout] to response, will it automatically be killed.
        allocationDelay: 1000, // time in ms between workers will be spawned at minimun
        shutdownTime: 5000 // ms to the worker will be killed by force automatically.
      },
      gc: {
        speed: 1000 //delay between gc
      }
    };
    this._data = {};
  }

  Cluster.prototype = {
    _malloc: function(cb) {
      var worker = new Worker(),
          utility = this._utility;

      createTimedHandler(this._config)
    },
    _gc: function() {
      var workersAlive = [],
          config = this._config,
          restart = this._data.restart;

      this._workers.forEach(function (worker) {
        if (!worker.isAlive()) {
          return;
        }
        if (!worker.isOnline() && config.worker.timeout < worker.uptime()) {
          // worker is not responding
          worker.kill(0);
          return;
        }
        if(restart) {
          var maxUptime = (new Date().getTime()) - this._data.restart.initialized;
          if (maxUptime <= worker.uptime()) {
            var ms = restart.force ? 0 : config.worker.shutdownTime; 
            worker.kill(ms);
            restart = null; // gc() will be re-run automatically when worker dies to setup a new worker anyways.
            return;
          }
        }

        //if(this._data.restart = options;
        workersAlive.push(worker);
      });
      if (restart) {
        this._data.restart = null;
      }
      if (workersAlive.length < config.concurrency.min) {
        var worker = new Worker();
        worker.onExit(this._gc.bind(this));
        workersAlive.push(worker);
      }
      else if(config.concurrency.max < workersAlive.length) {
        var worker = workersAlive.unshift();
        if(worker) {
          worker.kill(config.worker.shutdownTime);
        }
      }
      // may add
      this._workers = workersAlive;
    },

    init: function (options, cb) {
      //options.force to force a fast restart
      cluster.setupMaster(options);
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
            this._config.concurrency[option] = options[options];
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
    }
    /*,
    
    minimumWorkers: function(num) {
      if(typeof num === 'undefined') {
        return this._config.worker.min;
      }
      this._config.worker.min = num;
      return this;
    },
    maximumWorkers: function (num) {
      if (typeof num === 'undefined') {
        return this._config.worker.max;
      }
      this._config.worker.max = num;
      return this;
    },
    workerAllocationTimeout: function (num) {
      if (typeof num === 'undefined') {
        return this._config.worker.allocationTimeout;
      }
      this._config.worker.allocationTimeout = num;
      return this;
    },
    workerAllocationDelay: function (num) {
      if (typeof num === 'undefined') {
        return this._config.worker.allocationDelay;
      }
      this._config.worker.allocationDelay = num;
      return this;
    },
    workerListeningExpected: function (num) {
      if (typeof num === 'undefined') {
        return !!this._config.worker.listeningEventExpected;
      }
      this._config.worker.listeningEventExpected = !!num;
      return this;
    }*/
  };
  
  
  var obj = new Cluster();
  

  return obj;

})();