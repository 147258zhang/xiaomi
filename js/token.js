const express=require('express');
const jwt=require('jsonwebtoken');
const expressJWT=require('express-jwt')
const app=express();
const secretKey='sfadsf sfad'
app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.use(expressJWT({secret:secretKey,algorithms:['HS256']}).unless({path:[/^\/api/]}))
app.post('/api/index',(req,res)=>{
    const userinfo=req.body
    const tokenStr=jwt.sign({username:userinfo.username},secretKey,{expiresIn:'100s'})
    res.send({
        status:0,
        msg:"发送成功",
        token:'Bearer '+tokenStr
    });
})
app.post('/login',(req,res)=>{
    res.send('发送成功login')
})
app.listen(3000,()=>{
    console.log('服务器已登陆');
})