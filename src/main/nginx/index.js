import fs from 'fs'
import path from 'path'
import ejs from 'ejs'
import uuidV4 from 'uuid/v4'
const jsonPath = path.resolve(path.join(__static, './nginx/config/proxy.json'))
const logPath = process.platform === 'win32' ? 'windows/logs/error.log' : 'mac/logs/error.log'
const tempPath = process.platform === 'win32' ? 'windows/temp' : 'mac/temp'
export const writeJson = async (jsonObj) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(jsonPath, JSON.stringify(jsonObj, null, 2), (err) => {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        console.log('JSON saved to ' + jsonPath)
        let jsonObj = JSON.parse(fs.readFileSync(jsonPath))
        console.log(jsonObj)
        resolve(jsonObj)
      }
    })
  })
}
export const addRules = async (rule, mode) => {
  try {
    const jsonObj = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    const addMode = mode || jsonObj.mode
    const isAdd = jsonObj.proxyRules.find((item) => item.mode === addMode && item.rule === rule)
    console.log(isAdd)
    if (!isAdd) {
      jsonObj.proxyRules.push({
        id: uuidV4(),
        mode: addMode,
        status: true,
        rule
      })
      await writeJson(jsonObj)
      console.log(addMode + ' add rules success -> ' + rule)
      await addLog(addMode + ' add rules success -> ' + rule)
      return `新增成功`
    } else {
      console.log(`add rules error -> ${addMode}${rule} 已存在`)
      await addLog(`add rules error -> ${addMode}${rule} 已存在`)
      return `add rules error: ${addMode}${rule} 已存在`
    }
  } catch (e) {
    console.log('add rules error -> ' + e)
    await addLog('add rules error -> ' + e)
    return `新增失败: ${e}`
  }
}
export const addHost = async (host, proxyHost) => {
  try {
    const jsonObj = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    jsonObj.host[host] = proxyHost
    await writeJson(jsonObj)
    console.log('add host success ->' + host + ' -> ' + proxyHost)
    await addLog('add host success ->' + host + ' -> ' + proxyHost)
    return true
  } catch (e) {
    console.log('add host error -> ' + e)
    await addLog('add host error -> ' + e)
    return false
  }
}
export const changeMode = async (mode) => {
  try {
    const jsonObj = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    jsonObj.mode = mode
    await writeJson(jsonObj)
    console.log('change mode success -> ' + mode)
    await addLog('change mode success -> ' + mode)
    return true
  } catch (e) {
    console.log('change mode error -> ' + e)
    await addLog('change mode error -> ' + e)
    return false
  }
}
export const deleteMode = async (mode) => {
  try {
    const jsonObj = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    delete jsonObj.host[mode]
    await writeJson(jsonObj)
    console.log('delete mode success -> ' + mode)
    await addLog('delete mode success -> ' + mode)
    return true
  } catch (e) {
    console.log('delete mode error -> ' + e)
    await addLog('delete mode error -> ' + e)
    return false
  }
}
export const updateRule = async (id, rule) => {
  try {
    const jsonObj = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    let changeId = ''
    jsonObj.proxyRules = jsonObj.proxyRules.map(item => {
      if (item.id === id) {
        changeId = id
        console.log(`update rule -> ${id} successfully`)
        return rule
      } else {
        return item
      }
    })
    await addLog(`update rule -> ${changeId} successfully`)
    await writeJson(jsonObj)
    return true
  } catch (e) {
    console.log('update rules error -> ' + e)
    await addLog('update rules error -> ' + e)
    return false
  }
}
export const deleteRule = async (deleteId) => {
  try {
    const jsonObj = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    jsonObj.proxyRules = jsonObj.proxyRules.filter(({id}) => deleteId !== id)
    await writeJson(jsonObj)
    console.log('delete rules success id -> ' + deleteId)
    await addLog(`delete rules success id -> ${deleteId}`)
    return true
  } catch (e) {
    console.log('delete rules error -> ' + e)
    await addLog('delete rules error -> ' + e)
    return false
  }
}
export const updatePort = async (port) => {
  try {
    const jsonObj = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    jsonObj.port = port
    await writeJson(jsonObj)
    console.log('update port success port -> ' + port)
    await addLog('update port success port -> ' + port)
    return true
  } catch (e) {
    console.log('update port error -> ' + e)
    await addLog('update port error -> ' + e)
    return false
  }
}
export const renderConfig = async () => {
  try {
    const formTemp = fs.readFileSync(path.resolve(path.join(__static, './nginx/config/config.ejs')), 'utf-8')
    // 解析 渲染
    const formRender = await ejs.render(formTemp, loadUsingRules())
    console.log(formRender)
    await writeFile(path.join(__static, './nginx/config/enable-proxy.conf'), formRender)
    return true
  } catch (e) {
    console.log(e)
    return false
  }
}
export const loadUsingRules = () => {
  const jsonObj = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
  const obj = {
    defaultMode: '',
    rules: []
  }
  obj.logPath = path.resolve(path.join(__static, `./nginx/${logPath}`))
  obj.tempPath = path.resolve(path.join(__static, `./nginx/${tempPath}`))
  if (process.platform === 'win32') {
    obj.logPath = obj.logPath.replace(/\\/g, '/')
    obj.tempPath = obj.tempPath.replace(/\\/g, '/')
  }
  obj.defaultMode = jsonObj['host'][jsonObj.mode]
  obj.port = jsonObj['port']
  jsonObj.proxyRules.filter(({status}) => status).map(({rule, mode}) => {
    obj.rules.push({
      path: rule,
      proxy: jsonObj['host'][mode]
    })
  })
  return obj
}
export const writeFile = async (filePath, content) => {
  filePath = path.resolve(filePath)
  try {
    if (!await fs.accessSync(filePath, fs.constants.F_OK)) {
      console.log('文件已存在, 删除原文件', filePath)
      fs.unlinkSync(filePath)
      fs.writeFileSync(filePath, content)
      console.log('成功写入文件', filePath)
    }
  } catch (e) {
    try {
      fs.writeFileSync(filePath, content)
      console.log('成功写入文件', filePath)
    } catch (e) {
      console.log(e)
      console.log('写入文件失败', filePath)
    }
  }
}
export const importFile = async (filePath) => {
  try {
    await writeJson(JSON.parse(fs.readFileSync(filePath, 'utf-8')))
    console.log('importFile success ->' + filePath)
    return true
  } catch (e) {
    console.log('importFile error ->' + e)
    return false
  }
}
export const addLog = async (logText) => {
  try {
    const logPath = path.resolve(path.join(__static, './log.txt'))
    let log = fs.readFileSync(logPath, 'utf8')
    let addLog = ''
    addLog += `┏ Log: ${new Date()}-------------------` + '\r\n'
    addLog += logText + '\r\n'
    addLog += `┗ ----------------------------------------------------------------------` + '\r\n'
    log = addLog + log
    fs.writeFileSync(logPath, log)
    return true
  } catch (e) {
    console.log(e)
    return false
  }
}
export const cleanLogs = async () => {
  try {
    const logPath = path.resolve(path.join(__static, './log.txt'))
    fs.writeFileSync(logPath, '')
    return true
  } catch (e) {
    console.log(e)
    return false
  }
}
