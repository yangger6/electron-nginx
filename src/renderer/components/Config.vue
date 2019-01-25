<template>
    <el-container>
        <el-header>
            <h4 style="height: 30px;display: flex;align-items: center;justify-content: space-between">
            <span>
                环境：{{rules.mode}} 端口号：{{rules.port}} 运行状态：
                <span :class="[isOpenNginx ? 'success' : 'error', 'running']">◉️</span>
            </span>
                <div>
                    <el-button size="mini" @click="reload">重启服务</el-button>
                    <el-button size="mini" @click="importFile">导入配置</el-button>
                    <el-button size="mini" @click="openFile('get-path')">打开配置文件</el-button>
                    <el-button size="mini" @click="stopNginx">停止</el-button>
                    <el-button size="mini" @click="startNginx">启动</el-button>
                </div>
            </h4>
        </el-header>
        <el-steps :space="200" :active="stepActive" finish-status="success" simple v-show="showStep" style="padding: 13px 8px;margin:0 20px">
            <el-step title="生成配置文件" :icon="steps.isWriting ? 'el-icon-loading' : 'el-icon-edit'"></el-step>
            <el-step title="重置服务" :icon="steps.isReloading ? 'el-icon-loading' : 'el-icon-refresh'"></el-step>
        </el-steps>
        <p style="margin:10px 20px">
            <el-button type="danger" size="mini" @click="openFile('get-error-log-path')" v-show="errorLogVisible">打开错误日志</el-button>
        </p>
        <el-main style="margin-top: 10px">
            <el-collapse v-model="activeNames">
                <el-collapse-item :title="'切换环境/端口 当前代理地址：' + (rules['host'] ? rules['host'][rules.mode]: '')" name="1">
                    <p>
                        当前端口：
                        <el-input v-model="newPort" style="width: 100px" size="mini"></el-input>
                        <el-button size="mini" @click="updatePort">重启端口</el-button>
                    </p>
                    <p>
                        <el-input placeholder="请输入环境名" v-model="newHostName" style="width: 170px" size="mini"></el-input>
                        <el-input placeholder="请输入代理地址" v-model="newHost" style="width: 300px" size="mini"></el-input>
                        <el-button size="mini" @click="addHost">新增环境</el-button>
                    </p>
                    <p v-for="path, name in rules.host" :key="name">
                        <el-button :type="rules.mode === name ? 'primary' : ''" size="mini" @click="updateMode(name)">
                            {{rules.mode === name ? '当前：': ''}}{{name}}
                        </el-button>
                        <el-button type="danger" size="mini" @click="deleteMode(name)">
                            删除
                        </el-button>
                        <span>{{path}}</span>
                    </p>
                </el-collapse-item>
                <el-collapse-item title="规则" name="2">
                    <p style="display: flex">
                        <el-select v-model="newMode" placeholder="请选择环境" size="mini" style="width: 200px;margin-left: 15px">
                            <el-option
                                    v-for="path, name in rules.host"
                                    :key="name"
                                    :label="name"
                                    :value="name">
                            </el-option>
                        </el-select>
                        <el-input v-model="newRule" size="mini" style="margin: 0 15px"></el-input>
                        <el-button size="mini" @click="addNewRule">新增</el-button>
                        <el-button size="mini" @click="init">重置修改</el-button>
                    </p>
                    <el-table
                            size="mini"
                            :data="rules.proxyRules"
                            highlight-current-row
                            style="width: 100%">
                        <el-table-column label="状态" width="90">
                            <template slot-scope="scope">
                                <el-select v-model="scope.row.status" placeholder="启用状态" size="mini">
                                    <el-option label="启用" :value="true"></el-option>
                                    <el-option label="关闭" :value="false"></el-option>
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column label="环境" width="150">
                            <template slot-scope="scope">
                                <el-select v-model="scope.row.mode" placeholder="请选择环境" size="mini">
                                    <el-option
                                            v-for="path, name in rules.host"
                                            :key="name"
                                            :label="name"
                                            :value="name">
                                    </el-option>
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column label="路径">
                            <template slot-scope="scope">
                                <el-input v-model="scope.row.rule" size="mini"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column property="address" label="操作" width="150">
                            <template slot-scope="scope">
                                <el-button
                                        size="mini"
                                        @click="handleEdit(scope.$index, scope.row)">保存</el-button>
                                <el-button
                                        size="mini"
                                        type="danger"
                                        @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-collapse-item>
                <el-collapse-item title="日志" name="3">
                    <log></log>
                </el-collapse-item>
            </el-collapse>
        </el-main>
    </el-container>
</template>

<script>
  import log from './log'
  const { ipcRenderer, shell } = require('electron')
  const { dialog } = require('electron').remote
  export default {
    components: {
      log
    },
    data () {
      return {
        rules: {},
        activeNames: '2',
        newMode: '',
        newRule: '',
        newPort: '',
        newHostName: '',
        newHost: '',
        errorLogVisible: false,
        isOpenNginx: false,
        showStep: false,
        stepActive: 0,
        steps: {
          isWriting: false,
          isReloading: false
        }
      }
    },
    async created () {
      await this.startNginx()
      await this.reload()
    },
    methods: {
      async init () {
        this.newRule = ''
        this.newMode = ''
        this.newHostName = ''
        this.newHost = ''
        this.rules = await ipcRenderer.sendSync('get-rules')
        this.newPort = this.rules.port
        this.isOpenNginx = await ipcRenderer.sendSync('get-status')
        console.log(this.rules)
      },
      async handleEdit (index, row) {
        if (await ipcRenderer.sendSync('update-rule', [row.id, row])) {
          this.$notify.success(`更新规则成功`)
        }
        await this.reload()
      },
      async handleDelete (index, row) {
        if (await ipcRenderer.sendSync('delete-rule', row.id)) {
          this.$notify.success(`删除规则成功`)
        }
        await this.reload()
      },
      async importFile () {
        dialog.showOpenDialog({
          title: '选择proxy.json文件',
          defaultPath: 'proxy.json',
          filters: ['json']
        }, async (filePath) => {
          if (await ipcRenderer.sendSync('import-file', filePath[0])) {
            this.$notify.success(`导入成功`)
          }
          await this.reload()
        })
      },
      async addNewRule () {
        this.$notify.success(await ipcRenderer.sendSync('add-rule', [this.newRule, this.newMode]))
        await this.reload()
      },
      async addHost () {
        if (await ipcRenderer.sendSync('add-host', [this.newHostName, this.newHost])) {
          this.$notify.success(`新增环境:${this.newHost}成功`)
          await this.init()
        }
      },
      async reload () {
        const delay = (t) => new Promise(resolve => setTimeout(resolve, t))
        this.showStep = true
        this.steps.isWriting = true
        await delay(300)
        if (await ipcRenderer.sendSync('render-config')) {
          this.steps.isWriting = false
          this.steps.isReloading = true
          this.stepActive = 1
        }
        if (await ipcRenderer.sendSync('reload-nginx')) {
          this.steps.isReloading = false
          this.errorLogVisible = false
          this.stepActive = 2
        } else {
          this.steps.isReloading = false
          this.errorLogVisible = true
          this.$notify.error('服务重启失败')
          return
        }
        await delay(300)
        await this.init()
        this.showStep = false
        this.stepActive = 0
        this.$notify.success('重启服务成功')
      },
      async updateMode (mode) {
        if (await ipcRenderer.sendSync('update-mode', mode)) {
          await this.reload()
          this.$notify.success(`切换环境:${mode}成功`)
        }
      },
      async deleteMode (mode) {
        if (mode === this.rules.mode) {
          this.$notify.error(`当前环境:${mode}正在运行`)
        }
        if (await ipcRenderer.sendSync('delete-mode', mode)) {
          this.$notify.success(`删除环境:${mode}成功`)
          await this.init()
        }
      },
      async updatePort () {
        if (await ipcRenderer.sendSync('update-port', this.newPort)) {
          this.$notify.success(`切换端口:${this.newPort}成功`)
          await this.reload()
        }
      },
      async openFile (path) {
        const filePath = await ipcRenderer.sendSync(path)
        console.log(filePath)
        shell.openItem(filePath)
      },
      async stopNginx () {
        if (await ipcRenderer.sendSync('stop-nginx')) {
          await this.init()
          this.$notify.success(`停止成功`)
        }
      },
      async startNginx () {
        if (await ipcRenderer.sendSync('start-nginx')) {
          await this.init()
          this.$notify.success(`启动成功`)
        }
      }
    }
  }
</script>

<style scoped lang="scss">
    span{
        &.running{
            color: #E6A23C;
        }
        &.success{
            color: #67C23A;
        }
        &.error{
            color: #F56C6C;
        }
    }
</style>
