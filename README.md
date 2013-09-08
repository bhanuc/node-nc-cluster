node-nc-cluster
===============

Simple helper for node.js inbuilt cluster module. It is a more lightweight
variant of iscaas cluster-master module that allows more customzation.

#Features:

- Configuration/Customzation. Multiple configurations and easily to add more.

- Does not interfeir with others libraries. You can safely use libraries that
  take advantage of the cluster module to as lon the never call
  require('cluster').setupMaster method.

- Monitor. The library will monitor the system and respawn, increase and decrease
  the number of workers depending of the resource usage.

#Usage:

```JavaScript
var ncCluster = require('nc-cluster');

// (optional)
ncCluster.concurrency({
  min: 2,
  max: 4  
});

// (optional)
ncCluster.worker({
  shutdownTime: 5000 // ms to do a graceful shutdown before automatically killed by force.
});
        
// (required)
ncCluster.init({
  exec: __dirname + '/worker.js'
});

// (optional)
ncCluster.restart();

// (optional)
ncCluster.quit();
```

#Installation:

```
npm install nc-cluster
```

#Test:
Within the nc-cluster folder, type:
```
npm test
```

#Reference

##.init(options)
Initialize the library. Will call the inbuilt require('cluster').setupMaster

##.concurrency(options)
Set concurrency options. Default:

min: 1
max: (number of CPU cores)

##.worker(options)
Set worker options. Default:

shutdownTime: 5000 (shutdown time in ms each worker has to do a graceful shutdown before it will be killed by force)

##.gc(options)
Set worker options. Default:

speed: 1000 (Minimun time in ms the garbage collector will run, which checks the health of the system)

##.restart(options)
Set worker options. Default:

force: false

##.quit(options)
Set worker options. Default:

force: false

##.size()
Return the internal process count. May not be equal to the real worker count.

##.workers() Return array<Worker>
Return a copy of the internal worker array. Each object in the returned object will
be a instance of the "Worker" class defined below.

##class Worker

Helper class. All instances in the array returned from .workers() will be of this type.

###.isAlive() Return bool
Return true if the worker exists or soon will exist, otherwise false.

###.isOnline() Return bool
Return true if the event 'online' has been fired on the worker, otherwise false.

###.isListening() Return bool
Return true if the event 'listening' has been fired on the worker, otherwise false.

###.isDisconnected() Return bool
Return true if the event 'disconnect' has been fired on the worker, otherwise false.

###.kill(ms)
Kill the worker and give it [ms] ms to do a graceful shutdown.

###.uptime() Return int
Return uptime in ms.

###.onOnline(function)
Set 'online' event handler. Will overwrite the previus if it has been already set.
Even it may overwrite the internal event handler, is it safe to call it from client code.

###.onListening(function)
Set 'listening' event handler. Will overwrite the previus if it has been already set.
Even it may overwrite the internal event handler, is it safe to call it from client code.

###.onDisconnected(function)
Set 'disconnect' event handler. Will overwrite the previus if it has been already set.
Even it may overwrite the internal event handler, is it safe to call it from client code.

###.onExit(function)
Set 'exit' event handler. Will overwrite the previus if it has been already set.
Even it may overwrite the internal event handler, is it safe to call it from client code.

###.id() Return [worker ID]
Return worker ID. Same id will be used as the key in the inbuilt cluster module:

```
var id = worker.id(),
    inbuiltWorker = require('cluster').workers[id];

//inbuiltWorker.send, inbuiltWorker.on('message) or what you may want.
```

#License
Copyright (c) Fredrik Olofsson ("Author")
All rights reserved.

The BSD License

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:

1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE AUTHOR AND CONTRIBUTORS ``AS IS'' AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS
BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN
IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.








