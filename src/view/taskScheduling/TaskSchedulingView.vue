<template>
<div class="whole-contain tasksched-contain">
  <div>
    <Message-view></Message-view>
  </div>
  <div class="latest-bg task-latest-bg">
    <div class="latest-time">{{ latestTime }}</div>
    <div class="latest-date">{{ latestDate }}</div>
  </div>
  <el-container direction="vertical" :style="wholeBodyStyle">
    <el-header class="query-contain" style="height: 70px;">
      <Query-view :data="queryRowGroup" class="left" @keyupEnter="queryDataReq()"></Query-view>
      <div class="left-button">
        <el-button type="info" plain @click="cleanQueryData()">清空</el-button>
        <el-button type="primary" @click="queryDataReq()">查询</el-button>
        <el-button type="success" @click="queryDataReq()">预分配</el-button>
        <el-popover placement="bottom" trigger="manual" v-model="ctrlFVisible" popper-class="ctrl-f-popover" width="274">
          <Query-view :data="ctrlF" @change="changeHandleOfCtrlF" class="right" @keyupEnter="findCtrlF()"></Query-view>
          <div class="ctrl-f-query" @click="findCtrlF()"></div>
          <div class="ctrl-f-close" @click="handleCtrlFButton()"></div>
          <el-button slot="reference" :class="ctrlFVisible?'open':'close'" type="info" @click="handleCtrlFButton()">定位</el-button>
        </el-popover>
        <el-button type="success" @click="queryAllData()">刷新</el-button>
      </div>
    </el-header>
    <el-main class="tasksched-table-main">
      <el-container class="tasksched-table-container" :style="tableContStyle">
        <el-container direction="vertical" class="table-container tasksched-table-container1" ref="resize-table">
          <el-header>
            <div class="table-header tasksched-table-header-left">
              <img :src="require('@img/title_deco.png')"/>
              <span class="header-title">航班列表</span>
              <span>
                <div class="dot-font">
                  <div class="dot-color-4_1"></div>
                  <span>本站</span>
                </div>
                <div class="dot-font">
                  <div class="dot-color-4_2"></div>
                  <span>前起</span>
                </div>
                <div class="dot-font">
                  <div class="dot-color-4_3"></div>
                  <span>计划</span>
                </div>
                <div class="dot-font">
                  <div class="dot-color-2"></div>
                  <span>延误</span>
                </div>
                <div class="dot-font">
                  <div class="dot-color-3"></div>
                  <span>取消</span>
                </div>
                <div class="dot-font">
                  <div class="dot-color-1"></div>
                  <span>起飞</span>
                </div>
              </span>
            </div>
            <div class="tasksched-table-header-right">
              <div>
                <el-radio-group v-model="flightType" size="small" @change="queryDataReq()">
                  <el-radio-button label="all">所有航班</el-radio-button>
                  <el-radio-button label="remark">异常航班</el-radio-button>
                  <el-radio-button label="mark">关注航班</el-radio-button>
                </el-radio-group>
              </div>
              <div>
                <el-radio-group v-model="taskType" size="small" @change="queryDataReq()">
                  <el-radio-button label="normal">常用任务</el-radio-button>
                  <el-radio-button label="special">特车任务</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </el-header>
          <el-main class="tasksched-table-1 whole-table-main">
            <div class="div-left-table" :style="divLeftTableStyle">
              <div class="div-left-table_header" :style="divLeftTableStyle">
                <table cellpadding="0" cellspacing="0" class="left-table_header" :style="divLeftTableStyle">
                  <thead>
                    <tr>
                      <th v-show="!item.hidden" v-for="(item, index) in tableData.fields" :key="index" :width="item.width" :style="{minWidth: item.minWidth + 'px'}">{{item.label}}</th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div class="div-left-table_body" :style="divTableBodyStyle" @mousewheel="scrollEvent">
                <table cellpadding="0" cellspacing="0" class="left-table_body" ref="wholeTable">
                  <tbody>
                    <tr v-for="(item, index) in tableData.data" :key="index" :id="item.afid" :data-flighta="item.flightNoA" :data-flightd="item.flightNoD" :draggable="(queryData.execDateFlag != -1)&&item.colourType != 1" @dragstart="dragFlight" @drop="dropFlight" @dragover="allowDrop(item.colourType, $event)"
                    :class="[tableRowClassName({'row': item, 'rowIndex': index}), tableClickRowClass[index]?'is-active':'']" @click="clickRow(index)">
                      <div v-for="field in tableData.fields" :key="field.prop" :class="field.hidden?'body-tr-div':'body-tr-div show-field'" :style="!field.hidden && {width: field.width + 'px'}">
                        <td v-if="!field.hidden" :width="field.width" :class="field.class">
                          <div v-if="field.prop == 'mark'" class="first-col-color">
                            <img v-if="item[field.prop]" :src="require('@img/icon_heart_liked.png')" @click.self.stop="queryData.execDateFlag != -1&&cancelMarkFlight(item)"/>
                            <img v-else :src="require('@img/icon_heart_default.png')" @click.self.stop="queryData.execDateFlag != -1&&markFlight(item)"/>
                          </div>
                          <div v-else-if="field.prop == 'stand' && item[field.prop]" :class="field.childClass">{{ item[field.prop] }}</div>
                          <div v-else-if="field.prop == 'preDepTime'" :class="item['preDepTimeCss']?item['preDepTimeCss']+' time-bg':'time-bg'">{{ item[field.prop] ? item[field.prop] : '—:—' }}</div>
                          <div v-else-if="field.prop == 'arrvTime'" :class="item['arrvTimeCss']?item['arrvTimeCss']+' time-bg':'time-bg'">{{ item[field.prop] ? item[field.prop] : '—:—' }}</div>
                          <div v-else-if="field.prop == 'deptTime'" :class="item['deptTimeCss']?item['deptTimeCss']+' time-bg':'time-bg'">{{ item[field.prop] ? item[field.prop] : '—:—' }}</div>
                          <div v-else-if="field.prop == 'abCountA' || field.prop == 'abCountD' || field.prop == 'pgCountA' || field.prop == 'pgCountD'">{{ spliceArr(item[field.prop], '/') }}</div>
                          <div v-else>{{ item[field.prop] }}</div>
                        </td>
                      </div>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="div-right-table" :style="divRightTableStyle">
              <div class="div-right-table_header">
                <div class="div-right-table_header-div">
                  <table cellpadding="0" cellspacing="0" class="right-table_header" :style="rightTableWidthStyle">
                    <thead>
                      <tr>
                        <th v-show="!item.hidden" v-for="(item, index) in tableData.taskFields" :key="index" :width="item.width" :style="{minWidth: item.minWidth + 'px'}">{{item.label}}</th>
                      </tr>
                    </thead>
                  </table>
                </div>
              </div>
              <div class="div-right-table_body" :style="divTableBodyStyle" @mousewheel="scrollEvent">
                <table cellpadding="0" cellspacing="0" class="right-table_body_block">
                  <tbody>
                    <tr v-for="(item, index) in tableData.data" :key="index" :id="item.afid" :data-flighta="item.flightNoA" :data-flightd="item.flightNoD"
                    :draggable="(queryData.execDateFlag != -1)&&(item.colourType != 1)" @dragstart="dragFlight" @drop="dropFlight" @dragover="allowDrop(item.colourType, $event)"
                    :class="tableClickRowClass[index]?'is-active':''" @click="clickRow(index)">
                      <div class="body-tr-div" :style="{width: '100%'}"></div>
                    </tr>
                  </tbody>
                </table>
                <table cellpadding="0" cellspacing="0" class="right-table_body" :style="rightTableWidthStyle">
                  <tbody>
                    <tr v-for="(item, index) in tableData.data" :key="index" :id="item.afid" :data-flighta="item.flightNoA" :data-flightd="item.flightNoD"
                    :draggable="(queryData.execDateFlag != -1)&&(item.colourType != 1)" @dragstart="dragFlight" @drop="dropFlight" @dragover="allowDrop(item.colourType, $event)"
                    :class="tableClickRowClass[index]?'is-active':''" @click="clickRow(index)">
                      <div v-for="taskField in tableData.taskFields" :key="taskField.prop" :class="taskField.hidden?'body-tr-div-hidden':'body-tr-div'"
                      :style="!taskField.hidden && {width: 'calc(' + taskField.width + 'px - 10px'}">
                        <td v-if="!taskField.hidden" :width="taskField.width - 10"><!--  @click="eventStop($event)" -->
                          <el-popover placement="bottom" width="160" trigger="click" class="popover-bottom">
                            <div class="task-right-click-tip">
                              <div :class="queryData.execDateFlag != -1&&(item.taskDataMap[taskField.prop] && (!['NoDistribute', 'NormalFinished', 'OvertimeFinished', 'ExceptionFinished'].includes(item.taskDataMap[taskField.prop].taskDataCss)))?'tip-first':'tip-first div-disabled'"
                              @click="queryData.execDateFlag != -1&&item.taskDataMap[taskField.prop] && (!['NoDistribute', 'NormalFinished', 'OvertimeFinished', 'ExceptionFinished'].includes(item.taskDataMap[taskField.prop].taskDataCss)) && cancelTaskButtonClick(item.taskDataMap[taskField.prop])">
                                <div class="tip-undo"></div>
                                <div>撤销分配</div>
                              </div>
                              <div :class="queryData.execDateFlag != -1&&(item.taskDataMap[taskField.prop] && (!['NoDistribute'].includes(item.taskDataMap[taskField.prop].taskDataCss)))?'tip-second':'tip-second div-disabled'"
                              @click="queryData.execDateFlag != -1&&item.taskDataMap[taskField.prop] && (!['NoDistribute'].includes(item.taskDataMap[taskField.prop].taskDataCss)) && editTaskButtonClick(item.taskDataMap[taskField.prop])">
                                <div class="tip-edit"></div>
                                <div>任务编辑</div>
                              </div>
                            </div>
                            <div slot="reference">
                              <div v-if="item.taskDataMap[taskField.prop]" :class="item.taskDataMap[taskField.prop].taskDataCss + ' task-field-div'" @click="handleShow($event)">
                                <div v-if="['EnsureException', 'Ensuring', 'EnsureOvertime'].includes(item.taskDataMap[taskField.prop].taskDataCss)" class="task-doing-animation"></div>
                                <span :class="item.taskDataMap[taskField.prop].beginTimeCss">{{ item.taskDataMap[taskField.prop].beginTime ? item.taskDataMap[taskField.prop].beginTime : '—:—' }}</span> - <span :class="item.taskDataMap[taskField.prop].endTimeCss">{{ item.taskDataMap[taskField.prop].endTime ? item.taskDataMap[taskField.prop].endTime : '—:—' }}</span>
                              </div>
                            </div>
                          </el-popover>
                          <!-- <div v-if="item.taskDataMap[taskField.prop]" :class="item.taskDataMap[taskField.prop].taskDataCss + ' task-field-div'">
                            <span :class="item.taskDataMap[taskField.prop].beginTimeCss">{{ item.taskDataMap[taskField.prop].beginTime ? item.taskDataMap[taskField.prop].beginTime : '—:—' }}
                            </span>-<span :class="item.taskDataMap[taskField.prop].endTimeCss">
                              {{ item.taskDataMap[taskField.prop].endTime ? item.taskDataMap[taskField.prop].endTime : '—:—' }}
                            </span>
                          </div>
                          <div v-if="item.taskDataMap[taskField.prop] && item.taskDataMap[taskField.prop].taskDataCss == 'NoDistribute'" class="yellow-spot"></div> -->
                          <!-- <span v-if="item.taskDataMap[taskField.prop]">
                            <span :class="item.taskDataMap[taskField.prop].beginTimeCss">{{ item.taskDataMap[taskField.prop].beginTime ? item.taskDataMap[taskField.prop].beginTime : '—:—' }}
                            </span>-<span :class="item.taskDataMap[taskField.prop].endTimeCss">
                              {{ item.taskDataMap[taskField.prop].endTime ? item.taskDataMap[taskField.prop].endTime : '—:—' }}
                            </span>
                          </span> -->
                        </td>
                        <div v-if="!taskField.hidden && item.taskDataMap[taskField.prop] && item.taskDataMap[taskField.prop].taskDataCss == 'NoDistribute'" class="yellow-spot"></div>
                        <div v-if="!taskField.hidden && item.taskDataMap[taskField.prop] && item.taskDataMap[taskField.prop].refuseCss == 'true'" class="refuse-spot"></div>
                      </div>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="div-opr-table">
              <div class="div-opr-table_header">
                <el-popover placement="bottom" width="520" trigger="click" v-model="defaultRow">
                  <div class="opr-popover">
                    <el-main>
                      <div class="opr-popover-left">
                        <el-header>航班信息</el-header>
                        <el-main>
                          <ul>
                            <div v-for="(field, index) in tableData.fields" :key="field.prop">
                              <li v-if="index > 7" :class="((oprPopoverDirect == 'left') && (oprPopoverIndex == index)) ? 'opr-popover-li-click' : ''">
                                <div class="opr-popover-li-left">{{ substrValue(field.label, 6) }}</div>
                                <div class="opr-popover-li-right">
                                  <div :class="field.hidden?'button-close':'button-show'" @click="handleEye(field, index, 'left')"></div>
                                  <div class="button-up" @click="handleUp(field, index, 'left')"></div>
                                  <div class="button-top" @click="handleTop(field, index, 'left')"></div>
                                </div>
                              </li>
                            </div>
                          </ul>
                        </el-main>
                      </div>
                      <div class="opr-popover-right">
                        <el-header>任务信息</el-header>
                        <el-main>
                          <ul>
                            <div v-for="(field, index) in tableData.taskFields" :key="field.prop">
                              <li v-if="field.label" :class="((oprPopoverDirect == 'right') && (oprPopoverIndex == index)) ? 'opr-popover-li-click' : ''">
                                <div class="opr-popover-li-left">{{ substrValue(field.label, 6) }}</div>
                                <div class="opr-popover-li-right">
                                  <div :class="field.hidden?'button-close':'button-show'" @click="handleEye(field, index, 'right')"></div>
                                  <div class="button-up" @click="handleUp(field, index, 'right')"></div>
                                  <div class="button-top" @click="handleTop(field, index, 'right')"></div>
                                </div>
                              </li>
                            </div>
                          </ul>
                        </el-main>
                      </div>
                    </el-main>
                    <el-footer>
                      <div class="footer-left">
                        <el-button type="info" plain @click="getDefaultRow()">恢复默认值</el-button>
                      </div>
                      <div class="footer-right">
                        <el-button type="info" plain @click="closeDefaultRow()">取消</el-button>
                        <el-button type="primary" @click="saveDefaultRow()">保存</el-button>
                      </div>
                    </el-footer>
                  </div>
                  <div class="opr-header-button" slot="reference">编辑表头</div>
                </el-popover>
              </div>
              <div class="div-opr-table_body" :style="[divOprTableStyle, divTableBodyStyle]">
                <table cellpadding="0" cellspacing="0">
                  <tbody>
                    <tr v-for="(item, index) in tableData.data" :key="index" :id="item.afid" :data-flighta="item.flightNoA" :data-flightd="item.flightNoD"
                    :draggable="(queryData.execDateFlag != -1)&&(item.colourType != 1)" @dragstart="dragFlight" @drop="dropFlight" @dragover="allowDrop(item.colourType, $event)"
                    :class="tableClickRowClass[index]?'is-active':''" @click="clickRow(index)">
                      <td width="90">
                        <div class="div-opr-i">
                          <div>
                            <div class="icon_list_add" @click.self.stop="addSpecialTask(item)"></div>
                            <div class="icon_list_gantt" @click.self.stop="skipToFlightGantt(item)"></div>
                          </div>
                          <!-- <a class="icon_list_task"/> -->
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </el-main>
        </el-container>
        <el-container direction="vertical" class="table-container tasksched-table-container2">
          <el-header class="tasksched-header">
            <div class="table-header">
              <img :src="require('@img/title_deco.png')"/>
              <span class="header-title">{{deptName}}</span>
            </div>
            <div class="header-button">
              <div class="opr-header-button" @click="skipToResGantt()">资源甘特图</div>
            </div>
          </el-header>
          <el-main>
            <el-header class="tasksched-task-header">
              <el-input placeholder="请输入保障单元或人员" v-model.trim="rightQueryData.name" clearable style="width: 90%; margin: 0 5% 10px 5%;" @keyup.enter.native="handleQueryTeam('change')">
                <i slot="prefix" class="el-input__icon el-icon-search"></i>
              </el-input>
              <el-select v-model="rightQueryData.taskNo" :filterable="true" placeholder="请选择任务" :default-first-option="true" @change="handleQueryTeam('change')"
              style="width: 90%; margin: 0 5% 10px 5%;">
                <el-option v-for="task in taskArr" :key="task.index" :label="task.label" :value="task.key"></el-option>
              </el-select>
            </el-header>
            <el-main class="tasksched-task-body">
              <div class="task-body-ul">
                <ul>
                  <li v-for="item in rightDrag" :key="item.index" :id="item.id" :data-type="item.type" :data-task="item.taskNo" :data-taskname="item.taskName" :data-name="item.name" :draggable="queryData.execDateFlag != -1" @dragstart="dragData" @drop="dropData" @dragover="allowDrop(null, $event)">
                    <div v-if="((!taskOnline) && (!taskFree)) || (taskOnline && item.online && (!taskFree)) || (taskFree && (!item.taskCount) && !taskOnline) || (taskFree && (!item.taskCount) && taskOnline && item.online)" class="task-list-li">
                      <div class="li-head">
                        <div :class="`${item.online?'':'head-no-online '}${item.type}`"></div>
                      </div>
                      <div class="li-font">
                        <div class="li-font-name">
                          <div :class="item.online?'font-online':'font-no-online'">{{ item.online?'[在线]':'[离线]' }}</div>
                          <div class="font-name">
                            {{ substrValue(item.name, 7) }}</div>
                        </div>
                        <div class="li-font-task-flight">
                          <div class="font-label">任务航班：</div>
                          <div v-if="item.flightNos" class="font-flight-div">
                            <div class="font-flight"><p>{{ item.flightNos }}</p></div>
                          </div>
                        </div>
                      </div>
                      <div class="li-img">
                        <div :class="item.taskCss + ' img-flag'"></div>
                        <div :class="item.taskCss + ' img-font'">{{ item.taskCount }}</div>
                        <el-popover v-if="item.type != 'Personal'" placement="left" width="398" trigger="hover">
                          <div class="li-img-popover">
                            <el-header>{{ item.name }}</el-header>
                            <el-main>
                              <ul>
                                <li v-for="emp in teamEmpArr" :key="emp.teamEmpId">
                                  <div class="task-list-li">
                                    <div class="li-head">
                                      <div :class="`${emp.online?'':'head-no-online '}Personal`"></div>
                                    </div>
                                    <div class="li-font">
                                      <div class="li-font-name">
                                        <div :class="emp.online?'font-online':'font-no-online'">{{ emp.online?'[在线]':'[离线]' }}</div>
                                        <div class="font-name">
                                          {{ substrValue(emp.name, 7) }}</div>
                                      </div>
                                      <div class="li-font-task-flight">
                                        <div class="font-label">任务航班：</div>
                                        <div v-if="emp.flightNos" class="font-flight-div">
                                          <div class="font-flight"><p>{{ emp.flightNos }}</p></div>
                                        </div>
                                      </div>
                                    </div>
                                    <div class="li-img">
                                      <div :class="emp.taskCss + ' img-flag'"></div>
                                      <div :class="emp.taskCss + ' img-font'">{{ emp.taskCount }}</div>
                                    </div>
                                  </div>
                                </li>
                              </ul>
                            </el-main>
                          </div>
                          <div slot="reference" @mouseover="getTeamEmp(item.id, item.taskNo)"><img class="li-img-img" :src="require('@img/icon_more.png')"/></div>
                        </el-popover>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </el-main>
          </el-main>
          <el-footer>
            <div class="tasksched-task-footer">
              <div class="task-footer-left">
                <el-dropdown trigger="click" @command="selectTaskSort" class="div-button">
                  <span class="el-dropdown-link">{{ taskSortSelect }}<i class="el-icon-arrow-up el-icon--right"></i></span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-for="taskSort in taskSorts" :key="taskSort.key" :command="taskSort" :class="taskSortSelect==taskSort.label?'select':''">{{ taskSort.label }}</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
              <div class="task-footer-right">
                <div :class="taskOnline?'div-button-select div-button':'div-button'" @click="filterOnline()">只在线</div>
                <div :class="taskFree?'div-button-select div-button':'div-button'" @click="filterFree()">只空闲</div>
              </div>
            </div>
          </el-footer>
        </el-container>
      </el-container>
    </el-main>
    <div class="dialog-form-edit" v-if="taskButtonData.editVisible">
      <el-dialog v-if="taskButtonData.editVisible" :visible.sync="taskButtonData.editVisible" :close-on-click-modal="false" width="480px">
        <div slot="title" class="dialog-header">
          <img :src="require('@img/title_deco.png')"/>
          <span class="header-title">{{ taskButtonData.type==1?'撤销分配':'任务编辑' }}</span>
        </div>
        <div class="dialog-body">
          <div class="dialog-body-top">
            <el-row :gutter="20">
              <el-col :span="6"><div>任务名称</div><div>{{ taskButtonData.data.taskName }}</div></el-col>
              <el-col :span="6"><div>进港航班</div><div>{{ taskButtonData.data.flightNoA }}</div></el-col>
              <el-col :span="6"><div>出港航班</div><div>{{ taskButtonData.data.flightNoD }}</div></el-col>
              <el-col :span="6"><div>机位</div><div>{{ taskButtonData.data.stand }}</div></el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <div class="task-button-team-emp-title">任务保障单元/执行人</div>
                <div class="task-button-team-emp-div" v-if="taskButtonData.data.distributors">
                  <p v-for="(item, index) in taskButtonData.data.distributors" :key="index">{{ (item.confirm==2)?(item.name+'(拒绝)'):item.name }}</p>
                </div>
                <div v-else> </div>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="24"><div>备注</div><div>{{ taskButtonData.data.remark }}</div></el-col>
            </el-row>
          </div>
          <div v-if="taskButtonData.type == 1" class="dialog-body-bottom">
            <div class="dialog-body-bottom-first">撤销原因</div>
            <div>
              <div v-if="taskButtonData.data.refuseReason" class="refuse-reason-div">
                <div v-for="item in taskButtonData.data.refuseReason" :key="item" @click="taskButtonData.formData.button = item"
                :class="taskButtonData.formData.button==item?'div-button-select div-button':'div-button'">{{ item }}</div>
              </div>
              <div v-else> </div>
              <div class="refuse-reason-other-div">
                <div :class="taskButtonData.formData.button=='other'?'div-button-select div-button':'div-button'"
                @click="taskButtonData.formData.button = 'other'">其他</div>
                <div v-if="taskButtonData.formData.button=='other'">
                  <el-input type="textarea" placeholder="请输入撤销原因" v-model.trim="taskButtonData.formData.textarea"></el-input>
                  <p v-if="!taskButtonData.formData.textarea" class="textarea-tip">撤销原因不能为空，请填写后提交</p>
                </div>
              </div>
            </div>
          </div>
          <div v-if="taskButtonData.type == 2" class="dialog-body-bottom edit-time-bottom">
            <el-row :gutter="24">
              <el-col :span="24">
                <div style="display: flex;">任务原因
                  <div class="edit-time-reason-div">
                    <div class="dot-font">
                      <div class="dot-color-3"></div>
                      <span>拒绝</span>
                    </div>
                    <div class="dot-font">
                      <div class="dot-color-2"></div>
                      <span>异常</span>
                    </div>
                    <div class="dot-font">
                      <div class="dot-color-0"></div>
                      <span>撤销</span>
                    </div>
                  </div>
                </div>
                <div v-if="taskButtonData.data.records.length > 0" class="task-reason-list" :style="taskButtonData.style">
                  <div v-for="(item, index) in taskButtonData.data.records" :key="index" :class="`task-reason-div ${item.classify=='TASK_REJECT'?'font-color-3':item.classify=='TASK_EXCEPTION'?'font-color-2':'font-color-0'}`">
                    <div>{{formatterTimeOfHM(item.actionTime)}}</div>
                    <div class="line">
                      <div class="dot"></div>
                    </div>
                    <div>
                      <div>{{item.name}}</div>
                      <div>{{item.reason}}</div>
                    </div>
                    <el-popover placement="bottom-start" popper-class="task-reason-popover" :disabled="item.attachment.length <= 0">
                      <div>
                        <el-carousel trigger="click" arrow="always" :autoplay="false">
                          <el-carousel-item v-for="(imgUrl, index) in item.attachment" :key="index">
                            <img v-if="imgUrl.split('.')[imgUrl.split('.').length-1] != 'mp4'" :src="dfsUrl + imgUrl" @click="showWinImg(dfsUrl + imgUrl)" style="cursor: pointer;"/>
                            <video v-else width="240" height="423" controls="controls" autoplay="autoplay">
                              <source :src="dfsUrl + imgUrl" type="video/mp4" />
                              <object :data="dfsUrl + imgUrl" width="240" height="423">
                                <embed width="240" height="423" :src="dfsUrl + imgUrl" />
                              </object>
                            </video>
                          </el-carousel-item>
                        </el-carousel>
                        <div v-show="showImg" class="show-img" @click="showImg = false">
                          <img :src="imgSrc"/>
                        </div>
                      </div>
                      <div class="task-reason-popover-slot" slot="reference">
                        <div v-if="item.classify=='TASK_EXCEPTION'" :class="item.attachment.length <= 0 ? 'attachment-gray div-button' : 'attachment-white div-button'"></div>
                      </div>
                    </el-popover>
                  </div>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <div>任务计划开始时间</div>
                <div>{{ taskButtonData.data.beginTimeE?taskButtonData.data.beginTimeE:' ' }}</div>
              </el-col>
              <el-col :span="12">
                <div>任务计划完成时间</div>
                <div>{{ taskButtonData.data.endTimeE?taskButtonData.data.endTimeE:' ' }}</div>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <div>任务实际开始时间</div>
                <div>
                  <el-date-picker type="datetime" placeholder="请选择时间" format="yyyy-MM-dd HH:mm" value-format="yyyy-MM-dd HH:mm" size="small"
                  v-model="taskButtonData.timeData.startTime" :disabled="taskButtonData.data.beginTimeA!=''"></el-date-picker>
                </div>
              </el-col>
              <el-col :span="12">
                <div>任务实际完成时间</div>
                <div>
                  <el-date-picker type="datetime" placeholder="请选择时间" format="yyyy-MM-dd HH:mm" value-format="yyyy-MM-dd HH:mm" size="small"
                  v-model="taskButtonData.timeData.endTime" :disabled="taskButtonData.data.beginTimeA=='' || taskButtonData.data.endTimeA != ''"></el-date-picker>
                  <p v-if="taskButtonData.data.beginTimeA==''" class="textarea-tip">需先提交任务开始时间</p>
                  <p v-if="taskButtonData.data.beginTimeA!='' && taskButtonData.data.endTimeA=='' && taskButtonData.timeData.startTime>taskButtonData.timeData.endTime" class="textarea-tip">任务结束时间必须大于等于开始时间</p>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="handleTaskButtonClose">取 消</el-button>
          <el-button v-if="taskButtonData.type==1" type="primary" @click="handleTaskButtonSave"
          :disabled="(taskButtonData.formData.button=='other'&&!taskButtonData.formData.textarea)||taskButtonData.formData.button==''">确 定</el-button>
          <el-tooltip v-if="taskButtonData.type==2" content="提示：提交时间后任务将切换至完成状态，且不可修改！" placement="top-end" popper-class="tasksched dialog-footer-tooltip">
            <el-button type="primary" @click="handleTaskButtonSave" :loading="taskButtonData.outLoading"
            :disabled="!((!taskButtonData.data.beginTimeA&&!taskButtonData.data.endTimeA&&taskButtonData.timeData.startTime)||
            (taskButtonData.data.beginTimeA&&!taskButtonData.data.endTimeA&&taskButtonData.timeData.endTime))">{{taskButtonData.outLoading?'确定中':'确 定'}}</el-button>
          </el-tooltip>
        </div>
        <Warning-box-view :data="taskButtonData" @handleConfirm="handleCancelButtonSave"></Warning-box-view>
        <!-- <el-dialog :visible.sync="taskButtonData.visible" :close-on-click-modal="false" width="660px" append-to-body class="other-dialog dialog-cancel-warn">
          <div slot="title" class="dialog-header">
            <img src="../../assets/img/title_deco.png" />
            <span class="header-title">警告</span>
          </div>
          <div class="dialog-body">
            <div>
              <div class="cancel-warn-img"></div>
            </div>
            <div><p class="other-dialog-cont">确认要撤销任务分配吗？</p></div>
            <div><p class="other-dialog-tip">操作不可恢复</p></div>
          </div>
          <div slot="footer" class="dialog-footer">
            <el-button @click="handleCancelButtonClose">取 消</el-button>
            <el-button type="primary" @click="handleCancelButtonSave">确 定</el-button>
          </div>
        </el-dialog> -->
      </el-dialog>
    </div>
    <el-dialog v-if="taskFlightData.visible" :visible.sync="taskFlightData.visible" :close-on-click-modal="false" width="660px" append-to-body class="other-dialog dialog-task-flight-warn" @close="clearAllTaskFlightData">
      <div slot="title" class="dialog-header">
        <img :src="require('@img/title_deco.png')"/>
        <span class="header-title">提示</span>
      </div>
      <div class="dialog-body">
        <div class="task-flight-cont">
          <div>
            <div class="task-flight-task"></div>
            <div><p class="other-dialog-tip">任务名称</p></div>
            <div><p class="other-dialog-cont">{{ taskFlightData.data.taskName }}</p></div>
          </div>
          <div>
            <div class="task-flight-flight"></div>
            <div><p class="other-dialog-tip">保障航班</p></div>
            <div><p class="other-dialog-cont">{{ (this.taskFlightData.data.flightNoA&&this.taskFlightData.data.flightNoD)?(this.taskFlightData.data.flightNoA+'/'+this.taskFlightData.data.flightNoD):((this.taskFlightData.data.flightNoA?this.taskFlightData.data.flightNoA:'')+(this.taskFlightData.data.flightNoD?this.taskFlightData.data.flightNoD:'')) }}</p></div>
          </div>
          <div>
            <div class="task-flight-user"></div>
            <div><p class="other-dialog-tip">保障单元/执行人</p></div>
            <div><p class="other-dialog-cont">{{ taskFlightData.data.name }}</p></div>
          </div>
        </div>
        <div class="task-flight-remark"><p>备注：</p><el-input type="input" v-model.trim="taskFlightData.queryData.remark" :maxlength="30"></el-input></div>
        <div><p class="other-dialog-cont">请确认任务分配信息！</p></div>
        <div><p class="other-dialog-tip">确认后若需撤销分配可点击任务胶囊</p></div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="info" @click="handleTaskFlightClose">取 消</el-button>
        <el-button type="primary" @click="handleTaskFlightSave" :loading="taskFlightData.loading">{{taskFlightData.loading?'分配中':'确 定'}}</el-button>
      </div>
    </el-dialog>
    <el-dialog v-if="specialTaskData.visible" :visible.sync="specialTaskData.visible" :close-on-click-modal="false" width="760px" append-to-body class="other-dialog dialog-special-task" @close="closeSpecialTaskData">
      <div slot="title" class="dialog-header">
        <img :src="require('@img/title_deco.png')"/>
        <span class="header-title">新增任务</span>
      </div>
      <div class="dialog-body">
        <div class="special-task-opt">
          <div>请选择需要添加的任务块，可多选：</div>
          <div>
            <div v-for="(item, index) in specialTaskData.options" :key="index" @click="selectSpecialTask(item)" :class="~require('lodash').findIndex(specialTaskData.selectArr, ['taskNo', item.taskNo]) ? 'div-button-select div-button' : 'div-button'">{{item.taskCn}}</div>
          </div>
        </div>
        <div class="special-task-select">
          <div>已选任务：</div>
          <div>
            <div v-for="(item, index) in specialTaskData.selectArr" :key="index">{{item.taskCn}}</div>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="info" @click="closeSpecialTaskData">取 消</el-button>
        <el-button type="primary" @click="saveSpecialTask" :loading="specialTaskData.loading">{{specialTaskData.loading?'新增中':'确 定'}}</el-button>
      </div>
    </el-dialog>
  </el-container>
</div>
</template>

<script>
import $ from 'jquery'
import QueryView from '../../components/common/QueryView'
import WarningBoxView from '../../components/common/WarningBoxView'
import MessageView from './MessageView'
import baseMixin from '../../components/mixin/baseMixin'
import basicTableMixin from '../../components/mixin/basicTableMixin'
import wholeTableMixin from '../../components/mixin/wholeTableMixin'
import basicMsgMixin from '../../components/mixin/basicMsgMixin'
import webSocketMixin from '../../components/mixin/webSocketMixin'
import {postDataOther, queryAll, postData} from '../../api/base.js'
import {compareSort} from '../../util/util.js'
import colResizable1 from '../../../static/colResizable-1.6.js'
import _ from 'lodash'

export default {
  components: {
    QueryView,
    WarningBoxView,
    MessageView
  },
  mixins: [baseMixin, basicTableMixin, basicMsgMixin, wholeTableMixin, webSocketMixin],
  data () {
    return {
      onlineStatusIntervalTime: 10 * 1000,
      resGanttOpenWin: null,
      flightGanttOpenWin: null,
      // 操作table宽度
      divOprTableStyle: {
        width: '90px'
      },
      // 手动resize列宽
      resizeConf: {
        resizeMode: 'flex',
        // postbackSafe: true,
        gripInnerHtml: '<div class="grip"></div>',
        draggingClass: 'dragging',
        // HEADERONLY: true,
        fixed: false,
        onResize: this.onTableResized
      },
      // 任务列表排序方式
      taskSorts: [
        {
          key: 'desc',
          label: '任务数降序'
        }, {
          key: 'asc',
          label: '任务数升序'
        }
      ],
      dfsUrl: '',
      // 更新保障单元查询时请求路径
      pushWebsocketUrl: '/aoms-job/websocket/push',
      // 撤销任务/任务编辑 请求URL
      taskButtonUrl: 'taskscheduling/vue/dynamicTask/queryTaskDetail',
      // 撤销任务/任务编辑 弹出框控制
      taskButtonData: {
        editVisible: false,
        loading: false,
        outLoading: false,
        width: '660px',
        class: ' dialog-cancel-warn',
        info: '确认要撤销任务分配吗？',
        type: 0,
        data: {},
        style: {
          'max-height': window.innerHeight - 590 + 'px'
        },
        formData: {
          button: '',
          textarea: ''
        },
        timeData: {
          startTime: '',
          endTime: ''
        },
        visible: false
      },
      // 撤销任务保存URL
      saveTaskCancelUrl: 'taskscheduling/dynamicTask/recallDynamicTask',
      // 修改时间保存URL
      saveTimeEditUrl: 'taskscheduling/dynamicTask/updateDynamicTask',
      // 获取特殊任务URL
      getSpecialTaskUrl: '/taskscheduling/vue/dynamicTask/querySpecialTask',
      // 保存特殊任务URL
      saveSpecialTaskUrl: '/sysconfig/empTask/saveSpecialTask',
      specialTaskData: {
        visible: false,
        loading: false,
        options: [],
        selectArr: []
      },
      // 只在线
      taskOnline: true,
      // 只空闲
      taskFree: false,
      // 选中任务排序方式
      taskSortSelect: '',
      // 请求路径
      queryUrl: 'vue/taskPage/queryList',
      // 查询条件每行个数
      colSize: 5,
      // 查询条件设置
      queryList: [
        {
          // span: '机位号',
          key: 'stand',
          value: '',
          type: 'input',
          inputText: '机位号',
          span: 4
        }, {
          // span: '航班号',
          key: 'flightNo',
          value: '',
          type: 'input',
          inputText: '航班号',
          toUpper: true,
          span: 4
        }, {
          // 'span': '日期',
          key: 'execDateFlag',
          tabsKey: 'execDateFlag',
          value: 0,
          defaultValue: 0,
          type: 'tabs',
          size: 'small',
          inputText: '',
          options: [{
            key: -1,
            value: '昨天'
          }, {
            key: 0,
            value: '今天'
          }, {
            key: 1,
            value: '明天'
          }],
          'span': 3
        }
      ],
      // 航班类型过滤条件
      flightType: 'all',
      // 任务类型过滤条件
      taskType: 'normal',
      // 列表设置
      tableData: {
        /* loading: false,
        isOperat: 0,
        height: tableHeight, */
        data: [],
        /* stripe: true,
        highlight: true,
        headerCellClass: 'tableHeaderCell-Center',
        rowClassName: this.tableRowClassName,
        selection: true, */
        fields: [
          {prop: 'mark', label: '', width: '40', minWidth: '40', fixed: true, hidden: false},
          {prop: 'flightNoA', label: '进港航班', width: '80', minWidth: '80', fixed: true, hidden: false},
          {prop: 'flightNoD', label: '出港航班', width: '80', minWidth: '80', fixed: true, hidden: false},
          {prop: 'stand', label: '机位', width: '80', minWidth: '80', childClass: 'standClass', fixed: true, hidden: false},
          {prop: 'aircraftType', label: '机型', width: '80', minWidth: '80', fixed: true, hidden: false},
          /* {prop: 'routeCh', label: '航线', width: '240', fixed: true, hidden: false}, */
          {prop: 'preDepTime', label: '前起', width: '80', minWidth: '80', fixed: false, hidden: false, class: 'td-left-border'},
          {prop: 'arrvTime', label: '到达', width: '80', minWidth: '80', fixed: false, hidden: false, class: 'td-left-border'},
          {prop: 'deptTime', label: '起飞', width: '80', minWidth: '80', fixed: false, hidden: false, class: 'td-left-border td-left-right-border'},
          {prop: 'pgCountA', label: '货/邮/行(进)', width: '120', fixed: true, hidden: false},
          {prop: 'pgCountD', label: '货/邮/行(出)', width: '120', fixed: true, hidden: false},
          {prop: 'abCountA', label: '成人/婴儿(进)', width: '120', fixed: true, hidden: false},
          {prop: 'abCountD', label: '成人/婴儿(出)', width: '120', fixed: true, hidden: false}/* ,
          {prop: 'progressStatusNameCA', label: '进港状态', width: '100', fixed: false, hidden: false},
          {prop: 'progressStatusNameCD', label: '出港状态', width: '100', fixed: false, hidden: false} */
        ],
        taskFields: []
      },
      // 右侧班组人员查询路径
      rightUrl: 'permission/taskscheduling/task/queryEmpByTask',
      // 获取权限任务路径
      queryTaskUrl: 'permission/taskscheduling/task/queryOwnTaskByEmp',
      // 获取默认隐藏/显示列路径
      queryDefaultRowUrl: 'sysconfig/empTask/list',
      // 保存默认隐藏/显示列路径
      saveDefaultRowUrl: 'sysconfig/empTask/saveAll',
      deptName: '',
      // 右侧列表班组查询条件
      rightQueryData: {
        name: '',
        taskNo: ''
      },
      // 右侧任务下拉框数据
      taskArr: [],
      // 右侧班组人员列表
      rightDrag: [],
      // 根据班组Id获取人员路径
      getTeamEmpUrl: 'organization/teamemployee/queryByTaskAndTeam',
      // 班组Id对应人员信息
      teamEmpArr: [],
      saveTaskFlightUrl: 'taskscheduling/dynamicTask/saveDistribution',
      taskFlightData: {
        visible: false,
        loading: false,
        data: {},
        queryData: {
          remark: ''
        }
      },
      showImg: false,
      imgSrc: null
    }
  },
  watch: {
    queryList: function (newValue, oldValue) {
      this.text = 'Waiting for the value to changed...'
      /* this.debouncedGetAnswer()
      console.log('value2 is changed :' + oldValue + ' to ' + newValue) */
    }
  },
  created () {
    this.getTaskSelectOptions()
    this.getTaskCol()
    this.getDefaultRow()
    this.taskSortSelect = this.taskSorts[0].label
  },
  mounted () {
    this.timer = setInterval(this.handleQueryTeam, this.onlineStatusIntervalTime)
    window.name = this.$route.name
    this.deptName = localStorage.getItem('deptName')
    const that = this
    this.$store.commit('setConfigValue', 'dfsUrl')
    this.dfsUrl = this.$store.getters.getConfigValue
    // this.$nextTick(() => {
      var resizeMain = this.$refs['resize-table'].$el.querySelector('.el-main')
      var top1 = resizeMain.getBoundingClientRect().top
      this.wholeMounted(top1)
      resizeMain.style.height = window.innerHeight - top1 - 20 + 'px'
      $('.left-table_header').colResizable(this.resizeConf)
      window.onresize = () => {
        this.$nextTick(() => {
          return (() => {
            var top2 = resizeMain.getBoundingClientRect().top
            resizeMain.style.height = window.innerHeight - top2 - 20 + 'px'
            this.wholeMounted(top1)
            this.taskButtonData.style['max-height'] = window.innerHeight - 590 + 'px'
          })()
        })
      }
    // })
  },
  methods: {
    skipToResGantt () {
      var name = '资源甘特图'
      const {href} = this.$router.resolve({
        name: name
      })
      this.resGanttOpenWin = window.open(href, name)
    },
    skipToFlightGantt (item) {
      var name = '航班保障甘特图'
      localStorage.setItem('flightGanttA', item.dynamicFlightIdA)
      localStorage.setItem('flightGanttD', item.dynamicFlightIdD)
      if (this.flightGanttOpenWin) {
        var pushData = {
          type: 4
        }
        postDataOther(this.pushWebsocketUrl, pushData).then(res => {
          if (res.data.code != 0) {
            this.showError('同步更新航班保障甘特图', '请重试 !')
          }
        })
      }
      const {href} = this.$router.resolve({
        name: name
      })
      this.flightGanttOpenWin = window.open(href, name)
    },
    addSpecialTask (item) {
      var data = {
        dynamicFlightIdA: item.dynamicFlightIdA,
        dynamicFlightIdD: item.dynamicFlightIdD
      }
      postData(this.getSpecialTaskUrl, data).then(res => {
        if (res.data.code == 0) {
          this.specialTaskData.options = res.data.data
          this.specialTaskData.visible = true
        }
      })
    },
    selectSpecialTask (item) {
      var index = _.findIndex(this.specialTaskData.selectArr, ['taskNo', item.taskNo])
      if (~index) {
        this.specialTaskData.selectArr.splice(index, 1)
      } else {
        this.specialTaskData.selectArr.push(item)
      }
    },
    saveSpecialTask () {
      var data = {
        dynamicTaskIds: _.map(this.specialTaskData.selectArr, 'dynamicTaskId'),
        taskNos: _.map(this.specialTaskData.selectArr, 'taskNo')
      }
      this.specialTaskData.loading = true
      postData(this.saveSpecialTaskUrl, data).then(res => {
        if (res.data.code == 0) {
          this.showSuccess('新增特殊任务')
          this.closeSpecialTaskData()
          this.showSpecialTask(data.taskNos)
        } else {
          this.showError('新增特殊任务', '请重新尝试 !')
        }
        this.specialTaskData.loading = false
      })
    },
    showSpecialTask (taskNos) {
      _.forEach(taskNos, (taskNo) => {
        var index = _.findIndex(this.tableData[this.customOtherFields()], ['prop', taskNo])
        if (~index) {
          this.handleEye(this.tableData[this.customOtherFields()][index], index, 'right', true)
        }
      })
    },
    closeSpecialTaskData () {
      this.specialTaskData.loading = false
      this.specialTaskData.visible = false
      this.specialTaskData.options = []
      this.specialTaskData.selectArr = []
    },
    handleShow (event) {
      this.clickTaskDiv = true
    },
    queryAllData (flag) {
      this.queryDataReq()
      this.handleQueryTeam(flag)
    },
    customUpdateTableWidth (otherFieldsWidth) {
      $('.right-table_header').colResizable(this.resizeConf, otherFieldsWidth)
    },
    getTeamEmp (teamId, taskNo) {
      queryAll(this.getTeamEmpUrl, {'teamId': teamId, 'taskNo': taskNo}).then(res => {
        if (res.data.code == 0) {
          this.teamEmpArr = res.data.data
        }
      })
    },
    customOtherFields () {
      return 'taskFields'
    },
    // 保存显示/隐藏列 save保存事件
    saveDefaultRow () {
      this.saveDefaultRowReq('taskFields')
    },
    // 自定义追加查询条件（按钮查询事件）
    customQueryMethod () {
      switch (this.flightType) {
        case 'all': this.$delete(this.queryData, 'remark')
                    this.$delete(this.queryData, 'mark')
                    break
        case 'remark':this.$delete(this.queryData, 'mark')
                      this.$set(this.queryData, 'remark', 'N')
                      break
        case 'mark':this.$delete(this.queryData, 'remark')
                    this.$set(this.queryData, 'mark', true)
                    break
      }
    },
    filterChange () {},
    setRowIndex ({row, rowIndex}) {
      row.index = rowIndex
    },
    handleQueryTeam (flag) {
      localStorage.setItem('resGanttTaskNo', this.rightQueryData.taskNo)
      queryAll(this.rightUrl, this.rightQueryData).then(response => {
        if (response.data.code == 0) {
          if (flag == 'change') {
            var pushData = {
              type: 3,
              data: this.rightQueryData
            }
            postDataOther(this.pushWebsocketUrl, pushData).then(res => {
              if (res.data.code != 0) {
                this.showError('同步更新资源甘特图', '请重试 !')
              }
            })
          }
          this.rightDrag = response.data.data
          this.selectTaskSort(null, flag)
         /*  this.taskArr = response.data.data
          if (this.taskArr.length > 0) {
            this.rightQueryData.taskNo = this.taskArr[0]
          } */
        }
      })
    },
    getTaskSelectOptions () {
      this.taskArr = this.$store.getters.getTaskColOption
      if (this.taskArr.length > 0) {
        this.rightQueryData.taskNo = this.taskArr[0].key
        this.handleQueryTeam()
      }
    },
    getTaskCol () {
      var options = this.$store.getters.getTaskColOption
      options.forEach(item => {
        let obj = {prop: item.key, label: item.label, width: '117', minWidth: '117', fixed: false, hidden: false, formatter: this.formatterMin}
        this.tableData.taskFields.push(obj)
      })
    },
    // 拖拽触发事件相关
    dragFlight (event) {
      event.dataTransfer.setData('afid', event.target.id)
      this.$set(this.taskFlightData.data, 'flightNoA', event.target.dataset.flighta)
      this.$set(this.taskFlightData.data, 'flightNoD', event.target.dataset.flightd)
    },
    dragData (event) {
      event.dataTransfer.setData('dataId', event.target.id)
      event.dataTransfer.setData('type', event.target.dataset.type)
      event.dataTransfer.setData('task', event.target.dataset.task)
      this.$set(this.taskFlightData.data, 'name', event.target.dataset.name)
      this.$set(this.taskFlightData.data, 'taskName', event.target.dataset.taskname)
    },
    dropFlight (event) {
      event.preventDefault()
      let dataId = event.dataTransfer.getData('dataId')
      if (dataId) {
        this.$set(this.taskFlightData.data, 'flightNoA', event.currentTarget.dataset.flighta)
        this.$set(this.taskFlightData.data, 'flightNoD', event.currentTarget.dataset.flightd)
        let type = event.dataTransfer.getData('type')
        let taskNo = event.dataTransfer.getData('task')
        let afid = event.currentTarget.id
        let item = null
        for (let i = 0; i < this.tableData.data.length; i++) {
          if (this.tableData.data[i].afid == afid) {
            item = this.tableData.data[i]
            break
          }
        }
        if (item != null) {
          if (item.taskDataMap.hasOwnProperty(taskNo)) {
            this.taskFlightData.queryData = {
              'afid': afid,
              'id': dataId,
              'taskNo': taskNo,
              'type': type,
              'remark': this.taskFlightData.queryData.remark
            }
            this.taskFlightData.visible = true
          } else {
            this.showError('分配', '当前航班未分配所选任务 !')
          }
        }
      }
    },
    dropData (event) {
      event.preventDefault()
      let afid = event.dataTransfer.getData('afid')
      if (afid) {
        let target = this.getTargetLi(event.target)
        this.$set(this.taskFlightData.data, 'name', target.dataset.name)
        this.$set(this.taskFlightData.data, 'taskName', target.dataset.taskname)
        let dataId = target.id
        let taskNo = target.dataset.task
        let type = target.dataset.type
        let item = null
        for (let i = 0; i < this.tableData.data.length; i++) {
          if (this.tableData.data[i].afid == afid) {
            item = this.tableData.data[i]
            break
          }
        }
        if (item != null) {
          if (item.taskDataMap.hasOwnProperty(taskNo)) {
            this.taskFlightData.queryData = {
              'afid': afid,
              'id': dataId,
              'taskNo': taskNo,
              'type': type
            }
            this.taskFlightData.visible = true
          } else {
            this.showError('分配', '当前航班未分配所选任务 !')
          }
        }
      }
    },
    allowDrop (colorType, event) {
      if (colorType != 1) {
        event.preventDefault()
      }
    },
    clearAllTaskFlightData () {
      this.taskFlightData = {
        visible: false,
        data: {},
        queryData: {
          remark: ''
        }
      }
    },
    // 递归获取任务列表中event对应的li
    getTargetLi (target) {
      if (target.localName == 'li') {
        return target
      } else {
        let targ = this.getTargetLi(target.parentNode)
        return targ
      }
    },
    // 调整列宽事件
    onTableResized (event) {
      var tableClass = event.currentTarget.classList[0]
      var classArr = tableClass.split('-')
      var fields = []
      var columns = $(event.currentTarget).find('th')
      var JCLRgrips = $(event.currentTarget.parentElement).find('.JCLRgrips')
      var table = $(event.currentTarget.parentElement).find('table')
      var widthSum = 0
      let count = 0
      switch (classArr[0]) {
        case 'left':fields = this.tableData.fields
                    break
        case 'right':fields = this.tableData.taskFields
                    break
      }
      columns.each(function (index, item) {
        let width = $(this).width()
        fields[index].width = width
        if (!fields[index].hidden) {
          widthSum += parseInt(width)
          count += 1
        }
      })
      if (classArr[0] == 'left') {
        this.divLeftTableStyle.width = widthSum + 2 + 'px'
        JCLRgrips.width(widthSum)
        this.divRightTableStyle.width = 'calc(100% - ' + this.divLeftTableStyle.width + ' - ' + this.divOprTableStyle.width + ')'
        /* table.css('margin-left', '1px') */
      } else if (classArr[0] == 'right') {
        var rightTableBody = $(event.currentTarget.parentElement).parent().parent().find('table')
        rightTableBody.splice(1, 1)
        rightTableBody.width(widthSum)
        JCLRgrips.width(widthSum + 1)
      }
      /* table.width(widthSum + 10) */
    },
    // 自定义websocket获取数据后操作
    customWsOnMessage (data) {
      if (data.type == 1) {
        this.queryAllData()
        // this.queryDataReq()
        // this.tableData.data.splice(data.data.oldIndex, 1)
        // this.tableData.data.splice(data.data.newIndex, 0, data.data.row)
      } else if (data.type == 0) {
        this.queryAllData()
        // this.queryDataReq()
      }
    },
    // 任务列表排序方式选中
    selectTaskSort (taskSort, flag) {
      if (taskSort) {
        this.taskSortSelect = taskSort.label
      }
      var sort = ''
      this.taskSorts.forEach(item => {
        if (this.taskSortSelect == item.label) {
          sort = item.key
        }
      })
      if (flag == 'change') {
        var pushData = {
          type: 3,
          sort: sort
        }
        postDataOther(this.pushWebsocketUrl, pushData).then(res => {
          if (res.data.code != 0) {
            this.showError('同步更新资源甘特图', '请重试 !')
          }
        })
      }
      this.rightDrag = _.orderBy(this.rightDrag, ['taskCount'], sort)
      // this.rightDrag.sort(compareSort('taskCount', sort))
    },
    // 筛选任务在线状态
    filterOnline () {
      this.taskOnline = !this.taskOnline
    },
    // 筛选任务在线状态
    filterFree () {
      this.taskFree = !this.taskFree
    },
    // 撤销分配 点击按钮触发事件
    cancelTaskButtonClick (data) {
      queryAll(this.taskButtonUrl, {'dynamicTaskId': data.dynamicTaskId}).then(res => {
        if (res.data.code == 0) {
          this.taskButtonData.data = res.data.data
          this.taskButtonData.editVisible = true
          this.taskButtonData.type = 1
        }
      })
    },
    // 修改时间 点击按钮触发事件
    editTaskButtonClick (data) {
      var _this = this
      queryAll(this.taskButtonUrl, {'dynamicTaskId': data.dynamicTaskId}).then(res => {
        if (res.data.code == 0) {
          _this.taskButtonData.data = res.data.data
          _this.taskButtonData.timeData.startTime = _this.taskButtonData.data.beginTimeA
          _this.taskButtonData.timeData.endTime = _this.taskButtonData.data.endTimeA
          _this.taskButtonData.editVisible = true
          _this.taskButtonData.type = 2
        }
      })
    },
    // 撤销分配/修改时间 关闭按钮事件
    handleTaskButtonClose () {
      this.taskButtonData.editVisible = false
      this.taskButtonData.formData = {
        button: '',
        textarea: ''
      }
      this.taskButtonData.timeData = {
        startTime: '',
        endTime: ''
      }
    },
    handleTaskFlightClose () {
      this.taskFlightData.visible = false
      this.taskFlightData.loading = false
      this.clearAllTaskFlightData()
    },
    // 撤销分配 撤销按钮事件
    handleCancelButtonSave () {
      this.taskButtonData.loading = true
      var data = {
        dynamicTaskId: this.taskButtonData.data.dynamicTaskId,
        reserved1: this.taskButtonData.formData.button
      }
      if (this.taskButtonData.formData.button == 'other') {
        data.reserved1 = this.taskButtonData.formData.textarea
      }
      queryAll(this.saveTaskCancelUrl, data).then(res => {
        this.taskButtonData.loading = false
        if (res.data.code == 0) {
          this.showSuccess('任务撤销')
          this.taskButtonData.visible = false
          this.taskButtonData.editVisible = false
          this.taskButtonData.type = 0
          this.taskButtonData.data = {}
          this.taskButtonData.formData = {
            button: '',
            textarea: ''
          }
        } else {
          this.showError('任务撤销', '任务撤销失败，请联系管理员 !')
        }
      }).catch(() => {
        this.taskButtonData.loading = false
      })
    },
    // 撤销分配/修改时间 确定按钮事件
    handleTaskButtonSave () {
      if (this.taskButtonData.type == 1) {
        this.taskButtonData.visible = true
      } else if (this.taskButtonData.type == 2) {
        this.taskButtonData.outLoading = true
        var edit = {
          dynamicTaskId: this.taskButtonData.data.dynamicTaskId,
          beginTimeA: this.taskButtonData.timeData.startTime,
          endTimeA: this.taskButtonData.timeData.endTime
        }
        queryAll(this.saveTimeEditUrl, edit).then(res => {
          this.taskButtonData.outLoading = false
          if (res.data.code == 0) {
            this.showSuccess('任务时间修改')
            this.taskButtonData.editVisible = false
            this.taskButtonData.type = 0
            this.taskButtonData.data = {}
            this.taskButtonData.formtimeDataData = {
              startTime: '',
              endTime: ''
            }
          } else {
            this.showError('任务时间修改', '任务时间修改失败，请联系管理员 !')
          }
        }).catch(() => {
          this.taskButtonData.outLoading = false
        })
      }
    },
    // 分配任务 确定按钮事件
    handleTaskFlightSave () {
      this.taskFlightData.loading = true
      queryAll(this.saveTaskFlightUrl, this.taskFlightData.queryData).then(res => {
        this.taskFlightData.loading = false
        if (res.data.code == 0) {
          this.clearAllTaskFlightData()
          this.showSuccess('分配')
          this.handleQueryTeam()
        } else if (res.data.code == -1 && res.data.msg != null) {
          this.showError('分配', res.data.msg)
        } else {
          this.showError('分配', '分配失败，请联系管理员 !')
        }
      }).catch(() => {
        this.taskFlightData.loading = false
      })
    },
    showWinImg (src) {
      this.showImg = true
      this.imgSrc = src
    }
  },
  computed: {
    /* comMessage: function (value1) {
      return this.message + value1
    },
    comMessage2: function (value2) {
      return this.message + value2
    } */
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.contextmenu-card {
  position: absolute;
  z-index: 3
}
/* ************************航班列表点击样式开始************************ */
.tasksched-table-container1 .hover-row * {
  background-color: #7bb3f7 !important
}
.tasksched-table-container1 .current-row * {
  background-color: #0f7bff;
  color: #fff
}
/* ************************航班列表点击样式结束************************ */
/* ****************航班列表/班组列表 宽高begin**************** */
.tasksched-table-container1 {
  margin-right: 16px;
  width: calc(100% - 430px);
}
.tasksched-table-container2 {
  width: 410px;
}
/* ****************航班列表/班组列表 宽高end**************** */
/* **********************任务table字体样式开始********************** */
.right-table_body tr,
.right-table_body_block tr {
  background-color: #0e3042;
}
.right-table_body td {
  color: #081a25;
  overflow: hidden;
  padding: 0;
  border-radius: 6px;
  position: relative;
}
.task-field-div .at {
  text-decoration: underline;
}
/* *******任务table背景颜色开始******** */
.right-table_body .body-tr-div {
  height: 30px !important;
  padding: 9px 5px;
}
.right-table_body .body-tr-div-hidden {
  padding: 0;
}
.right-table_body .body-tr-div .task-field-div {
  box-sizing: border-box;
  height: 30px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}
.right-table_body .body-tr-div .task-field-div:hover {
  color: #fff;
  opacity: 0.8;
}
.task-right-click-tip {
  height: 80px;
}
.task-right-click-tip>div:first-child:not(.div-disabled):hover {
  border-radius: 8px 8px 0 0;
  background-color:rgba(60,166,200,0.4);
}
.task-right-click-tip>div:last-child:not(.div-disabled):hover {
  border-radius: 0 0 8px 8px;
  background-color:rgba(60,166,200,0.4);
}
.task-right-click-tip .tip-first {
  border-bottom: 1px solid rgba(60, 166, 200, 0.7);
}
.task-right-click-tip>div {
  height: 50%;
  text-align: center;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  line-height: 40px;
  padding-left: 33px;
}
.task-right-click-tip>div>div {
  float: left;
}
.task-right-click-tip>div>div:first-child {
  margin: 10px 10px 10px 0;
  width: 20px;
  height: 20px;
}
.tip-undo {
  background: url('./../../assets/img/icon_menu_undo.png');
}
.tip-edit {
  background: url('./../../assets/img/icon_menu_edit.png');
}
/* 正常完成 */
.tasksched-table-container1 .right-table_body .NormalFinished {
  background-color: #03a786;
}
/* 超时完成 */
.tasksched-table-container1 .right-table_body .OvertimeFinished {
  background-color: #e65069;
}
/* 保障异常 */
.tasksched-table-container1 .right-table_body .ExceptionFinished {
  background-color: #fdcf53;
}
/* 正在保障(动态) */
.tasksched-table-container1 .right-table_body .Ensuring {
  background-color: #03a786;
}
/* 正在保障超时(动态) */
.tasksched-table-container1 .right-table_body .EnsureOvertime {
  background-color: #e65069;
}
/* 正在保障异常(动态) */
.tasksched-table-container1 .right-table_body .EnsureException {
  background-color: #fdcf53;
}
/* 黄点 */
.yellow-spot {
  width: 8px;
  height: 8px !important;
  background: #fdcf53;
  border-radius: 50%;
  position: relative;
  float: right;
  right: -4px;
  top: -38px;
}
/* 拒绝戳 */
.refuse-spot {
  width: 24px;
  height: 24px !important;
  position: relative;
  float: right;
  right: -12px;
  top: -45px;
  background-image: url('../../assets/img/tg_reject.png');
  z-index: 50;
}
/* 未分配(黄点) */
.tasksched-table-container1 .right-table_body .NoDistribute {
  background-color: #45738f;
}
/* 已分配未接受 */
.tasksched-table-container1 .right-table_body .Distributed {
  background-color: #45738f;
}
/* 已接受未执行 */
.tasksched-table-container1 .right-table_body .Accepted {
  background-color: #7eb3d6;
}
/* 已接受未开始异常 */
.tasksched-table-container1 .right-table_body .AcceptedException {
  background-color: #7eb3d6;
  border: 2px solid #fdcf53;
}
/* 已接受未开始超时 */
.tasksched-table-container1 .right-table_body .AcceptedOvertime {
  background-color: #7eb3d6;
  border: 2px solid #e65069;
}
/* ****任务table背景颜色结束**** */
/* **********************任务table字体样式结束********************** */
/* *************************右侧班组列表开始************************** */
/* header */
.tasksched-task-header {
  float: left;
  width: 100%;
  height: 80px !important;
  line-height: 0 !important;
}
.tasksched-task-header div {
  height: 32px;
  margin: 5px 0 !important;
  width: 100% !important;
}
/* body */
.tasksched-table-container2>.el-main {
  margin: 0 20px;
}
.tasksched-task-body {
  float: left;
  width: 100%;
  height: calc(100% - 80px);
}
.task-body-ul {
  height: calc(100% - 20px);
  overflow: hidden;
  padding-top: 20px;
}
.tasksched-task-body ul {
  margin: 0;
  padding-left: 0;
  list-style: none;
  height: 100%;
  overflow-y: scroll;
}
.task-list-li {
  height: 60px;
  background: rgba(54, 140, 180, 0.4);
  border-radius: 8px;
  margin: 0 0 10px 0;
}
.task-list-li:hover {
  background: rgba(54, 140, 180, .6);
}
.task-list-li div {
  float: left;
}
/* 头像 */
.li-head {
  height: 44px;
  width: 44px;
  margin: 8px 12px 8px 16px;
}
.li-head div {
  height: 100%;
  width: 100%;
  border-radius: 50%;
}
.head-no-online {
  opacity: 0.4;
}
/* 文字 */
.li-font {
  width: calc(100% - 172px);
  height: 100%;
}
.li-font-name {
  font-size: 16px;
  width: 100%;
  line-height: 16px;
  height: 16px;
  margin: 12px 0 0 0;
  white-space:nowrap;
  text-overflow:ellipsis;
}
.li-font-name>div {
  float: left;
}
.li-font-name .font-name {
  color: #fff;
}
.font-online {
  color: #03bf99;
}
.font-no-online {
  color: #7a939e;
}
.li-font-task-flight {
  color: #7a939e;
  font-size: 14px;
  line-height: 18px;
  width: 100%;
  margin-top: 10px;
  display: flex;
  align-items: center;
}
.li-font-task-flight div {
  float: left;
}
.font-label {
  min-width: 70px;
}
/* .font-flight {
  color: #03bf99;
  float: left;
  height: 18px;
}
.font-flight p {
  margin: 0;
} */
.font-flight-div {
  flex-grow: 1;
}
.font-flight {
  color: #060d14;
  float: left;
  height: 18px;
  background: #fdcf53;
  border-radius: 4px;
  font-weight: bold;
  padding: 0 2px;
}
.font-flight p {
  margin: 0 1px 0 0;
}
/* 标志&按钮 */
.li-img {
  width: 90px;
  height: 30px;
  margin: 15px 5px;
  float: right !important;
}
.li-img .li-img-img {
  cursor: pointer;
}
.li-img .li-img-img:hover {
  opacity: 0.8;
}
.li-img>div,
.li-img>span {
  width: 30px;
  height: 30px;
  text-align: center;
  line-height: 30px;
}
.li-img-popover>header {
  height: 40px;
  color: #fff;
  font-size: 18px;
  padding-left: 14px;
}
.li-img-popover>main {
  max-height: 410px;
  margin: 0 14px 20px 14px;
}
.li-img-popover ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.img-font {
  font-size: 20px;
}
.img-flag.noTask {
  background-image: url('./../../assets/img/icon_flag_yellow.png');
}
.img-flag.hasTask {
  background-image: url('./../../assets/img/icon_flag_green.png');
}
.img-font.noTask {
  color: #fdcf53;
}
.img-font.hasTask {
  color: #03bf99
}
/* footer */
.tasksched-table-container2 .el-footer {
  border-top: 1px solid rgba(60, 166, 200, 0.2)
}
.tasksched-task-footer {
  float: left;
  width: 100%;
  height: 60px;
  font-size: 14px;
}
.tasksched-task-footer>div {
  height: 100%;
}
.task-footer-left {
  float: left;
}
.tasksched-task-footer>div>div {
  margin-top: 13px;
}
.task-footer-left>div {
  width: 120px;
}
.task-footer-right {
  float: right;
}
.task-footer-right>div {
  float: left;
  width: 70px;
  margin-left: 10px;
  line-height: 32px;
}
.task-footer-left>.div-button:hover,
.task-footer-right>.div-button:hover {
  color: #fff;
  opacity: 0.8;
}
/* *************************右侧班组列表结束************************** */
/* **************************弹出框设置开始************************** */
.dialog-body-top {
  background: rgba(60, 166, 200, 0.1);
  border: 1px solid rgba(60, 166, 200, 0.5);
  box-shadow: 0px 0px 30px rgba(60, 166, 200, 0.3) inset;
  border-radius: 8px;
  padding: 16px 20px;
  margin: 0 0 30px 0;
}
.dialog-body-top .task-button-team-emp-title {
  margin-bottom: 0 !important;
}
.dialog-body-top .task-button-team-emp-div {
  display: flex;
  flex-flow: row wrap;
  height: auto !important;
  min-height: 16px;
}
.dialog-body-top .task-button-team-emp-div>p {
  margin: 12px 10px 0 0;
  height: 16px;
}
.dialog-body-top .el-row:not(:last-child),
.dialog-body-bottom.edit-time-bottom .el-row:not(:first-child) {
  margin-bottom: 20px;
}
.dialog-body-top .el-row:last-child .el-col>div:last-of-type {
  height: auto;
  word-wrap: break-word;
}
.dialog-body-top .el-col,
.dialog-body-bottom.edit-time-bottom .el-col {
  min-height: 42px;
}
.dialog-body-top .el-col>div:first-child,
.dialog-body-bottom.edit-time-bottom .el-col>div:first-child {
  height: 14px;
  line-height: 14px;
  color: #7a939e;
  font-size: 14px;
  margin-bottom: 12px;
}
.dialog-body-top .el-col>div:last-child,
.dialog-body-bottom.edit-time-bottom .el-col>div:last-child {
  height: 16px;
  line-height: 16px;
  color: #fff;
  font-size: 16px;
}
.dialog-body-bottom.edit-time-bottom .edit-time-reason-div {
  display: flex;
  height: 14px;
  margin-left: 30px;
}
.dialog-body-bottom.edit-time-bottom .edit-time-reason-div .dot-font {
  height: 14px;
  display: flex;
  align-items: center;
}
.dialog-body-bottom.edit-time-bottom .edit-time-reason-div .dot-font>div:first-of-type {
  margin: 0 5px 0 0;
}
.dialog-body-bottom.edit-time-bottom .task-reason-list {
  overflow-y: auto;
  height: auto !important;
  margin-bottom: 20px;
}
.dialog-body-bottom.edit-time-bottom .task-reason-div {
  height: auto;
  display: flex;
  font-size: 16px;
  line-height: 16px;
}
.dialog-body-bottom.edit-time-bottom .task-reason-div>div:first-of-type {
  width: 50px;
  flex-grow: 0;
  font-size: 14px;
}
.dialog-body-bottom.edit-time-bottom .task-reason-div>div:last-of-type {
  margin-bottom: 10px;
}
.dialog-body-bottom.edit-time-bottom .task-reason-div:not(:last-of-type)>div:last-of-type {
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(60, 166, 200, 0.4);
}
.dialog-body-bottom.edit-time-bottom .task-reason-div>span {
  margin-bottom: 10px;
}
.dialog-body-bottom.edit-time-bottom .task-reason-div:not(:last-child)>span {
  border-bottom: 1px solid rgba(60, 166, 200, 0.4);
  padding-bottom: 10px;
}
.dialog-body-bottom.edit-time-bottom .task-reason-div>div:last-of-type>div:last-of-type {
  font-size: 14px;
}
.dialog-body-bottom.edit-time-bottom .task-reason-div .line {
  width: 0;
  margin: 0 10px 0 0;
  padding-bottom: 20px;
  flex-grow: 0;
  border: 1px dashed #223543;
  position: relative;
}
.dialog-body-bottom.edit-time-bottom .task-reason-div .dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  float: left;
  left: -4px;
  top: 3px;
  border: 2px solid;
  position: absolute;
  box-sizing: border-box;
}
.font-color-0 .dot {
  border-color: #fff;
}
.font-color-2 .dot {
  border-color: #fdcf53;
}
.font-color-3 .dot {
  border-color: #e65069;
}
.dialog-body-bottom.edit-time-bottom .task-reason-div>div:last-of-type {
  flex-grow: 0;
  width: calc(100% - 97px);
}
.dialog-body-bottom.edit-time-bottom .task-reason-div .task-reason-popover-slot {
  flex-grow: 0;
  width: 30px;
  height: 30px;
  margin-left: 15px;
  margin-right: 10px;
}
.dialog-body-bottom.edit-time-bottom .task-reason-div .task-reason-popover-slot>div {
  width: 30px;
  height: 30px;
}
.attachment-gray {
  background-image: url('../../assets/img/list_icon_gray.png');
  width: 30px;
  height: 30px;
  padding: 0 !important;
  cursor: auto;
}
.attachment-white {
  background-image: url('../../assets/img/list_icon_white.png');
  width: 30px;
  height: 30px;
  padding: 0 !important;
  cursor: pointer;
}
.dialog-body-bottom.edit-time-bottom .task-reason-div>div:last-of-type>div:first-of-type {
  margin-bottom: 10px;
}
.dialog-body-bottom-first {
  margin: 0 0 16px 0;
  height: 14px;
  line-height: 14px;
  color: #7a939e;
  font-size: 14px;
}
.refuse-reason-div {
  display: flex;
  margin: 0 0 10px 0;
  flex-wrap: wrap;
}
.refuse-reason-div>div {
  margin-right: 10px;
}
.refuse-reason-div>.div-button:hover,
.refuse-reason-other-div>.div-button:hover {
  color: #fff;
}
.refuse-reason-other-div>div:first-child {
  width: 28px;
  margin-bottom: 16px;
}
.dialog-body-bottom .div-button {
  padding-left: 10px;
  padding-right: 10px;
  flex-grow: 0;
  margin-bottom: 10px;
}
.textarea-tip {
  color: #e65069;
  font-size: 14px;
  padding-left: 20px;
}
/* **************************弹出框设置结束************************** */
</style>
