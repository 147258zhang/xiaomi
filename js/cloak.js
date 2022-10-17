const express=require('express');
const path=require('path')
const app=express();
app.get('/:number/index',(req,res)=>{
    // console.log(path.join(__dirname,'../vue.js'));
    console.log(req.params);
    
    setTimeout(()=>{
        res.sendFile(path.join(__dirname,'../vue.js'));
    },req.params.number.valueOf()*1000)
})
app.listen(3000,()=>{
    console.log('服务器已登陆');
})