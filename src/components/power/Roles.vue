<!--  -->
<template>
    <div>
        <!--面包屑导航区-->
    <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card >
        <!--添加角色按钮-->
        <el-row>
            <el-col>
                <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
            </el-col>
        </el-row>
        <!--角色列表区域-->
        <el-table :data="rolesList" border stripe>
            <!--展开列-->
            <el-table-column type="expand" >
                <template slot-scope="scope">
                    <el-row :class="['bdbottom',i1 == 0 ? 'bdtop' :'','vcenter' ]" v-for="(item1, i1) in scope.row.children" :key="item1.id">
                        <!--渲染一级权限-->
                        <el-col :span="5">
                            <el-tag>{{item1.authName}}</el-tag>
                            <i class="el-icon-caret-right"></i>
                        </el-col>
                        <!--渲染二级和三级权限-->
                        <el-col :span="19">
                            <!--通过for循环嵌套渲染二级权限-->
                            <el-row :class="[i2 == 0 ?  '':'bdtop' ,'vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                                <el-col :span="6">
                                    <el-tag type="success">{{item2.authName}}</el-tag>
                                    <i class="el-icon-caret-right"></i>
                                </el-col>
                                <!--通过for循环嵌套渲染三级权限-->
                                <el-col :span="18">
                                    <el-tag closable @close="removeRightById(scope.row ,item3.id)" type="warning" v-for="(item3) in item2.children" :key="item3.id">{{item3.authName}}</el-tag>
                                </el-col>
                            </el-row>
                        </el-col>
                    </el-row>
                    <!--预处理拿出用户权限数据
                    <pre>{{scope.row}}</pre>
                    -->
                </template>
            </el-table-column>
            <!--索引列-->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="角色名称" prop="roleName"></el-table-column>
            <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
            <el-table-column label="操作" width="300px">
                <template slot-scope="scope">
                    <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeRolesById(scope.row.id)" >删除</el-button>
                    <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                </template>
                
            </el-table-column>
        </el-table>
        <!--添加角色的对话框-->
        <el-dialog
            title="添加角色"
            :visible.sync="addDialogVisible"
            width="50%" @close="addDialogClosed">
            <!--内容主体区域-->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px" >
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <!--底部区域-->
            <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addRoles">确 定</el-button>
            </span>
        </el-dialog>
    </el-card>
    <!--修改用户的对话框-->
        <el-dialog
            title="修改角色信息"
            :visible.sync="editDialogVisible"
            width="50%" @close="editDialogClosed">
            <!--内容主体区域-->
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px" >
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="editForm.roleName" disabled></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="editForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <!--底部区域-->
            <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editRolesInfo">确 定</el-button>
            </span>
        </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
    title="分配权限"
    :visible.sync="setRightDialogVisible"
    width="50%" @close="setRightDialogClosed"
    >
    <!-- 显示树形控件 -->
    <el-tree  ref="treeRef" :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKyes"></el-tree>
    <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
    </span>
</el-dialog>


    </div>
</template>

<script>
export default {
    data () {
        return {
            //所有角色列表数据
            rolesList: [],
            // 控制分配权限对话框的显示和隐藏
            setRightDialogVisible: false,
            // 所有权限的数据
            rightsList: [],
            // 树形控件的属性绑定对象
            treeProps:{
                label: 'authName',
                children: 'children'
            },
            // 默认选中节点的Id值数组
            defKyes:[],
            // 当前即将分配权限的角色id
            roleId:'',
            // 添加角色的表单
            addForm:{
                roleName: '',
                roleDesc: ''
            },
            // 编辑角色的表单
            editForm: {},
            // 控制添加角色对话框的显示与隐藏
            addDialogVisible: false,
            // 控制编辑角色对话框的显示与隐藏
            editDialogVisible: false,
            // 添加表单的验证规则对象
            addFormRules: {
                roleName: [
                    {required: true,message: '请输入该角色名称',trigger: 'blur'},
                ],
                roleDesc: [
                    {required: true,message: '请输入角色描述',trigger: 'blur'},
                ],
            },
            // 编辑表单的验证规则对象
            editFormRules: {
                roleDesc: [
                    {required: true,message: '请输入角色描述',trigger: 'blur'},
                ],
            }

        }
    },
    created(){
        this.getRolesList()
    },
    methods: {
        //获取所有角色的列表
        async getRolesList(){
            const {data:res} = await this.$http.get('roles')
            if(res.meta.status !== 200) return this.$message.error('获取角色列表失败！');
            this.rolesList = res.data
            //console.log(rolesList)
        },
        //根据id删除对应的权限
        async removeRightById(role,rightId){
            //弹窗是否删除权限
            const confirmResult = await  this.$confirm('此操作将永久删除该角色权限, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
                }
            ).catch(err => err)
            //如果用户确认删除，则返回值为字符串 confirm
            //如果用户取消删除，则返回值为字符串 cancel
            //console.log(confirmResult)
            if(confirmResult !== 'confirm'){
                return this.$message.info('已取消删除')
            }
            const {data:res} = await this.$http.delete('roles/'+role.id+'/rights/'+rightId)
                console.log(res)
            if(res.meta.status !== 200){
                return this.$message.error('删除权限失败！')
            }   
                this.$message.success('删除权限成功!')
                //为了不让列表关闭，重新刷新当前角色的children即可
                role.children = res.data
        },
        //展示添加角色的对话框 
        async showEditDialog(id){
            const {data:res} = await this.$http.get('roles/'+id)
            if(res.meta.status !== 200)   return this.$message.error('查询角色信息失败!')          
            console.log(res.data)
            this.editForm = res.data
            this.editDialogVisible = true
        },
        // 点击确定按钮,添加角色
        addRoles(){
            this.$refs.addFormRef.validate( async valid=>{
                if(!valid) return
                //可以发起添加用户的请求
                const {data:res} = await this.$http.post('roles',this.addForm)
                //console.log(res)
                if(res.meta.status !== 201) return this.$message.error('添加角色失败！')
                this.$message.success('添加角色成功!')
                //隐藏添加用户的对话框
                this.addDialogVisible = false
                this.getRolesList()
            })
        },
        //监听添加角色对话框的关闭事件
        addDialogClosed(){
            this.$refs.addFormRef.resetFields()
        },
        //监听修改角色对话框的关闭事件
        editDialogClosed(){
            this.$refs.editFormRef.resetFields()
        },
         //修改角色的表单预验证
        editRolesInfo(){
            this.$refs.editFormRef.validate( async valid=>{
                //console.log(valid)
                if(!valid) return
                //可以发起修改用户的请求
                const {data:res} = await this.$http.put('roles/' + this.editForm.roleId,{
                    roleName: this.editForm.roleName , roleDesc: this.editForm.roleDesc
                })
                //console.log(res)
                if(res.meta.status !== 200) return this.$message.error('更新角色信息失败!')
                
                //隐藏添加用户的对话框
                this.editDialogVisible = false
                //刷新数据列表
                this.getRolesList()
                //提示修改成功
                this.$message.success('更新角色信息用户成功!')
            })
        },
        //根据id删除用户信息
        async removeRolesById(id){
            //弹框询问用户是否删除数据
            const confirmResult =await  this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
                }
            ).catch(err => err)
            //如果用户确认删除，则返回值为字符串 confirm
            //如果用户取消删除，则返回值为字符串 cancel
            //console.log(confirmResult)
            if(confirmResult !== 'confirm'){
                return this.$message.info('已取消删除')
            }
            const {data:res} = await this.$http.delete('roles/'+id)
            if(res.meta.status !== 200) return this.$message.error('删除角色失败！')
                this.$message.success('删除角色成功!')
                //刷新角色列表
                this.getRolesList()
        },
        //展示分配权限的对话框
        async showSetRightDialog(role){
            // 在弹出对话框的时候拿到角色id
            this.roleId = role.id
            //获取到所有权限的数据
            const {data:res}=  await this.$http.get('rights/tree')
            if(res.meta.status != 200) return this.$message.error('获取权限数据失败！')
            // 获取到的权限数据保存到list中
            this.rightsList = res.data
            //console.log(this.rightsList)

            //递归获取三级节点的id
            this.getLeafKeys(role, this.defKyes)

            this.setRightDialogVisible=true
        },
        // 通过递归的方式，获取角色下所有三级权限的id并保存在defKeys数组中
        getLeafKeys(node ,arr){
            // 如果当前node节点不包含children属性，则是三级节点
            if(!node.children){
                return arr.push(node.id)
            }
            node.children.forEach(item =>
                this.getLeafKeys(item,arr))
        },
        // 监听分配权限对话框的关闭事件
        setRightDialogClosed(){
            this.defKyes = []
        },
        // 点击确定按钮为角色分配权限
        async allotRights(){
            const keys = [
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys()
            ]
            //console.log(keys)
            // 以 `,` 分割的权限 ID 列表（获取所有被选中、叶子节点的key和半选中节点的key, 包括 1，2，3级节点）
            const idStr = keys.join(',')

            const {data:res} = await this.$http.post('roles/'+this.roleId+'/rights',{rids:idStr})
            console.log(res)
                if(res.meta.status != 200) return this.$message.error('更新权限失败！')

            this.$message.success('分配权限成功!')
            this.getRolesList()
            // 将对话框隐藏
            this.setRightDialogVisible = false
        }

    },
}

</script>
<style lang='less' scoped>
.el-tag{
    margin: 7px;
}
.bdtop{
    border-top: 1px solid #eee;
}
.bdbottom{
    border-bottom: 1px solid #eee;
}
.vcenter{
    display: flex;
    align-items: center;
}
</style>