<template>
  <div>
    <scroll id="cartScroll">
      <nav-bar class="cartNavBar" ref="cartNavBar">
        <div slot="left" class="left" v-on:click="$store.commit('BACK')">
          <i class="el-icon-arrow-left"></i>
        </div>
        <div slot="center">
          <div class="title">购物车</div>
          <p class="address">配送至:{{address}}</p>
        </div>
        <div slot="right" class="right">
          <!-- el-icon-more -->
          <el-dropdown trigger="click" @command="pushRouter">
            <span class="el-dropdown-link">
              <i class="el-icon-more-outline el-icon-more"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="/home">首页</el-dropdown-item>
              <el-dropdown-item command="/keywords">分类搜索</el-dropdown-item>
              <el-dropdown-item command="/profile">我的京东</el-dropdown-item>
              <el-dropdown-item command="/profile" disabled>浏览记录</el-dropdown-item>
              <el-dropdown-item command="/profile" divided>我的关注</el-dropdown-item>
              <el-dropdown-item command="/profile" divided>分享</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </nav-bar>
      <div v-if="!$store.state.userInfo" class="shopcart_login_bar">
        登录可以同步账号下的购物车信息
        <router-link tag="a" to="/login">登录</router-link>
      </div>
      <div>
        <!-- 正常判断购物车数据 ShopCart 为空。。 -->
        <div class="cart_empty" v-if="!this.shopCart">
          <img :src="urlPath+'/routine/cart_empty.png'" alt />
          <p>您的购物车还没有任何数据，请添加商品</p>
        </div>
        <div v-else>
          <cart-goods
            v-for="(item,key) in shopCart"
            :key="key"
            :shopName="key"
            ref="cart_goods"
            @checknorm="selectNorm"
            :goods="item"
            @ischeckshopall="is_check_shop_all"
          ></cart-goods>
        </div>
      </div>
      <div class="shopBox">....</div>
    </scroll>
    <cart-tab-bar ref="tabBar" @checkall="check_shop_all" @confirm="confirmOrder"></cart-tab-bar>
  </div>
</template>

<script>
//公共组件
import NavBar from "components/common/navbar/NavBar";
import Scroll from "components/contents/scroll/Scroll";
//内部子组件
import CartTabBar from "./childComp/CartTabBar";
import CartGoods from "./childComp/CartGoods";
// import {postShopCart} from "network/shopCart";
import {UpdataShopCart} from "network/shopCart";
export default {
  name: "Cart",
  data(){
    return{
      payMentData:[],
    }
  },
  created() {//创建
    //如果用户存在。则网络请求shopCart数据
    if (this.$store.state.userInfo && this.shopCartLength == 0) {
      // this.getShopCart();
      this.$store.dispatch("getShopCart", this.$store.state.userInfo.id);
    }
    // postShopCart(13).then(res=>{
    //   console.log(res);
    //   this.shop = res.data;
    // });
    console.log(this.$store.state.shopCart);
  },
  components: {
    NavBar,
    Scroll,
    CartTabBar,
    CartGoods,
  },
  // beforeRouteEnter(to, from, next) {
  //   alert("进入cart");
  //   //这是守卫是在组件创建创建之前调用的。所以不能获取实例 this
  //   //因为当当前守卫执行的时候，组件实例还没有被创建
  //   next();
  // },
  beforeRouteLeave(to, from, next) {
      if (to.path == "/login") this.$store.state.loginHistory = from.path;
      
      //离开cart页面的时候，修改购物车数据
      if(this.$store.state.userInfo) this.upDataShopCart();
      next();
  },
  computed: {
    shopCartLength() {
      return this.$store.state.shopCartLength;
    },
    urlPath() {
      return this.$store.state.urlPath;
    },
    address() {
      //   //去除地址中的默认地址
      let addr = '';
      if(this.$store.state.userInfo){
        addr = this.$store.state.ShoppingAddress.takeover_addr.split(",").join(' ');
      }else{
        let path = window.location.origin + '/jd';
        let data = window.localStorage.getItem(path);
        if(data != null){
          addr = data.orderAddr ? data.orderAddr : '北京市,北京市,昌平区' 
        }else{
          addr = '北京市,北京市,昌平区'
        }
      }
      return addr.split(",").join('')
    },
    shopCart() {
      return this.$store.state.shopCart;
    },
    cart_goods(){
      return this.$store.state.cart_goods;
    }
  },
  watch: {
    shopCart(val) {
      console.log(val)
    },
  },
  methods: {
    pushRouter(path) {
      this.$router.push(path);
      // this.$router.commit('ROUTERTO',path)
    },
    //是否是全选商品
    is_check_shop_all() {
      console.log(this.$refs.cart_goods);
      let cart_goods = this.$refs.cart_goods;
      let tabbar = this.$refs.tabBar;
      let allCheck = tabbar.$el.querySelector('#allCheck')
      let temp = 0;
      cart_goods.forEach((item) => {
        let shopNameCheck = item.$el.querySelector(".shop_name input[type=checkbox]");
        if (shopNameCheck.checked) {
          temp++;
        }
      });
      if(temp == cart_goods.length){
        allCheck.checked = true;
      }else{
        allCheck.checked = false;
      }
    },
    //全选按钮事件
    check_shop_all(temp) {
      //获取全选按钮
      let allCheck = this.$refs.tabBar.$el.querySelector("#allCheck");
      //获取4个商品按钮组件
      let cart_goods = this.$refs.cart_goods;
      let num = 0;
      if (temp == "all") {
        cart_goods.forEach((item) => {
          let checkbox1 = item.$el.querySelector(
            ".shop_name input[type=checkbox]"
          );
          checkbox1.checked = allCheck.checked;
          let checkbox2 = item.$el.querySelectorAll(
            ".radio input[type=checkbox]"
          );
          checkbox2.forEach((inputObj) => {
            inputObj.checked = allCheck.checked;
          });
          if (allCheck.checked) {
            //true
            //取所有商品价钱总和
            this.$store.state.totalPayment = this.$store.state.ShopCartMoneyAll;
            this.$store.state.totalNum = this.$store.state.ShopCartGoodsNum;
            //取商品数量总和
          } else {
            this.$store.state.totalPayment = 0;
            this.$store.state.totalNum = 0;
          }
        });
      } else if (temp == "shop_name") {
        console.log("点击了店铺");
        cart_goods.forEach((item) => {
          // console.log(item);
          //商铺全选 1个
          let checkbox1 = item.$el.querySelector(
            ".shop_name input[type=checkbox]"
          );
          if (checkbox1.checked == true) {
            num++;
          }
        });
        if (num == cart_goods.length) {
          this.$refs.tabBar.$el.querySelector(
            ".select-money input[type=checkbox]"
          ).checked = true;
        } else {
          this.$refs.tabBar.$el.querySelector(
            ".select-money input[type=checkbox]"
          ).checked = false;
        }
      } else {
        cart_goods.forEach((item) => {
          // console.log(item);
          //商铺全选 1个
          let checkbox1 = item.$el.querySelector(
            ".shop_name input[type=checkbox]"
          );
          //商铺选择 多个
          let checkbox2 = item.$el.querySelectorAll(
            ".radio input[type=checkbox]"
          );
          let num1 = 0;
          checkbox2.forEach((inputObj) => {
            // console.log(inputObj);
            console.log(inputObj.checked);
            if (inputObj.checked == true) {
              num1++;
            }
          });
          if (num1 == checkbox2.length) {
            checkbox1.checked = true;
            num++;
          } else {
            checkbox1.checked = false;
          }
          //判断是否被全选
          if (num == cart_goods.length) {
            this.$refs.tabBar.$el.querySelector(
              ".select-money input[type=checkbox]"
            ).checked = true;
          } else {
            this.$refs.tabBar.$el.querySelector(
              ".select-money input[type=checkbox]"
            ).checked = false;
          }
        });
      }
    },
    selectNorm(obj) {
      console.log(obj);
    },
    //去结算的方法，beicarttabber组件调用
    confirmOrder(){
      //获取cart页面中被选择的订单商品
      let cart_goods = this.$refs.cart_goods
      let arr = []
      cart_goods.forEach(item=>{
        // 获取每个组件内商品前的复选框组
        let inputAll = item.$el.querySelectorAll('.radio input')
        // console.log(inputAll);
        for(let i = 0; i < inputAll.length; i++){
          console.log(inputAll[i])
          if(inputAll[i].checked){
            console.log(item.goods[i]);
            //可以定义cart全局的，方便以后自己及组件使用
            this.payMentData.push(item.goods[i])
            //方法存要提交的数据
            arr.push(item.goods[i])
          }
        }
      })
      this.$router.push("/confirm_order/" + JSON.stringify(arr));
    },
    upDataShopCart(){
      let shopCart = {...this.$store.state.shopCart}
      let shopCartHistory = {...this.$store.state.shopCartHistory}
      for(let i in shopCart){
        for(let j = 0; j < shopCart[i].length; j++){
          if(
            shopCart[i][j].ischeck != shopCartHistory[i][j].ischeck ||
            shopCart[i][j].num != shopCartHistory[i][j].num ||
            shopCart[i][j].norm != shopCartHistory[i][j].norm
            ){
            //请求修改购物车的接口，把数据传递上去，修改购物车数据
            console.log(shopCart[i][j])
            let data = {}
            data.id = shopCart[i][j].id
            data.num = shopCart[i][j].num
            data.ischeck = shopCart[i][j].ischeck
            data.norm = shopCart[i][j].norm
            //执行网络请求
            UpdataShopCart(data)
          }
        }
      }
    }

  },
};
</script>
<style lang='less' scoped>
#cartScroll {
  height: calc(100vh - 49px);
  overflow: hidden;
  background-color: mediumaquamarine;
  .cartNavBar {
    background-color: #fff;
    .title {
      font-size: 18px;
      line-height: 24px;
    }
    .address {
      font-size: 14px;
      line-height: 20px;
      margin: 0 auto;
      max-width: 60%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .shopBox {
    margin-top: 15px;
    border-radius: 10px;
    background-color: #fff;
    height: 5000px;
  }
}
body {
  margin: 0;
}
</style>
