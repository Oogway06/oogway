const drawRandomCard = () => {
  return Math.floor(Math.random() * 10)
}

const getHandValue = (hand) => {
  var sum = 0
  for (var i=0; i<hand.length; i++){
    sum += hand[i]
  }
  return sum
}

const position = (bj, from, sender) => {
  let position = false
  Object.keys(bj).forEach((i) => {
    if (bj[i].id === sender && bj[i].from === from) {
      position = i
    }
  })
  if (position !== false) {
    return position
  }
}

const isBJFrom = (bj, from) => {
  let position = false
  Object.keys(bj).forEach((i) => {
    if (bj[i].from === from) {
      position = true
    }
  })
  return position
}

const isBJPlayer = (bj, sender) => {
  let position = false
  Object.keys(bj).forEach((i) => {
    if (bj[i].id === sender) {
      position = true
    }
  })
  return position
}

module.exports = { drawRandomCard, getHandValue, position, isBJFrom, isBJPlayer }
