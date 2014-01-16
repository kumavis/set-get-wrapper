// dependencies
var WeakMap = require('weak-map')

// module globals
var wrapperCoreMap = new WeakMap()


module.exports = SetGetWrapper

// Create a wrapper around an object that expects a set/get API
function SetGetWrapper(core,keys) {
  // force instantiation with the 'new' keyword
  if(!(this instanceof SetGetWrapper)) { return new SetGetWrapper(core,keys) }
  // set default values
  var wrapper = this
  var keys = keys || []
  // keep track of the wrapper-core relationship and registered keys
  wrapperCoreMap.set(wrapper,{core:core,keys:keys})
  // for all keys provided, wrap to set/get calls on core
  keys.map(function(key){
    _linkWrapperToCore(wrapper,core,key)
  })
}

// Use an existing object as a wrapper
SetGetWrapper.useAsWrapper = function useAsWrapper(wrapper,core,extraKeys){
  // set default values
  var extraKeys = extraKeys || []
  // register wrapper-core relationship and keys
  wrapperCoreMap.set(wrapper,{core:core,keys:extraKeys})
  // move any existing data over to core and setup core-wrapper linkages
  SetGetWrapper.updateKeys(wrapper)
  // for any extra keys provided, wrap to set/get calls on core
  extraKeys.map(function(key){
    _linkWrapperToCore(wrapper,core,key)
  })
}

// Utility - Discover keys and first shipping the values to the core
SetGetWrapper.updateKeys = function updateKeys(wrapper,newKeys){
  // input validation
  if (!wrapperCoreMap.get(wrapper)) throw TypeError('Argument must be an instance of SetGetWrapper')
  var data = wrapperCoreMap.get(wrapper)
  var core = data.core
  var keys = data.keys
  newKeys = newKeys || Object.keys(wrapper)
  var temporaryValueStore = {}
  // for all keys provided, grab the values
  newKeys.map(function(key){
    // exit early if not a new key
    if (-1 !== keys.indexOf(key)) return
    // hold on to the raw value the wrapper has
    temporaryValueStore[key] = wrapper[key]
  })
  // setup forwarding on keys
  SetGetWrapper.addKeys(wrapper,newKeys)
  // call set for all the values we collected
  Object.keys(temporaryValueStore).map(function(key){
    // grab the raw value the wrapper had
    var value = temporaryValueStore[key]
    // pass value over to core
    core.set(key,value)
  })
}

// Utility - Add additional keys, overwriting the values
SetGetWrapper.addKeys = function updateKeys(wrapper,newKeys){
  // input validation
  if (!wrapperCoreMap.get(wrapper)) throw TypeError('Argument must be an instance of SetGetWrapper')
  var data = wrapperCoreMap.get(wrapper)
  var core = data.core
  var keys = data.keys
  newKeys = newKeys || Object.keys(wrapper)
  // for all keys provided, wrap to set/get calls on core
  newKeys.map(function(key){
    // exit early if not a new key
    if (-1 !== keys.indexOf(key)) return
    keys.push(key)
    // setup core-wrapper linkage 
    _linkWrapperToCore(wrapper,core,key)
  })
}

// Sets up a set/get linkage between wrapper and core
function _linkWrapperToCore(wrapper,core,key){
  Object.defineProperty(wrapper, key, {
    get: function(){ return core.get(key) },
    set: function(newValue){ return core.set(key,newValue) },
    enumerable: true,
    configurable: true,
  })
}