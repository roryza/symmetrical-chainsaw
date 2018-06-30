// local testing server
const express = require('express')
const app = express()

app.use(express.static('docs'))

app.listen(3080, () => console.log('Currency Converter listening on port 3080...'))
