import nginxService from './NginxService'
import jsonObj from '../nginx/config/proxy'
import path from 'path'
import {renderConfig, changeMode, updatePort, deleteMode, addHost, addRules, deleteRule, updateRule, importFile} from '../nginx/config/index'
const { ipcMain } = require('electron')
ipcMain.on('get-rules', async (event, arg) => {
  event.returnValue = jsonObj
})
ipcMain.on('get-path', async (event) => {
  event.returnValue = path.resolve(path.join(__dirname, '../nginx/config/proxy.json'))
})
ipcMain.on('get-status', async (event, arg) => {
  event.returnValue = await nginxService.status()
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
