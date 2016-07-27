const test = require('tape')
const _spawn = require('child_process').spawn
const fs = require('fs')
const tryConnect = require('try-net-connect')
const pkg = require('../package.json')
const image = 'pmkr/nginx:' + pkg.version

const spawn = (command, args, options = {}) => {
  options.stdio = 'inherit' // makes docker processes loud
  return _spawn(command, args, options)
}

test('starts nginx', t => {
  const p = spawn('docker', ['run', '--rm', '--net=host', image])
    .on('close', () => t.end())
  tryConnect({
    port: 80,
    retry: 500
  }).on('connected', () => {
    p.kill()
    t.pass()
  })
})

test('uses conf mounted at /nginx/nginx.conf', t => {
  const p = spawn('docker', [
    'run',
    '--rm',
    '--net=host',
    '-v', __dirname + '/fixtures/port1234.conf:/nginx/nginx.conf',
    image
  ]).on('close', () => t.end())
  tryConnect({
    port: 1234,
    retry: 500
  }).on('connected', () => {
    p.kill()
    t.pass()
  })
})

test('uses env var in conf template', t => {
  const p = spawn('docker', [
    'run',
    '--rm',
    '--net=host',
    '-e', 'port=1234',
    '-v', __dirname + '/fixtures/variablePort.conf:/nginx/nginx.conf',
    image
  ]).on('close', () => t.end())
  tryConnect({
    port: 1234,
    retry: 500
  }).on('connected', () => {
    p.kill()
    t.pass()
  })
})

test('uses data from /nginx/data.js in conf template', t => {
  const p = spawn('docker', [
    'run',
    '--rm',
    '--net=host',
    '-v', __dirname + '/fixtures/variablePort.conf:/nginx/nginx.conf',
    '-v', __dirname + '/fixtures/data.js:/nginx/data.js',
    image
  ]).on('close', () => t.end())
  tryConnect({
    port: 1234,
    retry: 500
  }).on('connected', () => {
    p.kill()
    t.pass()
  })
})

test('uses data from /nginx/data.yaml in conf template', t => {
  const p = spawn('docker', [
    'run',
    '--rm',
    '--net=host',
    '-v', __dirname + '/fixtures/variablePort.conf:/nginx/nginx.conf',
    '-v', __dirname + '/fixtures/data.yaml:/nginx/data.yaml',
    image
  ]).on('close', () => t.end())
  tryConnect({
    port: 1235,
    retry: 500
  }).on('connected', () => {
    p.kill()
    t.pass()
  })
})

test('uses data from /nginx/data.json in conf template', t => {
  const p = spawn('docker', [
    'run',
    '--rm',
    '--net=host',
    '-v', __dirname + '/fixtures/variablePort.conf:/nginx/nginx.conf',
    '-v', __dirname + '/fixtures/data.json:/nginx/data.json',
    image
  ]).on('close', () => t.end())
  tryConnect({
    port: 1236,
    retry: 500
  }).on('connected', () => {
    p.kill()
    t.pass()
  })
})

test('prefers data.yaml over data.json', t => {
  const p = spawn('docker', [
    'run',
    '--rm',
    '--net=host',
    '-v', __dirname + '/fixtures/variablePort.conf:/nginx/nginx.conf',
    '-v', __dirname + '/fixtures/data.json:/nginx/data.json',
    '-v', __dirname + '/fixtures/data.yaml:/nginx/data.yaml',
    image
  ]).on('close', () => t.end())
  tryConnect({
    port: 1235,
    retry: 500
  }).on('connected', () => {
    p.kill()
    t.pass()
  })
})

test('prefers data.js over data.yaml', t => {
  const p = spawn('docker', [
    'run',
    '--rm',
    '--net=host',
    '-v', __dirname + '/fixtures/variablePort.conf:/nginx/nginx.conf',
    '-v', __dirname + '/fixtures/data.yaml:/nginx/data.yaml',
    '-v', __dirname + '/fixtures/data.js:/nginx/data.js',
    image
  ]).on('close', () => t.end())
  tryConnect({
    port: 1234,
    retry: 500
  }).on('connected', () => {
    p.kill()
    t.pass()
  })
})

test('reloads data.js module on nginx reload', t => {
  const makeDataFile = port => {
    fs.writeFileSync('/tmp/data.js', `module.exports = {port: ${port}}`)
  }

  makeDataFile(1234)

  const p = spawn('docker', [
    'run',
    '--rm',
    '--net=host',
    '-v', __dirname + '/fixtures/variablePort.conf:/nginx/nginx.conf',
    '-v', '/tmp/data.js:/nginx/data.js',
    image
  ]).on('close', () => t.end())

  tryConnect({
    port: 1234,
    retry: 500
  }).on('connected', () => {
    makeDataFile(1237)

    p.kill('SIGHUP')

    tryConnect({
      port: 1237,
      retry: 500
    }).on('connected', () => {
      p.kill()
      t.pass()
    })
  })
})

test('exits if given invalid yaml data file', t => {
  const p = spawn('docker', [
    'run',
    '--rm',
    '--net=host',
    '-v', __dirname + '/fixtures/invalid.yaml:/nginx/data.yaml',
    image
  ]).on('exit', (exitCode) => {
    t.equal(exitCode, 1)
    t.end()
  })
})
