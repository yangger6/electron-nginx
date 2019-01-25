<template>
    <div>
        <p>
            <el-button size="mini" @click="cleanLog">清空日志</el-button>
            <el-button size="mini" @click="openLog">打开日志</el-button>
        </p>
        <pre class="log" v-html="log"></pre>
    </div>
</template>

<script>
  const { ipcRenderer, shell } = require('electron')
export default {
    data () {
      return {
        log: ''
      }
    },
    async created () {
      const delay = t => new Promise(resolve => setTimeout(resolve, t))
      const timer = async () => {
        await delay(1000)
        await this.loadLog()
        await timer()
      }
      await timer()
    },
    methods: {
      async loadLog () {
        this.log = await ipcRenderer.sendSync('get-logs')
      },
      async cleanLog () {
        await ipcRenderer.sendSync('clean-logs')
        this.$notify.success('清除日志成功')
        await this.loadLog()
      },
      async openLog () {
        const filePath = await ipcRenderer.sendSync('get-logs-path')
        console.log(filePath)
        shell.openItem(filePath)
      }
    }
}
</script>

<style lang="scss">
    .log{
        height: 170px;
        width: 100%;
        word-wrap:break-word;
        overflow: auto;
    }
</style>