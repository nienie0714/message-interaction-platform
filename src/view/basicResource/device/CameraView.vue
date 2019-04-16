<template>
  <el-container direction="vertical">
    <el-header class="query-contain">
      <Query-view :data="queryRowGroup" class="left" @keyupEnter="queryDataReq()"></Query-view>
      <div class="left-button">
        <el-button type="info" icon="el-icon-search" plain @click="cleanQueryData()">清空</el-button>
        <el-button type="primary" icon="el-icon-search" @click="queryDataReq()">查询</el-button>
      </div>
    </el-header>
    <el-main class="page-table-view">
      <div class="page-table-header">
        <div class="page-table-title">查询结果</div>
        <Tool-button-view :permissions="permissions" :selectionCount="tableData.multipleSelection.length" @handleDownload="handleDownload" @handleAdd="handleAdd" @handleDelete="handleDelete"></Tool-button-view>
        <Pagination-view :pageData="pageData" @sizeChange="handleSizeChange" @currentChange="handleCurrentChange"></Pagination-view>
      </div>
      <Table-view :permissions="permissions" :tableData="tableData" ref="basicTable" @handleDetail="handleDetail" @handleEdit="handleEdit" @handleDelete="handleDelete"></Table-view>
    </el-main>
    <Edit-view :formData="formData" @handleAdd="saveAdd" @handleEdit="saveEdit"></Edit-view>
    <Warning-box-view :data="deleteData" @handleConfirm="handleDeleteConfirm"></Warning-box-view>
  </el-container>
</template>

<script>
import QueryView from '../../../components/common/QueryView'
import PaginationView from '../../../components/common/PaginationView'
import TableView from '../../../components/common/BaseTableView'
import ToolButtonView from '../../../components/common/ToolButtonView'
import EditView from '../../../components/common/EditView'
import basicTableMixin from '../../../components/mixin/basicTableMixin'
import pageTableMixin from '../../../components/mixin/pageTableMixin'
import {twoDecimalAll, IPReg, portReg, threeD} from '../../../util/rules.js'

// const tableHeight = ''

export default {
  components: {
    QueryView,
    PaginationView,
    TableView,
    ToolButtonView,
    EditView
  },
  mixins: [basicTableMixin, pageTableMixin],
  data () {
    return {
      // 基础路径
      baseUrl: 'basicdata/camera',
      // 查询条件每行个数
      colSize: 4,
      formData: {
        title: '新增',
        visible: false,
        inline: true,
        className: 'twiceCol',
        key: 'cameraNo',
        formData: [
          {key: 'cameraNo', label: '摄像头编号', type: 'input', maxlength: 30},
          {key: 'cameraCn', label: '摄像头名称', type: 'input', maxlength: 50},
          {key: 'longitude', label: '经度', type: 'input', maxlength: 7},
          {key: 'latitude', label: '纬度', type: 'input', maxlength: 7},
          {key: 'ip', label: 'IP地址', type: 'input'},
          {key: 'port', label: '端口', type: 'input', maxlength: 7},
          {key: 'username', label: '用户名', type: 'input', maxlength: 30},
          {key: 'password', label: '密码', type: 'input', maxlength: 30},
          {key: 'sortkey', label: '排序码', type: 'input'},
          {key: 'remark', label: '备注', type: 'textarea', autosize: true, maxlength: 100}
        ],
        rules: {
          cameraNo: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: this.unique, trigger: 'blur'}
          ],
          cameraCn: [
            {required: true, message: '必填项', trigger: 'blur'}
          ],
          longitude: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: twoDecimalAll, trigger: 'blur'}
          ],
          latitude: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: twoDecimalAll, trigger: 'blur'}
          ],
          ip: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: IPReg, trigger: 'blur'}
          ],
          port: [
            {required: true, message: '必填项', trigger: 'blur'},
            {validator: portReg, trigger: 'blur'}
          ],
          sortkey: [
            {validator: threeD, trigger: 'blur'}
          ]
        }
      },
      // 查询条件设置
      queryList: [
        {
          key: 'cameraNo',
          value: '',
          type: 'input',
          inputText: '摄像头编号',
          span: 4
        }, {
          key: 'cameraCn',
          value: '',
          type: 'input',
          inputText: '摄像头名称',
          span: 4
        }
      ],
      // 列表设置
      tableData: {
        loading: false,
        data: [],
        stripe: true,
        height: window.innerHeight,
        // type: 'selection',
        highlight: true,
        headerCellClass: 'tableHeaderCell-Center',
        rowClassName: this.tableRowClassName,
        key: 'cameraNo',
        multipleSelection: [],
        fields: [
          {prop: 'cameraNo', label: '摄像头编号', fixed: true, hidden: false, overflow: true},
          {prop: 'cameraCn', label: '摄像头名称', fixed: false, hidden: false, overflow: true},
          {prop: 'longitude', label: '经度', fixed: false, hidden: false, overflow: true},
          {prop: 'latitude', label: '维度', fixed: false, hidden: false, overflow: true},
          {prop: 'ip', label: 'IP地址', fixed: false, hidden: false, overflow: true},
          {prop: 'port', label: '端口', fixed: false, hidden: false, overflow: true},
          {prop: 'username', label: '用户名', fixed: false, hidden: false, overflow: true},
          {prop: 'password', label: '密码', fixed: false, hidden: false, overflow: true}
        ]
      }
    }
  },
  methods: {
  }
}
</script>
