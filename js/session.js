const express=require('express');
const session=require('express-session');
const path=require('path')
const app=express();
app.use(session({
    secret:'sadfafe',
    resave:false,
    saveUninitialized:true
}))
app.use(express.json())
app.use(express.urlencoded({
    extended:false
}))
app.use('',express.static('../../xiaomi'))
app.post('/login',(req,res)=>{
    if(req.body.uname!=='admin'|| req.body.password!=='00000'){
        return res.send({
            status:1,
            msg:'登录失败'
        })
    }
    req.session.islogin=true,
    req.session.user=req.body,
    res.send({
        status:0,
        msg:'登录成功'
    })
})
app.post('/index1',(req,res)=>{
    if(!req.session.islogin){
        return res.send({
            status:1,
            msg:'fail'
        })
    }
    res.send({
        status:0,
        msg:'success'
    });
})
app.post('/logout',(req,res)=>{
    req.session.destroy(),
    res.send({
        status:0,
        msg:"退出登录成功"
    })
})
app.listen(3000,()=>{
    console.log('服务器已登陆');
})