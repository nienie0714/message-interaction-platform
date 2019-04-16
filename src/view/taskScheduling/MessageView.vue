<template>
<div class="message-body" :style="messageStyle" @drop="msgContUp($event)" @dragover="allowDrop($event)">
  <div class="msg-button-div">
    <div class="msg-button-left">
      <div v-for="item in msgTypeButton" :key="item.key" :class="`${msgType.type==item.key?'is-active':''} ${msgType.disabled?'disabled':''}`" @click="!msgType.disabled && changeMsgType(item.key)">{{item.label}}<div v-if="msgData[item.key].count > 0" class="unread-red-count">{{msgData[item.key].count > maxLength ? `${maxLength}+` : msgData[item.key].count}}</div></div>
    </div>
    <div class="msg-button-right">
      <div :class="talk.show ? 'is-active': ''" @click="changeMsgType(talk.type)">{{talk.title}}
        <div v-if="talk.talkData.arr.length > 0 && require('lodash').filter(talk.talkData.arr, ['unread', true]).length > 0">{{require('lodash').filter(talk.talkData.arr, ['unread', true]).length}}</div>
      </div>
    </div>
  </div>
  <div class="msg-cont-div message-info-dialog" :style="contStyle" v-show="msgType.show">
    <div class="msg-cont-header table-header" :draggable="true" @dragstart="msgContDown($event, 'contStyle')" @drop="msgContUp($event)" @dragover="allowDrop($event)">
      <img :src="require('@img/title_deco.png')" />
      <span class="header-title">{{msgType.title}}</span>
      <div>
        <div class="header-close" @click="changeMsgType(msgType.type)"></div>
      </div>
    </div>
    <div class="msg-cont-cont msg-type-cont">
      <div>
        <el-input placeholder="搜索" clearable v-model.trim="msgType.filterValue" @keyup.enter.native="filterMsgDataEnter">
          <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
      </div>
      <div class="msg-cont-ul">
        <ul v-if="filterMsgData.length > 0">
          <li v-for="(item, index) in filterMsgData" :key="index" :class="msgType.rowSelect == index ? 'row-select' : ''" @click="rowSelectClick(index)">
            <div v-if="[msgTypeButton[1].key, msgTypeButton[2].key, msgTypeButton[3].key].includes(msgType.type)" class="li-img">
              <img :src="'/static/airline/l_' + item.airline.toLowerCase() + '.png'" width="100%"/>
            </div>
            <div :class="msgType.type == msgTypeButton[0].key ? 'li-font-notice li-font' : 'li-font'">
              <div>
                <div>{{msgType.type == msgTypeButton[0].key ? item.msgTopic : item.flightNo}}</div>
                <div v-if="[msgTypeButton[1].key, msgTypeButton[2].key].includes(msgType.type)" class="li-font-task">{{item.taskName}}</div>
                <div v-if="!item.msgConfirmTime" class="dot-red"></div>
                <div v-if="msgType.type == msgTypeButton[0].key && ~item.type" class="li-font-show">{{item.type == 0 ? '全部' : (item.type == 1 ? '部门':'科室')}}可见</div>
              </div>
              <div>
                <div v-if="msgType.type == msgTypeButton[2].key" class="li-font-gray">{{`来自：${item.empName}`}}</div>
                <div :class="msgType.type == msgTypeButton[2].key?'li-font-white':'li-font-gray'">{{item.msgCont}}</div>
              </div>
            </div>
            <div class="li-time">{{item.time.substr(11, 5)}}</div>
          </li>
        </ul>
        <div v-else class="msg-cont-ul-none">
          <img :src="require('@img/im/pic_msg_none.png')" />
          <div>{{filterMsgResult}}</div>
        </div>
      </div>
      <div v-if="msgType.rowSelect != null && ~msgType.rowSelect" class="msg-cont-info">
        <div class="info-flex">
          <div class="li-img" v-if="[msgTypeButton[1].key, msgTypeButton[2].key, msgTypeButton[3].key].includes(msgType.type)">
            <img :src="'/static/airline/l_' + filterMsgData[msgType.rowSelect].airline.toLowerCase() + '.png'" width="100%"/>
          </div>
          <div :class="msgType.type == msgTypeButton[0].key ? 'li-font-notice li-font' : 'li-font'">
            <div>
              <div>{{ msgType.type == msgTypeButton[0].key ? filterMsgData[msgType.rowSelect].msgTopic : filterMsgData[msgType.rowSelect].flightNo}}</div>
              <div v-if="[msgTypeButton[1].key, msgTypeButton[2].key].includes(msgType.type)" class="li-font-task">{{filterMsgData[msgType.rowSelect].taskName}}</div>
            </div>
            <div v-if="[msgTypeButton[1].key, msgTypeButton[2].key, msgTypeButton[3].key].includes(msgType.type)">
              <div v-if="msgType.type == msgTypeButton[1].key" class="li-font-gray">{{filterMsgData[msgType.rowSelect].msgSenderName}}</div>
              <div v-if="msgType.type == msgTypeButton[2].key" class="li-font-gray">{{`来自：${filterMsgData[msgType.rowSelect].empName}`}}</div>
              <div v-if="msgType.type == msgTypeButton[3].key" class="li-font-gray">{{filterMsgData[msgType.rowSelect].msgSenderName}}</div>
            </div>
          </div>
          <div>
            <div class="info-close" @click="rowSelectClick(msgType.rowSelect)"></div>
          </div>
        </div>
        <div class="info-br"></div>
        <div class="info-flex">
          <div>接收时间：</div>
          <div>{{filterMsgData[msgType.rowSelect].time.substr(0, 16)}}</div>
          <div v-if="msgType.type == msgTypeButton[0].key && ~filterMsgData[msgType.rowSelect].type" class="li-font-show">{{filterMsgData[msgType.rowSelect].type == 0 ? '全部' : (filterMsgData[msgType.rowSelect].type == 1 ? '部门':'科室')}}可见</div>
        </div>
        <div class="info-cont">{{filterMsgData[msgType.rowSelect].msgCont}}</div>
      </div>
    </div>
    <div class="msg-cont-footer">
      <el-button v-if="[msgTypeButton[1].key, msgTypeButton[2].key, msgTypeButton[3].key].includes(msgType.type)" type="primary" @click="batchRead()">全部已读</el-button>
      <el-button type="danger" @click="batchClear()">一键清空</el-button>
      <el-button v-if="[msgTypeButton[0].key].includes(msgType.type)" type="primary" @click="newTopic()">写通告</el-button>
    </div>
  </div>
  <el-dialog v-if="msgData.notice.sendMsg.visible" :visible.sync="msgData.notice.sendMsg.visible" :close-on-click-modal="false" width="860px" append-to-body class="other-dialog notice-dialog" @close="closeNoticeDialog">
    <div slot="title" class="dialog-header">
      <img :src="require('@img/title_deco.png')" />
      <span class="header-title">发布通告</span>
    </div>
    <div class="dialog-body">
      <div class="notice-label">
        <div class="label-label">通告主题</div>
        <div class="label-required">*必填项</div>
      </div>
      <div class="info-flex">
        <el-select v-model="msgData.notice.sendMsg.topic" placeholder="请选择通告主题" :filterable="true" :clearable="true" @change="changeTopic">
          <el-option v-for="item in msgData.notice.sendMsg.options" :key="item" :label="item" :value="item"></el-option>
        </el-select>
        <el-button type="primary" @click="skipTopic">主题/内容管理</el-button>
      </div>
      <div class="notice-label">
        <div class="label-label">通告内容</div>
        <div class="label-required">*必填项</div>
      </div>
      <div class="notice-cont">
        <el-input type="textarea" v-model="msgData.notice.sendMsg.content" placeholder="输入通告内容（可通过选择通告内容快速填入）" :maxlength="200"></el-input>
        <el-select v-model="msgData.notice.sendMsg.content" placeholder="请选择通告内容" :filterable="true" :clearable="true">
          <el-option v-for="item in msgData.notice.sendMsg.contOptions" :key="item.noticeTopicId" :label="item.content" :value="item.content"></el-option>
        </el-select>
      </div>
      <div>
        <el-radio :disabled="msgData.notice.sendMsg.depts == null" v-model="msgData.notice.sendMsg.type" :label="0">全部可见</el-radio>
        <el-radio :disabled="!(msgData.notice.sendMsg.depts != null && msgData.notice.sendMsg.depts.length > 0)" v-model="msgData.notice.sendMsg.type" :label="1">仅部门可见</el-radio>
        <el-radio :disabled="!(msgData.notice.sendMsg.depts != null && msgData.notice.sendMsg.depts.length > 2)" v-model="msgData.notice.sendMsg.type" :label="2">仅科室可见</el-radio>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeNoticeDialog">取 消</el-button>
      <el-button type="primary" :loading="msgData.notice.sendMsg.loading" @click="sendTopic">确 定</el-button>
    </div>
  </el-dialog>
  <div class="msg-cont-div message-info-dialog" :style="contTalkStyle" v-show="talk.show">
    <div class="msg-cont-header table-header" :draggable="true" @dragstart="msgContDown($event, 'contTalkStyle')" @drop="msgContUp($event)" @dragover="allowDrop($event)">
      <img :src="require('@img/title_deco.png')" />
      <span class="header-title">{{talk.title}}</span>
      <div class="header-select-button">
        <div :class="talk.selectType==1?'is-active':''" @click="changeTalkType(1)">对话</div>
        <div :class="talk.selectType==2?'is-active':''" @click="changeTalkType(2)">联系人</div>
      </div>
      <div>
        <div class="header-close" @click="changeMsgType(talk.type)"></div>
      </div>
    </div>
    <div class="msg-cont-cont msg-talk-cont">
      <div v-if="talk.selectType == 1" class="talk-cont talk-cont-1">
        <div class="talk-cont-left">
          <div class="talk-cont-ul">
            <div v-for="(item, index) in talk.talkData.arr" :key="index" :class="talk.talkData.selectIndex == index ? 'row-select' : ''" @click="talkArrSelectClick(index)">
              <div :class="`${item.type}-logo`">{{item.type=='personal'?item.name.substr(0, 1):'群'}}</div>
              <div>
                <div>
                  <div>{{item.name}}</div>
                  <div v-if="item.unread" class="arr-unread"></div>
                </div>
                <div>{{getLastCont(item)}}</div>
              </div>
              <div class="talk-time">{{getLastTime(item)}}</div>
              <div class="close-button" @click.stop="closeTalkArr(index)"></div>
            </div>
          </div>
        </div>
        <div class="talk-cont-right">
          <div class="talk-cont-record" v-if="talk.talkData.selectIndex != null && ~talk.talkData.selectIndex">
            <div>
              <div :class="`${talk.talkData.arr[talk.talkData.selectIndex].type}-logo`">{{talk.talkData.arr[talk.talkData.selectIndex].type=='personal'?talk.talkData.arr[talk.talkData.selectIndex].name.substr(0, 1):'群'}}</div>
              <div class="talk-cont-record-title">
                <div>
                  <div>{{talk.talkData.arr[talk.talkData.selectIndex].name}}</div>
                  <div v-if="talk.talkData.arr[talk.talkData.selectIndex].hasOwnProperty('isManager') && talk.talkData.arr[talk.talkData.selectIndex].isManager == 'Y'" class="font-gray">(自建)</div>
                </div>
                <div>{{talk.talkData.arr[talk.talkData.selectIndex].count + (talk.talkData.arr[talk.talkData.selectIndex].type=='personal'?'':'人')}}</div><!-- {{item.lastMsg}} -->
              </div>
              <div v-if="~talk.talkData.selectIndex && talk.talkData.arr[talk.talkData.selectIndex].type == 'group'" class="talk-cont-record-tip">
                <el-popover trigger="click" :width="240" popper-class="talk-cont-record-group-pop">
                  <div class="pop-body">
                    <div class="pop-title">
                      <div>{{talk.talkData.arr[talk.talkData.selectIndex].name}}</div>
                      <div class="font-gray">&nbsp;{{'(' + talk.talkData.arr[talk.talkData.selectIndex].count + '人)'}}</div>
                    </div>
                    <div class="pop-cont">
                      <div>
                        <div class="talk-cont-ul">
                          <div v-for="(item, index) in talk.talkData.memberArr" :key="index" class="talk-group-list">
                            <div class="personal-logo">{{item.empName.substr(0, 1)}}</div>
                            <div>
                              <div>{{item.empName}}</div>
                              <div>{{item.deptName}}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="pop-footer">
                      <el-button type="primary" :class="talk.talkData.arr[talk.talkData.selectIndex].isManager == 'Y'?'':'div-disabled'"
                      @click="talk.talkData.arr[talk.talkData.selectIndex].isManager == 'Y' && editGroupClick(2)">编辑群</el-button>
                      <el-button type="danger" :class="talk.talkData.arr[talk.talkData.selectIndex].isManager == 'Y'?'':'div-disabled'"
                      @click="talk.talkData.arr[talk.talkData.selectIndex].isManager == 'Y' && deleteGroupClick()">删除群</el-button>
                    </div>
                  </div>
                  <div slot="reference" class="group-edit-button" @click="getGroupMemberClick(talk.talkData.arr[talk.talkData.selectIndex].id)"></div>
                </el-popover>
              </div>
            </div>
            <div class="record-cont-scroll">
              <div v-if="talk.talkData.arr[talk.talkData.selectIndex].pageNum <= talk.talkData.arr[talk.talkData.selectIndex].maxPage" class="record-top">
                <div @click="postRecordArr(talk.talkData.selectIndex)">查看更早的信息</div>
              </div>
              <div v-for="(item, index) in talk.talkData.arr[talk.talkData.selectIndex].recordArr" :key="index" :class="empId==item.msgSender?'record-cont record-right':'record-cont record-left'">
                <div>
                  <div v-if="talk.talkData.arr[talk.talkData.selectIndex].type=='group'" class="record-name">{{item.msgSender == empId ? '我' : item.msgSenderName}}</div>
                  <div v-if="talk.talkData.arr[talk.talkData.selectIndex].type=='group'" class="record-time">{{`(${item.msgDeptName})`}}</div>
                  <div class="record-time">{{item.msgTime.substr(11, 5)}}</div>
                </div>
                <div>
                  <div class="record-cont-bubble"></div>
                  <div class="record-cont-font media">{{item.msgType == 0 ? item.msgContent : ''}}
                    <img v-if="item.msgType == 1" :src="dfsUrl + item.msgContent" @click="showWinImg(dfsUrl + item.msgContent)" style="cursor: pointer;" />
                    <div v-else-if="item.msgType == 2" :style="`cursor: pointer; margin: -10px; height: 36px; width: ${item.msgContLen * 4.6}px; min-width: 60px; max-width: 280px; position: relative;`">
                      <div @click="playPause(index, 'audio')" :class="`audio ${talk.talkData.mediaPlay.index == index ? 'play' : 'paused'}`"></div>
                      <div v-if="item.unread && item.msgType == 2" class="audio-unread"></div>
                      <audio>
                        <source :src="dfsUrl + item.msgContent" type="audio/mpeg">
                      </audio>
                    </div>
                    <video v-else-if="item.msgType == 3" width="280" height="280" controls="controls" @click="playPause(index, 'video')">
                      <source :src="dfsUrl + item.msgContent" type="video/mp4" />
                      <object :data="dfsUrl + item.msgContent" width="280" height="280">
                        <embed width="280" height="280" :src="dfsUrl + item.msgContent" />
                      </object>
                    </video>
                  </div>
                  <div v-if="item.msgType == 2" class="audio-time">{{item.msgContLen + '″'}}</div>
                </div>
              </div>
            </div>
            <div>
              <div>
                <div class="record-voice"></div>
                <div class="record-emoji"></div>
                <el-upload :action="talk.talkData.imgData.action" :accept="talk.talkData.imgData.accept" :http-request="httpRequest" :file-list="talk.talkData.imgData.fileList" :on-change="imgFileChange">
                  <div class="record-pic"></div>
                </el-upload>
                <div class="record-words"></div>
                <div class="new-record">
                  <div v-if="talk.talkData.newRecordShow" @click="scrollRecord(talk.talkData.selectIndex, true)">
                    <div></div>
                    <div>有新消息</div>
                  </div>
                </div>
              </div>
              <div>
                <div>
                  <el-input v-model.trim="talk.talkData.arr[talk.talkData.selectIndex].sendCont" @keyup.enter.native="sendImMsg(0)"></el-input>
                </div>
                <div class="record-send" @click="sendImMsg(0)"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="talk.selectType == 2" class="talk-cont talk-cont-2">
        <div class="talk-cont-left">
          <div class="talk-cont-ul">
            <div :class="talk.ctcsType == 1 ? 'row-select' : ''" @click="talkCtcsSelectClick(1)">
              <div class="Personal"></div>
              <div>个人</div>
            </div>
            <div :class="talk.ctcsType == 2 ? 'row-select' : ''" @click="talkCtcsSelectClick(2)">
              <div class="Group"></div>
              <div>群组</div>
            </div>
          </div>
        </div>
        <div class="talk-cont-right">
          <div v-if="talk.ctcsType == 1" class="talk-cont-person">
            <div>
              <div>组织结构：</div>
              <div>
                <el-cascader v-model="talk.ctcsData.emp.deptId" expand-trigger="click" :options="talk.ctcsData.emp.options" :props="talk.ctcsData.emp.props" filterable change-on-select @change="ctcsDeptChange()"></el-cascader>
              </div>
            </div>
            <div>
              <div>
                <el-input type="input" v-model.trim.lazy="talk.ctcsData.emp.filterValue" auto-complete="off" placeholder="搜索联系人" @keyup.enter.native="filterMsgEmpDataEnter()">
                  <i slot="prefix" class="el-input__icon el-icon-search"></i>
                </el-input>
              </div>
              <div>
                <div class="talk-cont-ul">
                  <div v-for="(item, index) in talk.ctcsData.emp.filterArr" :key="index" :class="talk.ctcsData.emp.selectKey == item.empId ? 'talk-emp-list row-select' : 'talk-emp-list'"
                  @click="rowCtcsSelectClick('emp', item.empId)" @dblclick="selectCtcsDblClick('personal', item.empId, item.empName)">
                    <div class="personal-logo">{{item.empName.substr(0, 1)}}</div>
                    <div>{{item.empName}}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="talk-cont-group">
            <div>
              <div>全部群组</div>
              <div>
                <el-button type="primary" @click="editGroupClick(1)">新建群组</el-button>
              </div>
            </div>
            <div>
              <div>
                <el-input type="input" v-model.trim.lazy="talk.ctcsData.group.filterValue" auto-complete="off" placeholder="搜索群组" @keyup.enter.native="filterMsgGroupDataEnter()">
                  <i slot="prefix" class="el-input__icon el-icon-search"></i>
                </el-input>
              </div>
              <div>
                <div class="talk-cont-ul">
                  <div v-for="(item, index) in talk.ctcsData.group.filterArr" :key="index" :class="talk.ctcsData.group.selectKey == item.chatGroupId ? 'talk-group-list row-select' : 'talk-group-list'"
                  @click="rowCtcsSelectClick('group', item.chatGroupId)" @dblclick="selectCtcsDblClick('group', item.chatGroupId, item.chatGroupCn, item.isManager)">
                    <div class="group-logo">群</div>
                    <div>
                      <div>
                        <div>{{item.chatGroupCn}}</div>
                        <div v-if="item.isManager == 'Y'" class="font-gray">(自建)</div>
                      </div>
                      <div>{{item.chatMemberNumber + '人'}}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-show="showImg" class="show-img" @click="showImg = false">
    <img :src="imgSrc"/>
  </div>
  <el-dialog v-if="talk.talkData.editGroup.visible" :visible.sync="talk.talkData.editGroup.visible" :close-on-click-modal="false" width="820px" append-to-body class="other-dialog talk-dialog" @close="closeTalkDialog">
    <div slot="title" class="dialog-header">
      <img :src="require('@img/title_deco.png')" />
      <span class="header-title">{{talk.talkData.editGroup.title + '组'}}</span>
    </div>
    <div class="dialog-body">
      <div>
        <div>群名称</div>
        <div>
          <el-input type="input" v-model.trim="talk.talkData.editGroup.groupData.name" :maxlength="25"></el-input>
        </div>
      </div>
      <div>
        <div>
          <div>全部人员</div>
          <div class="talk-cont-person">
            <div>
              <div>组织结构：</div>
              <div>
                <el-cascader v-model="talk.talkData.editGroup.deptId" expand-trigger="click" :options="talk.talkData.editGroup.options" :props="talk.talkData.editGroup.props" filterable change-on-select @change="editGroupDeptChange()"></el-cascader>
              </div>
            </div>
            <div>
              <div>
                <el-input type="input" v-model.trim.lazy="talk.talkData.editGroup.filterValue" auto-complete="off" placeholder="搜索联系人" @keyup.enter.native="filterEditGroupEmpDataEnter()">
                  <i slot="prefix" class="el-input__icon el-icon-search"></i>
                </el-input>
              </div>
              <div>
                <div class="talk-cont-ul">
                  <div v-for="(item, index) in talk.talkData.editGroup.filterArr" :key="index" class="talk-emp-list" @click="selectEditGroupClick(item)">
                    <div :class="~require('lodash').findIndex(talk.talkData.editGroup.groupData.arr, ['empId', item.empId]) ? 'radio-button el-checkbox__input is-checked' : 'radio-button el-checkbox__input'"><div class="el-checkbox__inner"></div></div>
                    <div class="personal-logo">{{item.empName.substr(0, 1)}}</div>
                    <div>{{item.empName}}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div>已添加人员</div>
          <div class="talk-cont-person-select">
            <div>
              <div v-for="item in talk.talkData.editGroup.groupData.arr" :key="item.empId">
                <div>
                  <div>{{item.empName}}</div>
                  <div>{{item.deptName}}</div>
                </div>
                <div class="talk-emp-cancle" @click="selectEditGroupClick(item)"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeTalkDialog">取 消</el-button>
      <el-button type="primary" :loading="talk.talkData.editGroup.loading" @click="saveTalkDialog">确 定</el-button>
    </div>
  </el-dialog>
  <Warning-box-view :data="talk.talkData.deleteGroup" @handleConfirm="deleteGroupConfirm"></Warning-box-view>
  <div class="msg-cont-div message-info-dialog msg-task-cont-div" v-if="taskMsg.data.length > 0" :style="contTaskStyle">
    <div class="msg-cont-header table-header" :draggable="true" @dragstart="msgContDown($event, 'contTaskStyle')" @drop="msgContUp($event)" @dragover="allowDrop($event)">
      <img :src="require('@img/title_deco.png')" />
      <span class="header-title">任务申请</span>
      <div class="unread-red-count">{{taskMsg.data.length}}</div>
      <div>
        <div class="div-button-usabled" @click="msgTaskApplyAll('N')">全部拒绝</div>
      </div>
    </div>
    <div class="msg-cont-cont msg-type-cont">
      <div></div>
      <div class="msg-cont-task-font">
        <div>
          <div>目标航班</div>
          <div>{{taskMsg.data[taskMsg.index].flightNo}}</div>
        </div>
        <div>
          <div>申请任务</div>
          <div>{{taskMsg.data[taskMsg.index].taskCn}}</div>
        </div>
        <div>
          <div>申请人</div>
          <div>{{taskMsg.data[taskMsg.index].empName}}</div>
        </div>
      </div>
    </div>
    <div class="msg-cont-footer">
      <div :class="taskMsg.index > 0 ? 'div-button-usabled' : 'div-button div-disabled'" @click="taskMsg.index > 0 && changeMsgTaskIndex(-1)">上一条({{taskMsg.index}})</div>
      <div>
        <el-button type="danger" @click="msgTaskApply(taskMsg.index, 'N')">拒绝</el-button>
        <el-button type="primary" @click="msgTaskApply(taskMsg.index, 'Y')">同意</el-button>
      </div>
      <div :class="taskMsg.data.length - taskMsg.index - 1 > 0 ? 'div-button-usabled' : 'div-button div-disabled'" @click="taskMsg.data.length - taskMsg.index - 1 > 0 && changeMsgTaskIndex(1)">下一条({{taskMsg.data.length - taskMsg.index - 1}})</div>
    </div>
  </div>
</div>
</template>

<script>
import baseMixin from '../../components/mixin/baseMixin'
import basicMsgMixin from '../../components/mixin/basicMsgMixin'
import rabbitMqMixin from '../../components/mixin/rabbitMqMixin'
import WarningBoxView from '../../components/common/WarningBoxView'
import _ from 'lodash'
import { postAllData, postDataEndPage, queryPageDataList, postData, postDataNone, dfsPost, queryAll } from '../../api/base'

export default {
  mixins: [baseMixin, basicMsgMixin, rabbitMqMixin],
  components: {
    WarningBoxView
  },
  data () {
    return {
      empId: null,
      basicData: {
        basicOpenWin: null,
        getBasicRooter: '/sys/resource/queryUrlAuthority',
        basicRouterUrl: '/basicdata/msg/noticeTopic',
        basicRooter: 0
      },
      dfsUrl: null,
      imgSrc: null,
      showImg: false,
      sendMsgUrl: '/rabbitMQ/sendMsg',
      // 最大条数
      maxLength: 99,
      // 获取所有消息未读数量
      queryCountUrl: 'message/aomsMsgRecord/queryAomsMsgCount',
      // 查询数据库信息
      queryUrl: 'message/aomsMsgRecord/queryAomsMsgRecord',
      // 更新单条信息已读
      updateRowUrl: 'message/aomsMsgRecord/updateForRead',
      // 全部已读
      batchReadUrl: 'message/aomsMsgRecord/batchUpdateForRead',
      // 一键清空
      batchClearUrl: 'message/aomsMsgRecord/clearAomsMsgRecord',
      talk: {
        show: false,
        type: 'im',
        selectType: 1,
        title: '即时通讯',
        count: 0,
        ctcsType: 1,
        talkData: {
          updateDataUrl: '/message/aomsChatMember/queryDeptNameOrMemberNumber',
          getRecordUrl: '/message/aomsMsgRecord/queryRightMsg',
          queryDeptUrl: '/message/aomsChatMember/queryDeptName',
          pageNum: 1,
          pageSize: 30,
          selectIndex: null,
          newRecordShow: false,
          imgData: {
            action: 'dfs/files',
            accept: 'image/png,image/jpg,image/jpeg',
            limit: 1,
            fileList: []
          },
          mediaPlay: {
            index: null,
            media: null,
            type: null
          },
          arr: [],
          deptName: null,
          queryMember: '/message/aomsChatMember/queryAomsChatMember',
          memberArr: [],
          editGroup: {
            saveUrl: '/message/aomsChatGroup/insertGroupAndMember',
            updateUrl: '/message/aomsChatGroup/updateGroupAndMember',
            deleteUrl: '/message/aomsChatGroup/deleteGroupAndMember',
            visible: false,
            loading: false,
            title: '新建',
            groupData: {
              id: null,
              name: '',
              arr: []
            },
            queryDeptUrl: '/organization/department/queryDeptTreeByUserId',
            queryEmpUrl: '/organization/department/queryAllEmployeeByDeptId',
            deptId: null,
            props: {value: 'id', label: 'text', children: 'children'},
            options: [],
            filterValue: '',
            filterArr: []
          },
          deleteGroup: {
            visible: false,
            loading: false,
            width: '500px',
            class: ' dialog-delete-warn',
            info: '确认要删除所选数据吗？'
          }
        },
        ctcsData: {
          emp: {
            queryDeptUrl: '/organization/department/queryDeptTreeByUserId',
            queryEmpUrl: '/organization/department/queryAllEmployeeByDeptId',
            deptId: null,
            props: {value: 'id', label: 'text', children: 'children'},
            options: [],
            filterValue: '',
            filterArr: [],
            arr: [],
            selectKey: null
          },
          group: {
            queryGroupUrl: '/message/aomsChatGroup/queryChatGroupInfo',
            filterValue: '',
            filterArr: [],
            arr: [],
            selectKey: null
          }
        }
      },
      msgType: {
        show: false,
        type: null,
        disabled: false,
        title: '航班动态',
        rowSelect: null,
        filterValue: ''
      },
      msgTypeButton: [
        {
          key: 'notice',
          label: '生产通告'
        },
        {
          key: 'alarm',
          label: '告警消息'
        },
        {
          key: 'task',
          label: '任务反馈'
        },
        {
          key: 'flight',
          label: '航班动态'
        }
      ],
      msgData: {
        notice: {
          data: [],
          count: 0,
          sendMsg: {
            getDepts: '/organization/department/queryDeptIdsByEmpId',
            getAllEmps: '/organization/employee/queryAll',
            getEmps: '/organization/department/queryAllEmployeeByDeptId',
            getOptions: '/message/noticeTopic/queryNoRepeatTopic',
            getContOptions: '/message/noticeTopic/queryAll',
            depts: null,
            options: [],
            contOptions: [],
            topic: '',
            content: '',
            type: 0,
            loading: false,
            visible: false
          }
        },
        alarm: {
          data: [],
          count: 0
        },
        task: {
          data: [],
          count: 0
        },
        flight: {
          data: [],
          count: 0
        }
      },
      filterMsgData: [],
      filterMsgResult: '暂无消息',
      messageStyle: {
        pointerEvents: 'none'
      },
      mouseScreen: {
        down: false,
        styleName: '',
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0
      },
      contStyle: {
        left: window.innerWidth - 360 + 'px',
        right: '0px',
        x: window.screenX + (window.outerWidth - window.innerWidth) / 2 + window.innerWidth - 360,
        top: window.innerHeight - 700 + 'px',
        bottom: '0px',
        y: window.screenY + window.outerHeight - window.innerHeight + window.innerHeight - 700,
        height: '700px',
        width: '360px'
      },
      contTalkStyle: {
        left: '0px',
        right: window.innerWidth - 600 + 'px',
        x: window.screenX + (window.outerWidth - window.innerWidth) / 2,
        top: '0px',
        bottom: '0px',
        y: window.screenY + window.outerHeight - window.innerHeight,
        height: '500px',
        width: '600px'
      },
      contTaskStyle: {
        left: '0px',
        right: window.innerWidth - 600 + 'px',
        x: window.screenX + (window.outerWidth - window.innerWidth) / 2,
        top: '0px',
        bottom: '0px',
        y: window.screenY + window.outerHeight - window.innerHeight,
        height: '250px',
        width: '600px'
      },
      taskMsg: {
        applyUrl: '/taskscheduling/taskApply/save',
        applyAllUrl: '/taskscheduling/taskApply/saveAll',
        type: 'apply',
        subtype: 'apply.feedback.',
        index: 0,
        data: []
      }
    }
  },
  mounted () {
    this.empId = JSON.parse(localStorage.getItem('empId'))
    this.$store.commit('setConfigValue', 'dfsUrl')
    this.dfsUrl = this.$store.getters.getConfigValue
    postData(this.queryCountUrl, null).then(res => {
      if (res.data.code == 0) {
        _.forEach(this.msgData, (obj, key) => {
          obj.count = res.data.data[`unread_${key}`]
        })
      }
      postData(this.basicData.getBasicRooter, this.basicData.basicRouterUrl).then(res => {
        if (res.data.code == 0) {
          this.basicData.basicRooter = res.data.data
        }
      })
    })
    this.styleCenter('contTalkStyle', 600, 500)
    this.styleCenter('contTaskStyle', 600, 250)
    window.addEventListener('resize', () => {
      this.$nextTick(() => {
        return (() => {
          this.resizeStyle('contStyle')
          this.resizeStyle('contTalkStyle')
          this.resizeStyle('contTaskStyle')
        })()
      })
    })
  },
  methods: {
    styleCenter (style, width, height) {
      this[style].left = (window.innerWidth - width) / 2 + 'px'
      this[style].right = (window.innerWidth - width) / 2 + 'px'
      this[style].top = (window.innerHeight - height) / 2 + 'px'
      this[style].bottom = (window.innerHeight - height) / 2 + 'px'
    },
    resizeStyle (style) {
      var x = this[style].x
      var width = parseInt(this[style].width.split('px')[0])
      var windowX = window.screenX + (window.outerWidth - window.innerWidth) / 2
      var windowWidth = window.innerWidth
      if (parseInt(this[style].left.split('px')[0]) == 0 || x <= windowX) {
        this[style].left = '0px'
        this[style].right = windowWidth - width + 'px'
        this[style].x = windowX
      } else if (parseInt(this[style].right.split('px')[0]) == 0 || x >= windowX + windowWidth - width) {
        this[style].left = windowWidth - width + 'px'
        this[style].right = '0px'
        this[style].x = windowX + windowWidth - width
      } else {
        this[style].left = x - windowX + 'px'
        this[style].right = windowWidth - (x - windowX + width) + 'px'
      }
      var y = this[style].y
      var height = parseInt(this[style].height.split('px')[0])
      var windowY = window.screenY + window.outerHeight - window.innerHeight - 8
      var windowHeight = window.innerHeight
      if (parseInt(this[style].top.split('px')[0]) <= 0 || y <= windowY) {
        this[style].top = '0px'
        this[style].bottom = windowHeight - height + 'px'
        this[style].y = windowY
      } else if (parseInt(this[style].bottom.split('px')[0]) == 0 || y + height >= windowY + windowHeight) {
        this[style].top = windowHeight - height + 'px'
        this[style].bottom = '0px'
        this[style].y = windowY + windowHeight - height
      } else {
        this[style].top = y - windowY + 'px'
        this[style].bottom = windowHeight - (y - windowY + height) + 'px'
      }
    },
    // 自定义rabbitmq获取数据后操作
    customMqOnMessage (data) {
      var obj = _.find(this.msgTypeButton, ['key', data['msg_type']])
      var msg = null
      if (obj) {
        if (this.msgType.type == obj.key) {
          if (this.msgType.rowSelect != null) {
            this.msgType.rowSelect += 1
          }
          msg = JSON.parse(data['msg_content'])
          let temp = null
          switch (obj.key) {
            case this.msgTypeButton[0].key:
            temp = {
              time: `${this.latestDate.replace(/\//g, '-')} ${this.latestTime}`,
              msgTopic: msg['notice_topic'],
              msgCont: msg['notice_content'],
              type: msg['notice_type'],
              msgConfirmTime: null,
              msgUuid: data['msg_id']
            }
            break
            case this.msgTypeButton[1].key:
            let arr = data['msg_subtype'].split('.')
            this.$store.commit('setOption', 'taskTmp')
            let tmp = _.find(this.$store.getters.getOption, ['key', `${arr[0]}.${arr[1]}`])
            let reg = new RegExp('{([^}]+)}', 'g')
            let res = null
            let result = []
            while ((res = reg.exec(tmp.remark)) != null) {
              result.push(res)
            }
            let remark = tmp.remark
            _.forEach(result, (rst) => {
              remark = remark.replace(rst[0], msg[rst[1]])
            })
            temp = {
              airline: msg.flt_no.substr(0, 2),
              flightNo: msg.flt_no,
              time: `${this.latestDate.replace(/\//g, '-')} ${this.latestTime}`,
              msgCont: remark,
              msgSenderName: data['msg_sender'],
              taskName: msg.task_cn,
              msgConfirmTime: null,
              msgUuid: data['msg_id']
            }
            break
            case this.msgTypeButton[2].key:
            arr = data['msg_subtype'].split('.')
            this.$store.commit('setOption', 'taskTmp')
            tmp = _.find(this.$store.getters.getOption, ['key', `${arr[0]}.${arr[1]}`])
            reg = new RegExp('{([^}]+)}', 'g')
            res = null
            result = []
            while ((res = reg.exec(tmp.remark)) != null) {
              result.push(res)
            }
            remark = tmp.remark
            _.forEach(result, (rst) => {
              remark = remark.replace(rst[0], msg[rst[1]])
            })
            temp = {
              airline: msg.flt_no.substr(0, 2),
              flightNo: msg.flt_no,
              time: `${this.latestDate.replace(/\//g, '-')} ${this.latestTime}`,
              msgCont: remark,
              msgSenderName: data['msg_sender'],
              taskName: msg.task_name,
              empName: msg.emp_name,
              msgConfirmTime: null,
              msgUuid: data['msg_id']
            }
            break
            case this.msgTypeButton[3].key:
            temp = {
              airline: msg.FLIGHTNOF.substr(0, 2),
              flightNo: msg.FLIGHTNOF,
              time: `${this.latestDate.replace(/\//g, '-')} ${this.latestTime}`,
              msgCont: msg.MSGCONTENT,
              msgSenderName: data['msg_sender'],
              msgConfirmTime: null,
              msgUuid: data['msg_id']
            }
            break
          }
          this.msgData[data['msg_type']].data.unshift(temp)
          this.msgData[data['msg_type']].data = this.msgData[data['msg_type']].data.slice(0, this.maxLength)
          this.filterMsgDataEnter()
        }
        this.msgData[obj.key].count += 1
      } else if (data['msg_type'] == this.talk.type && JSON.parse(data['msg_sender']) != this.empId) {
        msg = JSON.parse(data['msg_content'])
        var index = _.findIndex(this.talk.talkData.arr, ['id', msg.hasOwnProperty('im_group_id') ? JSON.parse(msg['im_group_id']) : JSON.parse(msg['im_sender_id'])])
        if (~index) {
          if ([4, 5].includes(JSON.parse(msg['im_type']))) {
            if (JSON.parse(msg['im_type']) == 4) {
              this.$set(this.talk.talkData.arr[index], 'personalId', msg['im_content'])
              var personalIdArr = this.talk.talkData.arr[index].personalId.split(',').map(Number)
              var incld = _.find(personalIdArr, this.empId)
            }
            if (!incld) {
              this.talk.talkData.arr.splice(index, 1)
              if (this.talk.talkData.selectIndex != null) {
                if (this.talk.talkData.selectIndex == index) {
                  this.showErrorCustom(JSON.parse(msg['im_type']) == 4 ? `您已被移出${msg['im_group_name']}群组` : `${msg['im_group_name']}群组已被管理员解散`, '')
                  this.talk.talkData.selectIndex = null
                } else if (this.talk.talkData.selectIndex > index) {
                  this.talk.talkData.selectIndex -= 1
                }
              }
            }
            postData(this.talk.ctcsData.group.queryGroupUrl, {}).then(res => {
              if (res.data.code == 0) {
                this.talk.ctcsData.group.arr = res.data.data.sort((item1, item2) => {
                  return item1.chatGroupCn.localeCompare(item2.chatGroupCn, 'zh-CN')
                })
                this.filterMsgGroupDataEnter()
              }
            })
          } else {
            this.talk.talkData.arr[index].recordArr.push({
              msgSender: JSON.parse(msg['im_sender_id']),
              msgSenderName: msg['im_sender_name'],
              msgDeptName: msg['im_dept_name'],
              msgContent: msg['im_content'],
              msgTime: `${this.latestDate} ${this.latestTime}`,
              msgType: JSON.parse(msg['im_type']),
              msgContLen: msg.hasOwnProperty('im_content_length') ? JSON.parse(msg['im_content_length']) : null,
              unread: true
            })
            this.$set(this.talk.talkData.arr[index], 'unread', true)
            this.$set(this.talk.talkData.arr[index], 'name', msg.hasOwnProperty('im_group_id') ? msg['im_group_name'] : msg['im_sender_name'])
            this.talkArrTop(index)
            this.scrollRecord(index, null, true)
          }
        } else {
          if ([4, 5].includes(JSON.parse(msg['im_type']))) {
            postData(this.talk.ctcsData.group.queryGroupUrl, {}).then(res => {
              if (res.data.code == 0) {
                this.talk.ctcsData.group.arr = res.data.data.sort((item1, item2) => {
                  return item1.chatGroupCn.localeCompare(item2.chatGroupCn, 'zh-CN')
                })
                this.filterMsgGroupDataEnter()
              }
            })
          } else {
            this.talk.talkData.arr.unshift({
              id: msg.hasOwnProperty('im_group_id') ? JSON.parse(msg['im_group_id']) : JSON.parse(msg['im_sender_id']),
              name: msg.hasOwnProperty('im_group_name') ? msg['im_group_name'] : msg['im_sender_name'],
              type: msg.hasOwnProperty('im_group_id') ? 'group' : 'personal',
              sendCont: null,
              recordArr: [{
                msgSender: JSON.parse(msg['im_sender_id']),
                msgSenderName: msg['im_sender_name'],
                msgDeptName: msg['im_dept_name'],
                msgContent: msg['im_content'],
                msgTime: `${this.latestDate} ${this.latestTime}`,
                msgType: JSON.parse(msg['im_type']),
                msgContLen: msg.hasOwnProperty('im_content_length') ? JSON.parse(msg['im_content_length']) : null,
                unread: true
              }],
              postCount: 0,
              unread: true,
              pageNum: this.talk.talkData.pageNum,
              msgId: null
            })
            if (this.talk.talkData.selectIndex != null) {
              this.talk.talkData.selectIndex += 1
            }
          }
        }
      } else if (data['msg_type'] == this.taskMsg.type && _.startsWith(data['msg_subtype'], this.taskMsg.subtype)) {
        msg = JSON.parse(data['msg_content'])
        let temp = {
          time: `${this.latestDate.replace(/\//g, '-')} ${this.latestTime}`,
          dynamicTaskApplyId: msg.dynamicTaskApplyId,
          flightNo: msg.flightNo,
          taskCn: msg.taskCn,
          empName: msg.empName
        }
        this.taskMsg.data.push(temp)
      }
    },
    scrollRecord (index, sign, newRecordSign) {
      if (!_.isEmpty(document.getElementsByClassName('record-cont-scroll'))) {
        var bool = document.getElementsByClassName('record-cont-scroll')[0].scrollHeight - document.getElementsByClassName('record-cont-scroll')[0].scrollTop <= document.getElementsByClassName('record-cont-scroll')[0].clientHeight || sign
        if (this.talk.show && this.talk.selectType == 1 && this.talk.talkData.selectIndex == index && bool) {
          this.$set(this.talk.talkData.arr[index], 'unread', false)
          this.talk.talkData.newRecordShow = false
          this.$nextTick(() => {
            document.getElementsByClassName('record-cont-scroll')[0].scrollTop = document.getElementsByClassName('record-cont-scroll')[0].scrollHeight
          })
        } else {
          if (newRecordSign) {
            this.talk.talkData.newRecordShow = true
          }
        }
      }
    },
    msgContDown (event, styleName) {
      this.mouseScreen.down = true
      this.mouseScreen.startX = event.clientX
      this.mouseScreen.startY = event.clientY
      this.messageStyle.pointerEvents = 'all'
      this.mouseScreen.styleName = styleName
    },
    msgContUp (event) {
      if (this.mouseScreen.down) {
        var style = this[this.mouseScreen.styleName]
        this.mouseScreen.endX = event.clientX
        this.mouseScreen.endY = event.clientY
        var left = parseInt(style.left.split('px')[0])
        var width = parseInt(style.width.split('px')[0])
        var moveWidth = this.mouseScreen.endX - this.mouseScreen.startX
        var styleW = this.computeLeft(left, width, moveWidth)
        style.left = styleW.left
        style.right = styleW.right
        style.x = styleW.x

        var top = parseInt(style.top.split('px')[0])
        var height = parseInt(style.height.split('px')[0])
        var moveHeight = this.mouseScreen.endY - this.mouseScreen.startY
        var styleH = this.computeTop(top, height, moveHeight)
        style.top = styleH.top
        style.bottom = styleH.bottom
        style.y = styleH.y
        this.mouseScreen.down = false
        this.messageStyle.pointerEvents = 'none'
      }
    },
    allowDrop (event) {
      event.preventDefault()
    },
    computeLeft (left, width, moveWidth) {
      var style = {
        left: 0,
        right: 0,
        x: 0
      }
      if (left + moveWidth < 0 || window.innerWidth - width < 0) {
        style.left = '0px'
        style.right = window.innerWidth - width + 'px'
        style.x = width + window.screenX + (window.outerWidth - window.innerWidth) / 2
      } else if (left + moveWidth > window.innerWidth - width) {
        style.left = window.innerWidth - width + 'px'
        style.right = '0px'
        style.x = window.innerWidth - width + window.screenX + (window.outerWidth - window.innerWidth) / 2
      } else {
        style.left = left + moveWidth + 'px'
        style.right = window.innerWidth - (left + moveWidth) - width + 'px'
        style.x = left + moveWidth + window.screenX + (window.outerWidth - window.innerWidth) / 2
      }
      if (style.left < 0) {
        style.left = '0px'
        style.right = window.innerWidth - width + 'px'
        style.x = width + window.screenX + (window.outerWidth - window.innerWidth) / 2
      }
      return style
    },
    computeTop (top, height, moveHeight) {
      var style = {
        top: 0,
        bottom: 0,
        y: 0
      }
      if (top + moveHeight < 0 || window.innerHeight - height < 0) {
        style.top = '0px'
        style.bottom = window.innerHeight - height + '0px'
        style.y = window.screenY + window.outerHeight - window.innerHeight - 8
      } else if (top + moveHeight > window.innerHeight - height) {
        style.top = window.innerHeight - height + 'px'
        style.bottom = '0px'
        style.y = window.innerHeight - height + window.screenY + window.outerHeight - window.innerHeight - 8
      } else {
        style.top = top + moveHeight + 'px'
        style.bottom = window.innerHeight - (top + moveHeight) - height + '0px'
        style.y = top + moveHeight + window.screenY + window.outerHeight - window.innerHeight - 8
      }
      if (style.top < 0) {
        style.top = '0px'
        style.bottom = window.innerHeight - height + 'px'
        style.y = window.screenY + window.outerHeight - window.innerHeight - 8
      }
      return style
    },
    changeMsgType (type) {
      if (this.msgType.type == type) {
        this.msgType.show = false
        this.msgType.title = null
        this.msgType.type = null
        this.msgType.rowSelect = null
      } else {
        if (this.talk.type == type) {
          if (!_.isEmpty(this.talk.talkData.arr) && this.talk.talkData.selectIndex && !this.talk.show) {
            this.talk.talkData.selectIndex = 0
            this.talkArrSelectClick(0)
          }
          this.talk.show = !this.talk.show
        } else {
          var obj = _.find(this.msgTypeButton, ['key', type])
          if (obj) {
            this.msgType.filterValue = null
            this.msgType.title = obj.label
            this.msgType.type = obj.key
            this.msgType.show = true
            this.msgType.rowSelect = null
            this.queryMsgData(this.msgType.type)
          }
        }
      }
    },
    changeTalkType (selectType) {
      this.talk.selectType = selectType
      if (selectType == 1) {
        if (this.talk.talkData.selectIndex != null && ~this.talk.talkData.selectIndex) {
          this.$nextTick(() => {
            document.getElementsByClassName('record-cont-scroll')[0].scrollTop = document.getElementsByClassName('record-cont-scroll')[0].scrollHeight
          })
        }
      } else if (selectType == 2) {
        var urls = [this.talk.ctcsData.emp.queryDeptUrl, this.talk.ctcsData.group.queryGroupUrl]
        postAllData(urls, [{}, {}]).then(this.axios.spread((resa, resb) => {
          if (resa.data.code == 0) {
            this.talk.ctcsData.emp.options = resa.data.data
            if (this.talk.ctcsData.emp.options && this.talk.ctcsData.emp.options.length > 0) {
              this.talk.ctcsData.emp.deptId = [this.talk.ctcsData.emp.options[0].id]
              this.ctcsDeptChange()
            }
          }
          if (resb.data.code == 0) {
            this.talk.ctcsData.group.arr = resb.data.data.sort((item1, item2) => {
              return item1.chatGroupCn.localeCompare(item2.chatGroupCn, 'zh-CN')
            })
            this.filterMsgGroupDataEnter()
          }
        }))
      }
    },
    queryMsgData (type) {
      this.msgType.disabled = true
      var data = {
        msgTypeNo: type
      }
      postData(this.queryUrl, data).then(res => {
        if (res.data.code == 0) {
          this.msgType.rowSelect = null
          this.msgData[type].data = []
          _.forEach(res.data.data['rows'], (item) => {
            var obj = JSON.parse(item.msgContent)
            var temp = null
            switch (this.msgType.type) {
              case this.msgTypeButton[0].key:
              temp = {
                time: item.msgReceiveTime,
                msgTopic: obj['notice_topic'],
                msgCont: obj['notice_content'],
                msgSenderName: item.msgSenderName,
                msgConfirmTime: item.msgConfirmTime,
                msgUuid: item.msgUuid
              }
              break
              case this.msgTypeButton[2].key:
              var arr = item.msgTypeSubNo.split('.')
              this.$store.commit('setOption', 'taskTmp')
              var tmp = _.find(this.$store.getters.getOption, ['key', `${arr[0]}.${arr[1]}`])
              var reg = new RegExp('{([^}]+)}', 'g')
              var res = null
              var result = []
              while ((res = reg.exec(tmp.remark)) != null) {
                result.push(res)
              }
              var remark = tmp.remark
              _.forEach(result, (rst) => {
                remark = remark.replace(rst[0], obj[rst[1]])
              })
              temp = {
                airline: obj.flt_no.substr(0, 2),
                flightNo: obj.flt_no,
                taskName: obj.task_name,
                empName: obj.emp_name,
                time: item.msgReceiveTime,
                msgCont: remark,
                msgSenderName: item.msgSenderName,
                msgConfirmTime: item.msgConfirmTime,
                msgUuid: item.msgUuid
              }
              break
              case this.msgTypeButton[3].key:
              temp = {
                airline: obj.FLIGHTNOF.substr(0, 2),
                flightNo: obj.FLIGHTNOF,
                time: item.msgReceiveTime,
                msgCont: obj.MSGCONTENT,
                msgSenderName: item.msgSenderName,
                msgConfirmTime: item.msgConfirmTime,
                msgUuid: item.msgUuid
              }
              break
            }
            this.msgData[type].data.push(temp)
          })
          this.msgData[type].data = this.msgData[type].data.slice(0, this.maxLength)
          this.filterMsgDataEnter()
        }
        this.msgData[type].count = _.countBy(this.msgData[type].data, ['msgConfirmTime', null]).true || 0
        this.msgType.disabled = false
      }).catch(err => {
        this.showError('获取消息信息', err)
        this.msgType.disabled = false
      })
    },
    rowSelectClick (index) {
      if (this.msgType.rowSelect == index) {
        this.msgType.rowSelect = null
      } else {
        this.msgType.rowSelect = index
        if (!this.filterMsgData[index].msgConfirmTime) {
          var data = {
            msgUuid: this.filterMsgData[index].msgUuid
          }
          postData(this.updateRowUrl, data).then(res => {
            if (res.data.code == 0) {
              _.forEach(this.filterMsgData, (item) => {
                if (item.msgUuid == data.msgUuid) {
                  item.msgConfirmTime = this.latestTime
                }
              })
            }
            this.msgData[this.msgType.type].count = _.countBy(this.msgData[this.msgType.type].data, ['msgConfirmTime', null]).true || 0
          })
        }
      }
    },
    rowCtcsSelectClick (key, value) {
      this.talk.ctcsData[key].selectKey = value
    },
    selectEditGroupClick (item) {
      var objIndex = _.findIndex(this.talk.talkData.editGroup.groupData.arr, ['empId', item.empId])
      if (~objIndex) {
        this.talk.talkData.editGroup.groupData.arr.splice(objIndex, 1)
      } else {
        this.talk.talkData.editGroup.groupData.arr.unshift(item)
      }
    },
    selectCtcsDblClick (type, id, name, isManager) {
      var data = {
        id: id,
        type: type
      }
      var objIndex = _.findIndex(this.talk.talkData.arr, data)
      if (~objIndex) {
        this.talk.talkData.selectIndex = objIndex
        this.talk.selectType = 1
        this.$nextTick(() => {
          var scrollTop = document.getElementsByClassName('talk-cont-1')[0].querySelector('.talk-cont-ul').querySelector('.row-select').offsetTop
          document.getElementsByClassName('talk-cont-1')[0].querySelector('.talk-cont-left').scrollTop = scrollTop - 1 - document.getElementsByClassName('message-info-dialog')[1].querySelector('.msg-cont-header').clientHeight
        })
        this.talk.talkData.arr[objIndex].name = name
        this.postCountArr(data, objIndex)
      } else {
        this.talk.talkData.arr.unshift({
          id: id,
          name: name,
          type: type,
          sendCont: null,
          isManager: isManager,
          postCount: 0,
          unread: false,
          pageNum: this.talk.talkData.pageNum,
          msgId: null
        })
        this.talk.talkData.selectIndex = 0
        this.talk.selectType = 1
        this.postCountRecordArr(data, this.talk.talkData.selectIndex)
      }
    },
    postCountArr (data, index, sign) {
      var urls = [this.talk.talkData.updateDataUrl, this.talk.talkData.queryDeptUrl]
      postAllData(urls, [data, '']).then(this.axios.spread((resa, resb) => {
        if (resa.data.code == 0) {
          this.$set(this.talk.talkData.arr[index], 'count', resa.data.data[data.type == 'personal' ? 'deptName' : 'chatMemberNumber'])
          this.$set(this.talk.talkData.arr[index], 'isManager', resa.data.data.hasOwnProperty('isManager') ? resa.data.data.isManager : null)
          this.$set(this.talk.talkData.arr[index], 'personalId', resa.data.data.hasOwnProperty('personalId') ? resa.data.data.personalId : null)
        }
        if (resb.data.code == 0) {
          this.talk.talkData.deptName = resb.data.data.deptName
        }
        this.scrollRecord(index, sign)
      }))
    },
    postRecordArr (index) {
      var data = {
        pageNum: this.talk.talkData.arr[index].pageNum,
        pageSize: this.talk.talkData.pageSize,
        data: {
          id: this.talk.talkData.arr[index].id,
          type: this.talk.talkData.arr[index].type,
          msgId: this.talk.talkData.arr[index].msgId
        }
      }
      queryPageDataList(this.talk.talkData.getRecordUrl, data).then(res => {
        if (res.data.code == 0) {
          var temp = res.data.data.rows
          var arr = []
          var scrollHeight = document.getElementsByClassName('record-cont-scroll')[0].scrollHeight
          _.forEach(temp, (tmp) => {
            var cont = JSON.parse(tmp['MSG_CONTENT'])
            if (![4, 5].includes(cont['im_type'])) {
              var obj = {
                msgUuid: tmp['MSG_UUID'],
                msgSender: tmp['MSG_SENDER'],
                msgSenderName: tmp['MSG_SENDER_NAME'],
                msgDeptName: tmp['DEPT_NAME'],
                msgContent: cont['im_content'],
                msgTime: this.empId == tmp['MSG_SENDER'] ? tmp['MSG_SEND_TIME'] : tmp['MSG_RECEIVE_TIME'],
                msgType: cont['im_type'],
                msgContLen: cont.hasOwnProperty('im_content_length') ? cont['im_content_length'] : null
              }
              this.talk.talkData.arr[index].recordArr.unshift(obj)
            }
          })
          this.talk.talkData.arr[index].pageNum += 1
          this.$nextTick(() => {
            console.log('测试')
            document.getElementsByClassName('record-cont-scroll')[0].scrollTop = document.getElementsByClassName('record-cont-scroll')[0].scrollHeight - scrollHeight
          })
          // this.scrollRecord(index, sign)
        }
      })
    },
    postCountRecordArr (data, index, sign) {
      var datac = {
        pageNum: this.talk.talkData.arr[index].pageNum,
        pageSize: this.talk.talkData.pageSize,
        data: data
      }
      var urls = [this.talk.talkData.updateDataUrl, this.talk.talkData.queryDeptUrl, this.talk.talkData.getRecordUrl]
      postDataEndPage(urls, [data, '', datac]).then(this.axios.spread((resa, resb, resc) => {
        if (resa.data.code == 0) {
          this.$set(this.talk.talkData.arr[index], 'count', resa.data.data[data.type == 'personal' ? 'deptName' : 'chatMemberNumber'])
          this.$set(this.talk.talkData.arr[index], 'isManager', resa.data.data.hasOwnProperty('isManager') ? resa.data.data.isManager : null)
          this.$set(this.talk.talkData.arr[index], 'postCount', 1)
          this.$set(this.talk.talkData.arr[index], 'personalId', resa.data.data.hasOwnProperty('personalId') ? resa.data.data.personalId : null)
        }
        if (resb.data.code == 0) {
          this.talk.talkData.deptName = resb.data.data.deptName
        }
        if (resc.data.code == 0) {
          var temp = _.reverse(resc.data.data.rows)
          var arr = []
          _.forEach(temp, (tmp, tmpIndex) => {
            if (tmpIndex == 0) {
              this.talk.talkData.arr[index].msgId = tmp['MSG_ID']
            }
            var cont = JSON.parse(tmp['MSG_CONTENT'])
            if (![4, 5].includes(cont['im_type'])) {
              var obj = {
                msgUuid: tmp['MSG_UUID'],
                msgSender: tmp['MSG_SENDER'],
                msgSenderName: tmp['MSG_SENDER_NAME'],
                msgDeptName: tmp['DEPT_NAME'],
                msgContent: cont['im_content'],
                msgTime: this.empId == tmp['MSG_SENDER'] ? tmp['MSG_SEND_TIME'] : tmp['MSG_RECEIVE_TIME'],
                msgType: cont['im_type'],
                msgContLen: cont.hasOwnProperty('im_content_length') ? cont['im_content_length'] : null
              }
              arr.push(obj)
            }
          })
          this.talk.talkData.arr[index].recordArr = arr
          this.talk.talkData.arr[index].pageNum += 1
          this.talk.talkData.arr[index].maxPage = Math.ceil(resc.data.data.total / this.talk.talkData.pageSize)
          if (!_.isEmpty(arr)) {
            this.scrollRecord(index, sign)
          }
        }
      }))
    },
    getLastCont (item) {
      var cont = ''
      if (item.recordArr && item.recordArr.length > 0) {
        switch (_.last(item.recordArr).msgType) {
          case 0: cont = _.last(item.recordArr).msgContent
          break
          case 1: cont = '[图片]'
          break
          case 2: cont = '[语音]'
          break
          case 3: cont = '[视频]'
          break
        }
      }
      return cont
    },
    getLastTime (item) {
      var time = ''
      if (item.recordArr && item.recordArr.length > 0) {
        time = _.last(item.recordArr).msgTime.substr(11, 5)
      }
      return time
    },
    batchRead () {
      var arr = []
      if (this.msgType.filterValue) {
        arr = _.map(this.filterMsgData, 'msgUuid')
      }
      var data = {
        msgTypeNo: this.msgType.type,
        msgUuid: arr
      }
      postData(this.batchReadUrl, data).then(res => {
        if (res.data.code == 0) {
          _.forEach(this.filterMsgData, (item) => {
            if (this.msgType.filterValue) {
              if (arr.includes(item.msgUuid)) {
                item.msgConfirmTime = this.latestTime
              }
            } else {
              item.msgConfirmTime = this.latestTime
            }
          })
        }
        this.msgData[this.msgType.type].count = _.countBy(this.msgData[this.msgType.type].data, ['msgConfirmTime', null]).true || 0
      })
    },
    batchClear () {
      this.msgType.rowSelect = null
      var length = this.msgData[this.msgType.type].data.length
      var data = {
        msgUuid: this.filterMsgData[0].msgUuid
      }
      postData(this.batchClearUrl, data).then(res => {
        if (res.data.code == 0) {
          this.msgData[this.msgType.type].data = _.dropRight(this.msgData[this.msgType.type].data, length)
          this.msgType.rowSelect = null
          this.filterMsgDataEnter()
        }
        this.msgData[this.msgType.type].count = _.countBy(this.msgData[this.msgType.type].data, ['msgConfirmTime', null]).true || 0
      })
    },
    newTopic () {
      if (this.msgData.notice.sendMsg.depts == null) {
        postData(this.msgData.notice.sendMsg.getDepts, this.empId).then(res => {
          if (res.data.code == 0) {
            this.msgData.notice.sendMsg.depts = res.data.data
            if (this.msgData.notice.sendMsg.depts == null) {
              this.showErrorCustom('获取权限异常', '请重新尝试')
            } else {
              postData(this.msgData.notice.sendMsg.getOptions, null).then(res => {
                if (res.data.code == 0) {
                  this.msgData.notice.sendMsg.options = res.data.data
                  this.msgData.notice.sendMsg.visible = true
                } else {
                  this.showError('获取通告主题', '请重新尝试')
                }
              })
            }
          } else {
            this.showErrorCustom('获取权限异常', '请重新尝试')
          }
        })
      } else {
        this.msgData.notice.sendMsg.visible = true
      }
    },
    changeTopic (value) {
      if (value == null) {
        this.msgData.notice.sendMsg.contOptions = []
      } else {
        queryAll(this.msgData.notice.sendMsg.getContOptions, {topic: value}).then(res => {
          if (res.data.code == 0) {
            this.msgData.notice.sendMsg.contOptions = res.data.data
          } else {
            this.showError('获取通告内容', '请重新尝试')
          }
        })
      }
    },
    skipTopic () {
      if (this.basicData.basicRooter) {
        var name = '通告主题'
        var {href} = this.$router.resolve({
          name: name
        })
        this.basicData.basicOpenWin = window.open(href, name)
      } else {
        this.showErrorCustom('跳转失败', '当前用户无通告主题管理权限 !')
      }
    },
    sendTopic () {
      if (this.msgData.notice.sendMsg.type == 0) {
        this.sendTopicMsg()
      } else if (this.msgData.notice.sendMsg.depts != null) {
        if (this.msgData.notice.sendMsg.type == 1) {
          if (this.msgData.notice.sendMsg.depts.length > 1) {
            postData(this.msgData.notice.sendMsg.getEmps, this.msgData.notice.sendMsg.depts[1]).then(res => {
              if (res.data.code == 0) {
                this.sendTopicMsg(_.map(res.data.data, 'empId').join(','))
              }
            })
          } else if (this.msgData.notice.sendMsg.depts.length > 0) {
            postData(this.msgData.notice.sendMsg.getEmps, _.last(this.msgData.notice.sendMsg.depts)).then(res => {
              if (res.data.code == 0) {
                this.sendTopicMsg(_.map(res.data.data, 'empId').join(','))
              }
            })
          } else {
            this.showErrorCustom('操作异常', '当前员工无所属部门')
          }
        } else {
          if (this.msgData.notice.sendMsg.depts.length > 2) {
            postData(this.msgData.notice.sendMsg.getEmps, _.last(this.msgData.notice.sendMsg.depts)).then(res => {
              if (res.data.code == 0) {
                this.sendTopicMsg(_.map(res.data.data, 'empId').join(','))
              }
            })
          } else if (this.msgData.notice.sendMsg.depts.length > 0) {
            this.showErrorCustom('操作异常', '当前员工无所属科室')
          } else {
            this.showErrorCustom('操作异常', '参数错误')
          }
        }
      } else {
        this.newTopic()
        this.showErrorCustom('操作异常', '参数错误, 请重新尝试')
      }
    },
    sendTopicMsg (personalId) {
      var msgContent = {
        notice_topic: this.msgData.notice.sendMsg.topic,
        notice_content: this.msgData.notice.sendMsg.content,
        notice_type: this.msgData.notice.sendMsg.type
      }
      var msgData = {
        msg_sender: this.empId,
        msg_subtype: `notice${personalId ? '.spec' : '.all'}`,
        msg_type: 'notice',
        msg_content: JSON.stringify(msgContent)
      }
      if (personalId) {
        this.$set(msgData, 'msg_personalid', personalId)
      }
      this.msgData.notice.sendMsg.loading = true
      postDataNone(this.sendMsgUrl, JSON.stringify(msgData)).then(res => {
        if (res.data.status == 0) {
          this.closeNoticeDialog()
          this.showSuccess('通告发布')
        } else {
          this.msgData.notice.sendMsg.loading = false
          this.showError('通告发布', '请重新尝试 !')
        }
      })
    },
    closeNoticeDialog () {
      this.msgData.notice.sendMsg.visible = false
      this.msgData.notice.sendMsg.loading = false
      this.msgData.notice.sendMsg.topic = null
      this.msgData.notice.sendMsg.content = null
      this.msgData.notice.sendMsg.type = 0
    },
    filterMsgDataEnter () {
      if (!this.msgType.filterValue) {
        this.filterMsgData = this.msgData[this.msgType.type].data
        this.filterMsgResult = '暂无消息'
      } else {
        this.filterMsgData = _.filter(this.msgData[this.msgType.type].data, (item) => {
          return (item.flightNo && ~item.flightNo.indexOf(this.msgType.filterValue)) || (item.msgCont && ~item.msgCont.indexOf(this.msgType.filterValue))
        })
        if (this.filterMsgData.length == 0) {
          this.filterMsgResult = '无搜索结果'
        }
      }
    },
    filterMsgEmpDataEnter () {
      if (!this.talk.ctcsData.emp.filterValue) {
        this.talk.ctcsData.emp.filterArr = this.talk.ctcsData.emp.arr
      } else {
        this.talk.ctcsData.emp.filterArr = _.filter(this.talk.ctcsData.emp.arr, (item) => {
          return ~item.empName.indexOf(this.talk.ctcsData.emp.filterValue)
        })
      }
    },
    filterMsgGroupDataEnter () {
      if (!this.talk.ctcsData.group.filterValue) {
        this.talk.ctcsData.group.filterArr = this.talk.ctcsData.group.arr
      } else {
        this.talk.ctcsData.group.filterArr = _.filter(this.talk.ctcsData.group.arr, (item) => {
          return ~item.chatGroupCn.indexOf(this.talk.ctcsData.group.filterValue)
        })
      }
    },
    filterEditGroupEmpDataEnter () {
      if (!this.talk.talkData.editGroup.filterValue) {
        this.talk.talkData.editGroup.filterArr = this.talk.talkData.editGroup.arr
      } else {
        this.talk.talkData.editGroup.filterArr = _.filter(this.talk.talkData.editGroup.arr, (item) => {
          return ~item.empName.indexOf(this.talk.talkData.editGroup.filterValue)
        })
      }
    },
    talkCtcsSelectClick (value) {
      this.talk.ctcsType = value
    },
    talkArrSelectClick (index) {
      var data = {
        id: this.talk.talkData.arr[index].id,
        type: this.talk.talkData.arr[index].type,
        msgId: this.talk.talkData.arr[index].msgId
      }
      this.talk.talkData.selectIndex = index
      if (this.talk.talkData.arr[index].postCount) {
        this.postCountArr(data, index, true)
      } else {
        this.postCountRecordArr(data, index, true)
      }
    },
    closeTalkArr (index) {
      this.talk.talkData.selectIndex = null
      this.talk.talkData.arr.splice(index, 1)
    },
    ctcsDeptChange () {
      var deptId = _.isEmpty(this.talk.ctcsData.emp.deptId) ? '' : this.talk.ctcsData.emp.deptId[this.talk.ctcsData.emp.deptId.length - 1]
      postData(this.talk.ctcsData.emp.queryEmpUrl, deptId).then(res => {
        if (res.data.code == 0) {
          this.talk.ctcsData.emp.arr = _.filter(res.data.data, (item) => {
            return item.empId != this.empId
          }).sort((item1, item2) => {
            return item1.empName.localeCompare(item2.empName, 'zh-CN')
          })
          this.filterMsgEmpDataEnter()
        }
      })
    },
    getGroupMemberClick (id) {
      postData(this.talk.talkData.queryMember, id).then(res => {
        if (res.data.code == 0) {
          this.talk.talkData.memberArr = _.filter(res.data.data, (item) => {
            return item.empId != this.empId
          })
        } else {
          this.showError('获取群组成员信息')
        }
      })
    },
    editGroupDeptChange () {
      var deptId = _.isEmpty(this.talk.talkData.editGroup.deptId) ? '' : this.talk.talkData.editGroup.deptId[this.talk.talkData.editGroup.deptId.length - 1]
      postData(this.talk.talkData.editGroup.queryEmpUrl, deptId).then(res => {
        if (res.data.code == 0) {
          this.talk.talkData.editGroup.arr = _.filter(res.data.data, (item) => {
            return item.empId != this.empId
          })
          this.filterEditGroupEmpDataEnter()
        }
      })
    },
    editGroupClick (sign) {
      this.talk.talkData.editGroup.title = sign == 1 ? '新建' : '编辑'
      this.talk.talkData.editGroup.groupData.id = null
      this.talk.talkData.editGroup.groupData.name = ''
      this.talk.talkData.editGroup.groupData.arr = []
      this.talk.talkData.editGroup.visible = true
      if (sign == 1) {
      } else {
        this.talk.talkData.editGroup.groupData.id = this.talk.talkData.arr[this.talk.talkData.selectIndex].id
        this.talk.talkData.editGroup.groupData.name = this.talk.talkData.arr[this.talk.talkData.selectIndex].name
        this.talk.talkData.editGroup.groupData.arr = this.talk.talkData.memberArr
      }
      postData(this.talk.talkData.editGroup.queryDeptUrl, {}).then(res => {
        if (res.data.code == 0) {
          this.talk.talkData.editGroup.options = res.data.data
          if (this.talk.talkData.editGroup.options && this.talk.talkData.editGroup.options.length > 0) {
            this.talk.talkData.editGroup.deptId = [this.talk.talkData.editGroup.options[0].id]
            this.editGroupDeptChange()
          }
        }
      })
    },
    deleteGroupClick () {
      this.talk.talkData.deleteGroup.visible = true
    },
    deleteGroupConfirm () {
      this.talk.talkData.deleteGroup.loading = true
      postData(this.talk.talkData.editGroup.deleteUrl, this.talk.talkData.arr[this.talk.talkData.selectIndex].id).then(res => {
        if (res.data.code == 0) {
          this.sendImMsg(5, '该群组已被删除')
          this.talk.talkData.arr.splice(this.talk.talkData.selectIndex, 1)
          this.talk.talkData.selectIndex = null
          this.talk.talkData.deleteGroup.loading = false
          this.talk.talkData.deleteGroup.visible = false
          this.showSuccess('删除群组')
        } else {
          this.showError('删除群组', '请重新尝试 !')
          this.talk.talkData.deleteGroup.loading = false
        }
      }).catch(err => {
        this.showError('删除群组', err)
        this.talk.talkData.deleteGroup.loading = false
      })
    },
    closeTalkDialog () {
      this.talk.talkData.editGroup.visible = false
      this.talk.talkData.editGroup.loading = false
      this.talk.talkData.editGroup.filterValue = ''
      this.talk.talkData.editGroup.groupData.name = ''
      this.talk.talkData.editGroup.groupData.arr = []
    },
    saveTalkDialog () {
      if (this.talk.talkData.editGroup.groupData.name && !_.isEmpty(this.talk.talkData.editGroup.groupData.arr)) {
        var data = {
          chatGroupId: this.talk.talkData.editGroup.groupData.id,
          chatGroupCn: this.talk.talkData.editGroup.groupData.name,
          lstAomsChatMember: this.talk.talkData.editGroup.groupData.arr
        }
        this.talk.talkData.editGroup.loading = true
        var url = this.talk.talkData.editGroup.groupData.id ? this.talk.talkData.editGroup.updateUrl : this.talk.talkData.editGroup.saveUrl
        postData(url, data).then(res => {
          if (res.data.code == 0) {
            this.showSuccess(`${this.talk.talkData.editGroup.groupData.id ? '编辑' : '新建'}群组`)
            if (this.talk.talkData.editGroup.title == '编辑') {
              this.sendImMsg(4, _.map(this.talk.talkData.editGroup.groupData.arr, 'empId').join(','))
            } else {
              postData(this.talk.ctcsData.group.queryGroupUrl, {}).then(res => {
                if (res.data.code == 0) {
                  this.talk.ctcsData.group.arr = res.data.data.sort((item1, item2) => {
                    return item1.chatGroupCn.localeCompare(item2.chatGroupCn, 'zh-CN')
                  })
                  this.filterMsgGroupDataEnter()
                }
              })
            }
            var index = _.findIndex(this.talk.talkData.arr, ['id', data.chatGroupId])
            if (index != null && this.talk.selectType == 1 && this.talk.talkData.selectIndex == index) {
              this.talk.talkData.arr[index].name = this.talk.talkData.editGroup.groupData.name
              var tmpData = {
                id: this.talk.talkData.arr[index].id,
                type: this.talk.talkData.arr[index].type
              }
              this.postCountArr(tmpData, this.talk.talkData.selectIndex)
            }
            this.closeTalkDialog()
            this.talk.talkData.editGroup.visible = false
          } else {
            this.showError(`${this.talk.talkData.editGroup.groupData.id ? '编辑' : '新建'}群组`, '请重新尝试 !')
          }
          this.talk.talkData.editGroup.loading = false
        })
      } else if (this.talk.talkData.editGroup.groupData.name) {
        this.showError(`${this.talk.talkData.editGroup.groupData.id ? '编辑' : '新建'}群组`, '群组成员不可为空, 请选择群组成员 !')
      } else {
        this.showError(`${this.talk.talkData.editGroup.groupData.id ? '编辑' : '新建'}群组`, '群组名称不可为空, 请输入群组名称 !')
      }
    },
    sendImMsg (type, msgCont) {
      var cont = null
      switch (type) {
        case 0:
        cont = this.talk.talkData.arr[this.talk.talkData.selectIndex].sendCont
        break
        case 1:
        cont = msgCont
        break
        case 4:
        cont = msgCont
        break
        case 5:
        cont = msgCont
        break
      }
      if (cont) {
        var msgContent = {
          im_content: cont,
          im_sender_id: this.empId,
          im_sender_name: localStorage.getItem('empName'),
          im_dept_name: this.talk.talkData.deptName,
          im_type: type
        }
        var msgData = {
          msg_receiver: this.talk.talkData.arr[this.talk.talkData.selectIndex].id,
          msg_personalid: this.talk.talkData.arr[this.talk.talkData.selectIndex].personalId,
          msg_sender: this.empId,
          msg_subtype: 'aoms.im',
          msg_type: 'im'
        }
        if (this.talk.talkData.arr[this.talk.talkData.selectIndex].type == 'personal') {
          this.$set(msgData, 'msg_personalid', this.talk.talkData.arr[this.talk.talkData.selectIndex].id)
        } else {
          this.$set(msgContent, 'im_group_id', this.talk.talkData.arr[this.talk.talkData.selectIndex].id)
          this.$set(msgContent, 'im_group_name', this.talk.talkData.arr[this.talk.talkData.selectIndex].name)
          this.$set(msgData, 'msg_personalid', this.talk.talkData.arr[this.talk.talkData.selectIndex].personalId)
        }
        this.$set(msgData, 'msg_content', JSON.stringify(msgContent))
        postDataNone(this.sendMsgUrl, JSON.stringify(msgData)).then(res => {
          if (res.data.status == 0) {
            if (![4, 5].includes(type)) {
              this.talk.talkData.arr[this.talk.talkData.selectIndex].recordArr.push({
                msgContent: cont,
                msgSender: this.empId,
                msgTime: `${this.latestDate} ${this.latestTime}`,
                msgDeptName: msgContent['im_dept_name'],
                msgType: type
              })
              this.talk.talkData.arr[this.talk.talkData.selectIndex].sendCont = null
              this.talkArrTop(this.talk.talkData.selectIndex)
              this.scrollRecord(this.talk.talkData.selectIndex, true)
            }
          } else {
          }
        })
      }
    },
    talkArrTop (index) {
      var tempObj = this.talk.talkData.arr[index]
      var tempIndex = this.talk.talkData.selectIndex
      this.talk.talkData.selectIndex = null
      this.talk.talkData.arr.splice(index, 1)
      if (tempIndex > index) {
        this.talk.talkData.selectIndex = tempIndex
      } else if (tempIndex < index) {
        this.talk.talkData.selectIndex = tempIndex + 1
      } else {
        this.talk.talkData.selectIndex = 0
      }
      this.talk.talkData.arr.unshift(tempObj)
    },
    httpRequest (file) {
      var reader = new FileReader()
      var _this = this
      reader.readAsDataURL(file.file)
      reader.onload = () => {
        const base = reader.result.split(',')[1]
        let arr = file.file.name.split('.')
        let filetype = arr[arr.length - 1]
        let imgdata = {
          base64fill: base,
          filelen: _this.talk.talkData.imgData.limit,
          filetype: filetype
        }
        let callback = (progress) => {
          // _this.progress = progress
        }
        // _this.showProgress = true
        dfsPost(this.talk.talkData.imgData.action, imgdata, callback).then(res => {
          var cont = res.data.filePath
          this.sendImMsg(1, cont)
        }).catch(err => {
          _this.showError('上传文件', err)
        })
      }
    },
    imgFileChange (file, fileList) {
      // debugger
      this.talk.talkData.imgData.fileList = [file]
    },
    showWinImg (src) {
      this.showImg = true
      this.imgSrc = src
    },
    playPause (index, tagName) {
      var media = document.getElementsByClassName('media')[index].querySelector(tagName)
      if (media.paused) {
        if (this.talk.talkData.mediaPlay.media && !this.talk.talkData.mediaPlay.media.paused) {
          if (this.talk.talkData.mediaPlay.type == 'video') {
            this.talk.talkData.mediaPlay.media.pause()
          } else {
            this.talk.talkData.mediaPlay.media.load()
          }
        }
        if (this.talk.talkData.arr[this.talk.talkData.selectIndex].recordArr[index].unread) {
          this.talk.talkData.arr[this.talk.talkData.selectIndex].recordArr[index].unread = false
        }
        media.play()
        this.talk.talkData.mediaPlay.index = index
        this.talk.talkData.mediaPlay.media = media
        this.talk.talkData.mediaPlay.type = tagName
        media.addEventListener('ended', () => {
          this.talk.talkData.mediaPlay.index = null
          this.talk.talkData.mediaPlay.media = null
          this.talk.talkData.mediaPlay.type = null
        })
      } else {
        if (media.type == 'video') {
          media.pause()
        } else {
          media.load()
        }
        this.talk.talkData.mediaPlay.index = null
        this.talk.talkData.mediaPlay.media = null
        this.talk.talkData.mediaPlay.type = null
      }
    },
    changeMsgTaskIndex (sum) {
      this.taskMsg.index += sum
    },
    msgTaskApply (index, flag) {
      var data = {
        dynamicTaskApplyId: this.taskMsg.data[index].dynamicTaskApplyId,
        confirmFlag: flag
      }
      postData(this.taskMsg.applyUrl, data).then(res => {
        if (res.data.code == 0) {
          if (index == this.taskMsg.data.length - 1) {
            if (index > 0) {
              index -= 1
            } else {
              index = 0
            }
          } else {
            index -= 1
          }
          this.taskMsg.data.splice(index, 1)
        } else {
          this.showError('任务申请处理', '请重新尝试 !')
        }
      })
    },
    msgTaskApplyAll (flag) {
      postData(this.taskMsg.applyAllUrl, {}).then(res => {
        if (res.data.code == 0) {
          this.taskMsg.index = 0
          this.taskMsg.data.splice(0, this.taskMsg.data.length)
        } else {
          this.showError('任务申请全部拒绝', '请重新尝试 !')
        }
      })
    }
  },
  computed: {
    audioPlayStatus: () => {
      try {
        if (!_.isNull(this.talk.talkData.mediaPlay.media)) {
          if (this.talk.talkData.mediaPlay.media.paused) {
            return 'paused'
          } else {
            return 'play'
          }
        } else {
          return 'paused'
        }
      } catch (err) {
        console.log(err)
      }
    }
  }
}
</script>

<style>
/* 消息div占据整个窗口 */
.message-body {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 199;
}
.message-info-dialog {
  background-color: rgba(8, 25, 38, 0.96) !important;
  border: 1px solid rgba(60, 166, 200, 0.7);
  box-shadow: 0 0 50px rgba(60, 166, 200, 0.4) inset, 0 20px 60px #000;
  border-radius: 10px;
}
.msg-button-div {
  width: 0;
  background-color: transparent;
  pointer-events: all;
}
.msg-button-div>div {
  z-index: 150;
  position: absolute;
  top: 30px;
}
.msg-button-left {
  right: 446px;
  width: 429px;
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
}
.msg-button-right {
  right: 323px;
  width: 108px;
}
.msg-button-left>div:not(:first-of-type) {
  border-right-width: 0px;
}
.msg-button-left>div:first-of-type {
  border-radius: 0 8px 8px 0;
}
.msg-button-left>div:last-of-type {
  border-radius: 8px 0 0 8px;
}
.msg-button-right>div {
  border-radius: 8px;
}
.msg-button-div>div>div {
  height: 32px;
  line-height: 30px;
  padding: 0 25px;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  color: #7a939e;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(60, 166, 200, 0.7);
  cursor: pointer;
  box-sizing: border-box;
  position: relative;
}
.msg-button-div>div>div.is-active,
.header-select-button>div.is-active {
  color: white;
  font-weight: bold;
  background-color: rgba(56, 195, 245, 0.2);
  box-shadow: 0px 0px 6px rgba(60, 166, 200, 0.7) inset !important;
}
.msg-button-div>div>div.disabled {
  cursor: not-allowed;
}
.unread-red-count {
  color: #fff;
  font-weight: normal;
  background-color: #e65069;
}
.msg-button-div>div>div>div {
  position: absolute;
  right: 10px;
  top: -10px;
  height: 14px;
  line-height: 14px;
  font-size: 14px;
  border-radius: 10px;
  padding: 5px;
}
.msg-task-cont-div .table-header .unread-red-count {
  padding: 5px 8px;
  height: 16px;
  line-height: 16px;
  font-size: 16px;
  border-radius: 16px;
}
.msg-cont-div {
  position: absolute;
  z-index: 199;
  pointer-events: all;
  display: flex;
  align-items: center;
  flex-direction: column;
  border-radius: 12px;
  box-sizing: border-box;
}
.msg-cont-div>div {
  width: 100%;
}
.msg-cont-header>.header-title {
  font-size: 20px;
  font-weight: normal;
}
.msg-cont-header>div:last-of-type {
  flex-grow: 1;
  display: flex;
  flex-direction: row-reverse;
  margin-right: 16px;
}
.msg-cont-header .header-close {
  width: 40px;
  height: 40px;
  cursor: pointer;
  background-image: url('../../assets/img/icon_bth_close.png');
}
.msg-cont-div>div:first-child {
  border-radius: 12px 12px 0 0;
  height: 50px;
}
.msg-cont-div>div:last-child:not(.msg-talk-cont) {
  height: 46px;
  padding: 0 16px 16px 16px;
}
.msg-cont-div>div:last-child {
  border-radius: 0 0 12px 12px;
  box-sizing: border-box;
}
.msg-cont-div>.msg-cont-footer {
  display: flex;
}
.msg-cont-div>.msg-cont-footer>.el-button {
  flex-grow: 1;
}
.msg-cont-div>.msg-cont-footer>.el-button:not(:last-child) {
  margin-right: 12px;
}
.msg-cont-cont {
  width: 100%;
  box-sizing: border-box;
}
.message-info-dialog .msg-type-cont {
  height: calc(100% - 50px - 46px);
  padding: 0 0 16px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.message-info-dialog .msg-type-cont>div:first-child {
  width: 100%;
  box-sizing: border-box;
  padding: 0 16px 4px 16px;
  flex-grow: 0;
}
.msg-task-cont-div {
  background-image: url('../../assets/img/im/pop_win_bg.png');
  background-repeat: repeat-x;
}
.msg-task-cont-div .table-header .header-title {
  padding-right: 10px;
}
.msg-task-cont-div .msg-type-cont {
  border-top: 1px solid rgba(60, 166, 200, 0.2);
  box-sizing: border-box;
  flex-direction: row;
  align-items: flex-start;
}
.msg-task-cont-div .msg-type-cont>div:first-child {
  width: 124px;
  height: 124px;
  margin: 12px 0 0 24px;
  background-image: url('../../assets/img/im/animate.gif');
}
.msg-task-cont-div .msg-type-cont>.msg-cont-task-font {
  margin: 50px 0 0 0;
  height: 46px;
  width: calc(100% - 150px);
  display: flex;
}
.msg-task-cont-div .msg-type-cont>.msg-cont-task-font>div {
  width: calc(100% / 3);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.msg-task-cont-div .msg-type-cont>.msg-cont-task-font>div:not(:first-of-type):not(:last-of-type) {
  border-left: 1px solid rgba(60, 166, 200, 0.4);
  border-right: 1px solid rgba(60, 166, 200, 0.4);
}
.msg-task-cont-div .msg-type-cont>.msg-cont-task-font>div>div:first-of-type {
  color: #7a939e;
  font-size: 16px;
  line-height: 16px;
  height: 16px;
  margin-bottom: 12px;
}
.msg-task-cont-div .msg-type-cont>.msg-cont-task-font>div>div:last-of-type {
  color: #fff;
  font-size: 18px;
  line-height: 18px;
  height: 18px;
}
.msg-task-cont-div .msg-cont-header>div:last-of-type {
  display: flex;
  flex-direction: row-reverse;
}
.msg-task-cont-div .msg-cont-header>div:last-of-type>div,
.msg-task-cont-div .msg-cont-footer>div {
  font-size: 15px;
  font-weight: bold;
}
.msg-task-cont-div .msg-cont-header>div:last-of-type>div,
.msg-task-cont-div .msg-cont-footer>div:first-of-type,
.msg-task-cont-div .msg-cont-footer>div:last-of-type {
  width: 98px;
}
.msg-task-cont-div .msg-cont-footer>div:not(:first-of-type):not(:last-of-type) {
  width: calc(100% - 200px);
  display: flex;
  justify-content: center;
}
.msg-task-cont-div .msg-cont-footer>div:not(:first-of-type):not(:last-of-type)>button {
  margin: 0;
  height: 32px;
  width: 98px;
}
.msg-task-cont-div .msg-cont-footer>div:not(:first-of-type):not(:last-of-type)>button:first-of-type {
  margin-right: 12px;
}
.msg-cont-cont .msg-cont-ul {
  width: calc(100% - 16px);
  box-sizing: border-box;
  overflow-x: hidden;
  margin-right: 16px;
  flex-grow: 1;
}
.msg-cont-cont .msg-cont-ul .msg-cont-ul-none {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  flex-direction: column;
}
.msg-cont-cont .msg-cont-ul .msg-cont-ul-none>div {
  font-size: 16px;
  color: #fff;
}
.msg-cont-cont .msg-cont-info {
  margin-top: 10px;
  padding: 10px;
  width: calc(100% - 32px);
  box-sizing: border-box;
  background-color: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(60, 166, 200, 0.5);
  box-shadow: 0 0 30px rgba(60, 166, 200, 0.3);
  border-radius: 8px;
  flex-grow: 0;
}
.msg-cont-cont .el-input__icon,
.talk-dialog .el-input__icon {
  line-height: 32px;
}
.msg-cont-cont .msg-cont-ul>ul,
.talk-dialog .msg-cont-ul>ul {
  padding: 0;
  margin: 0;
  width: 100%;
}
.msg-cont-cont .msg-cont-ul>ul>li,
.talk-dialog .msg-cont-ul>ul>li {
  display: flex;
  box-sizing: border-box;
  padding: 14px 4px 14px 16px;
  cursor: pointer;
}
.row-select {
  background-color: rgba(60,166,200,0.4);
}
.msg-cont-cont .li-img {
  height: 40px;
  width: 40px;
  margin-right: 10px;
}
.msg-cont-cont .li-img img {
  border-radius: 20px;
}
div.info-flex {
  display: flex;
}
.msg-cont-info>div:not(:first-of-type).info-flex {
  color: #7a939e;
  font-size: 14px;
  height: 14px;
  line-height: 14px;
}
.msg-cont-info .info-close {
  width: 16px;
  height: 16px;
  cursor: pointer;
  background-image: url('../../assets/img/icon_close_white_16.png');
}
.msg-cont-info .info-br {
  margin: 10px 0;
  border: 0.5px solid rgba(60, 166, 200, 0.4);
}
.msg-cont-info .info-cont {
  margin: 16px 0 0 0;
  color: #fff;
  font-size: 16px;
  word-wrap: break-word;
  max-height: 87px;
  overflow-x: hidden;
  line-height: 26px;
}
.msg-cont-cont .li-font {
  display: flex;
  flex-direction: column;
  position: relative;
}
.msg-cont-cont .msg-cont-ul .li-font {
  width: calc(100% - 98px);
}
.msg-cont-cont .msg-cont-ul .li-font-notice {
  width: calc(100% - 48px);
}
.msg-cont-cont .msg-cont-info .li-font {
  width: calc(100% - 50px);
}
.msg-cont-cont .msg-cont-info .li-font-notice {
  width: calc(100% - 16px);
}
.msg-cont-cont .li-font>div:first-of-type {
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  height: 16px;
  line-height: 16px;
  display: flex;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.msg-cont-cont .li-font>div:first-of-type:not(:last-of-type) {
  margin-bottom: 10px;
}
.msg-cont-cont .li-font>div:last-of-type {
  display: flex;
  flex-wrap: nowrap;
}
.msg-cont-cont .li-font>div:last-of-type>div:last-of-type {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}
.msg-cont-cont .li-font>div:last-of-type>div:last-of-type:not(:first-of-type) {
  margin-left: 10px;
}
.msg-cont-cont .li-font>div:last-of-type>.li-font-gray {
  color: #7a939e;
  font-size: 14px;
  height: 14px;
  line-height: 14px;
  flex-shrink: 0;
}
.msg-cont-cont .li-font>div:last-of-type>.li-font-white {
  color: #fff;
  font-size: 14px;
  height: 14px;
  line-height: 14px;
}
.li-font .li-font-task {
  color: #73c7e5;
  font-size: 16px;
  font-weight: bold;
  height: 16px;
  line-height: 16px;
  margin-left: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.li-font .dot-red {
  margin-left: 5px;
  width: 8px;
  height: 8px;
  background-color: #e65069;
  border-radius: 4px;
  flex-shrink: 0;
}
.info-flex .li-font-show,
.li-font .li-font-show {
  color: #03a786;
  font-size: 12px;
  height: 16px;
  line-height: 12px;
  margin-left: 10px;
  overflow: hidden;
  border: 1px solid #03a786;
  border-radius: 4px;
  padding: 2px 5px;
  box-sizing: border-box;
  min-width: 60px;
  flex-grow: 0;
  margin-right: 10px;
}
.info-flex .li-font-show {
  margin-left: 53px;
}
.li-font-notice>div:first-of-type>div:first-of-type {
  width: calc(100% - 60px);
}
.msg-cont-cont .msg-cont-ul>ul>li .li-time {
  color: #7a939e;
  font-size: 14px;
  height: 14px;
  line-height: 14px;
  width: 48px;
  flex-grow: 0;
}
.header-select-button {
  margin-left: 35px;
  display: flex;
}
.header-select-button>div {
  height: 32px;
  line-height: 30px;
  padding: 0 25px;
  font-size: 14px;
  text-align: center;
  color: #7a939e;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(60, 166, 200, 0.7);
  cursor: pointer;
  box-sizing: border-box;
}
.header-select-button>div:first-of-type {
  border-radius: 8px 0 0 8px;
  border-right-width: 0;
}
.header-select-button>div:last-of-type {
  border-radius: 0 8px 8px 0;
}
.msg-talk-cont {
  height: calc(100% - 50px);
  border-top: 1px solid rgba(60, 166, 200, 0.4);
}
.msg-talk-cont>div {
  display: flex;
  height: 100%;
}
.msg-talk-cont>div>div:first-of-type {
  width: 240px;
  border-right: 1px solid rgba(60, 166, 200, 0.4);
}
.msg-talk-cont>div>div:last-of-type {
  width: calc(100% - 241px);
}
.msg-talk-cont .talk-cont .talk-cont-left>div>div>div:first-of-type,
.msg-talk-cont .talk-cont-1 .talk-cont-right>div>div:first-of-type>div:first-of-type {
  width: 40px;
  height: 40px;
  line-height: 40px;
  border-radius: 20px;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
}
.talk-cont-1 .talk-cont-right>div>div:first-of-type>.talk-cont-record-tip {
  flex-grow: 1;
  display: flex;
  flex-direction: row-reverse;
}
.group-edit-button {
  width: 30px;
  height: 30px !important;;
  margin: 0 5px 0 5px;
  border: 1px solid #447385;
  border-radius: 6px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  background-position: center;
  cursor: pointer;
  background-image: url('../../assets/img/im/icon_list_group.png');
}
.talk-cont-1 .talk-cont-left>div>div>.talk-time {
  font-size: 14px;
  color: #7a939e;
  height: 38px;
  width: 35px;
  margin-left: 5px;
}
.talk-cont-1 .talk-cont-left {
  height: 100%;
  overflow-x: hidden;
}
.talk-cont-1 .talk-cont-left>div>div {
  position: relative;
}
.talk-cont-1 .talk-cont-left>div>div:hover>.close-button {
  position: absolute;
  right: 20px;
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background-color: #7a939e;
  background-image: url('../../assets/img/im/icon_btn_close_white.png');
  background-position: center;
}
.talk-cont-1 .talk-cont-left>div>div>div:not(:first-of-type):not(:last-of-type):not(.talk-time),
.talk-cont-1 .talk-cont-right>div>div:first-of-type>.talk-cont-record-title {
  width: calc(100% - 90px);
}
.talk-cont-1 .talk-cont-right>div>div:first-of-type>.talk-cont-record-title>div:first-of-type {
  display: flex;
}
.talk-cont-1 .talk-cont-left>div>div>div:not(:first-of-type):not(:last-of-type):not(.talk-time)>div>div:first-of-type,
.talk-cont-1 .talk-cont-left>div>div>div:not(:first-of-type):not(:last-of-type):not(.talk-time)>div:last-of-type,
.talk-cont-1 .talk-cont-right>div>div:first-of-type>.talk-cont-record-title>div:first-of-type>div:first-of-type {
  overflow: hidden;
  white-space:nowrap;
  text-overflow:ellipsis;
}
.talk-cont-1 .talk-cont-left>div>div>div:not(:first-of-type):not(:last-of-type):not(.talk-time),
.talk-cont-1 .talk-cont-right>div>div:first-of-type>.talk-cont-record-title,
.talk-cont-2 .talk-cont-left>div>div>div:last-of-type,
.talk-cont-record-group-pop .pop-cont .talk-cont-ul>.talk-group-list>div:last-of-type {
  margin-left: 10px;
  color: #fff;
  font-size: 16px;
  display: flex;
  flex-direction: column;
}
.talk-cont-1 .talk-cont-left>div>div>div:not(:first-of-type):not(:last-of-type):not(.talk-time)>div:first-of-type,
.talk-cont-1 .talk-cont-right>div>div>div:last-of-type>div:first-of-type,
.talk-cont-2 .talk-cont-left>div>div>div:last-of-type>div:first-of-type,
.talk-cont-record-group-pop .pop-cont .talk-cont-ul>.talk-group-list>div:last-of-type>div:first-of-type {
  height: 16px;
  line-height: 16px;
}
.talk-cont-1 .talk-cont-left>div>div>div:not(:first-of-type):not(:last-of-type):not(.talk-time)>div:last-of-type,
.talk-cont-1 .talk-cont-right>div>div:first-of-type>.talk-cont-record-title>div:last-of-type,
.talk-cont-2 .talk-cont-left>div>div>div:last-of-type>div:last-of-type,
.talk-cont-record-group-pop .pop-cont .talk-cont-ul>.talk-group-list>div:last-of-type>div:last-of-type {
  font-size: 14px;
  color: #7a939e;
  line-height: 14px;
  height: 14px;
  margin-top: 8px;
}
.talk-cont .talk-cont-right>div,
.talk-dialog .talk-cont-person {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.talk-cont-1 .talk-cont-record>div:not(:first-of-type):not(:last-of-type) {
  height: calc(100% - 143px);
  overflow-x: hidden;
}
.talk-cont .talk-cont-right>div>div:first-of-type,
.talk-dialog .talk-cont-person>div:first-of-type {
  display: flex;
  align-items: center;
  padding: 0 12px;
}
.talk-cont-1 .talk-cont-right>div>div:first-of-type {
  height: 60px;
}
.talk-cont-2 .talk-cont-right>div>div:first-of-type,
.talk-dialog .talk-cont-person>div:first-of-type {
  height: 50px;
}
.talk-cont-1 .talk-cont-right>div>div:first-of-type,
.talk-dialog .talk-cont-person>div:first-of-type {
  border-bottom: 1px solid rgba(60, 166, 200, 0.4);
  font-size: 14px;
}
.talk-cont-2 .talk-cont-right>.talk-cont-group>div:first-of-type {
  font-size: 16px;
}
.talk-cont-2 .talk-cont-right>div>div:last-of-type>div:first-of-type,
.talk-dialog .talk-cont-person>div:last-of-type>div:first-of-type {
  padding: 12px;
}
.talk-cont-person>div:last-of-type,
.talk-cont-group>div:last-of-type {
  height: calc(100% - 51px);
}
.talk-cont-person>div:last-of-type>div:last-of-type,
.talk-cont-group>div:last-of-type>div:last-of-type {
  margin: 0 12px 12px 0;
  height: calc(100% - 68px);
  overflow-x: hidden;
}
.talk-cont-2 .talk-cont-right>div>div:first-of-type>div:first-of-type,
.talk-dialog .talk-cont-person>div:first-of-type>div:first-of-type {
  color: #fff;
}
.talk-cont-person>div:first-of-type>div:last-of-type .el-input__inner {
  border: 0px solid rgba(60, 166, 200, 0.7) !important;
  box-shadow: none !important;
  background-color: transparent !important;
  padding: 0;
}
.talk-cont-person>div:first-of-type>div:last-of-type .el-cascader__label {
  line-height: 42px;
  color: #7a939e;
}
.talk-cont-person>div:first-of-type>div:last-of-type .el-cascader__label span {
  color: #7a939e;
}
.talk-cont-2 .talk-cont-right>div>div:first-of-type>div:last-of-type,
.talk-dialog .talk-cont-person>div:first-of-type>div:last-of-type {
  flex-grow: 1;
  display: flex;
  flex-direction: row-reverse;
}
.talk-cont-person>div:first-of-type>div:last-of-type .el-cascader {
  width: 100%;
}
.talk-cont-2 .talk-cont-right .talk-cont-ul>.talk-emp-list,
.talk-dialog .talk-cont-person .talk-cont-ul>.talk-emp-list {
  height: 36px;
  padding: 5px 12px;
}
.talk-cont-2 .talk-cont-right .talk-cont-ul>.talk-group-list {
  height: 36px;
  padding: 8px 12px;
}
.talk-cont-2 .talk-cont-right .talk-cont-ul>.talk-emp-list>div:first-of-type,
.talk-cont-2 .talk-cont-right .talk-cont-ul>.talk-group-list>div:first-of-type,
.talk-dialog .talk-cont-person .talk-cont-ul>.talk-emp-list>.personal-logo,
.talk-cont-record-group-pop .pop-cont .talk-cont-ul>.talk-group-list>.personal-logo {
  width: 36px;
  height: 36px;
  line-height: 36px;
  border-radius: 18px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}
.personal-logo {
  background-color: #336180;
  color: #5f9eb3;
}
.group-logo {
  background-color: #675140;
  color: #b99274;
}
.talk-cont-2 .talk-cont-right .talk-cont-ul>.talk-emp-list>div:last-of-type,
.talk-cont-2 .talk-cont-right .talk-cont-ul>.talk-group-list>div:last-of-type,
.talk-dialog .talk-cont-person .talk-cont-ul>.talk-emp-list>div:last-of-type {
  margin-left: 10px;
  font-size: 16px;
  color: #fff;
}
.talk-cont-2 .talk-cont-right .talk-cont-ul>.talk-group-list>div:last-of-type {
  display: flex;
  flex-direction: column;
}
.talk-cont-2 .talk-cont-right .talk-cont-ul>.talk-group-list>div:last-of-type>div:first-of-type,
.talk-cont-1 .talk-cont-right>div>div:not(.record-cont-scroll)>div:last-of-type>div:first-of-type {
  height: 16px;
  line-height: 16px;
  display: flex;
}
.talk-cont-2 .talk-cont-right .talk-cont-ul>.talk-group-list>div:last-of-type>div:last-of-type {
  font-size: 12px;
  line-height: 12px;
  height: 12px;
  color: #7a939e;
  margin-top: 6px;
}
.talk-cont-2 .talk-cont-right .talk-cont-ul>.talk-group-list>div:last-of-type>div:first-of-type>div:first-of-type {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.talk-cont-2 .talk-cont-right .talk-cont-ul>.talk-group-list>div:last-of-type {
  max-width: calc(100% - 46px);
  flex-grow: 1;
}
.talk-cont-1 .talk-cont-right>div>div:first-of-type>.talk-cont-record-title>div:first-of-type>div:first-of-type:not(:last-of-type),
.talk-cont-2 .talk-cont-right .talk-cont-ul>.talk-group-list>div:last-of-type>div:first-of-type>div:first-of-type:not(:last-of-type) {
  max-width: calc(100% - 43px);
}
.talk-cont-1 .talk-cont-right>div>div:first-of-type>.talk-cont-record-title>div:first-of-type>.font-gray,
.talk-cont-2 .talk-cont-right .talk-cont-ul>.talk-group-list>div:last-of-type>div:first-of-type>.font-gray {
  width: 43px;
}
.record-cont-scroll>div>div:first-of-type {
  display: flex;
}
.record-cont-scroll>div.record-right>div:first-of-type {
  flex-direction: row-reverse;
}
.record-cont-scroll>div.record-left>div:first-of-type>div:not(:first-of-type) {
  margin-left: 10px;
}
.record-cont-scroll>div.record-right>div:first-of-type>div:not(:first-of-type) {
  margin-right: 10px;
}
.record-cont-scroll .record-top {
  margin-top: 10px;
  height: 14px;
  width: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}
.record-cont-scroll .record-top>div {
  line-height: 14px;
  height: 14px;
  font-size: 14px;
  color: #7a939e;
  text-decoration: underline;
  cursor: pointer;
}
.talk-cont-ul {
  display: flex;
  flex-direction: column;
}
.talk-cont-ul>div {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  cursor: pointer;
}
.font-gray {
  color: #7a939e;
}
.talk-cont-record .record-cont {
  margin: 12px 12px 20px 12px;
}
.talk-cont-record .record-cont:last-of-type {
  margin-bottom: 0;
}
.talk-cont-record .record-cont>div:last-of-type {
  margin-top: 8px;
  display: flex;
}
.talk-cont-record .record-right>div:last-of-type {
  flex-direction: row-reverse;
}
.talk-cont-record .record-cont .record-time {
  font-size: 14px;
  height: 14px;
  line-height: 14px;
  color: #7a939e;
}
.talk-cont-record .record-cont .record-name {
  font-size: 16px;
  height: 16px;
  line-height: 16px;
  color: #fff;
}
.talk-cont-record .record-right .record-time {
  text-align: right;
}
.talk-cont-record .record-cont>div:last-of-type .record-cont-font {
  font-size: 16px;
  min-height: 16px;
  line-height: 16px;
  color: #fff;
  padding: 10px;
  border-radius: 8px;
  word-wrap: break-word;
}
.talk-cont-record .record-cont>div:last-of-type .record-cont-font img,
.talk-cont-record .record-cont>div:last-of-type .record-cont-font audio {
  max-width: 280px;
  max-height: 280px;
}
.talk-cont-record .record-left .record-cont-font {
  margin-left: -8px;
  background-color: rgba(60, 166, 200, 0.4);
  max-width: calc(100% - 32px);
}
.talk-cont-record .record-right .record-cont-font {
  margin-left: 10px;
  margin-right: -8px;
  background-color: rgba(3, 167, 134, 0.4);
  max-width: calc(100% - 42px);
}
.talk-cont-record .record-cont .record-cont-bubble {
  width: 16px;
  height: 16px;
}
.talk-cont-record .record-left .record-cont-bubble {
  background-image: url('../../assets/img/im/new_com_bubble_blue.png');
  background-position: left;
}
.talk-cont-record .record-right .record-cont-bubble {
  background-image: url('../../assets/img/im/new_com_bubble_green.png');
  background-position: right;
}
.talk-cont-record>div:last-of-type {
  padding: 10px 12px 12px 12px;
  height: 60px;
}
.talk-cont-record>div:last-of-type>div:first-of-type {
  display: flex;
}
.talk-cont-record>div:last-of-type>div:first-of-type>div {
  height: 18px;
  width: 18px;
  cursor: pointer;
}
.talk-cont-record>div:last-of-type>div:first-of-type>div:not(:first-of-type) {
  margin-left: 16px;
}
.talk-cont-record>div:last-of-type>div:first-of-type .new-record {
  flex-grow: 1;
  display: flex;
  justify-content: flex-end;
  cursor: default;
}
.talk-cont-record>div:last-of-type>div:first-of-type .new-record>div {
  display: flex;
  align-items: center;
  margin-top: -5px;
  margin-right: 10px;
  background-color: #3da6cc;
  padding: 5px 12px;
  border-radius: 14px;
  cursor: pointer;
}
.talk-cont-record>div:last-of-type>div:first-of-type .new-record>div>div:first-of-type {
  width: 20px;
  height: 20px;
  background-image: url('../../assets/img/im/arrow_to_bottom.png');
}
.talk-cont-record>div:last-of-type>div:first-of-type .new-record>div>div:last-of-type {
  margin-left: 6px;
  color: #fff;
  font-size: 14px;
}
.record-voice {
  background-image: url('../../assets/img/im/icon_msg_voice.png');
}
.record-emoji {
  background-image: url('../../assets/img/im/icon_msg_emoji.png');
}
.record-pic {
  height: 18px;
  width: 18px;
  background-image: url('../../assets/img/im/icon_msg_pic.png');
}
.record-words {
  background-image: url('../../assets/img/im/icon_msg_words.png');
}
.talk-cont-record>div:last-of-type>div:last-of-type {
  margin-top: 10px;
  display: flex;
  align-items: center;
}
.talk-cont-record>div:last-of-type>div:last-of-type>div:first-of-type {
  height: 32px !important;
  flex-grow: 1;
}
.talk-cont-record>div:last-of-type>div:last-of-type>div:last-of-type {
  margin-left: 10px;
  width: 30px;
  height: 30px;
  border: 1px solid #32aaff;
  background-color: rgba(50, 170, 255, 0.4);
  box-shadow: 0 0 10px rgba(50, 170, 255, 0.4) inset;
  border-radius: 15px;
  cursor: pointer;
}
.talk-cont-record>div:last-of-type>div:last-of-type>div:last-of-type:hover {
  opacity: 0.8;
}
.record-send {
  background-image: url('../../assets/img/im/icon_msg_send.png');
}
.talk-dialog .el-dialog {
  height: 600px;
}
.talk-dialog .dialog-body {
  height: 100%;
}
.talk-dialog .dialog-body>div {
  display: flex;
}
.talk-dialog .dialog-body>div:first-of-type {
  width: 360px;
  height: 32px;
  align-items: center;
}
.talk-dialog .dialog-body>div:last-of-type {
  margin-top: 20px;
  text-align: left;
  height: calc(100% - 52px);
}
.talk-dialog .dialog-body>div:first-of-type>div:first-of-type {
  color: #7a939e;
  font-size: 14px;
  font-weight: bold;
}
.talk-dialog .dialog-body>div:first-of-type>div:last-of-type {
  margin-left: 10px;
  flex-grow: 1;
}
.talk-dialog .dialog-body>div:last-of-type>div:first-of-type {
  width: 360px;
}
.talk-dialog .dialog-body>div:last-of-type>div:last-of-type {
  width: 400px;
  margin-left: 20px;
}
.talk-dialog .dialog-body>div:last-of-type>div>div:first-of-type {
  height: 16px;
  line-height: 16px;
  font-size: 16px;
  color: #fff;
}
.talk-dialog .dialog-body>div:last-of-type>div>div:last-of-type {
  margin-top: 12px;
  height: calc(100% - 28px);
  background-color: rgba(0, 0, 0, 0.2);
  box-shadow:0 0 30px rgba(61, 166, 204, 0.2)inset;
  border: 1px solid rgba(61, 166, 204, 0.6);
  border-radius: 12px;
  box-sizing: border-box;
}
.talk-emp-list .radio-button {
  width: 20px;
  height: 20px;
  margin-right: 12px;
}
.talk-cont-person-select {
  padding: 10px 10px 0 0;
  overflow-x: hidden;
}
.talk-cont-person-select>div {
  display: flex;
  flex-wrap: wrap;
}
.talk-cont-person-select>div>div {
  display: flex;
  align-items: center;
  margin-left: 10px;
  margin-bottom: 10px;
  padding: 10px;
  height: 36px;
  width: 159px;
  background-color: rgba(60, 166, 200, 0.2);
  border-radius: 8px;
}
.talk-cont-person-select>div>div>div:first-of-type {
  flex-grow: 1;
  width: calc(100% - 16px);
}
.talk-cont-person-select>div>div>div:first-of-type>div {
  overflow: hidden;
  white-space:nowrap;
  text-overflow:ellipsis;
}
.talk-cont-person-select>div>div>div:last-of-type {
  width: 16px;
  height: 16px;
  flex-grow: 0;
}
.talk-emp-cancle {
  background-image: url('../../assets/img/im/icon_btn_close_gray.png');
  cursor: pointer;
}
.talk-cont-person-select>div>div>div:first-of-type>div:first-of-type {
  height: 16px;
  line-height: 16px;
  font-size: 16px;
  color: #fff;
}
.talk-cont-person-select>div>div>div:first-of-type>div:last-of-type {
  height: 12px;
  line-height: 12px;
  font-size: 12px;
  color: #7a939e;
  margin-top: 8px;
  overflow: hidden;
}
.talk-cont-record-group-pop {
  height: 320px;
  width: 240px;
}
.talk-cont-record-group-pop .pop-body {
  width: 100%;
  height: 100%;
}
.talk-cont-record-group-pop .pop-title {
  display: flex;
  height: 50px;
  padding: 0 12px;
  align-items: center;
}
.talk-cont-record-group-pop .pop-cont {
  height: calc(100% - 102px);
  padding: 0 12px;
}
.talk-cont-record-group-pop .pop-cont>div {
  height: 100%;
  overflow-x: hidden;
}
.talk-cont-record-group-pop .pop-footer {
  height: 30px;
  padding: 10px 12px 12px 12px;
  display: flex;
}
.talk-cont-record-group-pop .pop-footer>.el-button {
  width: calc((100% - 10px) / 2);
}
.talk-cont-record-group-pop .pop-footer>.el-button:not(:first-of-type) {
  margin-left: 10px;
}
.talk-cont-record-group-pop .pop-title>div:first-of-type {
  font-size: 16px;
  color: #fff;
  font-weight: bold;
  width: calc(100% - 37px);
  overflow: hidden;
  white-space:nowrap;
  text-overflow:ellipsis;
}
.talk-cont-record-group-pop .pop-title>div:last-of-type {
  width: 37px;
}
.record-cont .audio-unread {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e65069;
  position: absolute;
  top: 0;
  right: -15px;
}
.record-cont .audio-time {
  font-size: 14px;
  color: #fff;
  line-height: 36px;
}
.record-left .audio-time {
  margin-left: 15px;
}
.record-right .audio-time {
  margin-right: 15px;
}
.media .audio {
  width: auto;
  height: 36px;
}
.media .audio.paused {
  background: url('../../assets/img/im/icon_vioce.png') no-repeat center;
}
.media .audio.play {
  background: url('../../assets/img/im/icon_voice_dynamic.gif') no-repeat center;
}
.record-cont .audio-unread,
.talk-cont-left .arr-unread {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e65069;
}
.record-cont .audio-unread {
  position: absolute;
  top: 0;
  right: -15px;
}
.talk-cont-left .arr-unread {
  margin-left: 8px;
}
.talk-cont-1 .talk-cont-left>div>div>div:not(:first-of-type):not(:last-of-type):not(.talk-time)>div:first-of-type {
  display: flex;
}
.talk-cont-1 .talk-cont-left>div>div>div:not(:first-of-type):not(:last-of-type):not(.talk-time)>div:first-of-type>div:first-of-type {
  max-width: calc(100% - 16px);
}
/* ***************************************发布通告************************************* */
.notice-dialog .el-dialog {
  height: 600px;
}
.notice-dialog .dialog-body {
  margin: 0 50px;
  text-align: left;
}
.notice-dialog .dialog-body>div:not(.notice-label) {
  margin-top: 16px;
}
.notice-label,
.notice-dialog .dialog-body>div:last-of-type {
  margin-top: 30px;
}
.notice-label {
  display: flex;
  font-size: 14px;
  height: 14px;
  line-height: 14px;
}
.label-label {
  color: #7a939e;
}
.label-required {
  color: #e65069;
  margin-left: 10px;
}
.notice-dialog .dialog-body .info-flex {
  width: 100%;
}
.notice-dialog .dialog-body .info-flex>div {
  flex-grow: 1;
}
.notice-dialog .dialog-body .info-flex>button {
  margin-left: 12px;
  flex-grow: 0;
}
.notice-cont {
  position: relative;
}
.notice-cont .el-textarea__inner {
  height: 240px !important;
}
.notice-cont .el-select {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 200px;
}
.notice-cont .el-select .el-input__inner {
  border-radius: 8px;
}
</style>
