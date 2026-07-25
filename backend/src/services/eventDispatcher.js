const EventEmitter = require('events');
class SystemEventDispatcher extends EventEmitter {}
module.exports = new SystemEventDispatcher();
