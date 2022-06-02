/*
  Librerias
*/

const axios = require('axios')
const cheerio = require('cheerio')

/*
  Js
*/

const gitClone = (user, repo) => {
  return new Promise(async(resolve, reject) => {
    var res = await axios.get(`https://github.com/${user}/${repo}`)
    var $ = cheerio.load(res.data)
    $('.Box-row Box-row--hover-gray p-3 mt-0', res.data).each(function() {
      resolve($(this).find('a').attr('href'))
    })
  })
}

module.exports = { gitClone }
