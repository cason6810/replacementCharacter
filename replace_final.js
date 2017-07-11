/**
 *
 * @date    2017-07-11 09:17:49
 * @version 1.0
 */

$(function() {
    var regx = new RegExp("{{(.*?)}}", "g");
    var p = {
        reg: new RegExp("{{(.*?)}}", "g"),
        ue: [],
        ueditIndex: '',
        subNum: '',
        contentBox: $('.content-box')
    };
    //将占位符转换成触发富文本编辑器的点
    addEditor(viewEditor);


/*功能部分*/
    function addEditor(callback) { //获得的模板区域 id
        var _html = p.contentBox.html();
        //模板内容为空则返回
        if ($.trim(_html) === '' || _html === null) {
            return false;
        }

        // 替换占位符增加结构为实例化富文本编辑器准备
        // 外层 span 可增加编辑图标的样式
        // 内层 span 为实例时的 id 做准备
        var _strS = _html.replace(regx, '<span><span class="editText">{{$1}}</span></span>');
        p.contentBox.html(_strS);

        // 遍历 editText 以获得 index
        p.contentBox.find('.editText').each(function(i, v) {
            // 实例化标签
            var _addhtml = '<' + 'script id="editor' + i + '" type="text/plain">' + '<' + '/script>';
            // 移除富文件编辑时可对比参考
            $(v).attr('data-id', i);
            $(v).parent().addClass('edit').append(_addhtml);
            // subNum统计需要实例化的总数
            p.subNum = i;
        });
        callback();
    }

    // 点击时显示编辑器
    function viewEditor() {
        var editorWidth = $('.text-body').width();
        // var editorHeight=300;
        //实例化所有编辑器
        for (var j = 0; j <= p.subNum; j++) {
            //同页面中需要不同配置编辑器时，在实例化时把配置同时带入
            p.ue[j] = UE.getEditor('editor' + j, {
                toolbars: [],
                isShow: false,
                enableAutoSave: false,
                saveInterval: 500000000,
                initialFrameWidth: editorWidth
            });
            // p.ue[j] = UE.getEditor('editor' + j,{initialFrameHeight:100,initialFrameWidth:400});
        }

        // 绑定edit点击时显示编辑器
        $('.edit').click(function() {
            var _this = $(this);
            // 将需编辑的文字保存到 _strTemp
            var _strTemp = $.trim(_this.find('span').html());
            // 获得当前 edit 所对应的富文本编辑器 id
            p.ueditIndex = _this.find("span").attr('data-id');
            // 当前 id 的富文本编辑器渲染后进行重新赋值
            p.ue[p.ueditIndex].ready(function() {
                _strTemp = _strTemp.replace(/^{{/, '');
                _strTemp = _strTemp.replace(/}}$/, '');
                p.ue[p.ueditIndex].setContent(_strTemp);
                p.ue[p.ueditIndex].setShow();
            });

            // 给document绑定事件，点击编辑框以外的地方关闭编辑器，并将编辑内容换至触发点
            $(document).unbind().bind('click', function(e) {
                e = e || window.event; //浏览器兼容性
                var _ele = e.target || e.srcElement;
                _ele = $(_ele);
                // 循环判断点击元素父级是否为编辑器，判断至body不再判断，关闭编辑器并赋值
                while (!_ele.is('html')) {
                    // 如果当前点为富文本编辑框则不做处理
                    if (_ele.is('.edit') || _ele.is('#editor' + p.ueditIndex)) {
                        saveHtml();
                        p.ue[p.ueditIndex].setShow();
                        return;
                    }
                    _ele = _ele.parent();
                }
                saveHtml();

            });
        });
    }

    function saveHtml() {
        // 循环ue(编辑器集合)，依次关闭编辑器并将当前内容存至相对应span
        for (var i = 0; i < p.ue.length; i++) {
            if (typeof p.ue[i] !== undefined) {
                if (p.ue[i].hasContents()) {
                    var content = p.ue[i].getContent();
                    content = content.replace(/^<p>/, '');
                    content = content.replace(/<\/p>$/, '');
                    // content = content.replace(/<p><br\/><\/p>/, '');
                    //参考 http://fex.baidu.com/ueditor/#qa-allowDivToP

                    // 去除换行后判断当前内容是否为空，避免只有空换行而无法再次编辑
                    var _flagC = content.replace(/<br\/>/, '');
                    if (_flagC.length === 0) {
                        content = $.trim($('span[data-id="' + i + '"]').html());
                    }
                    // 将修改后的内容回显至页面
                    $('#' + (p.ue[i].key)).siblings('span').html(content);
                }
            }
            p.ue[i].setHide();
        }
    }

    // 字符转义
    function escape2Html(str) {
        var arrEntities = {
            'lt': '<',
            'gt': '>',
            'nbsp': ' ',
            'amp': '&',
            'quot': '"'
        };
        return str.replace(/&(lt|gt|nbsp|amp|quot);/ig, function(all, t) {
            return arrEntities[t];
        });
    }

});