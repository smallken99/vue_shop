<!--  -->
<template>
    <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card>
        <!-- 提示区域 -->
        <el-alert
            title="添加商品信息"
            type="info" center show-icon :closable="false">
        </el-alert>
        <!-- 步骤条区域 -->
        <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
        </el-steps>
        <!-- Form表单 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <!-- Tabs标签页区域 -->
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
            <el-tab-pane label="基本信息" name="0">
                <el-form-item label="商品名称" prop="goods_name">
                    <el-input v-model="addForm.goods_name"></el-input>
                </el-form-item>
                <el-form-item label="商品价格" prop="goods_price">
                    <el-input v-model="addForm.goods_price" type="number"></el-input>
                </el-form-item>
                <el-form-item label="商品重量" prop="goods_weight">
                    <el-input v-model="addForm.goods_weight" type="number"></el-input>
                </el-form-item>
                <el-form-item label="商品数量" prop="goods_number">
                    <el-input v-model="addForm.goods_number" type="number"></el-input>
                </el-form-item>
                <el-form-item label="商品分类" prop="goods_cat">
                <!-- 选择商品分类的级联选择框 -->
                <!-- options用来指定数据源 -->
                <!-- props用来指定配置对象 -->
                <el-cascader
                    clearable
                    expandTrigger="hover"
                    v-model="addForm.goods_cat"
                    :options="cateList"
                    :props="cateProps"
                    @change="handleChange"></el-cascader>
                </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品参数" name="1">
                <!-- 渲染表单的item项 -->
                <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                    <el-checkbox-group v-model="item.attr_vals">
                        <el-checkbox :label="item2" v-for="(item2,i) in  item.attr_vals " :key="i" border></el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品属性" name="2">
                <!-- 渲染表单的item项 -->
                <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                    <el-input v-model="item.attr_vals">
                    </el-input>
                </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品图片" name="3">
                <!-- action表示图片要上传到后台的API地址 -->
                <el-upload
                :action="uploadUrl"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                list-type="picture" :headers="headerObj" :on-success="handleSuccess"
                >
                <el-button size="small" type="primary">点击上传</el-button>
                </el-upload>
            </el-tab-pane>
            <el-tab-pane label="商品内容" name="4">
                <!-- 富文本编辑器组件 -->
                <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                <!-- 添加商品的按钮 -->
                <el-button type="primary" class="btAdd" @click="addGoods">添加商品</el-button>
            </el-tab-pane>
        </el-tabs>
        </el-form>

    </el-card>
    <!-- 图片预览 -->
    <el-dialog
    title="图片预览"
    :visible.sync="previewVisible"
    width="50%"
    >
    <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
    </div>
</template>

<script>
// 导入lodash
import _ from 'lodash'
export default {
    data () {
        return {
            activeIndex: '0',
            // 添加商品的表单对象
            addForm:{
                goods_name: '',
                goods_price: 0,
                goods_weight: 0,
                goods_number: 0,
                // 级联选择框双向绑定的数组
                goods_cat: [],
                // 图片的数组
                pics: [],
                // 商品介绍内容
                goods_introduce: '',
                // 商品的参数（数组），包含 `动态参数` 和 `静态属性`
                attrs: []

            },
            addFormRules:{
                goods_name: [
                    { required: true,message: '请输入商品名称', trigger: 'blur'}
                ] ,
                goods_price: [
                    { required: true,message: '请输入商品价格', trigger: 'blur'},
                ],
                goods_weight: [
                    { required: true,message: '请输入商品重量', trigger: 'blur'},
                ],
                goods_number: [
                    { required: true,message: '请输入商品数量', trigger: 'blur'},
                ],
                goods_cat: [
                    { required: true,message: '请输入商品分类', trigger: 'blur'},
                ],
            },
            // 商品分类列表
            cateList: [],
            // 级联选择框的对象
            cateProps: {
                label: 'cat_name',
                value: 'cat_id',
                children: 'children'
            },
            // 动态参数列表的数据
            manyTableData: [],
            // 静态属性列表的数据
            onlyTableData: [],
            // 上传图片的URL地址
            uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
            // 图片上传组件的headers请求头对象
            headerObj: {
                Authorization: window.sessionStorage.getItem('token')
            },
            // 图片预览的url路径
            previewPath: '',
            // 图片预览对话框的显示与隐藏
            previewVisible: false
            
            
        }
    },

    created(){
        this.getCateList()
    },
    computed:{
        cateId(){
            if(this.addForm.goods_cat.length == 3)
            return this.addForm.goods_cat[2]
            return null
        },
    },
    methods: {
         // 获取父级分类的数据列表
        async getCateList(){
            const {data : res} = await this.$http.get('categories')
            if(res.meta.status !== 200) return this.$message.error('获取父级分类列表失败')
            //console.log(res.data)
            this.cateList = res.data
        },
        // 监听级联选择框选项发生变化的事件
        handleChange(){
            if(this.addForm.goods_cat.length != 3)
                this.addForm.goods_cat = []
        },
        // 切换标签之前的钩子，若返回 false 或者返回 Promise 且被 reject，则阻止切换。
        beforeTabLeave(activeName,oldActiveName){
            if(oldActiveName == '0' && this.addForm.goods_cat.length != 3){
                this.$message.error('请先选择商品分类!')
                return false
            }
        },
        // 获取tag标签里面的数据
        async tabClicked(){
            //证明访问的是动态参数面板
            if(this.activeIndex == '1'){
                const {data : res} = await this.$http.get('categories/'+this.cateId+'/attributes', {params:{sel: 'many'}})
                if(res.meta.status !== 200) return this.$message.error('获取动态参数列表失败')  
                 // 将attr_vals进行分割 获得标签
                // ps:后面改进用三元表达式 解决attr_vals为空的情况
                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals ?  (item.attr_vals || '').split(' ') : []
                })
                //console.log(res.data)
                this.manyTableData = res.data
            }else if(this.activeIndex == '2'){
                /* 获取静态属性列表 */
                const {data : res} = await this.$http.get('categories/'+this.cateId+'/attributes', {params:{sel: 'only'}})
                if(res.meta.status !== 200) return this.$message.error('获取静态属性列表失败')  
                // console.log(res.data)
                this.onlyTableData = res.data
            }
        },
        // 处理图片预览事件
        handlePreview(file){
            this.previewPath = file.response.data.url
            this.previewVisible = true
        },
        //处理移除图片的操作 
        handleRemove(file){
            // 1、获取想要删除图片的临时路径
            const filePath = file.response.data.tmp_path
            // 2、从pics数组中，找到这个图片对应的索引值
            const idx = this.addForm.pics.findIndex(x => x.pic == filePath)
            // 3、调用数组的splice方法，把图片信息对象，从pic数组中删除
            this.addForm.pics.splice(idx,1)
            //console.log(this.addForm)
        },
        // 监听图片上传成功的事件
        handleSuccess(response){
            // console.log(response)
            // 1、拼接得到一个图片信息对象
            const picInfo = {pic: response.data.tmp_path}
            // 2、将图片信息对象 push到pics数组中
            this.addForm.pics.push(picInfo)
            // console.log(this.addForm.pics)
        },
        // 点击添加商品按钮触发的事件
        addGoods(){
            // console.log(this.addForm)
            this.$refs.addFormRef.validate(async valid =>{
                if(!valid) return this.$message.error('请填写必要的表单项！')
                // 执行添加的业务逻辑
                // lodash cloneDeep(obj)
                const form = _.cloneDeep(this.addForm)
                form.goods_cat = form.goods_cat.join(',')
                // 处理动态参数
                this.manyTableData.forEach(item => {
                    const newInfo = {attr_id: item.attr_id,attr_value: item.attr_vals.join(' ')}
                    this.addForm.attrs.push(newInfo)
                })
                // 处理静态属性
                this.onlyTableData.forEach(item => {
                    const newInfo = {attr_id: item.attr_id,attr_value: item.attr_vals}
                    this.addForm.attrs.push(newInfo)
                })
                form.attrs = this.addForm.attrs
                // console.log(form)
                // 发起请求，进行添加商品操作
                // 商品的名称，必须是唯一的
                const {data:res} = await this.$http.post('goods',form)
                if(res.meta.status !== 201) return this.$message.error('添加商品失败')  
                this.$message.success('添加商品成功!')
                this.$router.push('/goods')
            })
        }
    },
}

</script>
<style lang='less' scoped>
.el-checkbox{
    margin: 0 8px 0 0 !important
}
.previewImg{
    width: 100%
}
.btAdd{
    margin-top: 15px;
}
</style>