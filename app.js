
const ws_url = 'ws://localhost:8080/'
const inventory = document.querySelector('.inventory')

var isSendingNotification = false
const activateNotification = function () {
  isSendingNotification = !isSendingNotification
  if (isSendingNotification) {
    document.querySelector('button').innerHTML = 'Deactivate notifications'
  } else {
    document.querySelector('button').innerHTML = 'Activate notifications for inventory lower than 5'
  }
}

function notifyMe (event) {
  if (!('Notification' in window)) {
    alert('This browser does not support desktop notification')
  } else if (Notification.permission === 'granted') {
    var notification = new Notification(`${event.store} is missing of ${event.model}`)
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(function (permission) {
      if (permission === 'granted') {
        var notification = new Notification(`Notification granted | ${event.store} is missing of ${event.model}`)
      }
    })
  }
}

const human_to_id = function (storeName) {
  return storeName.toLowerCase().split(' ').join('_')
}

const updateProduct = function (productStock, event) {
  productStock.innerHTML = event.inventory
}

const createProduct = function (storeNode, event) {
  const product = document.createElement('li')
  product.id = human_to_id(event.model)
  product.className = 'product'
  product.id = human_to_id(event.model)
  product.innerHTML = `${event.model}: <span class="inventory">${event.inventory}</span>`
  storeNode.appendChild(product)
}

const createStore = function (event) {
  const store = document.createElement('div')
  store.id = human_to_id(event.store)
  store.className = 'store'
  store.innerHTML = `<h4>${event.store}</h4>`

  const listOfModel = document.createElement('ul')

  store.appendChild(listOfModel)
  inventory.appendChild(store)
  createProduct(listOfModel, event)
}

const updateView = function (event) {
  if (event.inventory < 5 & isSendingNotification) {
    notifyMe(event)
  }
  const storeNode = inventory.querySelector(`.store#${human_to_id(event.store)}`)
  if (storeNode) {
    const productNode = storeNode.querySelector(`.product#${human_to_id(event.model)}`)
    if (productNode) {
      updateProduct(productNode.querySelector('span'), event)
    } else {
      createProduct(storeNode.querySelector('ul'), event)
    }
  } else {
    createStore(event)
  }
}

if ('WebSocket' in window) {
  var ws = new WebSocket(ws_url)
  ws.onmessage = function (evt) {
    var received_msg = JSON.parse(evt.data)
    updateView(received_msg)
  }
  ws.onclose = function () {
    alert('Connection is closed...')
  }
} else {
  alert('WebSocket NOT supported by your Browser!')
}
