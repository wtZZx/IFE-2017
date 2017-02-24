function subscriptions (callback, dispose) {
    this.callback = callback
    this.dispose =  dispose // 用于取消事件订阅
}

function subscribe () {
    let _subscriptions = {
    }
    
    this.$watch = function (property, callback) {
        var subscription = new subscriptions(callback, function () {
            if (_subscriptions.hasOwnProperty(property)) {
                let index = _subscriptions[property].indexOf(this)
                _subscriptions[property].splice(index, 1)
            }
        })

        if (!_subscriptions.hasOwnProperty(property)) {
            _subscriptions[property] = [] // 因为一个属性可能有多个订阅对象，所以用数组存放
        }
        _subscriptions[property].push(subscription)

        return subscription
    }

    this.notifySubscribers = function (newVal, key) {
        let subscriptions = _subscriptions[key]
        // 遍历执行 callback
        subscriptions.forEach(function (subscribeCallback) {
            subscribeCallback.callback(newVal, key)
        })
    }
}

function Observer (data) {
    this.data = data

    subscribe.call(this.data)

    this.walk(this.data) // 深度 observable 化

    return this.data
}

Observer.prototype.walk = function (data) {
    for (let key in data) {
        let val = data[key]
        if (typeof val === 'object') {
            new Observer(val)
        }
        this.conver(key, val)
    }
}

Observer.prototype.conver = function (key, val) {
    Object.defineProperty(this.data, key, {
        set (newVal) {
            if (newVal !== val) {
                if (typeof newVal === 'object') {
                    new Observer(newVal)
                }
                this.notifySubscribers(newVal, key)
                val = newVal
            }
        },
        get () {
            return val
        }
    })
}

let app1 = new Observer({
    name: 'wtzzx',
    age: 12
})

let ageWatcher = app1.$watch('age', function (age, key) {
    console.log(`我真的是越来越年经了，现在是 ${age}, ${key}`)
})

app1.$watch('age', function (age, key) {
    console.log(`我又减了一岁？是逆生长么？ ${age}, ${key}`)
})

app1.$watch('name', function (name, key) {
    console.log(`我改了一个名字，现在叫 ${name}, ${key}`)
})

app1.age = 11

ageWatcher.dispose()

app1.age = 10