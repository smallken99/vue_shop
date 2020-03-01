<!--  -->
<template>
    <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card >
        <!-- 头部的警告区域 -->
        <el-alert :closable="false"
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning" show-icon>
        </el-alert>
    <!-- 选择商品分类区域 -->
    <el-row>
        <el-col>
            <span>选择商品分类：</span>
            <!-- 选择商品分类的级联选择框 -->
            <!-- options用来指定数据源 -->
                <!-- props用来指定配置对象 -->
                <el-cascader
                    clearable
                    expandTrigger="hover"
                    v-model="selectedCatKeys"
                    :options="cateList"
                    :props="cateProps"
                    @change="handleChange"></el-cascader>
        </el-col>
    </el-row>

    <!-- 页签区域 -->
    <el-tabs v-model="activeName" @tab-click="handleTabClick">
    <!-- 添加动态参数的面板 -->
    <el-tab-pane label="动态参数" name="many">
        <!-- 添加参数的按钮 -->
        <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
        <!-- 动态参数表格 -->
        <el-table :data="manyTableData" border stripe >
            <!-- 展开行 -->
            <el-table-column type="expand" >
                <template slot-scope="scope">
                    <!-- 循环渲染tag标签 -->
                    <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
                    <!-- 输入tag标签的文本框 -->
                    <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                    >
                    </el-input>
                <!-- 添加tag标签的按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column  label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column  label="操作" >
                <template slot-scope="scope">
                    <el-button size="mini" type="primary" inon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                    <el-button size="mini" type="danger" inon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-tab-pane>
        
    <!-- 添加静态属性的面板 -->
    <el-tab-pane label="静态属性" name="only">
        <!-- 添加属性的按钮 -->
        <el-button type="primary" size="mini" :disabled="isBtnDisabled"  @click="addDialogVisible = true">添加属性</el-button>
        <!-- 静态属性表格 -->
        <el-table :data="onlyTableData" border stripe >
            <!-- 展开行 -->
            <el-table-column type="expand" >
                <template slot-scope="scope">
                    <!-- 循环渲染tag标签 -->
                    <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
                    <!-- 输入tag标签的文本框 -->
                    <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                    >
                    </el-input>
                <!-- 添加tag标签的按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column  label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column  label="操作" >
                <template slot-scope="scope">
                    <el-button size="mini" type="primary" inon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                    <el-button size="mini" type="danger" inon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-tab-pane>
    </el-tabs>

    <!-- 添加参数的对话框 -->
    <el-dialog @close="addDialogClosed"
    :title=" '添加' +titleText "
    :visible.sync="addDialogVisible"
    width="50%"
        >
        <!-- 添加参数的表单 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" >
        <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
        </el-form>
    <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
    </span>
    </el-dialog>

    <!-- 编辑参数的对话框 -->
    <el-dialog @close="editDialogClosed"
    :title=" '修改' +titleText "
    :visible.sync="editDialogVisible"
    width="50%"
        >
        <!-- 添加参数的表单 -->
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" >
        <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
        </el-form>
    <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
    </span>
    </el-dialog>


    </el-card>
    </div>
</template>

<script>
export default {
    data () {
        return {
            // 商品分类列表
            cateList: [],
            // 级联选择框的对象
            cateProps: {
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            // 级联选择框双向绑定的数组
            selectedCatKeys: [],
            // 被激活的页签名称
            activeName: 'many',
            // 动态参数的数据
            manyTableData: [],
            // 静态属性的数据
            onlyTableData: [],
            // 控制添加对话框的显示与隐藏
            addDialogVisible :false,
            // 添加参数的表单数据对象
            addForm: {
                attr_name: ''
            },
            // 添加表单的验证规则对象
            addFormRules:{
                attr_name: [
                    {required: true,message: '请输入参数名称',trigger: 'blur'}
                ]
            },
            // 控制修改对话框的展示与隐藏   
            editDialogVisible: false,
            // 修改的表单数据对象
            editForm:{
                attr_name: ''
            },
            // 修改表单的验证规则对象
            editFormRules:{
                attr_name: [
                    {required: true,message: '请输入参数名称',trigger: 'blur'}
                ]
            },
            // 控制按钮与文本框的切换显示
            inputVisible :false,
            // 文本框中输入的内容
            inputValue: ''
            

        }
    },

    created(){
        // 获取所有的商品分类列表
        this.getCateList()
    },
    computed:{
        // 如果按钮需要被禁用，则返回true，否则返回false
        isBtnDisabled(){
            if(this.selectedCatKeys.length !== 3) return true
            return false
        },
        // 当前选中三级分类的id
        cateId(){
            if(this.selectedCatKeys.length == 3)
            return this.selectedCatKeys[2]
            return null
        },
        // 动态计算标题的文本
        titleText(){
            if(this.activeName == 'many')
                return '动态参数'
            else
                return '静态属性'
        }
    },
    methods: {
        async getCateList(){
            const {data : res} = await this.$http.get('categories')
            if(res.meta.status !== 200) return this.$message.error('获取商品分类失败！')
            // console.log(res.data)
            this.cateList = res.data
            //console.log(res)
        },
        // 监听级联选择框选项发生变化的事件
        async handleChange(){
            // console.log(this.selectedCatKeys)
            // 获取参数列表数据
            this.getParamsData()
        },
        // 监听Tab页签点击事件
        handleTabClick(){
            //console.log(this.activeName)
            // 获取参数列表数据
            this.getParamsData()
        },
        //获取参数列表数据
        async getParamsData(){
            // 证明选中的不是三级分类
            if(this.selectedCatKeys.length !== 3){
                this.selectedCatKeys = []
                this.manyTableData = []
                this.onlyTableData = []
                return
            }
            // 反之，选中的是三级分类
            // console.log(this.selectedCatKeys)
            // 根据所选分类的id和当前所处面板参数，获取数据请求
            const {data:res} = await this.$http.get('categories/'+this.cateId+'/attributes', {params:{sel: this.activeName}})
            if(res.meta.status !== 200) return this.$message.error('获取参数列表失败！')
            // console.log(res.data)
            // 将attr_vals进行分割 获得标签
            // ps:后面改进用三元表达式 解决attr_vals为空的情况
            res.data.forEach(item => {
                item.attr_vals = item.attr_vals ?  (item.attr_vals || '').split(' ') : []
                // 控制文本框的显示与隐藏
                item.inputVisible =false
                // 文本框中输入的值
                item.inputValue = ''
            })
            //console.log(res.data)
            // 通过判断来挂载到对应的表格上
            if(this.activeName == 'many'){
                this.manyTableData = res.data
            }else{
                this.onlyTableData = res.data
            }
        },
        // 监听添加对话框的关闭事件
        addDialogClosed(){
            this.$refs.addFormRef.resetFields()
        },
        // 点击确定按钮，添加分类参数
        addParams(){
            this.$refs.addFormRef.validate(async  valid =>{
                if(!valid) return 
                const {data:res} = await this.$http.post('categories/'+this.cateId+'/attributes',{
                    attr_name: this.addForm.attr_name,
                    attr_sel: this.activeName
                })
                if(res.meta.status !== 201) return this.$message.error('添加参数列表失败！')
                // 添加成功就关闭对话框并重新刷新列表数据
                this.$message.success('添加参数成功!')
                this.addDialogVisible = false 
                this.getParamsData()
            })
        },
        // 点击编辑按钮，展示修改对话框
        async showEditDialog(attr_id){
            // 查询当前参数的信息
            const {data:res} = await this.$http.get('categories/'+this.cateId+'/attributes/'+attr_id,{
                params:{attr_sel :this.activeName}
            })
            if(res.meta.status !== 200) return this.$message.error('获取参数列表失败！')
            this.editForm = res.data
            this.editDialogVisible = true
        },
        // 当对话框关闭时，重置表单
        editDialogClosed(){
            this.$refs.editFormRef.resetFields()
        },
        // 点击确定按钮，进行信息修改
        editParams(){
            this.$refs.editFormRef.validate(async  valid =>{
                if(!valid) return 
                const {data:res} = await this.$http.put('categories/'+this.cateId+'/attributes/'+this.editForm.attr_id,{
                    attr_name: this.editForm.attr_name,
                    attr_sel: this.activeName
                })
                if(res.meta.status !== 200) return this.$message.error('修改参数列表失败！')
                // 修改成功就关闭对话框并重新刷新列表数据
                this.$message.success('修改参数成功!')
                this.editDialogVisible = false 
                this.getParamsData()
            })
        },
        // 根据id删除对应的参数项
        async removeParams(attr_id){
            const confirmResult = await this.$confirm('此操作将永久删该参数，是否继续？','提示',{
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            // 用户取消了删除操作
            if(confirmResult !== 'confirm') return this.$message.info('已取消删除！') 
            // 删除的业务逻辑
            const {data:res} = await this.$http.delete('categories/'+this.cateId+'/attributes/'+attr_id)
            if(res.meta.status !== 200) return this.$message.error('删除参数列表失败！')
            // 删除成功就关闭对话框并重新刷新列表数据
            this.$message.success('删除参数成功!')
            this.getParamsData()
        },
        // 文本框是去焦点或按下回车将会触发
        async handleInputConfirm(row){
            //console.log('ok!')
            if(row.inputValue.trim().length == 0){
                row.inputValue = ''
                row.inputVisible = false
                return 
            }
            // 如果没有return,则证明输入的内容，需要做后续的处理
            row.attr_vals.push(row.inputValue.trim())
            row.inputValue = ''
            row.inputVisible = false
            // 将对attr_vals的操作，保存到数据库
            this.saveAttrVals(row)
        },
        // 将对attr_vals的操作，保存到数据库
        async saveAttrVals(row){
            // 需要发起请求，保存数组数据
            const {data:res} = await this.$http.put('categories/'+this.cateId+'/attributes/'+row.attr_id,{
                    attr_name: row.attr_name,
                    attr_sel: row.attr_sel,
                    attr_vals: row.attr_vals.join(' ')
                })
            if(res.meta.status !== 200) return this.$message.error('修改参数列表失败！')
            // 修改成功就关闭对话框并重新刷新列表数据
            this.$message.success('修改参数成功!')
        },
        // 点击按钮，展示文本输入框 保存tag标签
        showInput(row){
            row.inputVisible = true
            // 让文本框自动获得焦点
            // $nextTick 方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
            this.$nextTick(_ => {
            this.$refs.saveTagInput.$refs.input.focus()
            })
        },
        // 删除对应的tag标签
        handleClose(i,row){
            row.attr_vals.splice(i,1)
            this.saveAttrVals(row)
        }

    },
}

</script>
<style lang='less' scoped>
.el-row{
    margin: 15px 0;
}
.el-tag{
    margin: 10px;
}
.input-new-tag {
    width: 100px;
}
</style>