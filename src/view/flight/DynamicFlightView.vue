<template>
<div class="whole-contain flight-contain">
  <div class="flight-url-select-div">
    <el-radio-group v-model="flightUrlSelect" size="small" @change="queryDataReq()">
      <el-radio-button label="real">实时航班查询</el-radio-button>
      <el-radio-button label="history">历史航班查询</el-radio-button>
    </el-radio-group>
  </div>
  <div v-if="flightUrlSelect == 'history'" class="flight-url-his-date-div">
    <el-date-picker type="date" v-model="execDate" placeholder="航班日期" format="yyyy-MM-dd" value-format="yyyy-MM-dd" size="small"
    :default-value="maxDate" :picker-options="pickerOptionsMethod" :clearable="false" @change="queryDataReq()"
    :editable="false" @keyup.enter.native="queryDataReq()"></el-date-picker>
  </div>
  <div class="latest-bg task-latest-bg">
    <div class="latest-time">{{ latestTime }}</div>
    <div class="latest-date">{{ latestDate }}</div>
  </div>
  <el-container direction="vertical" :style="wholeBodyStyle" :class="flightUrlSelect == 'history'?'flight-history-container':''">
    <el-header class="query-contain" style="height: 70px;">
      <Query-view :data="queryRowGroup" class="left" @keyupEnter="queryDataReq()"></Query-view>
      <div class="left-button">
        <el-button type="info" plain @click="cleanQueryData()">清空</el-button>
        <el-button type="primary" @click="queryDataReq()">查询</el-button>
        <el-popover placement="bottom" trigger="manual" v-model="ctrlFVisible" popper-class="ctrl-f-popover" width="274">
          <Query-view :data="ctrlF" @change="changeHandleOfCtrlF" class="right" @keyupEnter="findCtrlF()"></Query-view>
          <div class="ctrl-f-query" @click="findCtrlF()"></div>
          <div class="ctrl-f-close" @click="handleCtrlFButton()"></div>
          <el-button slot="reference" :class="ctrlFVisible?'open':'close'" type="info" @click="handleCtrlFButton()">定位</el-button>
        </el-popover>
        <el-button type="info" @click="exportDynamic()">导出</el-button>
        <el-button type="success" @click="queryDataReq()">刷新</el-button>
      </div>
    </el-header>
    <el-main class="flight-table-main">
      <el-container direction="vertical" :style="tableContStyle" class="flight-table-container table-container" ref="flight-table">
          <el-header>
            <div class="table-header flight-table-header-left">
              <img :src="require('@img/title_deco.png')" />
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
            <div class="flight-table-header-right">
              <div>
                <el-radio-group v-model="flightType" size="small" @change="queryDataReq()">
                  <el-radio-button label="S">所有航班</el-radio-button>
                  <el-radio-button label="A">进港航班</el-radio-button>
                  <el-radio-button label="D">出港航班</el-radio-button>
                  <el-radio-button label="N">异常航班</el-radio-button>
                  <el-radio-button label="SP">特殊航班</el-radio-button>
                  <el-radio-button label="V">VIP航班</el-radio-button>
                  <el-radio-button label="XXX">临界航班</el-radio-button>
                  <el-radio-button label="M">关注航班</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </el-header>
        <el-main class="whole-table-main">
          <div class="div-left-table" :style="divLeftTableStyle">
            <div class="div-left-table_header" :style="divLeftTableStyle">
              <table cellpadding="0" cellspacing="0" class="left-table_header">
                <thead>
                  <tr>
                    <th v-show="!item.hidden" v-for="(item, index) in tableData.fields" :key="index" :width="item.width">{{item.label}}</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div class="div-left-table_body" :style="divTableBodyStyle" @mousewheel="scrollEvent">
              <table cellpadding="0" cellspacing="0" class="left-table_body" ref="wholeTable">
                <tbody>
                  <tr v-for="(item, index) in tableData.data" :key="index" :class="[tableRowClassName({'row': item, 'rowIndex': index}), tableClickRowClass[index]?'is-active':'']"
                  @click="clickRow(index)" @dblclick="showFlightEdit(index)"><!--  @contextmenu.prevent="tableRowContextmenu(item, $event)" -->
                    <div v-for="field in tableData.fields" :key="field.prop" :class="field.hidden?'body-tr-div':'body-tr-div show-field'" :style="!field.hidden && {width: field.width + 'px'}">
                      <td v-if="!field.hidden" :width="field.width" :class="field.class">
                        <div v-if="field.prop == 'mark'" class="first-col-color">
                          <img v-if="item[field.prop]" :src="require('@img/icon_heart_liked.png')" @click.self.stop="cancelMarkFlight(item)" @dblclick="eventStop($event)"/>
                          <img v-else :src="require('@img/icon_heart_default.png')" @click.self.stop="markFlight(item)" @dblclick="eventStop($event)"/>
                        </div>
                        <div v-else-if="field.prop == 'stand' && item[field.prop]" :class="field.childClass">{{ item[field.prop] }}</div>
                        <div v-else-if="field.prop == 'preDepTime'" :class="`${item['preDepTimeCss']?item['preDepTimeCss']:''} time-bg`">{{ item[field.prop] ? item[field.prop] : '—:—' }}</div>
                        <div v-else-if="field.prop == 'arrvTime'" :class="`${item['arrvTimeCss']?item['arrvTimeCss']:''} time-bg`">{{ item[field.prop] ? item[field.prop] : '—:—' }}</div>
                        <div v-else-if="field.prop == 'deptTime'" :class="`${item['deptTimeCss']?item['deptTimeCss']:''} time-bg`">{{ item[field.prop] ? item[field.prop] : '—:—' }}</div>
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
                      <th v-show="!item.hidden" v-for="(item, index) in tableData.otherFields" :key="index" :width="item.width">{{item.label}}</th>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
            <div class="div-right-table_body" :style="divTableBodyStyle" @mousewheel="scrollEvent">
              <table cellpadding="0" cellspacing="0" class="right-table_body_block">
                <tbody>
                  <tr v-for="(item, index) in tableData.data" :key="index" :class="[tableRowClassName({'row': item, 'rowIndex': index}), tableClickRowClass[index]?'is-active':'']"
                  @click="clickRow(index)" @dblclick="showFlightEdit(index)">
                    <div class="body-tr-div" :style="{width: '100%'}"></div>
                  </tr>
                </tbody>
              </table>
              <table cellpadding="0" cellspacing="0" class="right-table_body" :style="rightTableWidthStyle">
                <tbody>
                  <tr v-for="(item, index) in tableData.data" :key="index" :class="[tableRowClassName({'row': item, 'rowIndex': index}), tableClickRowClass[index]?'is-active':'']"
                  @click="clickRow(index)" @dblclick="showFlightEdit(index)"><!--  @contextmenu.prevent="tableRowContextmenu(item, $event)" -->
                    <div v-for="other in tableData.otherFields" :key="other.prop" class="body-tr-div" :style="!other.hidden && {width: other.width + 'px'}">
                      <td v-if="!other.hidden" :width="other.width" :class="other.class">
                        <div v-if="other.prop == 'attr'">
                          {{ formatterOption(other, item) }}
                        </div>
                        <div v-else-if="other.prop == 'allowBoardingTime'" class="td-input-div td-time-div" @click="eventStop($event)" @dblclick="eventStop($event)">
                          <div v-if="item.flightNoD != null && editable.hasOwnProperty(index) && editable[index]  == true">
                            <el-time-picker v-model="editTempItem[other.prop]" :clearable="false" format="HH:mm" value-format="HH:mm" :picker-options="{selectableRange: editReg.range}"></el-time-picker>
                            <div class="td-time-now-icon" @click="getAllowBoardTimeRange(index)">当前</div>
                          </div>
                          <span v-else>{{ item[other.prop] }}</span>
                        </div>
                        <div v-else-if="other.prop == 'abCountA' || other.prop == 'abCountD' || other.prop == 'pgCountA' || other.prop == 'pgCountD'" class="td-input-div">
                          <div v-if="editable.hasOwnProperty(index) && editable[index]  == true && (spliceArr(item[other.prop], '/') != '—')" @click="eventStop($event)" @dblclick="eventStop($event)">
                            <el-popover v-for="(arrItem, num) in item[other.prop]" :key="num" trigger="hover" :content="editReg.msg" :disabled="editReg.result[other.prop][num]" popper-class="editable-popper">
                              <el-input slot="reference" :id="'td-input-'+num" v-model.trim="editTempItem[other.prop][num]"
                              :class="editReg.result[other.prop][num]?'':'error-input'" @focus="$event.currentTarget.select()"
                              @keyup.enter.native="changeEditable(index)" @mousewheel.native.stop @blur.stop="editReg.show[other.prop][num] = false"
                              @change="editRegChange(index, other.prop, num)" @mouseenter.native="editRegMouseup(other.prop, num)"
                              :min="other.min" :max="other.max" :step="(other.step&&other.step.hasOwnProperty(num))?other.step[num]:1"></el-input>
                            </el-popover>
                            <!-- <el-input v-for="(arrItem, num) in item[other.prop]" :key="num" :id="'td-input-'+num" type="number" v-model.trim="item[other.prop][num]"
                            :class="editReg.result[other.prop][num]?'':'error-input'"
                            @keyup.enter.native="changeEditable(index)" @mousewheel.native.stop @blur="editReg.show = false"
                            @change="editRegChange(index, other.prop, num)" @mouseup.native="editRegMouseup(other.prop, num, $event)"
                            :min="other.min" :max="other.max" :step="(other.step&&other.step.hasOwnProperty(num))?other.step[num]:1"></el-input> -->
                          </div>
                          <span v-else>{{ spliceArr(item[other.prop], '/') }}</span>
                        </div>
                        <div v-else>{{ item[other.prop] }}</div>
                      </td>
                    </div>
                  </tr>
                </tbody>
              </table>
              <!-- <div v-if="editReg.show" class="edit-reg-msg">{{editReg.msg}}</div> -->
              <!-- <div v-if="editReg.show" class="edit-reg-msg" :style="editRegStyle">{{editReg.msg}}</div> -->
            </div>
          </div>
          <div class="div-opr-table">
            <div class="div-opr-table_header">
              <el-popover placement="bottom" width="310" trigger="click" v-model="defaultRow">
                <div class="opr-popover">
                  <el-main>
                    <!-- <div class="opr-popover-left">
                      <el-header>航班信息</el-header>
                      <el-main>
                        <ul>
                          <div v-for="(field, index) in tableData.fields" :key="field.prop">
                            <li v-if="index > 7">
                              <div class="opr-popover-li-left">{{ field.label }}</div>
                              <div class="opr-popover-li-right">
                                <div :class="field.hidden?'close':'show'" @click="handleEye(field, 'left')"></div>
                                <div class="up" @click="handleUp(field, index, 'left')"></div>
                                <div class="top" @click="handleTop(field, index, 'left')"></div>
                              </div>
                            </li>
                          </div>
                        </ul>
                      </el-main>
                    </div> -->
                    <div class="opr-popover-all">
                      <el-header>航班信息</el-header>
                      <el-main>
                        <ul>
                          <div v-for="(field, index) in tableData.otherFields" :key="field.prop">
                            <li v-if="field.label" :class="(oprPopoverIndex == index) ? 'opr-popover-li-click' : ''">
                              <div class="opr-popover-li-left">{{ substrValue(field.label, 9) }}</div>
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
                  <tr v-for="(item, index) in tableData.data" :key="index" :class="[tableRowClassName({'row': item, 'rowIndex': index}), tableClickRowClass[index]?'is-active':'']"
                  @click="clickRow(index)">
                    <td width="130">
                      <div class="div-opr-i">
                        <div v-if="editable.hasOwnProperty(index) && editable[index]  == true">
                          <div :class="(editReg.count == 0)?'opr-edit-save':'opr-edit-save div-disabled'" @click.self.stop="changeEditable(index)"></div>
                          <div class="opr-edit-cancel" @click.self.stop="initEditable(index)"></div>
                        </div>
                        <div v-else>
                          <div v-if="flightUrlSelect != 'history'" class="icon_list_input" @click.self.stop="changeEditable(index)"></div>
                          <div class="icon_list_info" @click.self.stop="showFlightEdit(index)" title="航班详情"></div>
                          <div class="icon_list_point" @click.self.stop="showNodeEdit(index)" title="节点详情"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <!-- <div v-if="cardShow" class="contextmenu-card" ref="flightCard" :style="'top: ' + cardTop + 'px; left: ' + cardLeft + 'px'">
            <div class="card-item" @click="hiddenCard()">
              <el-button @click="allowBoardClick()">允许登机</el-button>
              <el-button @click="changeData()">修改数据</el-button>
            </div>
          </div> -->
        </el-main>
      </el-container>
    </el-main>
    <div class="dialog-form-edit flight-info-dialog" v-if="infoData.visible">
      <el-dialog v-if="infoData.visible" :visible.sync="infoData.visible" :close-on-click-modal="false" width="680px">
        <div slot="title" class="dialog-header">
          <el-radio-group v-model="infoData.type" @change="changeInfoType">
            <el-radio-button label="flight">航班详情</el-radio-button>
            <el-radio-button label="node">节点详情</el-radio-button>
          </el-radio-group>
        </div>
        <div v-if="infoData.type == 'flight'" class="dialog-body flight-body">
          <div class="flight-info-content">
            <div class="flight-info-tab">
              <el-radio-group v-model="infoData.flightInfo.type" @change="changeFlightType">
                <el-radio-button label="A" :disabled="infoData.disabled == 'A'">进港航班详情</el-radio-button>
                <el-radio-button label="D" :disabled="infoData.disabled == 'D'">出港航班详情</el-radio-button>
              </el-radio-group>
            </div>
            <el-row class="flight-info-normal">
              <el-col class="info-flight-img-no" :span="6">
                <div class="info-flight-img"><img :src="'/static/airline/l_' + infoData.airline.toLowerCase() + '.png'" width="100%"/></div><!-- <img :src="'../../assets/airline/l_' + infoData.airline.toLowerCase() + '.png'" width="48%"/> -->
                <div class="info-flight-no">{{infoData.airline + infoData.flightInfo.data.flightNo}}</div>
              </el-col>
              <el-col :span="6">
                <div class="flight-info-title">始发站</div>
                <div class="flight-info-cont">{{infoData.flightInfo.data.startStationCn}}</div>
              </el-col>
              <el-col :span="6">
                <div class="flight-info-title">目的站</div>
                <div class="flight-info-cont">{{infoData.flightInfo.data.terminalStationCn}}</div>
              </el-col>
              <el-col :span="6">
                <div class="flight-info-title">航站楼编号</div>
                <div class="flight-info-cont">{{infoData.flightInfo.data.terminal}}</div>
              </el-col>
            </el-row>
            <el-row class="flight-info-normal">
              <el-col :span="6">
                <div class="flight-info-title">执行日期</div>
                <div class="flight-info-cont">{{infoData.flightInfo.data.execDate ? infoData.flightInfo.data.execDate.substr(0, 10) : '—'}}</div>
              </el-col>
              <el-col :span="6">
                <div class="flight-info-title">航班属性</div>
                <div class="flight-info-cont">{{infoData.flightInfo.data.attrCn}}</div>
              </el-col>
              <el-col :span="6">
                <div class="flight-info-title">任务</div>
                <div class="flight-info-cont">{{infoData.flightInfo.data.taskCn}}</div>
              </el-col>
              <el-col :span="6">
                <div class="flight-info-title">VIP标识</div>
                <div class="flight-info-cont">{{(infoData.flightInfo.data.vipFlag=='Y')?'是':'否'}}</div>
              </el-col>
            </el-row>
            <el-row class="flight-info-normal">
              <el-col :span="6">
                <div class="flight-info-title">飞机号</div>
                <div class="flight-info-cont">{{infoData.flightInfo.data.aircraftNo?infoData.flightInfo.data.aircraftNo:'&nbsp;'}}</div>
              </el-col>
              <el-col :span="6">
                <div class="flight-info-title">机型</div>
                <div class="flight-info-cont">{{infoData.flightInfo.data.aircraftType}}</div>
              </el-col>
              <el-col :span="6">
                <div class="flight-info-title">代理</div>
                <div class="flight-info-cont">{{infoData.flightInfo.data.agencyCn}}</div>
              </el-col>
            </el-row>
            <el-row class="flight-info-special flight-info-block-bottom">
              <el-col :span="12">
                <div class="flight-info-title">航线代码</div>
                <div class="flight-info-cont">{{infoData.flightInfo.data.route?infoData.flightInfo.data.route:'&nbsp;'}}</div>
              </el-col>
              <el-col :span="12">
                <div class="flight-info-title">航线名称</div>
                <div class="flight-info-cont">{{infoData.flightInfo.data.routeCn}}</div>
              </el-col>
            </el-row>
            <el-row class="flight-info-special">
              <el-col :span="6">
                <div class="flight-info-title">计划起飞/预计起飞</div>
                <div v-if="infoData.flightInfo.type == 'A'" class="flight-info-cont">{{spliteMin(infoData.flightInfo.data.prevDepTimeS) + '/' + spliteMin(infoData.flightInfo.data.prevDepTimeE)}}</div>
                <div v-else class="flight-info-cont">{{spliteMin(infoData.flightInfo.data.std) + '/' + spliteMin(infoData.flightInfo.data.etd)}}</div>
              </el-col>
              <el-col :span="6">
                <div class="flight-info-title">实际起飞</div>
                <div v-if="infoData.flightInfo.type == 'A'" class="flight-info-cont">{{spliteMin(infoData.flightInfo.data.prevDepTimeA)}}</div>
                <div v-else class="flight-info-cont">{{spliteMin(infoData.flightInfo.data.atd)}}</div>
              </el-col>
              <el-col v-if="infoData.flightInfo.type == 'A'" :span="6">
                <div class="flight-info-title">计划降落/预计降落</div>
                <div class="flight-info-cont">{{spliteMin(infoData.flightInfo.data.sta) + '/' + spliteMin(infoData.flightInfo.data.eta)}}</div>
              </el-col>
              <el-col v-if="infoData.flightInfo.type == 'A'" :span="6">
                <div class="flight-info-title">实际降落</div>
                <div class="flight-info-cont">{{spliteMin(infoData.flightInfo.data.ata)}}</div>
              </el-col>
            </el-row>
            <el-row class="flight-info-block-top flight-info-block-bottom">
              <el-col :span="6">
                <div class="flight-info-title">机位</div>
                <div class="flight-info-cont">{{infoData.flightInfo.data.stand?infoData.flightInfo.data.stand:'&nbsp;'}}</div>
              </el-col>
              <el-col :span="6">
                <div class="flight-info-title">行李转盘</div>
                <div class="flight-info-cont">{{infoData.flightInfo.data.belt}}</div>
              </el-col>
              <el-col :span="6">
                <div class="flight-info-title">跑道</div>
                <div class="flight-info-cont">{{infoData.flightInfo.data.runway}}</div>
              </el-col>
              <el-col :span="6">
                <div class="flight-info-title">登机口</div>
                <div class="flight-info-cont">{{infoData.flightInfo.data.gate}}</div>
              </el-col>
            </el-row>
            <div class="flight-info-tabs">
              <el-radio-group v-model="infoData.flightInfo.tabType">
                <el-radio-button label="status">状态</el-radio-button>
                <el-radio-button label="stations">经停站</el-radio-button>
                <el-radio-button label="share">共享航班</el-radio-button>
                <el-radio-button label="alter">备降站</el-radio-button>
                <el-radio-button label="other">其他</el-radio-button>
              </el-radio-group>
              <div v-if="infoData.flightInfo.tabType == 'status'">
                <el-row>
                  <el-col :span="8">
                    <div class="flight-info-title">进展状态</div>
                    <div class="flight-info-cont">{{infoData.flightInfo.data.progressStatusCn?infoData.flightInfo.data.progressStatusCn:'&nbsp;'}}</div>
                  </el-col>
                  <el-col :span="8">
                    <div class="flight-info-title">异常状态</div>
                    <div class="flight-info-cont">{{infoData.flightInfo.data.abnormalStatusCn}}</div>
                  </el-col>
                  <el-col :span="8">
                    <div class="flight-info-title">异常原因</div>
                    <div class="flight-info-cont">{{infoData.flightInfo.data.abnormalReasonCn}}</div>
                  </el-col>
                </el-row>
              </div>
              <div v-else-if="infoData.flightInfo.tabType == 'stations'">
                <el-row v-for="(groupItem, groupIndex) in Math.ceil(infoData.flightInfo.data.viaStationsCn.length / 2)" :key="groupIndex"
                :class="(groupItem == Math.ceil(infoData.flightInfo.data.viaStationsCn.length / 2))?'':'flight-info-normal'">
                  <el-col v-for="(item, index) in infoData.flightInfo.data.viaStationsCn.slice(groupIndex*2, groupIndex*2 + 1)" :key="index" :span="12">
                    <div class="flight-info-title">经停站{{groupIndex*2 + 1}}</div>
                    <div class="flight-info-cont">{{item}}</div>
                  </el-col>
                </el-row>
              </div>
              <div v-else-if="infoData.flightInfo.tabType == 'share'">
                <el-row v-for="(groupItem, groupIndex) in Math.ceil(infoData.flightInfo.data.shareFlight.length / 2)" :key="groupIndex"
                :class="(groupItem == Math.ceil(infoData.flightInfo.data.shareFlight.length / 2))?'':'flight-info-normal'">
                  <el-col v-for="(item, index) in infoData.flightInfo.data.shareFlight.slice(groupIndex*2, groupIndex*2 + 1)" :key="index" :span="12">
                    <div class="flight-info-title">共享航班{{groupIndex*2 + 1}}</div>
                    <div class="flight-info-cont">{{item}}</div>
                  </el-col>
                </el-row>
              </div>
              <div v-else-if="infoData.flightInfo.tabType == 'alter'">
                <el-row v-for="(groupItem, groupIndex) in Math.ceil(infoData.flightInfo.data.alternateStationCn.length / 2)" :key="groupIndex"
                :class="(groupItem == Math.ceil(infoData.flightInfo.data.alternateStationCn.length / 2))?'':'flight-info-normal'">
                  <el-col v-for="(item, index) in infoData.flightInfo.data.alternateStationCn.slice(groupIndex*2, groupIndex*2 + 1)" :key="index" :span="12">
                    <div class="flight-info-title">备降站{{groupIndex*2 + 1}}</div>
                    <div class="flight-info-cont">{{item}}</div>
                  </el-col>
                </el-row>
              </div>
              <div v-else-if="infoData.flightInfo.tabType == 'other'"></div>
            </div>
          </div>
        </div>
        <div v-if="infoData.type == 'node'" class="dialog-body node-body">
          <div class="node-info-content">
            <div class="info-flight-img-no">
              <div class="info-flight-img"><img :src="'/static/airline/l_' + infoData.airline.toLowerCase() + '.png'" width="100%"/></div><!-- <img :src="'../../assets/airline/l_' + infoData.airline.toLowerCase() + '.png'" width="48%"/> -->
              <div class="info-flight-no">{{infoData.flightNo}}</div>
            </div>
            <div class="node-info-table-div div-head">
              <table class="node-info-table table-head">
                <thead>
                  <tr class="node-info-table-thead">
                    <th>任务名称</th>
                    <th>预计时间</th>
                    <th>实际时间</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div class="node-info-table-div div-body">
              <table class="node-info-table table-body">
                <tbody>
                  <tr v-for="(item, index) in infoData.nodeInfo" :key="index" :class="(index % 2 == 0)?'node-info-table-tr tr-single':'node-info-table-tr tr-double'">
                    <td>{{item.nodeCn}}</td>
                    <td>{{item.timeE ? item.timeE.substr(11, 5) : ''}}</td>
                    <td :class="(item.timeA && item.timeE && (item.timeA.substr(11, 5)>item.timeE.substr(11, 5)))?'time-over text-dec':(item.timeA?'text-dec':'')">{{item.timeA ? item.timeA.substr(11, 5) : '—:—'}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </el-dialog>
    </div>
  </el-container>
</div>
</template>

<script>
import QueryView from '../../components/common/QueryView'
import basicTableMixin from '../../components/mixin/basicTableMixin'
import wholeTableMixin from '../../components/mixin/wholeTableMixin'
import baseMixin from '../../components/mixin/baseMixin'
import basicMsgMixin from '../../components/mixin/basicMsgMixin'
import webSocketMixin from '../../components/mixin/webSocketMixin'
import {queryAll, postData} from '../../api/base.js'

export default {
  components: {
    QueryView
  },
  mixins: [baseMixin, basicTableMixin, basicMsgMixin, wholeTableMixin, webSocketMixin],
  data () {
    return {
      // 右侧table宽度
      /* divRightTableStyle: {
        width: 'calc(100% - 732px)'
      }, */
      // 操作table宽度
      divOprTableStyle: {
        width: '130px'
      },
      // 允许登机时间URL
      allowBoardURL: 'flight/dynamic/allowBoarding',
      // 允许登机请求参数
      allowBoardData: {
        flightIdA: '',
        flightIdD: '',
        time: ''
      },
      // 下载文件名
      fileName: '航班查询.xls',
      // 右键菜单显示状态 true-显示; false-隐藏
      // cardShow: false,
      // 右键菜单定位 top 和 left 值
      // cardTop: 0,
      // cardLeft: 0,
      // 请求路径
      queryUrl: 'flight/dynamic/queryDynamicAircraftList',
      // 下载路径
      exportUrl: 'flight/dynamic/exportExcel',
      // 查询条件每行个数
      colSize: 6,
      // 航班查询接口选择过滤
      flightUrlSelect: 'real',
      // 航班类型过滤条件
      flightType: 'S',
      // 历史航班查询中航班日期
      execDate: '',
      maxDate: '',
      pickerOptionsMethod: {
        disabledDate (time) {
          var maxDate = new Date()
          maxDate.setDate(maxDate.getDate() - 2)
          return time.getTime() > maxDate
        }
      },
      // 查询条件设置
      queryList: [{
        // 'p': '始发站',
        key: 'routeA',
        value: '',
        type: 'input',
        toUpper: true,
        inputText: '航站/IATA码',
        span: 3
      }, {
        // span: '航班号',
        key: 'flightNo',
        value: '',
        type: 'input',
        inputText: '航班号',
        toUpper: true,
        span: 3
      }, {
        // span: '机位号',
        key: 'stand',
        value: '',
        type: 'input',
        inputText: '机位号',
        toUpper: true,
        span: 3
      }, {
        // 'span': '属性',
        key: 'attr',
        tabsKey: 'attr',
        value: null,
        type: 'tabs',
        size: 'small',
        inputText: '',
        options: [{
          key: null,
          value: '全部'
        }],
        'valueChange': 'attrChange',
        'span': 6
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
      }],
      // 获取默认隐藏/显示列路径
      queryDefaultRowUrl: 'sysconfig/empFlight/list',
      // 保存默认隐藏/显示列路径
      saveDefaultRowUrl: 'sysconfig/empFlight/saveAll',
      // 列表设置
      tableData: {
        data: [],
        fields: [
          {prop: 'mark', label: '', width: '40', fixed: true, hidden: false},
          {prop: 'flightNoA', label: '进港航班', width: '80', fixed: true, hidden: false},
          {prop: 'flightNoD', label: '出港航班', width: '80', fixed: true, hidden: false},
          {prop: 'stand', label: '机位', width: '80', childClass: 'standClass', fixed: true, hidden: false},
          {prop: 'aircraftType', label: '机型', width: '80', fixed: true, hidden: false},
          {prop: 'preDepTime', label: '前起', width: '80', fixed: false, hidden: false, class: 'td-left-border'},
          {prop: 'arrvTime', label: '到达', width: '80', fixed: false, hidden: false, class: 'td-left-border'},
          {prop: 'deptTime', label: '起飞', width: '80', fixed: false, hidden: false, class: 'td-left-border td-left-right-border'}
        ],
        otherFields: [
          {prop: 'allowBoardingTime', label: '允许登机时间', width: '120', fixed: true, hidden: false},
          {prop: 'pgCountA', label: '货/邮/行(进)', width: '120', fixed: true, hidden: false, min: 0, max: 999, step: {0: '0.01'}},
          {prop: 'pgCountD', label: '货/邮/行(出)', width: '120', fixed: true, hidden: false, min: 0, max: 999, step: {0: '0.01'}},
          {prop: 'abCountA', label: '成人/婴儿(进)', width: '120', fixed: true, hidden: false, min: 0, max: 999},
          {prop: 'abCountD', label: '成人/婴儿(出)', width: '120', fixed: true, hidden: false, min: 0, max: 999},
          {prop: 'taskNameC', label: '任务', width: '80', fixed: true, hidden: false},
          {prop: 'attr', label: '属性', width: '80', fixed: true, hidden: false, optionKey: 'attr'},
          {prop: 'aircraftNo', label: '机号', width: '80', fixed: true, hidden: false},
          {prop: 'execDateA', label: '进港执行日期', width: '100', fixed: false, hidden: true, formatter: this.formatterDay},
          {prop: 'execDateD', label: '出港执行日期', width: '100', fixed: false, hidden: true, formatter: this.formatterDay},
          {prop: 'routeCh', label: '航线', width: '300', fixed: true, hidden: false},
          {prop: 'sta', label: '计划到达', width: '80', fixed: false, hidden: true, formatter: this.formatterMin},
          {prop: 'eta', label: '预计到达', width: '80', fixed: false, hidden: true, formatter: this.formatterMin},
          {prop: 'ata', label: '实际到达', width: '80', fixed: false, hidden: true, formatter: this.formatterMin},
          {prop: 'std', label: '计划起飞', width: '80', fixed: false, hidden: true, formatter: this.formatterMin},
          {prop: 'etd', label: '预计起飞', width: '80', fixed: false, hidden: true, formatter: this.formatterMin},
          {prop: 'atd', label: '实际起飞', width: '80', fixed: false, hidden: true, formatter: this.formatterMin},
          {prop: 'gate', label: '登机口', width: '90', fixed: false, hidden: false},
          {prop: 'belt', label: '转盘', width: '80', fixed: false, hidden: false},
          {prop: 'progressStatusNameCA', label: '进港状态', width: '100', fixed: false, hidden: false},
          {prop: 'abnormalStatusNameCA', label: '进港异常', width: '120', fixed: false, hidden: false},
          {prop: 'abnormalReasonNameCA', label: '进港异常原因', width: '180', fixed: false, hidden: false},
          {prop: 'progressStatusNameCD', label: '出港状态', width: '100', fixed: false, hidden: false},
          {prop: 'abnormalStatusNameCD', label: '出港异常', width: '120', fixed: false, hidden: false},
          {prop: 'abnormalReasonNameCD', label: '出港异常原因', width: '180', fixed: false, hidden: false},
          {prop: 'shareFlightsA', label: '进港共享', width: '120', fixed: false, hidden: false},
          {prop: 'shareFlightsD', label: '出港共享', width: '120', fixed: false, hidden: false},
          {prop: 'terminal', label: '航站楼', width: '90', fixed: false, hidden: false}
        ]
      },
      options: [],
      editable: {},
      editRegArr: [], // ['allowBoardingTime', 'pgCountA', 'pgCountD', 'abCountA', 'abCountD'],
      editTempItem: {},
      editReg: {
        show: {
          'pgCountA': {},
          'pgCountD': {},
          'abCountA': {},
          'abCountD': {}
        },
        count: 0,
        result: {
          'pgCountA': {},
          'pgCountD': {},
          'abCountA': {},
          'abCountD': {}
        },
        msg: '',
        range: null
      },
      editRegStyle: {
        left: '0px',
        top: '0px'
      },
      changeEditableUrl: 'flight/dynamic/saveMailCargoPsg',
      // 详情面板数据
      infoData: {
        visible: false,
        type: 'flight', // 'node',
        disabled: null,
        flightUrl: '/flight/dynamic/queryDynamicFlightDetail',
        nodeUrl: '/taskscheduling/dynamicTask/queryDynamicNodeByFltIds',
        flightNo: '',
        dynamicFlightIdA: 0,
        dynamicFlightIdD: 0,
        airline: '',
        // 航班详情信息
        flightInfo: {
          type: 'A', // 'D',
          tabType: 'status',
          data: {}
        },
        // 节点详情
        nodeInfo: []
      }
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
    // document.addEventListener('click', this.eClick)
    this.getDefaultRow()
  },
  mounted () {
    window.name = this.$route.name
    this.getExecDate()
    this.$store.commit('setOption', 'attr')
    this.options = this.$store.getters.getOption
    const that = this
    // this.$nextTick(() => {
      var flightMain = this.$refs['flight-table'].$el.querySelector('.el-main')
      var top1 = flightMain.getBoundingClientRect().top
      flightMain.style.height = window.innerHeight - top1 - 20 + 'px'
      this.wholeMounted(top1)
      window.onresize = () => {
        this.$nextTick(() => {
          return (() => {
            var top2 = flightMain.getBoundingClientRect().top
            flightMain.style.height = window.innerHeight - top2 - 20 + 'px'
            this.wholeMounted(top1)
          })()
        })
      }
    // })
  },
  destroyed () {
    // document.removeEventListener('click', this.eClick)
  },
  methods: {
    exportDynamic () {
      switch (this.flightUrlSelect) {
        case 'history': this.exportUrl = 'flight/hisDynamic/exportExcel'
        this.fileName = '历史航班查询'
        break
        default: this.exportUrl = 'flight/dynamic/exportExcel'
        this.fileName = '实时航班查询'
      }
      this.handleDownload('1')
    },
    getExecDate () {
      var today = new Date()
      today.setDate(today.getDate() - 2)
      var year = today.getFullYear()
      var month = today.getMonth() + 1
      var day = today.getDate()
      if (day < 10) {
        day = '0' + day
      }
      this.execDate = year + '-' + month + '-' + day
    },
    // 格式化 YYYY-MM-DD
    spliteMin (value) {
      return value ? value.substr(11, 5) : '—:—'
    },
    // 监听全局鼠标点击事件
    // eClick (event) {
      /* console.log(this.editable)
      if (event.currentTarget.activeElement.parentElement.className.indexOf('td-input') == -1) {
        this.editable = {}
      } */
      // this.cardShow = false
      /* if (!this.$refs.wholeTable.$el.contains(e.target)) {
        this.cardShow = false
      } */
    // },
    // 自定义追加查询条件（按钮查询事件）
    customQueryMethod () {
      this.initEditable()
      this.$set(this.queryData, 'remark', this.flightType)
      this.$set(this.queryData, 'exec_date', this.execDate)
      switch (this.flightUrlSelect) {
        case 'real':this.queryUrl = 'flight/dynamic/queryDynamicAircraftList'
        this.$set(this.queryList[this.queryList.length - 1], 'hidden', false)
        break
        case 'history':this.queryUrl = 'flight/hisDynamic/queryDynamicAircraftList'
        this.$set(this.queryList[this.queryList.length - 1], 'hidden', true)
        break
      }
    },
    numThreePointTwoReg (value) {
      if (value != '' && value != null) { /* ([1-9]{1}\d{0,2})(\.([0-9]{1,2})) */
        let reg = /^(\d{0,3})(\.([0-9]{1,2}))?$/
        if (reg.test(value)) {
          return true
        } else {
          return false
        }
      } else {
        return null
      }
    },
    numThreeReg (value) {
      if (value != '' && value != null) {
        let reg = /^\d{0,3}$/
        if (reg.test(value)) {
          return true
        } else {
          return false
        }
      } else {
        return null
      }
    },
    initEditable (index) {
      // this.tableData.data[index] = JSON.parse(JSON.stringify(this.editTempItem))
      this.editable = {}
      this.editReg = {
        show: {
          'pgCountA': {},
          'pgCountD': {},
          'abCountA': {},
          'abCountD': {}
        },
        count: 0,
        result: {
          'pgCountA': {},
          'pgCountD': {},
          'abCountA': {},
          'abCountD': {}
        }
      }
    },
    changeEditable (index) {
      if (this.editable.hasOwnProperty(index) && this.editable[index]) {
        if (this.editReg.count == 0) {
          var data = {}
          var arr = ['allowBoardingTime', 'pgCountA', 'pgCountD', 'abCountA', 'abCountD', 'afid']
          // this.editRegArr
          arr.forEach(key => {
            this.$set(data, key, this.editTempItem[key])
          })
          postData(this.changeEditableUrl, data).then(res => {
            if (res.data.code == 0) {
              this.showSuccess('保存')
              this.initEditable(index)
            } else {
              this.showError('请求', '请检查网络连接 !')
            }
          })
        }
      } else {
        if (Object.getOwnPropertyNames(this.editable).length > 0) {
          this.initEditable(Object.keys(this.editable)[0])
        }
        this.editTempItem = JSON.parse(JSON.stringify(this.tableData.data[index]))
        this.initEditable(index)
        this.setEditRegArr(index)
        this.$set(this.editable, index, true)
        this.editReg.count = 0
        this.editRegArr.forEach(key => {
          if (key != 'allowBoardingTime') {
            if (this.editTempItem[key].length > 0) {
              this.editTempItem[key].forEach((value, num) => {
                this.$set(this.editReg.result[key], num, null)
                this.$set(this.editReg.show[key], num, false)
                this.editRegChange(index, key, num, true)
              })
            }
          }
        })
      }
    },
    setEditRegArr (index) {
      this.tableData.otherFields.forEach(obj => {
        if (obj.prop == 'allowBoardingTime' && obj.hidden == false && this.editTempItem.flightNoD != null) {
          this.editRegArr.push('allowBoardingTime')
        } else if (['pgCountA', 'pgCountD', 'abCountA', 'abCountD'].includes(obj.prop) && obj.hidden == false) {
          if (this.spliceArr(this.editTempItem[obj.prop], '/') != '—') {
            this.editRegArr.push(obj.prop)
          }
        }
      })
    },
    editRegChange (index, key, num, init) {
      var oldResult = null
      var result = null
      if (!init) {
        oldResult = this.editReg.result[key][num]
      }
      if (['pgCountA', 'pgCountD'].includes(key) && num == 0) {
        result = this.numThreePointTwoReg(this.editTempItem[key][num])
      } else {
        result = this.numThreeReg(this.editTempItem[key][num])
      }
      switch (result) {
        case null: this.editReg.result[key][num] = true
        this.editReg.show[key][num] = false
        break
        case true: this.editReg.result[key][num] = true
        this.editReg.show[key][num] = false
        break
        case false: this.editReg.result[key][num] = false
        this.editReg.show[key][num] = true
        break
      }
      switch (oldResult) {
        case null:
          if (!this.editReg.result[key][num]) {
            this.editReg.count += 1
          }
          break
        case true:
          if (!this.editReg.result[key][num]) {
            this.editReg.count += 1
          }
          break
        case false:
          if (this.editReg.result[key][num]) {
            this.editReg.count -= 1
          }
          break
      }
    },
    editRegMouseup (key, num) {
      // var left = 0
      // left += event.currentTarget.offsetLeft
      // left += event.currentTarget.offsetParent.offsetLeft
      // left += event.currentTarget.offsetParent.offsetParent.offsetLeft
      // this.editRegStyle.left = left + 'px'
      // var top = 0
      // top += event.currentTarget.offsetTop
      // top += event.currentTarget.offsetParent.offsetTop
      // top += event.currentTarget.offsetParent.offsetParent.offsetTop
      // this.editRegStyle.top = top + 'px'
      if (this.editReg.result[key][num] == false) {
        this.editReg.show[key][num] = true
      } else {
        this.editReg.show[key][num] = false
      }
      if (['pgCountA', 'pgCountD'].includes(key) && num == 0) {
        this.$set(this.editReg, 'msg', '最多保留3位整数和2位小数 !')
      } else {
        this.$set(this.editReg, 'msg', '最多保留3位整数 !')
      }
    },
    setInfoFlightId (index) {
      if (index > -1) {
        this.infoData.dynamicFlightIdA = this.tableData.data[index].dynamicFlightIdA
        this.infoData.dynamicFlightIdD = this.tableData.data[index].dynamicFlightIdD
        this.infoData.airline = this.tableData.data[index].airline
        var flightNoArr = []
        if (this.tableData.data[index].flightNoA) {
          flightNoArr.push(this.tableData.data[index].flightNoA)
        }
        if (this.tableData.data[index].flightNoD) {
          flightNoArr.push(this.tableData.data[index].flightNoD)
        }
        this.infoData.flightNo = flightNoArr.join(' / ')
      }
    },
    // 点击航班详情按钮
    showFlightEdit (index) {
      this.infoData.type = 'flight'
      this.setInfoFlightId(index)
      if (!this.infoData.dynamicFlightIdA) {
        this.infoData.disabled = 'A'
        this.infoData.flightInfo.type = 'D'
      } else {
        this.infoData.flightInfo.type = 'A'
        if (!this.infoData.dynamicFlightIdD) {
          this.infoData.disabled = 'D'
        } else {
          this.infoData.disabled = ''
        }
      }
      this.infoData.flightInfo.tabType = 'status'
      this.changeFlightType(this.infoData.flightInfo.type)
    },
    // 点击节点详情按钮
    showNodeEdit (index) {
      this.infoData.type = 'node'
      this.setInfoFlightId(index)
      var data = {
        flightId: [this.infoData.dynamicFlightIdA, this.infoData.dynamicFlightIdD]
      }
      switch (this.flightUrlSelect) {
        case 'history': this.infoData.nodeUrl = '/flight/hisDynamic/queryDynamicNodeByFltIds'
        break
        default: this.infoData.nodeUrl = '/taskscheduling/dynamicTask/queryDynamicNodeByFltIds'
      }
      queryAll(this.infoData.nodeUrl, data).then(res => {
        if (res.data.code == 0) {
          this.infoData.nodeInfo = res.data.data
          this.infoData.visible = true
        }
      })
    },
    // 改变进出港类型按钮
    changeFlightType (type) {
      var data = {
        flightId: ''
      }
      switch (type) {
        case 'A':data.flightId = this.infoData.dynamicFlightIdA
        break
        case 'D':data.flightId = this.infoData.dynamicFlightIdD
        break
      }
      switch (this.flightUrlSelect) {
        case 'history': this.infoData.flightUrl = '/flight/hisDynamic/queryDynamicFlightDetail'
        break
        default: this.infoData.flightUrl = '/flight/dynamic/queryDynamicFlightDetail'
      }
      queryAll(this.infoData.flightUrl, data).then(res => {
        if (res.data.code == 0) {
          this.infoData.flightInfo.data = res.data.data
          this.infoData.visible = true
        }
      })
    },
    // 改变详情按钮
    changeInfoType () {
      switch (this.infoData.type) {
        case 'flight':this.showFlightEdit()
        break
        case 'node':this.showNodeEdit()
        break
      }
    },
    customUpdateTableWidth () {},
    customOtherFields () {
      return 'otherFields'
    },
    // 保存显示/隐藏列 save保存事件
    saveDefaultRow () {
      this.saveDefaultRowReq('otherFields')
    },
    /* tableRowContextmenu (data, event) {
      this.cardShow = false
      // event.preventDefault()
      this.cardTop = event.clientY
      this.cardLeft = event.clientX
      this.cardShow = true
      this.allowBoardData.flightIdA = data.dynamicFlightIdA
      this.allowBoardData.flightIdD = data.dynamicFlightIdD
    },
    hiddenCard () {
      this.cardShow = false
    },
    allowBoardClick () {
      this.getClickTime()
      this.$prompt('请输入登机时间', '', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'time',
        inputValidator: this.allowBoardTimeReg,
        inputErrorMessage: '时间格式不正确'
      }).then(({ value }) => {
        this.allowBoardData.time = value
        // 发送登机请求
        queryAll(this.allowBoardURL, this.allowBoardData).then(response => {
          if (response.data.code == 0) {
            this.showSuccess('配置登机时间')
          }
        })
      }).catch(() => {
        // 取消事件
      })
    },
    allowBoardTimeReg (value) {
      let msg = '时间不能为空'
      if (value && value != '') {
        let hour = this.clickTime.getHours()
        let min = this.clickTime.getMinutes()
        let myHour = value.substr(0, 2)
        let myMin = value.substr(3, 2)
        // 相同小时且大于分钟
        if (myHour == hour) {
          if (myMin >= min) {
            return true
          }
        }
        let maxHour = hour + 2
        let maxHourMsg
        if (maxHour > 23) {
          maxHour -= 24
          if (myHour > hour || myHour <= maxHour) {
            return true
          }
          maxHourMsg = '明天' + maxHour
        } else {
          if (myHour > hour && myHour <= maxHour) {
            return true
          }
          maxHourMsg = maxHour
        }
        let minMsg = min
        if (min < 10) {
          minMsg = '0' + min
        }
        msg = '时间必须在' + hour + ':' + minMsg + '-' + maxHour + ':59之间'
      }
      return msg
    }, */
    getAllowBoardTimeRange (index) {
      this.getClickTime()
      var hour = this.clickTime.getHours()
      var min = this.clickTime.getMinutes()
      var maxHour = hour + 2
      if (maxHour > 23) {
        maxHour -= 24
        var minRange = '00:00:00 - ' + maxHour + ':59:59'
        var maxRange = hour + ':' + min + ' - 23:59:59'
        this.editReg.range = [minRange, maxRange]
      } else {
        this.editReg.range = hour + ':' + min + ':00 - ' + maxHour + ':59:59'
      }
      this.$set(this.editTempItem, 'allowBoardingTime', hour + ':' + min)
    },
    // 自定义websocket获取数据后操作
    customWsOnMessage (data) {
      if (data.type == 0) {
        this.queryDataReq()
      }
    },
    // 格式化 enum 成员
    formatterOption (field, row) {
      if (field.optionKey) {
        for (let i = 0; i < this.options.length; i++) {
          if (this.options[i].key == row[field.prop]) {
            return this.options[i].value
          }
        }
      }
      return row[field.prop]
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
.table-container {
  margin-right: 20px;
}
.contextmenu-card {
  position: absolute;
  z-index: 3
}
/* 航班顶部*实时-历史*选择框 */
.flight-url-select-div {
  position: absolute;
  top: 25px;
  left: calc(50% - 121px);
}
/* 历史航班日期选择 */
.flight-url-his-date-div {
  position: absolute;
  top: 25px;
  left: calc(50% + 121px);
  margin-left: 20px;
}
/* 编辑表头内容列宽度 */
.opr-popover-all {
  width: 100%;
}
.edit-reg-msg {
  position: absolute;
  color: red;
}
</style>
