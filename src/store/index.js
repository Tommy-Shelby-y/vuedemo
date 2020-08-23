//引入插件
import Vue from 'vue'
import Vuex from 'vuex'
//引入外部文件
import mutations from "./mutations"
import getters from "./getters"
import actions from "./actions"
Vue.use(Vuex)

const state = {
  urlPath: 'http://106.12.85.17:8090/public/image',
  TabBar: {
    is_jd_TabBar: true,
    is_jx_TabBar: false,
  },
  //用户名数据
  userInfo:{
    defaddr:{id:20,user_id:'13',tel:"电话",addr:'省,市,县(乡,街道),具体地址',name:'接收人',default:1},
    // defaddr:null,
    id:'13',
    email:'',
    name:'',
    qq:'',
    wx:'',
    img:"",
    tel:'',
  },
  //keep-leave
  keepExclude: 'Details,Cart,Payment,ConfirmOrder,Order',
  keepInclude: '',
  shopCartHistory:{},
  shopCart: null,
  shopCartLength:0,//购物车的数据数量
  loginRecords:'',//进入login的记录
  temp:null,
  totalNum:0,//支付数量
  totalPayment:0,//支付总价
  ShoppingAddress:'北京市昌平区马池口镇吉利大学',   //配送地址
  city:null,
  SKnavigation:null,//用于记录tabbar的上此 路由路径
  ShopCartMoneyAll:0,//记录购物车所有商品价钱总和
  ShopCartGoodsNum:0,//记录购物车商品总数量
  shopCartNameArr:[],
  indexArr:{},
  area_code: "86",//国际区号
  registreDialogShow:true,//用于控制注册页面，注册协议的显示
  routerHistory:"/home",//记录一下离开页面时的路由地址 
}
const x = new Vuex.Store({
  state,      //状态管理数据
  mutations,  //定义事件
  getters,    //计算
  actions,    //异步请求
  modules: {} //模块
})
export default x
