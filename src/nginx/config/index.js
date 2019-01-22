import fs from 'fs'
import path from 'path'
import ejs from 'ejs'
import jsonObj from './proxy.json'
import uuidV4 from 'uuid/v4'
const jsonPath = path.resolve(path.join(__dirname, './proxy.json'))
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
      console.log(addMode + 'add rules' + rule)
    } else {
      console.log(`add rules error -> ${addMode}${rule} 已存在`)
    }
  } catch (e) {
    console.log('add rules error -> ' + e)
  }
}
export const addHost = async (host, proxyHost) => {
  try {
    jsonObj.host[host] = proxyHost
    await writeJson(jsonObj)
    console.log('add host' + host + ' -> ' + proxyHost)
  } catch (e) {
    console.log('add host error -> ' + e)
  }
}
export const changeMode = async (mode) => {
  try {
    jsonObj.mode = mode
    await writeJson(jsonObj)
    console.log('change mode -> ' + mode)
    return true
  } catch (e) {
    console.log('change mode error -> ' + e)
    return false
  }
}
export const deleteMode = async (mode) => {
  try {
    delete jsonObj.host[mode]
    await writeJson(jsonObj)
    console.log('delete mode -> ' + mode)
    return true
  } catch (e) {
    console.log('delete mode error -> ' + e)
    return false
  }
}
export const updateRule = async (id, rule) => {
  try {
    jsonObj.proxyRules = jsonObj.proxyRules.map(item => {
      if (item.id === id) {
        console.log(`update rule -> ${id} successfully`)
        return rule
      } else {
        return item
      }
    })
    await writeJson(jsonObj)
    return true
  } catch (e) {
    console.log('update rules error -> ' + e)
    return false
  }
}
export const deleteRule = async (deleteId) => {
  try {
    jsonObj.proxyRules = jsonObj.proxyRules.filter(({id}) => deleteId !== id)
    await writeJson(jsonObj)
    console.log('delete rules success id -> ' + deleteId)
    return true
  } catch (e) {
    console.log('delete rules error -> ' + e)
    return false
  }
}
export const updatePort = async (port) => {
  try {
    jsonObj.port = port
    await writeJson(jsonObj)
    return true
  } catch (e) {
    console.log('change port error -> ' + e)
    return false
  }
}
export const renderConfig = async () => {
  try {
    const formTemp = fs.readFileSync(path.resolve(path.join(__dirname, './config.ejs')), 'utf-8')
    // 解析 渲染
    const formRender = await ejs.render(formTemp, loadUsingRules())
    fs.writeFileSync(path.join(__dirname, './enable-proxy.conf'), formRender)
  } catch (e) {
    console.log(e)
    return false
  }
  return true
}
export const loadUsingRules = () => {
  const obj = {
    defaultMode: '',
    rules: []
  }
  obj.defaultMode = jsonObj['host'][jsonObj.mode]
  obj.port = jsonObj['port']
  jsonObj.proxyRules.filter(({status}) => status).map(({rule, mode}) => {
    obj.rules.push({
      path: rule,
      proxy: jsonObj['host'][mode]
    })
  })
  console.log(obj)
  return obj
}
export const writeFile = async (filePath, content) => {
  filePath = path.resolve(filePath)
  try {
    if (!await fs.accessSync(filePath, fs.constants.F_OK)) {
      console.log('文件已存在, 删除原文件', filePath)
      await fs.unlinkSync(filePath)
      await fs.writeFileSync(filePath, content)
      console.log('成功写入文件', filePath)
    }
  } catch (e) {
    try {
      await fs.writeFileSync(filePath, content)
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
