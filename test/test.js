const test = require('tape')
const spawn = require('child_process').spawn
const fs = require('fs')
const tryConnect = require('try-net-connect')
const pkg = require('../package.json')
const image = 'pmkr/nginx:' + pkg.version

test('starts nginx', t => {
  t.plan(1)
  const p = spawn('docker', ['run', '--rm', '--net=host', image])
  tryConnect({
    port: 80,
    retry: 500
  }).on('connected', () => {
    p.kill()
    t.pass()
  })
})

test('uses conf mounted at /nginx/nginx.conf', t => {
  t.plan(1)
  const p = spawn('docker', [
    'run',
    '--rm',
    '--net=host',
    '-v', __dirname + '/fixtures/port1234.conf:/nginx/nginx.conf',
    image
  ])
  tryConnect({
    port: 1234,
    retry: 500
  }).on('connected', () => {
    p.kill()
    t.pass()
  })
})

test('uses env var in conf template', t => {
  t.plan(1)
  const p = spawn('docker', [
    'run',
    '--rm',
    '--net=host',
    '-e', 'port=1234',
    '-v', __dirname + '/fixtures/variablePort.conf:/nginx/nginx.conf',
    image
  ])
  tryConnect({
    port: 1234,
    retry: 500
  }).on('connected', () => {
    p.kill()
    t.pass()
  })
})

test('uses data from /nginx/data.js in conf template', t => {
  t.plan(1)
  const p = spawn('docker', [
    'run',
    '--rm',
    '--net=host',
    '-v', __dirname + '/fixtures/variablePort.conf:/nginx/nginx.conf',
    '-v', __dirname + '/fixtures/data.js:/nginx/data.js',
    image
  ])
  tryConnect({
    port: 1234,
    retry: 500
  }).on('connected', () => {
    p.kill()
    t.pass()
  })
})

test('uses data from /nginx/data.yaml in conf template', t => {
  t.plan(1)
  const p = spawn('docker', [
    'run',
    '--rm',
    '--net=host',
    '-v', __dirname + '/fixtures/variablePort.conf:/nginx/nginx.conf',
    '-v', __dirname + '/fixtures/data.yaml:/nginx/data.yaml',
    image
  ])
  tryConnect({
    port: 1235,
    retry: 500
  }).on('connected', () => {
    p.kill()
    t.pass()
  })
})

test('uses data from /nginx/data.json in conf template', t => {
  t.plan(1)
  const p = spawn('docker', [
    'run',
    '--rm',
    '--net=host',
    '-v', __dirname + '/fixtures/variablePort.conf:/nginx/nginx.conf',
    '-v', __dirname + '/fixtures/data.json:/nginx/data.json',
    image
  ])
  tryConnect({
    port: 1236,
    retry: 500
  }).on('connected', () => {
    p.kill()
    t.pass()
  })
})

test('prefers data.yaml over data.json', t => {
  t.plan(1)
  const p = spawn('docker', [
    'run',
    '--rm',
    '--net=host',
    '-v', __dirname + '/fixtures/variablePort.conf:/nginx/nginx.conf',
    '-v', __dirname + '/fixtures/data.json:/nginx/data.json',
    '-v', __dirname + '/fixtures/data.yaml:/nginx/data.yaml',
    image
  ])
  tryConnect({
    port: 1235,
    retry: 500
  }).on('connected', () => {
    p.kill()
    t.pass()
  })
})

test('prefers data.js over data.yaml', t => {
  t.plan(1)
  const p = spawn('docker', [
    'run',
    '--rm',
    '--net=host',
    '-v', __dirname + '/fixtures/variablePort.conf:/nginx/nginx.conf',
    '-v', __dirname + '/fixtures/data.yaml:/nginx/data.yaml',
    '-v', __dirname + '/fixtures/data.js:/nginx/data.js',
    image
  ])
  tryConnect({
    port: 1234,
    retry: 500
  }).on('connected', () => {
    p.kill()
    t.pass()
  })
})

test('reloads data.js module on nginx reload', t => {
  t.plan(1)
  const makeDataFile = port => {
    fs.writeFileSync('/tmp/data.js', `module.exports = {port: ${port}}`)
  }
  makeDataFile(1234)
  const p = spawn('docker', [
    'run',
    '--rm',
    '--net=host',
    '--name', 'test',
    '-v', __dirname + '/fixtures/variablePort.conf:/nginx/nginx.conf',
    '-v', '/tmp/data.js:/nginx/data.js',
    image
  ])
  tryConnect({
    port: 1234,
    retry: 500
  }).on('connected', () => {
    makeDataFile(1237)
    spawn('docker', ['kill', '-s', 'HUP', 'test'])
    tryConnect({
      port: 1237,
      retry: 500
    }).on('connected', () => {
      p.kill()
      t.pass()
    })
  })
})
