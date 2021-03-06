'use strict'
const http = require('http')
const exercise = require('workshopper-exercise/basic')

const words = require('boganipsum')({ paragraphs: 2, sentenceMax: 1 }).split(' ')

// the output will be long lines so make the comparison take that into account
exercise.longCompareOutput = true

// set up the data file to be passed to the submission
exercise.addSetup(function (mode, callback) {
  // mode == 'run' || 'verify'

  this.server = http.createServer(function (req, res) {
    // use setTimeout to slow down the output to test timing
    ;(function next (i) {
      if (i === words.length) {
        return res.end()
      }
      res.write(words[i] + ' ')
      setTimeout(next.bind(null, i + 1), 2)
    }(0))
  })

  this.server.on('error', function (err) {
    console.error(this.__('fail.unexpected_error', { message: err.message }))
    console.error(err.stack)
    process.exit(1)
  }.bind(this))

  this.server.listen(0, function () {
    const url = 'http://localhost:' + String(this.server.address().port)

    // give the url as the first cmdline arg to the child processes
    this.submissionArgs = [url]
    this.solutionArgs = [url]

    callback()
  }.bind(this))
})

// cleanup for both run and verify
exercise.addCleanup(function (mode, passed, callback) {
  // mode == 'run' || 'verify'

  if (!this.server) {
    return process.nextTick(callback)
  }

  this.server.close(callback)
})

module.exports = exercise
