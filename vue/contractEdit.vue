<style lang="less">
    .editContent {
        .edit {
            position: relative;
        }
        .edit > span {
            cursor: pointer;
            position: relative;
            /*background: url(edit.png)no-repeat 0 0;*/
            padding-left: 5px;
        }
        /* input */
        span.hover {
            cursor: pointer;
            background: #eee;
        }
        .edui-default {
            display: inline-block;
        }
        .edui-editor-toolbarbox {
            display: none;
        }
        .edui-message {
            display: none;
        }
        .edui-default,
        .edui-editor {
            text-indent: 0;
            /*float:left;*/
        }
    }

</style>
<template>
    <div>
        <div class="editContent" ref="editContent" v-html="editTxt">
        </div>
        <script id="editor1" type="text/plain"></script>
    </div>
</template>
<script>
    //    import '../../../../assets/ueditor/ueditor.config.ebnew.js';
    //    import '../../../../assets/ueditor/ueditor.all.min-fix.js';
    //    import '../../assets/ueditor/lang/zh-cn/zh-cn.js';

    export default {
        name: 'contractEdit',
        props: {
            articleStr: {
                type: String
            },
            type: String
        },
        data() {
            let _this = this;
            return {
                editor: null,
                editTxt: _this.articleStr,
                tempRef: '',
                tempRef2: '',
                tempEditContentOuterHTML: '',
                p: {
                    subNum: null,
                    ue: [],
                    ele: null,
                    text: '',
                    currentContent: ''
                }
            };
        },
        created() {
        },
        watch: {
            //            articleStr(newVal){
            //                console.log(newVal,'watch');
            //            }
        },
        async mounted() {
            await this.addEditor();
            await this.viewEditor();
            await this.clickEvent();    // 页面渲染之后调用点击文字出编辑框方法
        },
        updated() {
            //            this.viewEditor();
        },
        methods: {
            async addEditor() { //获得的模板区域 id
                let _this = this;
                let regx = new RegExp("{{(.*?)}}", "g");
                return new Promise((resolve, reject) => {
                    _this.editTxt = this.articleStr;
                    let _html = this.articleStr;
                    //模板内容为空则返回
                    if ($.trim(_html) === '' || _html === null) {
                        return false;
                    }

                    let _strS = _html.replace(regx, 'editText{{$1}}');
                    let strArr = _strS.split('editText');
                    let strHtml = '';
                    $.each(strArr, function (i, v) {
                        let index = i;
                        if (index == 0) {
                            strHtml += v;
                        } else {
                            //                        v=v.replace(/<span(.*)>$/,'');
                            let valueArr = v.split('}}');
                            let _t = '<span class="edit">' +
                                '<span class="editText" data-id="' + index + '">' + valueArr[0] + '}}</span>';
                            let _temp = v.replace(v, _t);
                            strHtml += _temp + '</span>' + valueArr[1];
                        }
                    });
                    _this.p.subNum = strArr.length;
                    _this.editTxt = strHtml;
                    resolve();
                })
            },
            async viewEditor() {
                let _this = this;
                //                let editorWidth = $('.text-body').width();
                let editorWidth = 600;
                let editorHeight = 300;
                //实例化一个编辑器

                return new Promise((resolve, reject) => {
                    _this.p.ue[1] = UE.getEditor('editor1', {
                        toolbars: [],
                        isShow: false,
                        enableAutoSave: false,
                        saveInterval: 500000000,
                        initialFrameWidth: editorWidth,
                        initialFrameHeight: editorHeight
                    });
                    _this.p.ue[1].ready(function () {
                        //阻止工具栏的点击向上冒泡
                        $(this.container).click(function (e) {
                            e.stopPropagation()
                        })
                    });
                    _this.setTxt();
                    resolve();
                })
            },
            // 点击时显示编辑器
            async clickEvent() {
                let _this = this;

                // 绑定edit点击时显示编辑器
                $('.editText').click(function () {

                    let $target = $(this);
                    _this.p.ele = $target;
                    let content = $target.html();
                    _this.p.text = $target.html();
                    let currentParnet = $target;
                    let currentContent = _this.p.ue[1].getContent();

                    $target.html('');
                    $target.append(_this.p.ue[1].container.parentNode);

                    _this.p.ue[1].reset();
                    setTimeout(function () {
                        _this.p.ue[1].setContent(content);
                        _this.p.ue[1].setShow();
                    }, 100);

                    setTimeout(() => {
                        // 给document绑定事件，点击编辑框以外的地方关闭编辑器，并将编辑内容换至触发点
                        $(document).unbind().bind('click', function (e) {
                            e = e || window.event; //浏览器兼容性
                            let _ele = e.target || e.srcElement;
                            _ele = $(_ele);
                            // 循环判断点击元素父级是否为编辑器，判断至body不再判断，关闭编辑器并赋值
                            while (!_ele.is('html')) {
                                // 如果当前点为富文本编辑框则不做处理
                                if (_ele.is('.edit') || _ele.is('#editor1')) {
                                    return;
                                }
                                _ele = _ele.parent();
                            }
                            _this.saveHtml();
                        });
                    }, 200)
                });

            },
            saveHtml() {
                let _this = this;
                // 循环ue(编辑器集合)，依次关闭编辑器并将当前内容存至相对应span

                if (typeof _this.p.ue[1] !== undefined) {
                    if (_this.p.ue[1].hasContents()) {
                        let content = _this.p.ue[1].getContent();
                        content = content.replace(/^<p>/, '');
                        content = content.replace(/<\/p>$/, '');
                        // content = content.replace(/<p><br\/><\/p>/, '');
                        //参考 http://fex.baidu.com/ueditor/#qa-allowDivToP

                        // 去除换行后判断当前内容是否为空，避免只有空换行而无法再次编辑
                        let _flagC = content.replace(/<br\/>/, '');
                        if (_flagC.length === 0) {
                            content = _this.p.text;
                        }
                        // 将修改后的内容回显至页面
                        _this.p.ele.html(content);
                    }
                }
                _this.setTxt();
                _this.p.ue[1].setHide();
            },
            setTxt(){
                this.$store.dispatch('setBuyerContractEditorText', this.$refs.editContent.innerHTML)
            },
            closeAllEditor() {
                let _this = this;
                for (let i = 1; i < _this.p.ue.length; i++) {
                    _this.p.ue[i].setHide();
                }
            },
            // 字符转义
            escape2Html(str) {
                let arrEntities = {
                    'lt': '<',
                    'gt': '>',
                    'nbsp': ' ',
                    'amp': '&',
                    'quot': '"'
                };
                return str.replace(/&(lt|gt|nbsp|amp|quot);/ig, function (all, t) {
                    return arrEntities[t];
                });
            },
            // 提交编辑后的合同（未用）
            submitContract() {
                let _this = this;

                //                console.log(this.$refs.editContent.querySelector('.edui-default'));
                //                console.log(this.$refs.editContent);
                this.tempRef = this.$refs.editContent;

                //                通过DOM操作把实例化后的编辑器替换成实例化前的script标签，但在子组件替换时也修改了原有内容，
                //                推论先将较的数据进行提交，在父组件里进行整理数据并传给后端
                //                但提交后的数据可能是字符串，在父组件操作时或需用jquery转为对象处理后再转成字符串进行提交
                //                for (let i = 1; i < _this.p.ue.length; i++) {
                //                    console.log(this.$refs.editContent.querySelector('#editor'+i));
                //                    this.tempRef.querySelector('#editor'+i).outerHTML='<' + 'script id="editor'+i+'" type="text/plain">' + '<' + '/script>';
                //                }


                //                this.$emit('update:current', this.$refs.editContent);
            }
        }
    }
</script>