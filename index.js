const torRequest = require('torrequest')
const express = require('express')
const app = express()

const log = []

app.get('/', (req, res, _) => {
  if (!req.query.url) return res.send('usage: /?url=http://example.org')
  torRequest({
    uri: req.query.url,
    torHost: 'localhost',
    torPort: 9050
  }, (err, rep) => {
    if (err) return res.send(err)
    res.send(rep.body)
    log.push({ ip: req.ip, url: new URL(req.query.url) })
  })
})

app.use((req, res) => {
  if (req.path === '/') return
  const index = log.findIndex((l) => l.ip === req.ip)
  if (index < 0) return res.redirect('/')

  log[index].url.pathname = req.path
  console.log(log[index])

  res.redirect('/?url=' + encodeURIComponent(log[index].url.href))
  log.splice(index, 1)
})
app.listen(8080)
