<template>
  <div class="home-container">
    <el-container class="home-container">
      <!-- 头部区 -->
      <el-header>
        <div>
          <img src="../assets/heima.png" alt="" />
          <span>电商后台管理系统</span>
        </div>
        <el-button type="info" @click="logout">退出</el-button>
      </el-header>
      <!-- 页面主体区 -->
      <el-container>
        <!-- 侧边栏 -->
        <el-aside :width="isCollapse ? '64px' : '200px'">
          <div class="toggle-button" @click="toggleCollapse">|||</div>
          <el-menu
            :default-active="activePath"
            :router="true"
            :collapse-transition="false"
            :collapse="isCollapse"
            :unique-opened="true"
            background-color="#333744"
            text-color="#fff"
            active-text-color="#409EFF"
          >
            <!-- 一级菜单 -->
            <el-submenu
              :index="item.id + ''"
              v-for="item in menulist"
              :key="item.id"
            >
              <!-- 一级菜单的模板 -->
              <template #title>
                <!-- 图标 -->
                <i :class="iconsObj[item.id]"></i>
                <!-- 文本 -->
                <span>{{ item.authName }}</span>
              </template>

              <!-- 二级菜单 -->
              <el-menu-item
                :index="'/' + subItem.path"
                v-for="subItem in item.children"
                :key="subItem.id"
                @click="saveNavState('/' + subItem.path)"
              >
                <template #title>
                  <i class="el-icon-menu"></i>
                  <span>{{ subItem.authName }}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!-- 右侧内容主体 -->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menulist: [],
      // 图标对象
      iconsObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      //是否展开折叠
      isCollapse: false,
      //被激活的链接地址
      activePath: ''
    };
  },
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.activePath;
  },
  methods: {
    //退出功能
    logout() {
      //清空token
      window.sessionStorage.clear();
      this.$router.push('/login');
    },
    //获取所有的菜单
    async getMenuList() {
      const { data: res } = await this.$http.get('menus');
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menulist = res.data;
      console.log(res);
    },
    // 折叠按钮
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    //保存链接的激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath);
      this.activePath = activePath;
    }
  }
};
</script>

<style>
.home-container {
  height: 100%;
  width: 100%;
}

.home-container .el-header {
  background-color: #373d41;
  color: #fff;
  font-size: 20px;

  display: flex;
  /* 平均分布 */
  justify-content: space-between;
  /* 垂直居中 */
  align-items: center;
  padding-left: 0;
}
.el-header div {
  display: flex;
  align-items: center;
}
.el-header div span {
  margin-left: 15px;
}

.el-aside {
  background-color: #333744;
}
.el-aside .toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  /* 鼠标放上去，变成小手 */
  cursor: pointer;
}
.el-aside .el-menu {
  border-right: none;
}
.el-aside .iconfont {
  margin-right: 10px;
}

.el-main {
  background-color: #eaedf1;
}
</style>
