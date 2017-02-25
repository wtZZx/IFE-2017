function subscriptions (callback, dispose) {
    this.callback = callback
    this.dispose =  dispose // 用于取消事件订阅
}

function subscribe () {
    let _subscriptions = {
    }
    
    this.$watch = function (property, callback) {
        let me = this 
        // 保存 data => this
        if (typeof me[property] === 'object') {
            for (let key in me[property]) {
                me[property].$watch(key, callback)
            }
            // 证多级对象下的属性也可以被 watch , 这里应该是存在问题的，应该要用递归来实现
            // 对于将父的 watch 直接添加到子属性上这样的做法 也觉得不是太好
        }
        let subscription = new subscriptions(callback, function () {
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
        let me = this
        let subscriptions = _subscriptions[key]
        // 遍历执行 callback
        if (subscriptions) {
            // 所有的对象应该要添加 watch 后才能触发回调
            subscriptions.forEach(function (subscribeCallback) {
                subscribeCallback.callback(newVal, key)
            })
        }
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

let app2 = new Observer({
    name: {
        firstName: {
            miao: 'wuli',
            tao: 'tao'
        },
        lastName: 'tao'
    },
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

app2.$watch('name', function (name, key) {
    console.log('我发生了变化，但不知道是哪一个')
})

// app2.name.$watch('firstName', function (name, key) {
//     console.log('change fistName')
// })

// app2.name.firstName = '蛤'

// app2.name.lastName = '习'

app2.name.firstName.miao = '滋瓷'