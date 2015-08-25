/* 简单UI插件
 * 功能：
 *
 *
 *
 *
 *
*/
var UiHelper = UiHelper || {};

// 内部使用的工具对象
UiHelper._util = UiHelper._util || {};
(function() {
  function _addEvent(el, e, callback, capture) {
    if (!!window.addEventListener) {
      el.addEventListener(e, callback, !!capture);
    } else {
      el.attachEvent('on' + e, callback);
    }
  }


  function _removeEvent(el, e, callback, capture) {
    if (!!window.addEventListener) {
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


  UiHelper._util = {
    addEvent: addEvent,
    removeEvent: removeEvent,
    isParent: isParent
  };
})();


// 构造界面弹出对象管理对象popupMgr
UiHelper.popupMgr = UiHelper.popupMgr || {};
(function() {
  var instance = {};
  instance.pops = {};

  // dom代表需要不需要触发popup对象消失doms对象(包含所有子对象)，disappearCallback代表（调用时this对象为此时传入的doms）
  function register(id, doms, disappearCallback) 
  {
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
    $(document).mousedown(function(event) {
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
    });
  }

  begin();

  UiHelper.popupMgr = {
    register: register,
    unregister: unregister
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
    title: LA('Save Task'),
    inputs: [{
      title: LA('Task Name'),
      id: 'taskname',
      type: "text",
      default: "hello"
    }, {
      title: LA('Task Description'),
      id: 'taskdescription',
      type: "textarea",
      default: "world"
    }],
    footer: {
      canclebtn: {
        title: LA('Cancel')
      },
      submitbtn: {
        title: LA('Save')
      }
    },
    submitcallback: function(){}
  }
  */
  var opts = opts || {};
  var popupName = 'uihelper_prompt';

  function config(options) {
    opts.title = options.title || 'Prompt';
    opts.inputs = options.inputs;
    opts.footer = options.footer;
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

    opts.footer.submitbtn.func(result);
    deletePrompt();
  }

  function renderPrompt() {
    var promptHMTL = '<div id="promptbackground" style="position:fixed; z-index:1000; width:100%; height:100%; background-color:rgba(0,0,0,0.2);">'
     + '<div id="promptdiv" style="width:400px; height:auto; background:#fff; margin: 0 auto; position:relative; top:100px; border-radius:6px; box-shadow:0px 0px 8px 2px #aaa;">'
     + renderTitle()
     + renderContent()
     + renderFooter()
     + '</div>'
     + '</div>';

    return promptHMTL;
  }

  function renderTitle() {
    var title = opts.title;
    var titleHTML = '<div class="prompttitle" style="background-color:#eeeeee;width:100%;height:50px;border-top-left-radius:6px;border-top-right-radius:6px;text-align:center;">'
      + '<p style="display:inline-block;line-height:50px;color:#57a;font-size:16px;">'
      + title
      + '</p>'
      + '<a id="closebtn" style="position:absolute;right:20px;color:grey;margin:10px 0px;font-size: 20px; cursor:pointer;">×'
      + '<a>'
      + '</div>';
    return titleHTML;
  }

  function renderContent() {
    var inputs = opts.inputs;
    var length = inputs.length;
    var inputHTML = '';
    for (var i = 0; i < length; i++) {
      inputHTML = inputHTML
        + '<div style="margin: 20px 10px;">'
        + '<span style="display:inline-block;font-size:14px;width:120px;text-align:right;padding:0px 10px 0px 0px;">'
        + inputs[i].title
        + ':</span>'
        + '<input id="'
        + inputs[i].id
        + '" style="width:200px;border-radius:3px;border:1px #aaa solid;font-size:12px;padding: 2px 5px;" type="'
        + inputs[i].type
        + '" value="'
        + inputs[i].default+'"/>'
        + '</div>';
    }

    var contentHTML = '<div id="promptcontent" style="background-color:#fff;width:100%;height:auto;margin:40px 0px;">'
     + inputHTML
    + '</div>';

    return contentHTML;
  }

  function renderFooter() {
    var footer = opts.footer;
    var submitbtn = footer.submitbtn;
    var canclebtn = footer.canclebtn;

    var footerHTML = '<div calss="promptfooter" style="background-color:#ddd;width:100%;height:45px;border-bottom-left-radius:6px;border-bottom-right-radius:6px;">'
      + '<a id="canclebtn" style="font-size:12px; line-height:16px; display:inline-block; padding:4px 14px; background: #eeeeee; border: 1px #ccc solid; float:left; margin:10px 20px; cursor:pointer; border-radius:4px;">'
      + canclebtn.title
      + '</a>'
      + '<a id="submitbtn" style="font-size:12px; line-height:16px; display:inline-block; padding:4px 14px; background: #eeeeee; border: 1px #ccc solid; float:right; margin:10px 20px; cursor:pointer; border-radius:4px;">'
      + submitbtn.title
      + '</a>'
      + '</div>';

    return footerHTML;
  }

  function deletePrompt() {
    UiHelper.popupMgr.unregister(popupName);
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
    UiHelper.popupMgr.register(popupName, [promptDiv], function() {
      deletePrompt();
    });

    addEvents();

    return myPrompt;
  }

  function addEvents() {
    var closeBtn = document.getElementById('closebtn');
    var cancleBtn = document.getElementById('canclebtn');
    var submitBtn = document.getElementById('submitbtn');

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
    var closeBtn = document.getElementById('closebtn');
    var cancleBtn = document.getElementById('canclebtn');
    var submitBtn = document.getElementById('submitbtn');

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
    title: 'Time Around',
    actions: [{
      title: 'One Minutes',
      value: '1'
    }, {
      title: 'Two Minutes',
      value: '2'
    }],
    footer: {
      canclebtn: {
        title: Cancel,
        func: function() {}
      }
    },
    actionCallback: function(value) {
      console.log(value);
    },
    position:{
      centerToLeft: 300,
      centerToTop: 300
    }
  }
  */
  var opts = opts || {};
  var popupName = 'uihelper_action';

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
    var actionHMTL = '<div id="actionbackground" style="position:fixed;z-index:1000;width:100%;height:100%;background-color:rgba(0,0,0,0.2);">'
    + '<div id="actiondiv" style="width:200px;height:auto;background:#fff;margin: 0 auto;position:absolute;border-radius:6px;box-shadow:0px 0px 8px 2px #aaa;">'
    + renderTitle()
    + renderContent()
    + renderFooter()
    + '</div>'
    + '</div>';

    return actionHMTL;
  }

  function renderTitle() {
    var title = opts.title;
    var titleHTML = '<div class="actiontitle" style="background-color:#eeeeee;width:100%;height:50px;border-top-left-radius:6px;border-top-right-radius:6px;text-align:center;">'
    + '<p style="display:inline-block;line-height:50px;color:#57a;font-size:16px;">'
    + title
    + '</p>'
    + '<a id="closebtn" style="position:absolute;right:20px;color:grey;margin:10px 0px;font-size: 20px; cursor:pointer;">×'
    + '<a>'
    + '</div>';

    return titleHTML;
  }

  function renderContent() {
    var actions = opts.actions;
    var length = actions.length;
    var inputHTML = '';
    for (var i = 0; i < length; i++) {
      inputHTML = inputHTML + '<a style="width:auto;text-align:center;display:block;font-size:14px;line-height:16px;padding: 5px 50px;cursor: pointer;"'
      + 'value="'
      + actions[i].value
      + '">'
      + actions[i].title
      + '</a>';
    }

    var contentHTML = '<div id="actioncontent" style="background-color:#fff;width:100%;height:auto;margin:20px 0px;">'
    + '<div style="">'
    + inputHTML
    + '</div>'
    + '</div>';

    return contentHTML;
  }

  function renderFooter() {
    var footer = opts.footer;
    var canclebtn = footer.canclebtn;

    var footerHTML = '<div calss="actionfooter" style="text-align:center;background-color:#ddd;width:100%;height:45px;border-bottom-left-radius:6px;border-bottom-right-radius:6px;">'
    + '<a id="canclebtn" style="font-size:12px;line-height:16px;display:inline-block;padding:4px 14px;background: #eeeeee;border: 1px #ccc solid;margin:10px 20px;cursor:pointer;border-radius:4px;">'
    + canclebtn.title
    + '</a>'
    + '</div>';

    return footerHTML;
  }

  function deleteAction() {
    UiHelper.popupMgr.unregister(popupName);
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
    UiHelper.popupMgr.register(popupName, [actionDiv], function() {
      deleteAction();
    });

    return myAction;
  }

  function addEvents() {
    var closeBtn = document.getElementById('closebtn');
    var cancleBtn = document.getElementById('canclebtn');
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
    var closeBtn = document.getElementById('closebtn');
    var cancleBtn = document.getElementById('canclebtn');
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
    title: 'hello',
    info: 'hello world',
    footer: {
      canclebtn: {
        title: LA('Cancel')
      },
      confirmbtn: {
        title: LA('Save')
      }
    },
    callback: function(){}
  }
  */
  var opts = opts || {};
  var popupName = 'uihelper_confirm';

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
    var confirmHMTL = '<div id="confirmbackground" style="position:fixed; z-index:1000; width:100%; height:100%; background-color:rgba(0,0,0,0.2);">'
     + '<div id="confirmdiv" style="width:400px; height:auto; background:#fff; margin: 0 auto; position:relative; top:100px; border-radius:6px; box-shadow:0px 0px 8px 2px #aaa;">'
     + renderTitle()
     + renderContent()
     + renderFooter()
     + '</div>'
     + '</div>';

    return confirmHMTL;
  }

  function renderTitle() {
    var title = opts.title;
    var titleHTML = '<div class="confirmtitle" style="background-color:#eeeeee;width:100%;height:50px;border-top-left-radius:6px;border-top-right-radius:6px;text-align:center;">'
      + '<p style="display:inline-block;line-height:50px;color:#57a;font-size:16px;">'
      + title
      + '</p>'
      + '<a id="closebtn" style="position:absolute;right:20px;color:grey;margin:10px 0px;font-size: 20px; cursor:pointer;">×'
      + '<a>'
      + '</div>';
    return titleHTML;
  }

  function renderContent() {
    var info = opts.info;

    var contentHTML = '<div id="confirmcontent" style="background-color:#fff;width:100%;height:auto;margin:40px 0px;">'
      + '<div style="margin: 0px 30px; font-size:14px">'
      + info
      + '</div>'
      + '</div>';

    return contentHTML;
  }

  function renderFooter() {
    var footer = opts.footer;
    var confirmbtn = footer.confirmbtn;
    var canclebtn = footer.canclebtn;

    var footerHTML = '<div calss="confirmfooter" style="background-color:#ddd;width:100%;height:45px;border-bottom-left-radius:6px;border-bottom-right-radius:6px;">'
      + '<a id="canclebtn" style="font-size:12px; line-height:16px; display:inline-block; padding:4px 14px; background: #eeeeee; border: 1px #ccc solid; float:left; margin:10px 20px; cursor:pointer; border-radius:4px;">'
      + canclebtn.title
      + '</a>'
      + '<a id="confirmbtn" style="font-size:12px; line-height:16px; display:inline-block; padding:4px 14px; background: #eeeeee; border: 1px #ccc solid; float:right; margin:10px 20px; cursor:pointer; border-radius:4px;">'
      + confirmbtn.title
      + '</a>'
      + '</div>';

    return footerHTML;
  }

  function deleteConfirm() {
    UiHelper.popupMgr.unregister(popupName);
    removeEnents();
    var confirmdiv = document.getElementById('confirmbackground');
    confirmdiv.parentNode.removeChild(confirmdiv);
  }

  function makeConfirm(options) {
    config(options);

    var myConfirm = document.createElement('div');
    document.body.appendChild(myConfirm);
    var html = renderConfirm();
    myConfirm.outerHTML = html;

    var confirmDiv = document.getElementById('confirmdiv');
    UiHelper.popupMgr.register(popupName, [confirmDiv], function() {
      deleteConfirm();
    });

    addEvents();

    return myConfirm;
  }

  function addEvents() {
    var closeBtn = document.getElementById('closebtn');
    var cancleBtn = document.getElementById('canclebtn');
    var confirmBtn = document.getElementById('confirmbtn');

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
    var closeBtn = document.getElementById('closebtn');
    var cancleBtn = document.getElementById('canclebtn');
    var confirmBtn = document.getElementById('confirmbtn');

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