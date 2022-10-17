const { disabled } = require('express/lib/application')
const mysql=require('mysql')
// 用户登录注册密码库
const db=mysql.createPool({
    host:'localhost',
    user:'root',
    password:'147258',
    database:'aaa'
})
module.exports=db
