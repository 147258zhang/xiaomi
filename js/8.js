const express=require('express');
const bcrypt=require('bcryptjs')
const joi=require('joi')
const expressjoi=require('@escook/express-joi')
const jwt=require('jsonwebtoken');
const expressJWt=require('express-jwt')
const db=require('./7');
const userRouter=require('./9')
const app=express();
const userSchema={
    body:{
        uname:joi.string().alphanum().min(3).max(12).required(),
        password:joi.string().pattern(/^[\S]{6,15}$/)
    }
}
const secretKey='wsafd asfa s'
app.use(express.urlencoded({extended:false}))

app.use((req,res,next)=>{
    res.cc=(err,status=1)=>{
        res.send({
            status,
            message:err instanceof Error?err.message:err,
        })
    }
    next()
})
app.use(expressJWt({secret:secretKey,algorithms:['HS256']}).unless({path:[/^\/api/]}))
app.use('/my',userRouter)
app.post('/api/register',expressjoi(userSchema),(req,res)=>{
    const userinfo=req.body
    // if(!userinfo.uname || !userinfo.password){
    //     return res.cc('用户名或密码不能为空！')
    // }
    console.log(req.body)
    const sql='select * from login where uid=?;'
    db.query(sql,[userinfo.uname],(err,results)=>{
        if(err){
            return res.cc(err)
        }
        if(results.length>0){
            return res.cc('用户名已存在')
        }
        userinfo.password=bcrypt.hashSync(userinfo.password,10)
        const sql='insert into login set ?;'
        db.query(sql,userinfo,(err,results)=>{
            if(err){
                return res.cc(err)
            }
            if(results.affectedRows!==1){
                return res.cc('用户注册失败,请稍后再试!')
            }
            res.send({status:0,message:'注册成功'})
        })
    })
})
app.post('/api/login',expressjoi(userSchema),(req,res)=>{
    const sql='select * from login where uname=?'
    db.query(sql,[req.body.uname],(err,results)=>{
        if(err) return res.cc(err)
        if(results.length!==1){
            return res.cc('用户名输入错误')
        }
        const compareResult=bcrypt.compareSync(req.body.password,results[0].password)
        if(!compareResult){
            return res.cc('登陆失败')
        }
        const user={...results[0],password:''}
        const tokenStr=jwt.sign(user,secretKey,{expiresIn:'1h'})
        res.send({
            status:0,
            message:'登陆成功',
            token: 'Bearer '+tokenStr
        })
    })
})
app.use((err,req,res,next)=>{
    if(err instanceof joi.ValidationError){
        return res.send({
            status:1,
            message:err.message
        })
    }
    if(err.name==='UnauthorizeError') return res.cc('身份认证失败')
})
app.listen(3000,()=>{
    console.log('服务器已登陆');
})