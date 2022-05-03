/*
  Lib
*/

const fs = require('fs')

/*
  Database
*/

const money = JSON.parse(fs.readFileSync('./database/user/money.json'))

/*
  Js
*/

const { Json } = require('./functions')

/*
  Other
*/

const workRecently = new Set()
const isWork = (jid) => !!workRecently.has(jid)
const workTimeAdd = (jid) => {
    workRecently.add(jid)
    setTimeout(() => workRecently.delete(jid), 180000) 
}

const addUser = (jid) => {
  const obj = {id: jid, money: 0}
  money.push(obj)
  fs.writeFileSync('./database/user/money.json', Json(money))
}

const addBal = (jid, amount) => {
  let position = false
  Object.keys(money).forEach((i) => {
    if (money[i].id === jid) {
      position = i
    }
  })
  if (position !== false) {
    money[position].money += amount
  }
  fs.writeFileSync('./database/user/money.json', Json(money))
}

const checkBal = (jid) => {
  let position = false
  Object.keys(money).forEach((i) => {
    if (money[i].id === jid) {
      position = i
    }
  })
  if (position !== false) {
    return money[position].money
  }
}

const checkBalReg = (jid) => {
  let position = false
  Object.keys(money).forEach((i) => {
    if (money[i].id === jid) {
      position = true
    }
  })
  return position
}

const removeBal = (jid, amount) => {
  let position = false
  Object.keys(money).forEach((i) => {
    if (money[i].id === jid) {
      position = i
    }
  })
  if (position !== false) {
    money[position].money -= amount
  }
  fs.writeFileSync('./database/user/money.json', Json(money))
}

module.exports = { addUser, addBal, checkBal, checkBalReg, isWork, removeBal, workTimeAdd }
