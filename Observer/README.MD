### 双向数据绑定 （2）

任务地址:

> [动态数据绑定（二）](http://ife.baidu.com/course/detail/id/20) 

##### 第三点的 $watch

实习过程中经常接触 Knockout 所以对 Observable() 这样的创建被观察对象的方式深恶痛决，于是在项目Leader的指导下看了一下 Observable 部分的原码，此处的 `$watch` 是与
Knockout 中的 `subscribe` 的实质其实是差不多， 仅仅是调用方式的不同而已，考虑到一个属性可能会有多个回调函数并且有可能某一个监听回调在将来可能被销毁，所以借鉴了 knockout
的 `dispose` 的实现

我有一点不爽地方就是 `$watch`, `notifySubscribers` 这些方法会直接暴露在 `new Observer()` 产生的对象下,这点我觉得还可以优化一下