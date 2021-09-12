<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告区 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>

      <!-- 步骤条 -->
      <el-steps
        :space="300"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form
        :model="addGoodsForm"
        :rules="addGoodsFormRules"
        ref="addGoodsFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addGoodsForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addGoodsForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addGoodsForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addGoodsForm.goods_cat"
                :options="cateList"
                :props="cateListProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTabData"
              :key="item.attr_id"
            >
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTabData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品图片" name="3">
            <!-- action表示图片要上传到后台的API地址 -->
            <el-upload
              :headers="headerObj"
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>

          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addGoodsForm.goods_introduce"></quill-editor>

            <!-- 添加商品按钮 -->
            <el-button type="primary" class="btnAdd">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash';

export default {
  data() {
    return {
      activeIndex: '0',
      addGoodsForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        // 图片数组
        pics: [],
        // 商品详情描述
        goods_introduce: '',
        attrs: []
      },
      addGoodsFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      cateList: [],
      cateListProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover'
      },
      manyTabData: [],
      onlyTabData: [],
      // 上传图片的地址
      uploadURL: 'https://api.naccl.top/vue/shop/api/private/v1/upload',
      // 图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewPath: '',
      previewVisible: false
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories');

      if (res.meta.status !== 200) {
        this.$message.error('获取商品分类列表失败！');
      }
      this.cateList = res.data;
      console.log(this.cateList);
    },
    // 级联选择器
    handleChange() {
      console.log(this.addGoodsForm.goods_cat);

      if (this.addGoodsForm.goods_cat.length !== 3) {
        this.addGoodsForm.goods_cat = [];
      }
    },
    // 标签页一项的离开事件
    beforeTabLeave(activeName, oldActiveName) {
      //   console.log('离开' + oldActiveName);
      //   console.log('进入' + activeName);

      if (oldActiveName === '0' && this.addGoodsForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类');
        return false;
      }
    },
    async tabClicked() {
      // 访问动态参数面板
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.catId}/attributes`,
          {
            params: {
              sel: 'many'
            }
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败！');
        }

        console.log(res.data);

        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(',');
        });
        this.manyTabData = res.data;
      }
      // 获取静态属性面板
      else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.catId}/attributes`,
          {
            params: {
              sel: 'only'
            }
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性列表失败！');
        }
        this.onlyTabData = res.data;
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      this.previewPath = file.response.data.url;
      this.previewVisible = ture;
    },
    // 处理移除图片的操作
    handleRemove(file) {
      // 获取将要删除的图片的临时路径
      const filePath = file.response.data.tem_path;
      // 从pics数组中，找到这个图片对应的索引值
      const i = this.addGoodsForm.pics.findIndex(x => x.pic === filePath);
      // 调用数组的splice方法，把图片信息对象，从pics数组中移除
      this.addGoodsForm.pics.splice(i, 1);
    },
    // 图片上传成功的事件
    handleSuccess(response) {
      console.log(response);
      // 拼接得到一个图片信息对象
      const picInfor = { pic: response.data.tem_path };
      // 将图片信息对象push到pics数组中
      this.addGoodsForm.pics.push(picInfor);
    },
    // 添加商品
    add() {
      this.$refs.addGoodsFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项！');
        }
        // 执行添加的业务逻辑

        // 直接赋值会报错（级联选择器），需要进行深拷贝lodash cloneDeep(obj)
        const form = _.cloneDeep(this.addGoodsForm);
        form.goods_cat = form.goods_cat.join(',');

        // 处理动态参数
        this.manyTabData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          };
          this.addGoodsForm.attrs.push(newInfo);
        });

        // 处理静态属性
        this.onlyTabData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          };
          this.addGoodsForm.attrs.push(newInfo);
        });

        form.attrs = this.addGoodsForm.attrs;

        // 发起请求添加商品
        // 商品的名称，必须是唯一的
        const { data: res } = await this.$http.post('goods', form);

        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！');
        }

        this.$message.success('添加商品成功！');
        this.$router.push('/goods')
      });
    }
  },
  computed: {
    catId() {
      if (this.addGoodsForm.goods_cat.length === 3) {
        return this.addGoodsForm.goods_cat[2];
      }
      return null;
    }
  }
};
</script>
<style>
.el-step__main .el-step__title {
  font-size: 12px;
}
.el-form {
  height: 100%;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>
