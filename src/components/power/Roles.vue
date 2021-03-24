<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮区 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddRolesDialog"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', index1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, index1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  @close="removeRightById(scope.row, item1.id)"
                  closable
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套 嵌套渲染二级权限 -->
                <el-row
                  :class="[index2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      @close="removeRightById(scope.row, item2.id)"
                      closable
                    >
                      {{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      @close="removeRightById(scope.row, item3.id)"
                      closable
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-delete"
              size="mini"
              @click="removeRolesById(scope.row.id)"
              >删除</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-s-tools"
              size="mini"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色的对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRolesDialogVisible"
      width="50%"
      @close="addRolesDialogClosed"
    >
      <el-form
        :model="addRolesForm"
        :rules="addRolesFormRules"
        ref="addRolesFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addRolesDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRoles">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改角色的对话框 -->
    <el-dialog
      title="修改角色信息"
      :visible.sync="editRolesDialogVisible"
      width="50%"
      @close="editRolesDialogClosed"
    >
      <el-form
        :model="editRolesForm"
        :rules="editRolesFormRules"
        ref="editRolesFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input :visible.sync="editRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editRolesDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRoles">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      rolelist: [],
      // 控制添加角色的对话框是否隐藏
      addRolesDialogVisible: false,
      //添加角色的表单对象
      addRolesForm: {
        roleName: '',
        roleDesc: ''
      },
      //添加角色验证规则对象
      addRolesFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ]
      },
      // 控制修改角色的对话框是否隐藏
      editRolesDialogVisible: false,
      //查询到的角色信息对象
      editRolesForm: {},
      //修改角色验证规则对象
      editRolesFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ]
      },
      // 控制分配的对话框是否隐藏
      setRightDialogVisible: false,
      // 所有权限的列表
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      //默认选中的节点id值数组
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: ''
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    // 获取所有角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles');
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败');
      }
      this.rolelist = res.data;
    },
    //展示添加角色对话框
    showAddRolesDialog() {
      this.addRolesDialogVisible = true;
    },
    // 监听添加角色的对话框关闭事件，重置表单
    addRolesDialogClosed() {
      this.$refs.addRolesFormRef.resetFields();
    },
    //添加并提交新角色
    addRoles() {
      this.$refs.addRolesFormRef.validate(async valid => {
        //判断valid校验失败，直接return
        if (!valid) return;
        //可以发起添加角色的网络请求
        const { data: res } = await this.$http.post('roles', this.addRolesForm);
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败！');
        }
        this.$message.success('添加角色成功');
        this.addRolesDialogVisible = false;
        this.getRolesList();
      });
    },
    // 展示修改角色的对话框,获取角色id
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('roles/' + id);
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色id失败！');
      }
      this.editRolesForm = res.data;
      this.editRolesDialogVisible = true;
    },
    //监听修改角色对话框的关闭事件，重置表单
    editRolesDialogClosed() {
      this.$refs.editRolesFormRef.resetFields();
    },
    //修改并提交对应的角色
    editRoles() {
      //提交前的预验证
      this.$refs.editRolesFormRef.validate(async valid => {
        if (!valid) return;
        //发起修改请求
        const { data: res } = await this.$http.put(
          'roles/' + this.editRolesForm.roleId,
          {
            roleName: this.editRolesForm.roleName,
            roleDesc: this.editRolesForm.roleDesc
          }
        );
        if (res.meta.status != 200) {
          return this.$message.error('修改角色信息失败！');
        }
        this.$message.success('修改角色信息成功！');
        this.getRolesList();
        this.editRolesDialogVisible = false;
      });
    },
    //根据id删除对应的角色信息
    async removeRolesById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色信息, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err);
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除');
      }
      const { data: res } = await this.$http.delete('roles/' + id);
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色信息失败!');
      }
      this.$message.success('删除角色信息成功');
      this.getRolesList();
    },
    // 根据id删除权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err);

      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除该权限');
      }

      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );

      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！');
      }
      this.$message.success('删除权限成功');

      // 把服务器返回的最新权限，直接赋值给当前权限的children属性，能够避免删除后合起来
      role.children = res.data;
    },
    //展示分配权限的对话框,在展示之前获取所有权限列表
    async showSetRightDialog(role) {
      this.roleId = role.id;
      // 获取权限列表
      const { data: res } = await this.$http.get('rights/tree');
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败！');
      }
      //把获取到的权限列表保存到data中
      this.rightsList = res.data;

      // 递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys);

      this.setRightDialogVisible = true;
    },
    // 通过递归的形式，获取角色下所有的三级权限的id，并保存到defKeys数组中
    getLeafKeys(node, arr) {
      // 如果当前node节点不包含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id);
      }

      node.children.forEach(item => {
        this.getLeafKeys(item, arr);
      });
    },
    // 监听分配权限的对话框关闭事件
    setRightDialogClosed() {
      this.defKeys = [];
    },
    // 点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];

      const idStr = keys.join(',');

      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );

      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败');
      }

      this.$message.success('分配权限成功');
      this.getRolesList();
      this.setRightDialogVisible = false;
    }
  }
};
</script>

<style>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
