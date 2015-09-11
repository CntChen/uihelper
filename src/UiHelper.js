/* 简单UI插件
 * 功能：
 *
 *
 *
 *
 *
 */
var UiHelper = UiHelper || {};

// 工具对象
UiHelper._util = UiHelper._util || {};
(function() {
  function _addEvent(el, e, callback, capture) {
    if (!!el.addEventListener) {
      el.addEventListener(e, callback, !!capture);
    } else {
      el.attachEvent('on' + e, callback);
    }
  }


  function _removeEvent(el, e, callback, capture) {
    if (!!el.addEventListener) {
      el.removeEventListener(e, callback, !!capture);
    } else {
      el.detachEvent('on' + e, callback);
    }
  }


  function addEvent(doms, e, callback, capture) {
    if (!doms.length) {
      doms = [doms];
    }
    var length = doms.length;
    for (var i = 0; i < length; i++) {
      _addEvent(doms[i], e, callback, capture);
    }
  }


  function removeEvent(doms, e, callback, capture) {
    if (!doms.length) {
      doms = [doms];
    }
    var length = doms.length;
    for (var i = 0; i < length; i++) {
      _removeEvent(doms[i], e, callback, capture);
    }
  }


  function isParent(domP, domS) // 判断dom对象domP是否是domS的父对象
  {
    var domSP = domS.parentNode;
    while (typeof(domSP) !== 'undefined' && domSP !== null) {
      if (typeof(domSP) !== 'undefined' && domSP !== null) {
        if (domSP === domP) {
          return true;
        }
      }
      domSP = domSP.parentNode;
    }
    return false;
  }

  function trim(str) {
    return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
  }

  function hasClass(el, cn) {
    return (' ' + el.className + ' ').indexOf(' ' + cn + ' ') !== -1;
  }

  function _addClass(el, cn) {
    if (!hasClass(el, cn)) {
      el.className = (el.className === '') ? cn : el.className + ' ' + cn;
    }
  }

  function addClass(doms, cn) {
    if (!doms.length) {
      doms = [doms];
    }
    var length = doms.length;
    for (var i = 0; i < length; i++) {
      _addClass(doms[i], cn);
    }
  }

  function _removeClass(el, cn) {
    el.className = trim((' ' + el.className + ' ').replace(' ' + cn + ' ', ' '));
  }

  function removeClass(doms, cn) {
    if (!doms.length) {
      doms = [doms];
    }
    var length = doms.length;
    for (var i = 0; i < length; i++) {
      _removeClass(doms[i], cn);
    }
  }

  UiHelper._util = {
    addEvent: addEvent,
    removeEvent: removeEvent,
    hasClass: hasClass,
    addClass: addClass,
    removeClass: removeClass,
    isParent: isParent
  };
})();


// 构造界面弹出对象管理对象popupMgr
UiHelper.popupMgr = UiHelper.popupMgr || {};
(function() {
  var instance = {};
  instance.pops = {};

  // dom代表需要不需要触发popup对象消失doms对象(包含所有子对象)，disappearCallback代表（调用时this对象为此时传入的doms）
  function register(id, doms, disappearCallback) {
    instance.pops[id] = {
      'doms': doms,
      'disappearCallback': disappearCallback
    };
  }


  function unregister(id) {
    if (typeof(instance.pops[id]) !== 'undefined' && instance.pops[id] !== null) {
      delete instance.pops[id];
    }
  }


  function begin() {
    UiHelper._util.addEvent(document, 'mousedown', documentMouseDown, false);

    function documentMouseDown(event) {
      for (var poper in instance.pops) {
        var callback = instance.pops[poper].disappearCallback;
        var doms = instance.pops[poper].doms;
        var willPass = false;
        for (var i in doms) {
          var dom = doms[i];
          if (dom === event.target || UiHelper._util.isParent(dom, event.target)) {
            willPass = true;
          }
        }
        if (!willPass) {
          callback.call(doms);
        }
      }
    }
  }

  begin();

  UiHelper.popupMgr = {
    register: register,
    unregister: unregister
  }
})();


// 构造抽屉组件
UiHelper.drawerMgr = UiHelper.drawerMgr || {};
(function() {
  // 将一个JQuery对象改造成一个抽屉对象
  // options格式
  //  {
  //  drawerHandlerSelector:"",
  //  drawerSpaceSelector:"",
  //  drawerHandlerFocusClass:"",
  //  drawerHandlerCallback:function(foucsEle){}
  //  }

  function makeDrawerBox(ele, options) {
    var handlerEles = ele.find(options.drawerHandlerSelector);
    var spaceEles = ele.find(options.drawerSpaceSelector);

    function focusOn(innerHandlerEle, animationTime) {
      var thisSpaceEle = innerHandlerEle.parent().find(options.drawerSpaceSelector);
      thisSpaceEle.slideDown(animationTime);
      innerHandlerEle.addClass(options.drawerHandlerFocusClass);

      spaceEles.not(thisSpaceEle).slideUp(animationTime);
      handlerEles.not(innerHandlerEle).removeClass(options.drawerHandlerFocusClass);

      options.drawerHandlerCallback(innerHandlerEle);
    }

    function removeFocus(innerHandlerEle, animationTime) {
      innerHandlerEle = $(innerHandlerEle);
      var thisSpaceEle = innerHandlerEle.parent().find(options.drawerSpaceSelector);
      thisSpaceEle.slideUp(animationTime);
      innerHandlerEle.removeClass(options.drawerHandlerFocusClass);

      options.drawerHandlerCallback(innerHandlerEle);
    }

    handlerEles.click(function() {
      if (UiHelper._util.hasClass(this, options.drawerHandlerFocusClass)) {
        removeFocus(this, 100);
      } else {
        focusOn($(this), 100);
      }
    });

    function openAllDrawers() {
      handlerEles.addClass(options.drawerHandlerFocusClass);
      spaceEles.show();
    }

    function closeAllDrawers() {
      handlerEles.removeClass(options.drawerHandlerFocusClass);
      spaceEles.hide();
    }

    function focusOnFirstDrawer() {
      focusOn(handlerEles.first(), 0);
    }

    function focusOnLastDrawer() {
      focusOn(handlerEles.last(), 0);
    }

    // 返回一个带各种抽屉开关方法的对象
    return {
      openAllDrawers: openAllDrawers,
      closeAllDrawers: closeAllDrawers,
      focusOnFirstDrawer: focusOnFirstDrawer,
      focusOnLastDrawer: focusOnLastDrawer
    };
  }

  UiHelper.drawerMgr = {
    makeDrawerBox: makeDrawerBox
  }
})();


function closeBtnMouseOver() {
  this.style.color = 'black';
}

function closeBtnMouseOut() {
  this.style.color = 'grey';
}

function BtnMouseOver() {
  this.style.background = '#f5f5f5';
}

function BtnMouseOut() {
  this.style.background = '#eeeeee';
}


UiHelper.Prompt = UiHelper.Prompt || {};
(function() {
  /* options格式
  var promptOpt = {
    title:LA('Save Task'),
    inputs:[{
      title:LA('Task Name'),
      id:'taskname',
      type:"text",
      default:"hello"
    }, {
      title:LA('Task Description'),
      id:'taskdescription',
      type:"passward",
      default:"world"
    }],
    footer:{
      canclebtn:{
        title:LA('Cancel')
      },
      submitbtn:{
        title:LA('Save')
      }
    },
    submitcallback:function(){}
  }
  */
  var opts = opts || {};
  var popupId = 'uihelper_prompt';

  function config(options) {
    opts.title = options.title || 'Prompt';
    opts.inputs = options.inputs;
    opts.footer = options.footer;
    opts.submitcallback = options.submitcallback;
    opts.testresult = options.testresult || function(){return ''};
  }

  function closeBtnClick() {
    deletePrompt();
  }

  function cancleBtnClick() {
    deletePrompt();
  }

  function submitBtnClick() {
    var result = {};

    var inputs = opts.inputs;
    var length = inputs.length;
    for (var i = 0; i < length; i++) {
      var inputId = inputs[i].id;
      var value = document.getElementById(inputId).value;
      result[inputId] = value;
    };

    var errorInfo = opts.testresult(result);
    if(!errorInfo){
        opts.submitcallback(result);
        deletePrompt();
    } else {
        showErrorMessage(errorInfo);
    }
  }

  function showErrorMessage(errorInfo){
    var errorMessageDom = document.getElementById('errormessage');
    errorMessageDom.innerHTML = errorInfo;
    console.log(errorInfo);
  }

  function renderPrompt() {
    var promptHMTL = '<div id="promptbackground" style="position:fixed;z-index:1000;width:100%;height:100%;background-color:rgba(0,0,0,0.2);">' + '<div id="promptdiv" style="width:400px;height:auto;background:#fff;margin:0 auto;position:relative;top:100px;border-radius:6px;box-shadow:0px 0px 8px 2px #aaa;">' + renderTitle() + renderContent() + renderErrorMessage() + renderFooter() + '</div>' + '</div>';

    return promptHMTL;
  }

  function renderTitle() {
    var title = opts.title;
    var titleHTML = '<div class="prompttitle" style="background-color:#eeeeee;width:100%;height:50px;border-top-left-radius:6px;border-top-right-radius:6px;text-align:center;">' + '<p style="display:inline-block;line-height:50px;color:#57a;font-size:16px;">' + title + '</p>' + '<a class="closebtn" style="position:absolute;right:20px;color:grey;margin:10px 0px;font-size:20px;cursor:pointer;">×' + '</a>' + '</div>';
    return titleHTML;
  }

  function renderErrorMessage(){
    var errorMessage = '<div id="errormessage" style="width: 100%;font-size: 15px;color: red;padding: 0px 30px 10px 30px;box-sizing: border-box;"></div>';
    return errorMessage;
  }

  function renderContent() {
    var inputs = opts.inputs;
    var length = inputs.length;
    var inputHTML = '';
    for (var i = 0; i < length; i++) {
      inputHTML = inputHTML + '<div style="margin:20px 10px 10px 10px;">' + '<span style="display:inline-block;font-size:14px;width:120px;text-align:right;padding:0px 10px 0px 0px;">' + inputs[i].title + ':</span>' + '<input id="' + inputs[i].id + '" style="width:200px;border-radius:3px;border:1px #aaa solid;font-size:12px;padding:2px 5px;" type="' + inputs[i].type + '" value="' + inputs[i].default+'"/>' + '</div>';
    }

    var contentHTML = '<div id="promptcontent" style="background-color:#fff;width:100%;height:auto;margin:40px 0px;">' + inputHTML + '</div>';

    return contentHTML;
  }

  function renderFooter() {
    var footer = opts.footer;
    var submitbtn = footer.submitbtn;
    var canclebtn = footer.canclebtn;

    var footerHTML = '<div calss="promptfooter" style="background-color:#ddd;width:100%;height:45px;border-bottom-left-radius:6px;border-bottom-right-radius:6px;">' + '<a class="canclebtn" style="font-size:12px;line-height:16px;display:inline-block;padding:4px 14px;background:#eeeeee;border:1px #ccc solid;float:left;margin:10px 20px;cursor:pointer;border-radius:4px;">' + canclebtn.title + '</a>' + '<a class="submitbtn" style="font-size:12px;line-height:16px;display:inline-block;padding:4px 14px;background:#eeeeee;border:1px #ccc solid;float:right;margin:10px 20px;cursor:pointer;border-radius:4px;">' + submitbtn.title + '</a>' + '</div>';

    return footerHTML;
  }

  function deletePrompt() {
    UiHelper.popupMgr.unregister(popupId);
    removeEnents();
    var promptdiv = document.getElementById('promptbackground');
    promptdiv.parentNode.removeChild(promptdiv);
  }

  function makePrompt(options) {
    config(options);

    var myPrompt = document.createElement('div');
    document.body.appendChild(myPrompt);
    var html = renderPrompt();
    myPrompt.outerHTML = html;

    var promptDiv = document.getElementById('promptdiv');
    UiHelper.popupMgr.register(popupId, [promptDiv], function() {
      deletePrompt();
    });

    addEvents();

    return myPrompt;
  }

  function addEvents() {
    var promptDiv = document.getElementById('promptdiv');
    var closeBtn = promptDiv.getElementsByClassName('closebtn')[0];
    var cancleBtn = promptDiv.getElementsByClassName('canclebtn')[0];
    var submitBtn = promptDiv.getElementsByClassName('submitbtn')[0];

    UiHelper._util.addEvent(closeBtn, 'click', closeBtnClick, false);
    UiHelper._util.addEvent(closeBtn, 'mouseover', closeBtnMouseOver, false);
    UiHelper._util.addEvent(closeBtn, 'mouseout', closeBtnMouseOut, false);

    UiHelper._util.addEvent(cancleBtn, 'click', cancleBtnClick, false);
    UiHelper._util.addEvent(cancleBtn, 'mouseover', BtnMouseOver, false);
    UiHelper._util.addEvent(cancleBtn, 'mouseout', BtnMouseOut, false);

    UiHelper._util.addEvent(submitBtn, 'click', submitBtnClick, false);
    UiHelper._util.addEvent(submitBtn, 'mouseover', BtnMouseOver, false);
    UiHelper._util.addEvent(submitBtn, 'mouseout', BtnMouseOut, false);
  }

  function removeEnents() {
    var promptDiv = document.getElementById('promptdiv');
    var closeBtn = promptDiv.getElementsByClassName('closebtn')[0];
    var cancleBtn = promptDiv.getElementsByClassName('canclebtn')[0];
    var submitBtn = promptDiv.getElementsByClassName('submitbtn')[0];

    UiHelper._util.removeEvent(closeBtn, 'click', closeBtnClick, false);
    UiHelper._util.removeEvent(closeBtn, 'mouseover', closeBtnMouseOver, false);
    UiHelper._util.removeEvent(closeBtn, 'mouseout', closeBtnMouseOut, false);

    UiHelper._util.removeEvent(cancleBtn, 'click', cancleBtnClick, false);
    UiHelper._util.removeEvent(cancleBtn, 'mouseover', BtnMouseOver, false);
    UiHelper._util.removeEvent(cancleBtn, 'mouseout', BtnMouseOut, false);

    UiHelper._util.removeEvent(submitBtn, 'click', submitBtnClick, false);
    UiHelper._util.removeEvent(submitBtn, 'mouseover', BtnMouseOver, false);
    UiHelper._util.removeEvent(submitBtn, 'mouseout', BtnMouseOut, false);
  }

  UiHelper.Prompt = {
    makePrompt: makePrompt
  }
})();


UiHelper.Action = UiHelper.action || {};
(function() {
  /* options格式
  var actionOpt = {
    title:'Time Around',
    actions:[{
      title:'One Minutes',
      value:'1'
    }, {
      title:'Two Minutes',
      value:'2'
    }],
    footer:{
      canclebtn:{
        title:Cancel,
        func:function() {}
      }
    },
    actionCallback:function(value) {
      console.log(value);
    },
    position:{
      centerToLeft:300,
      centerToTop:300
    }
  }
  */
  var opts = opts || {};
  var popupId = 'uihelper_action';

  function config(options) {
    opts.title = options.title || 'Action';
    opts.actions = options.actions;
    opts.footer = options.footer;
    opts.actionCallback = options.actionCallback || function() {};
    opts.position = options.position || {
      centerToLeft: 300,
      centerToTop: 300
    };
  }

  function closeBtnClick() {
    deleteAction();
  }

  function cancleBtnClick() {
    deleteAction();
  }

  function OptionMouseOver() {
    this.style.background = '#eeeeee';
  }

  function OptionMouseOut() {
    this.style.background = '#ffffff';
  }

  function OptionClick() {
    opts.actionCallback(this.getAttribute('value'));
    deleteAction();
  }

  function renderAction() {
    var actionHMTL = '<div id="actionbackground" style="position:fixed;z-index:1000;width:100%;height:100%;background-color:rgba(0,0,0,0.2);">' + '<div id="actiondiv" style="width:200px;height:auto;background:#fff;margin:0 auto;position:absolute;border-radius:6px;box-shadow:0px 0px 8px 2px #aaa;">' + renderTitle() + renderContent() + renderFooter() + '</div>' + '</div>';

    return actionHMTL;
  }

  function renderTitle() {
    var title = opts.title;
    var titleHTML = '<div class="actiontitle" style="background-color:#eeeeee;width:100%;height:50px;border-top-left-radius:6px;border-top-right-radius:6px;text-align:center;">' + '<p style="display:inline-block;line-height:50px;color:#57a;font-size:16px;">' + title + '</p>' + '<a class="closebtn" style="position:absolute;right:20px;color:grey;margin:10px 0px;font-size:20px;cursor:pointer;">×' + '</a>' + '</div>';

    return titleHTML;
  }

  function renderContent() {
    var actions = opts.actions;
    var length = actions.length;
    var inputHTML = '';
    for (var i = 0; i < length; i++) {
      inputHTML = inputHTML + '<a style="width:auto;text-align:center;display:block;font-size:14px;line-height:16px;padding:5px 50px;cursor:pointer;"' + 'value="' + actions[i].value + '">' + actions[i].title + '</a>';
    }

    var contentHTML = '<div id="actioncontent" style="background-color:#fff;width:100%;height:auto;margin:20px 0px;">' + '<div style="">' + inputHTML + '</div>' + '</div>';

    return contentHTML;
  }

  function renderFooter() {
    var footer = opts.footer;
    var canclebtn = footer.canclebtn;

    var footerHTML = '<div calss="actionfooter" style="text-align:center;background-color:#ddd;width:100%;height:45px;border-bottom-left-radius:6px;border-bottom-right-radius:6px;">' + '<a class="canclebtn" style="font-size:12px;line-height:16px;display:inline-block;padding:4px 14px;background:#eeeeee;border:1px #ccc solid;margin:10px 20px;cursor:pointer;border-radius:4px;">' + canclebtn.title + '</a>' + '</div>';

    return footerHTML;
  }

  function deleteAction() {
    UiHelper.popupMgr.unregister(popupId);
    removeEnents();
    var actiondiv = document.getElementById('actionbackground');
    actiondiv.parentNode.removeChild(actiondiv);
  }

  function makeAction(options) {
    config(options);

    var myAction = document.createElement('div');
    document.body.appendChild(myAction);
    myAction.outerHTML = renderAction();

    var actionContent = document.getElementById('actiondiv');
    var absoluteToTop = opts.position.centerToTop - actionContent.offsetHeight / 2;
    if (absoluteToTop < 50) {
      absoluteToTop = 50;
    } else if (absoluteToTop + actionContent.offsetHeight + 50 > document.body.offsetHeight) {
      absoluteToTop = document.body.offsetHeight - 50 - actionContent.offsetHeight;
    }
    var absoluteToLeft = opts.position.centerToLeft - actionContent.offsetWidth / 2;
    actionContent.style.top = absoluteToTop + 'px';
    actionContent.style.left = absoluteToLeft + 'px';

    addEvents();

    var actionDiv = document.getElementById('actiondiv');
    UiHelper.popupMgr.register(popupId, [actionDiv], function() {
      deleteAction();
    });

    return myAction;
  }

  function addEvents() {
    var actionDiv = document.getElementById('actiondiv');
    var closeBtn = actionDiv.getElementsByClassName('closebtn')[0];
    var cancleBtn = actionDiv.getElementsByClassName('canclebtn')[0];
    var options = document.getElementById('actioncontent').getElementsByTagName('a');

    UiHelper._util.addEvent(closeBtn, 'click', closeBtnClick, false);
    UiHelper._util.addEvent(closeBtn, 'mouseover', closeBtnMouseOver, false);
    UiHelper._util.addEvent(closeBtn, 'mouseout', closeBtnMouseOut, false);

    UiHelper._util.addEvent(cancleBtn, 'click', cancleBtnClick, false);
    UiHelper._util.addEvent(cancleBtn, 'mouseover', BtnMouseOver, false);
    UiHelper._util.addEvent(cancleBtn, 'mouseout', BtnMouseOut, false);

    UiHelper._util.addEvent(options, 'click', OptionClick, false);
    UiHelper._util.addEvent(options, 'mouseover', OptionMouseOver, false);
    UiHelper._util.addEvent(options, 'mouseout', OptionMouseOut, false);
  }

  function removeEnents() {
    var actionDiv = document.getElementById('actiondiv');
    var closeBtn = actionDiv.getElementsByClassName('closebtn')[0];
    var cancleBtn = actionDiv.getElementsByClassName('canclebtn')[0];
    var options = document.getElementById('actioncontent').getElementsByTagName('a');

    UiHelper._util.removeEvent(closeBtn, 'click', closeBtnClick, false);
    UiHelper._util.removeEvent(closeBtn, 'mouseover', closeBtnMouseOver, false);
    UiHelper._util.removeEvent(closeBtn, 'mouseout', closeBtnMouseOut, false);

    UiHelper._util.removeEvent(cancleBtn, 'click', cancleBtnClick, false);
    UiHelper._util.removeEvent(cancleBtn, 'mouseover', BtnMouseOver, false);
    UiHelper._util.removeEvent(cancleBtn, 'mouseout', BtnMouseOut, false);

    UiHelper._util.removeEvent(options, 'click', OptionClick, false);
    UiHelper._util.removeEvent(options, 'mouseover', OptionMouseOver, false);
    UiHelper._util.removeEvent(options, 'mouseout', OptionMouseOut, false);
  }

  UiHelper.Action = {
    makeAction: makeAction
  }
})();


UiHelper.Confirm = UiHelper.Confirm || {};
(function() {
  /* options格式
  var confirmOpt = {
    title:'hello',
    info:'hello world',
    footer:{
      canclebtn:{
        title:LA('Cancel')
      },
      confirmbtn:{
        title:LA('Save')
      }
    },
    callback:function(){}
  }
  */
  var opts = opts || {};
  var popupId = 'uihelper_confirm';

  function config(options) {
    opts.title = options.title || 'Confirm';
    opts.info = options.info;
    opts.footer = options.footer;
    opts.callback = options.callback;
  }

  function closeBtnClick() {
    deleteConfirm();
  }

  function cancleBtnClick() {
    deleteConfirm();
  }

  function confirmBtnClick() {
    opts.callback();
    deleteConfirm();
  }

  function renderConfirm() {
    var confirmHMTL = '<div id="confirmbackground" style="position:fixed;z-index:1000;width:100%;height:100%;background-color:rgba(0,0,0,0.2);">' + '<div id="confirmdiv" style="width:400px;height:auto;background:#fff;margin:0 auto;position:relative;top:100px;border-radius:6px;box-shadow:0px 0px 8px 2px #aaa;">' + renderTitle() + renderContent() + renderFooter() + '</div>' + '</div>';

    return confirmHMTL;
  }

  function renderTitle() {
    var title = opts.title;
    var titleHTML = '<div class="confirmtitle" style="background-color:#eeeeee;width:100%;height:50px;border-top-left-radius:6px;border-top-right-radius:6px;text-align:center;">' + '<p style="display:inline-block;line-height:50px;color:#57a;font-size:16px;">' + title + '</p>' + '<a class="closebtn" style="position:absolute;right:20px;color:grey;margin:10px 0px;font-size:20px;cursor:pointer;">×' + '</a>' + '</div>';
    return titleHTML;
  }

  function renderContent() {
    var info = opts.info;

    var contentHTML = '<div class="confirmcontent" style="background-color:#fff;width:100%;height:auto;margin:40px 0px;">' + '<div style="margin:0px 30px;font-size:14px">' + info + '</div>' + '</div>';

    return contentHTML;
  }

  function renderFooter() {
    var footer = opts.footer;
    var confirmbtn = footer.confirmbtn;
    var canclebtn = footer.canclebtn;

    var footerHTML = '<div calss="confirmfooter" style="background-color:#ddd;width:100%;height:45px;border-bottom-left-radius:6px;border-bottom-right-radius:6px;">' + '<a class="canclebtn" style="font-size:12px;line-height:16px;display:inline-block;padding:4px 14px;background:#eeeeee;border:1px #ccc solid;float:left;margin:10px 20px;cursor:pointer;border-radius:4px;">' + canclebtn.title + '</a>' + '<a class="confirmbtn" style="font-size:12px;line-height:16px;display:inline-block;padding:4px 14px;background:#eeeeee;border:1px #ccc solid;float:right;margin:10px 20px;cursor:pointer;border-radius:4px;">' + confirmbtn.title + '</a>' + '</div>';

    return footerHTML;
  }

  function deleteConfirm() {
    UiHelper.popupMgr.unregister(popupId);
    removeEnents();
    var confirmBackground = document.getElementById('confirmbackground');
    confirmBackground.parentNode.removeChild(confirmBackground);
  }

  function makeConfirm(options) {
    config(options);

    var myConfirm = document.createElement('div');
    document.body.appendChild(myConfirm);
    var html = renderConfirm();
    myConfirm.outerHTML = html;

    var confirmDiv = document.getElementById('confirmdiv');
    UiHelper.popupMgr.register(popupId, [confirmDiv], function() {
      deleteConfirm();
    });

    addEvents();

    return myConfirm;
  }

  function addEvents() {
    var confirmDiv = document.getElementById('confirmdiv');
    var closeBtn = confirmDiv.getElementsByClassName('closebtn')[0];
    var cancleBtn = confirmDiv.getElementsByClassName('canclebtn')[0];
    var confirmBtn = confirmDiv.getElementsByClassName('confirmbtn')[0];

    UiHelper._util.addEvent(closeBtn, 'click', closeBtnClick, false);
    UiHelper._util.addEvent(closeBtn, 'mouseover', closeBtnMouseOver, false);
    UiHelper._util.addEvent(closeBtn, 'mouseout', closeBtnMouseOut, false);

    UiHelper._util.addEvent(cancleBtn, 'click', cancleBtnClick, false);
    UiHelper._util.addEvent(cancleBtn, 'mouseover', BtnMouseOver, false);
    UiHelper._util.addEvent(cancleBtn, 'mouseout', BtnMouseOut, false);

    UiHelper._util.addEvent(confirmBtn, 'click', confirmBtnClick, false);
    UiHelper._util.addEvent(confirmBtn, 'mouseover', BtnMouseOver, false);
    UiHelper._util.addEvent(confirmBtn, 'mouseout', BtnMouseOut, false);
  }

  function removeEnents() {
    var confirmDiv = document.getElementById('confirmdiv');
    var closeBtn = confirmDiv.getElementsByClassName('closebtn')[0];
    var cancleBtn = confirmDiv.getElementsByClassName('canclebtn')[0];
    var confirmBtn = confirmDiv.getElementsByClassName('confirmbtn')[0];

    UiHelper._util.removeEvent(closeBtn, 'click', closeBtnClick, false);
    UiHelper._util.removeEvent(closeBtn, 'mouseover', closeBtnMouseOver, false);
    UiHelper._util.removeEvent(closeBtn, 'mouseout', closeBtnMouseOut, false);

    UiHelper._util.removeEvent(cancleBtn, 'click', cancleBtnClick, false);
    UiHelper._util.removeEvent(cancleBtn, 'mouseover', BtnMouseOver, false);
    UiHelper._util.removeEvent(cancleBtn, 'mouseout', BtnMouseOut, false);

    UiHelper._util.removeEvent(confirmBtn, 'click', confirmBtnClick, false);
    UiHelper._util.removeEvent(confirmBtn, 'mouseover', BtnMouseOver, false);
    UiHelper._util.removeEvent(confirmBtn, 'mouseout', BtnMouseOut, false);
  }

  UiHelper.Confirm = {
    makeConfirm: makeConfirm
  }
})();


// 提示信息
UiHelper.Message = UiHelper.Message || {};
(function() {
  var opts = opts || {};
  var hasMessageFrame = false;
  var timeoutToHideFrame = null;
  var autoIncreaseMessageId = 0;
  var MessageObjArr = [];

  function config(options) {
    opts.title = options.title || 'Message';
    opts.duration = options.duration || 3000;
    opts.duration = opts.duration > 3000 ? opts.duration : 3000;
    opts.duration = 10000000;
    opts.position = options.position || {
      centerToRight: 200,
      centerToTop: 50
    };
  }

  function closeBtnClick() {
    hideMessage();
  }

  function hideMessage() {
    var messageDiv = document.getElementById('messagediv');
    messageDiv.style.display = 'none';
    timeoutToHideFrame && clearTimeout(timeoutToHideFrame);
  }

  function showMessageFrame() {
    var messageDiv = document.getElementById('messagediv');
    messageDiv.style.display = 'block';

    timeoutToHideFrame && clearTimeout(timeoutToHideFrame);
    timeoutToHideFrame = setTimeout(hideMessage, opts.duration);
  }

  function deleteMessage() {
    removeEnents();
    var messageDiv = document.getElementById('messagediv');
    messagediv.parentNode.removeChild(messageDiv);
  }

  function renderMessage() {
    var messageHtmlArr = [
      '<div id="messagediv" style="z-index:1000;dispaly:none;width:300px;height:auto;background:#fff;margin:0 auto;position:fixed;border-radius:6px;box-shadow:0px 0px 8px 2px #aaa;top:',
      opts.position.centerToTop,
      'px;right:calc(',
      opts.position.centerToRight,
      'px - 150px)">',
      renderTitle(),
      renderContent(),
      renderFooter(),
      '</div>'
    ];

    return messageHtmlArr.join('');
  }

  function renderTitle() {
    var title = opts.title;
    var titleHtmlArr = [
      '<div class="messagetitle" style="background-color:#eeeeee;width:100%;height:50px;border-top-left-radius:6px;border-top-right-radius:6px;text-align:center;">',
      '<p style="display:inline-block;line-height:50px;color:#57a;font-size:16px;">',
      title,
      '</p>',
      '<a class="closebtn" style="position:absolute;right:20px;color:grey;margin:10px 0px;font-size:20px;cursor:pointer;">×</a>',
      '</div>'
    ];

    return titleHtmlArr.join('');
  }

  function renderContent() {
    var contentHtmlArr = [
      '<div id="messagecontent" style="background-color:#fff;width:100%;height:auto;margin:0px;">',
      '</div>'
    ];

    return contentHtmlArr.join('');
  }

  function renderFooter() {
    var footerHtmlArr = [
      '<div id="messagefooter" style="background-color:#eeeeee;width:100%;height:15px;border-bottom-left-radius:6px;border-bottom-right-radius:6px;">',
      '</div>'
    ];

    return footerHtmlArr.join('');
  }

  /* options格式
  var options = {
    title:'hello',
    duration:3000,
    position:{
      centerToRight:200,
      centerToTop:100
    }
  }
  */
  function makeMessage(options) {
    if (hasMessageFrame) {
      return;
    }
    hasMessageFrame = true;

    config(options || {});

    var myMessage = document.createElement('div');
    document.body.appendChild(myMessage);
    var html = renderMessage();
    myMessage.outerHTML = html;

    addEvents();

    return myMessage;
  }

  function addEvents() {
    var messageDiv = document.getElementById('messagediv');
    var closeBtn = messageDiv.getElementsByClassName('closebtn')[0];

    UiHelper._util.addEvent(closeBtn, 'click', closeBtnClick, false);
    UiHelper._util.addEvent(closeBtn, 'mouseover', closeBtnMouseOver, false);
    UiHelper._util.addEvent(closeBtn, 'mouseout', closeBtnMouseOut, false);
  }

  function removeEnents() {
    var messageDiv = document.getElementById('messagediv');
    var closeBtn = messageDiv.getElementsByClassName('closebtn')[0];

    UiHelper._util.removeEvent(closeBtn, 'click', closeBtnClick, false);
    UiHelper._util.removeEvent(closeBtn, 'mouseover', closeBtnMouseOver, false);
    UiHelper._util.removeEvent(closeBtn, 'mouseout', closeBtnMouseOut, false);
  }

  function addOneMessage(info, duration) {
    if (!hasMessageFrame) {
      makeMessage();
    }

    var messageContent = document.getElementById('messagecontent');

    var lastMessageObj =  MessageObjArr[autoIncreaseMessageId];
    if (lastMessageObj && lastMessageObj.info === info) {
      lastMessageObj.continueTimes++;
      lastMessageObj.timeoutToDeleteMessage && clearTimeout(lastMessageObj.timeoutToDeleteMessage);
      deleteOneMessage(messageContent.childNodes[0]);
    } else {
      autoIncreaseMessageId++
      MessageObjArr[autoIncreaseMessageId] = {
        info: info,
        continueTimes: 1,
        timeoutToDeleteMessage: null
      };
    }

    var lastMessageObj =  MessageObjArr[autoIncreaseMessageId];

    var oneMessage = document.createElement('div');
    messageContent.insertBefore(oneMessage, messageContent.childNodes[0]);
    var html = renderOneMessage(lastMessageObj.info, lastMessageObj.continueTimes);
    oneMessage.outerHTML = html;

    updateMessageState();

    var laseOneMessage = messageContent.childNodes[0];
    duration = duration || 3000;
    duration = duration > 500 ? duration : 500;
    duration = 3000;
    lastMessageObj.timeoutToDeleteMessage = setTimeout(function() {
      deleteOneMessage(laseOneMessage);
      MessageObjArr[autoIncreaseMessageId] = null;
      delete MessageObjArr[autoIncreaseMessageId];
    }, duration);

    showMessageFrame();
  }

  function deleteOneMessage(oneMessage) {
    if (!oneMessage) {
      return;
    }

    var messageContent = document.getElementById('messagecontent');
    messageContent.removeChild(oneMessage);
    updateMessageState();
    
    // $(oneMessage).sideUp(500, function(){
    //   messageContent.removeChild(oneMessage);
    //   updateMessageState();
    // });
  }

  function updateMessageState() {
    var messageContent = document.getElementById('messagecontent');
    var messages = messageContent.childNodes;
    var length = messages.length;

    if (length < 1) {
      hideMessage();
      return;
    } else {
      for (var i = 0; i < length - 1; i++) {
        messages[i].style.borderBottom = '1px solid #aaa';
      }
      messages[length - 1].style.borderBottom = 'none';
    }
  }

  function renderOneMessage(info, continueTimes) {
    var oneMessageHtmlArr = [
      '<div calss="onemessage" style="padding:20px 0px;">',
      '<div style="display:inline-block;width:30px;line-height:100%;padding:0px 5px;vertical-align:top;margin-top:2px;">',
      '<span style="display:inline-block;text-align:center;font-size:10px;height:12px;line-height:12px;min-width:12px;border-radius:9px;padding:2px;color:green;background-color:#ccc;overflow: hidden;float: right;">',
      continueTimes,
      '</span>',
      '</div>',
      '<div style="display:inline-block;font-size:16px;width:calc(100% - 40px);color:blue;overflow:hidden">',
      info,
      '</div>',
      '</div>'
    ];

    return oneMessageHtmlArr.join('');
  }

  UiHelper.Message = {
    makeMessage: makeMessage,
    addOneMessage: addOneMessage
  }
})();