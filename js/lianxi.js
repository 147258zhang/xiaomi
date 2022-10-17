const express=require('express');
const app=express();
app.use('',express.static('../../xiaomi'))
app.get('/index',(req,res)=>{
    console.log(req.query);
    res.send('发送成功');
})
app.listen(3000,()=>{
    console.log('服务器已登陆');
})