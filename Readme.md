# SetGetWrapper

Ever deal with a framework or module that requires you to use objects with a set/get API?
Ever get stuck trying to use that opinionated object with an API that expects regular javascript objects?
Never fear, `SetGetWrapper` is here. Create a wrapper object whose properties are bound to those of the set/get object, but can be accessed normally (some restrictions apply).

Note: If you have an existing object that you want to use as the wrapper, see `SetGetWrapper.useAsWrapper`

### Example

```javascript
var SetGetWrapper = require('./index.js')

// An Example class that expects you to use a set/get api
function NeedsSetGetApiClass(){
  var _secrets = {}
  this.get = function get(key){ return _secrets[key] }
  this.set = function set(key,newValue){ _secrets[key] = newValue }
}

// Introducing "Mr.SetGet"
// an instance of the set/get class
var mrSetGet = new NeedsSetGetApiClass()
// with some properties set with `set`
mrSetGet.set('age',31)
mrSetGet.set('hobbies',['knitting'])

// Introducing "Mr.Right"
// a wrapper around the set get class, with a list of keys to be linked
var mrRight = new SetGetWrapper(mrSetGet,['age','hobbies'])

// mrRight can directly read and write the properties of mrSetGet, if they have been listed or discovered
mrRight.age //=> 31
mrRight.hobbies.push('knotting')
mrRight.hobbies //=> ['knitting','knotting']
// these changes affect mrSetGet
mrSetGet.get('hobbies') //=> ['knitting','knotting']

// Remember: all keys must be linked before they can be used, either manually, or through discovery
mrRight.job = 'accountant'
mrSetGet.get('job') //=> undefined, 'job' was not listed in the original list of keys to be linked

// You can manually add keys to the wrapper in this way
// Note: it will send all previously untracked keys' values over to mrSetGet
SetGetWrapper.updateKeys(mrRight,['job'])
mrSetGet.get('job') //=> 'accountant'

// Discovery - Another way to add keys is to automatically look for unregistered keys
// Note: this is equivalent to SetGetWrapper.updateKeys(mrRight,Object.keys(mrRight))
mrRight.nickname = 'sri adhikara'
mrSetGet.get('nickname') //=> undefined
SetGetWrapper.updateKeys(mrRight)
mrSetGet.get('nickname') //=> 'sri adhikara'

// but wait, there's more!
// Introducing "Mrs.Tenured"
// she's been around for a while and not about to be replaced,
// but she does still need to keep in sync with mrSetGet
var mrsTenured = {
  memories: 'plenty',
  files: 'many',
  experience: 'lots',
}

// this will turn mrsTenured into a wrapper, send all values over to mrSetGet,
// and additionally (and optionally) add another key to be linked
SetGetWrapper.useAsWrapper(mrsTenured,mrSetGet,['students'])
mrSetGet.get('files') //=> 'many'
mrSetGet.get('students') //=> undefined, not set yet
mrSetGet.set('students',['joe','carl'])
mrsTenured.students //=> ['joe','carl']
```