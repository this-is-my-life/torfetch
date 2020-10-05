const torRequest = require('torrequest')
const express = require('express')
const cheerio = require('cheerio')
const app = express()

const log = []

app.get('/', (req, res, _) => {
  if (!req.query.url) return res.send('usage: /?url=http://example.org')
  console.log('Request: ', req.query.url)
  torRequest({
    uri: req.query.url,
    torHost: 'localhost',
    torPort: 9050
  }, (err, rep) => {
    if (err) return res.send(err)
    console.log('Response: length=', rep.body.length)

    const $ = cheerio.load(rep.body)
    const url = new URL(req.query.url)

    $('a').each((i, e) => {
      if (!e.attribs.href) return
      if (e.attribs.href.startsWith('#')) return
      if (e.attribs.href.startsWith('/')) return ($('a')[i].attribs.href = '/?url=' + encodeURIComponent(url.protocol + url.host + e.attribs.href))
      $('a')[i].attribs.href = '/?url=' + encodeURIComponent(e.attribs.href)
    })

    res.send($.html())
    log.push({ ip: req.ip, url })
  })
})

app.listen(8080)
