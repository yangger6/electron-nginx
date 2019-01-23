import nginxService from './NginxService'
import path from 'path'
import fs from 'fs'
import {renderConfig, changeMode, updatePort, deleteMode, addHost, addRules, deleteRule, updateRule, importFile} from './nginx/index'
const jsonPath = path.resolve(path.join(__static, './nginx/config/proxy.json'))
const { ipcMain } = require('electron')
ipcMain.on('get-rules', async (event, arg) => {
  event.returnValue = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
})
ipcMain.on('get-path', async (event) => {
  event.returnValue = path.resolve(path.join(__static, './nginx/config/proxy.json'))
})
ipcMain.on('get-error-log-path', async (event) => {
  event.returnValue = path.resolve(path.join(__static, `./nginx/${process.platform === 'win32' ? 'windows' : 'mac'}/logs/error.log`))
})
ipcMain.on('get-status', async (event, arg) => {
  event.returnValue = await nginxService.status()
})
ipcMain.on('stop-nginx', async (event, arg) => {
  event.returnValue = await nginxService.stop()
})
ipcMain.on('start-nginx', async (event, arg) => {
  nginxService.start()
  setTimeout(() => {
    event.returnValue = true
  }, 1000)
})
ipcMain.on('render-config', async (event, arg) => {
  event.returnValue = await renderConfig()
})
ipcMain.on('reload-nginx', async (event, arg) => {
  event.returnValue = await nginxService.reload()
})
ipcMain.on('add-host', async (event, arg) => {
  event.returnValue = await addHost(...arg)
})
ipcMain.on('add-rule', async (event, arg) => {
  event.returnValue = await addRules(...arg)
})
ipcMain.on('delete-rule', async (event, arg) => {
  event.returnValue = await deleteRule(arg)
})
ipcMain.on('update-rule', async (event, arg) => {
  event.returnValue = await updateRule(...arg)
})
ipcMain.on('update-mode', async (event, arg) => {
  event.returnValue = await changeMode(arg)
})
ipcMain.on('delete-mode', async (event, arg) => {
  event.returnValue = await deleteMode(arg)
})
ipcMain.on('update-port', async (event, arg) => {
  event.returnValue = await updatePort(arg)
})
ipcMain.on('import-file', async (event, arg) => {
  event.returnValue = await importFile(arg)
})
