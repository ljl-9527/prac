class Promise {
    constructor(executor) {
      this.state = "pending"
      this.value = ''
      this.reson = ''
      this.onfulfilledCallbacks = []
      this.onrejectedCallbacks = [] 
      const resolve = (value) => {
        if (value instanceof Promise) {
          return value.then(resolve, reject)
        }
        if (this.state === 'pending') {
          this.state = 'fulfilled'
          this.value = value 
          this.onfulfilledCallbacks.forEach(fn => fn(value))
        }
      }
      const reject = (reson) => {
        this.reson = reson
        if (this.state === 'pending') {
          this.state = 'rejected'
          this.onrejectedCallbacks.forEach(fn => fn(this.reson))
        }
      }
  
      try {
        executor(resolve, reject)
      } catch (e) {
        reject(e)
      }
    }
    then(onfulfilled = v=>v, onrejected = r=>r) {
      const promise2 = new Promise((resolve, reject) =>{
        setTimeout(() =>{
          if (this.state === 'fulfilled') {
            try {
              const x = onfulfilled(this.value)
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }
  
          else if (this.state === 'rejected') {
            try {
              const r = onrejected(this.reson)
              resolvePromise(promise2, r, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }
  
          else if (this.state === 'pending') {
            this.onfulfilledCallbacks.push((value) =>{
              try {
                const x = onfulfilled(value) 
                resolvePromise(promise2, x, resolve, reject)
              } catch (e) {
                reject(e)
              }
            }) 
            this.onrejectedCallbacks.push((reson) =>{
              try {
                const r = onrejected(reson) 
                resolvePromise(promise2, r, resolve, reject)
              } catch (e) {
                reject(e)
              }
            })
          }
        },0)
      })
  
      return promise2
    }
    catch(rejectFn){
      return this.then(null, rejectFn)
    }
  
  }
  function resolvePromise(promise2, x, resolve, reject) {
  
    if (promise2 === x) {
      return new TypeError('循环引用！')
    }
  
    else if (x instanceof Promise) {
      x.then(y => {
        resolvePromise(promise2, y, resolve, reject)
      },
      r => {
        reject(r)
      })
    }
  
    else {
      resolve(x)
    }
  }
  Promise.resolve = function(value){
    return new Promise((resolve, reject) => {
      resolve(value)
    })
  }
  Promise.reject = function(reson){
    return new Promise((resolve, reject) => {
      reject(reson)
    })
  }
  Promise.all = function (p) {
    return new Promise((resolve, reject) => {
      let count = 0
      const result = []
  
      function processData(index, value) {
        result[index] = value
        if (++count === p.length) {
          resolve(result)
        }
      }
      p.forEach((cur, index) => {
        if (cur instanceof Promise) {
            cur.then(v => {
              processData(index, v)
            }, r => {
              reject(r)
            })
        } else {
          processData(index, cur)
        }
      })
    })
  }
  Promise.race = function (p) {
    return new Promise((resolve, reject) => {
      p.forEach(cur => {
        if(cur instanceof Promise){
          cur.then(r => {
            resolve(r)
          })
        }else { 
          resolve(cur)
        }
      })
    })
  }