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

const { Json, sleep } = require('./functions')
const usedCommandRecently = new Set()

const addFilter = (user) => {
  usedCommandRecently.add(user)
  await sleep(5000)
  usedCommandRecently.delete(user)
}

const addUser = (user) => {
  money.push({id: user, money: 0})
  fs.writeFileSync('./database/user/money.json', Json(money))
}

const addBal = (user, amount) => {
  let position = false
  Object.keys(money).forEach((i) => {
    if (money[i].id === user) {
      position = i
    }
  })
  if (position !== false) {
    money[position].money += amount
  }
  fs.writeFileSync('./database/user/money.json', Json(money))
}

const checkBal = (user) => {
  let position = false
  Object.keys(money).forEach((i) => {
    if (money[i].id === user) {
      position = i
    }
  })
  if (position !== false) {
    return money[position].money
  }
}

const checkBalReg = (user) => {
  let position = false
  Object.keys(money).forEach((i) => {
    if (money[i].id === user) {
      position = true
    }
  })
  return position
}

const isFiltered = (user) => usedCommandRecently.has(user)

const removeBal = (user, amount) => {
  let position = false
  Object.keys(money).forEach((i) => {
    if (money[i].id === user) {
      position = i
    }
  })
  if (position !== false) {
    money[position].money -= amount
  }
  fs.writeFileSync('./database/user/money.json', Json(money))
}

module.exports = { addFilter, addUser, addBal, checkBal, checkBalReg, isFiltered, removeBal }
