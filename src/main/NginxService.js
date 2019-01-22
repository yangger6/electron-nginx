import jsonObj from '../nginx/config/proxy'
const util = require('util')
const path = require('path')
const exec = util.promisify(require('child_process').exec)
const nginxPath = process.platform === 'win32' ? 'windows/nginx.exe' : 'mac/bin/nginx'
class NginxService {
  constructor () {
    this.init()
  }
  async init () {
    await this.loadConfig()
  }
  async loadConfig () {
    // this.config = path.resolve(path.join(__dirname, '../nginx/config/nginx.conf'))
    this.config = path.resolve(path.join(__dirname, '../nginx/config/enable-proxy.conf'))
    this.nginx = path.resolve(path.join(__dirname, `../nginx/${nginxPath}`))
  }
  async test () {
    try {
      const {stderr} = await exec(`${this.nginx} -t -c ${this.config}`)
      console.log(stderr)
      if (stderr.match('successful')) {
        return true
      } else {
        return false
      }
    } catch (e) {
      console.log(e)
      return false
    }
  }
  async stop () {
    try {
      await exec(`ps -lef|grep -i nginx:|awk '{ print $2}'|xargs kill -9`)
    } catch (e) {
    }
    return true
  }
  async start () {
    try {
      await this.stop()
      const {stderr} = await exec(`${this.nginx} -c ${this.config}`)
      console.log(stderr)
    } catch (e) {
      console.log(e)
      return false
    }
  }
  async reload () {
    try {
      if (await this.test()) {
        const {stdout, stderr} = await exec('nginx -s reload')
        console.log(stdout)
        console.log(stderr)
        return true
      }
    } catch (e) {
      console.log(e)
      return false
    }
  }
  async status () {
    try {
      await exec(`lsof -i:${jsonObj.port}`)
      return true
    } catch (e) {
      return false
    }
  }
}
export default new NginxService()
// (async () => {
//   const aa = new NginxService()
//   await aa.start()
//   await aa.reload()
// })()
