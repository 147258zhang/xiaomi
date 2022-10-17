const express=require('express');
const app=express();
const db=require('./js/7.js');
//加密密码的包
const bcrypt=require('bcryptjs');
// token验证的包
const jwt=require('jsonwebtoken');
const expressJWT=require('express-jwt')
const joi=require('joi');
// 解决跨域问题的包
const cors=require('cors')
const expressJoi=require('@escook/express-joi')
const userSchema={
    body:{
        uname:joi.string().alphanum().min(3).max(12).required(),
        password:joi.string().pattern(/^[\S]{6,15}$/)
    }
}
const updateUserSchema={
    body:{
        uname:joi.string().required(),
        email:joi.string().required()
    }
}
const updatePasswordSchema={
    body:{
        oldpwd:joi.string().pattern(/^[\S]{6,15}$/),
        newpwd:joi.not(joi.ref('oldpwd')).concat(joi.string().pattern(/^[\S]{6,15}$/))
    }
}
const secretKey='sfa  asdfae as'
app.use(cors())
app.use('',express.static('../xiaomi'))
app.use(expressJWT({secret:secretKey,algorithms:['HS256']}).unless({path:[/^\/api/]}))
app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.use((req,res,next)=>{
    res.cc=(err,status=1)=>{
        res.send({
            status,
            //instanceof为判断是否为error的原型对象
            msg:err instanceof Error?err.message:err,
        })
    }
    next();
})
app.post('/api/register',expressJoi(userSchema),(req,res)=>{
    const userinfo=req.body
    // console.log(userinfo);
    const sql='select * from login where uname=?;'
    //占位符可以写数组只有一个数组可以省略
    db.query(sql,[userinfo.uname],(err,results)=>{
        if(err) return res.cc(err)
        if(results.length>0) return res.cc('用户名被占用')
        if(results.length===0){
            userinfo.password=bcrypt.hashSync(userinfo.password,10)
            // set占位符和() values(?,?)效果一样
            const sql='insert into login set ?;'
            db.query(sql,userinfo,(err,results)=>{
                const sql='select * from login where uname=?'
                if(err) return res.cc(err)
                //insert into 插入数据返回对象，对象affectedRows为影响行数
                if(results.affectedRows!==1) return res.cc('用户注册失败,请稍后再试')
                db.query(sql,[userinfo.uname],(err,results)=>{
                    if(err) return res.cc(err)
                    const user={...results[0],password:''}
                    const tokenStr=jwt.sign(user,secretKey,{expiresIn: '1h'})
                    console.log(user);
                    res.send({
                        status:0,
                        msg:'注册成功',
                        token:'Bearer '+tokenStr
                    })
                })
            })
        }
    })
})
app.post('/api/login',expressJoi(userSchema),(req,res)=>{
    const userinfo=req.body
    const sql='select * from login where uname=?;'
    db.query(sql,[userinfo.uname],(err,results)=>{
        if(err) return res.cc(err)
        if(results.length!==1){
            return res.cc('用户名输入错误')
        }
        const compareResult=bcrypt.compareSync(userinfo.password,results[0].password)
        if(!compareResult) return res.cc('登录失败')
        const user={...results[0],password:'',user_pic:''}
        const tokenStr=jwt.sign(user,secretKey,{expiresIn: '1h'})
        res.send({
            status:0,
            msg:'登陆成功',
            token:'Bearer '+tokenStr
        })
    })
})
app.post('/api/search',(req,res)=>{
    console.log(req.body);
    const sql='select * from phone union select * from tv'
    db.query(sql,(err,results)=>{
        if(err) return res.cc(err)
        res.send(results)
    })
})
app.post('/api/phone',(req,res)=>{
    const sql='select * from phone'
    db.query(sql,(err,results)=>{
        if(err) return res.cc(err)
        res.send(results)
    })
})
app.post('/api/tv',(req,res)=>{
    const sql='select * from tv'
    db.query(sql,(err,results)=>{
        if(err) return res.cc(err)
        res.send(results)
    })
})
app.get('/api/phone',(req,res)=>{
    const sql='select * from phone,hardware where phone.id=hardware.phoneID and phone.id=?'
    console.log(req.query);
    db.query(sql,[req.query.id],(err,results)=>{
        if(err) return res.cc(err)
        res.send(
            results
        )
    })
})
app.get('/api/tv',(req,res)=>{
    const sql='select * from tv,color where tv.id=? and tv.id=color.tvID'
    console.log(req.query);
    db.query(sql,[req.query.id],(err,results)=>{
        if(err) return res.cc(err)
        res.send(
            results
        )
    })
})
app.get('/api/cart',(req,res)=>{
    console.log(req.query);
    var sql='select * from hardware,phone where hardware.phoneID=phone.id and find_in_set(hardware.id,?)'
    db.query(sql,[req.query.id],(err,results)=>{
        if(err) return res.cc(err)
        res.send(results)
    })
})
app.post('/router/userinfo',(req,res)=>{
    console.log(req.user);
    const sql='select id,uname,email from login where id=?'
    // 通过req.user访问token字符串中的id属性
    db.query(sql,[req.user.id],(err,results)=>{
        if(err) return res.cc(err)
        if(results.length!==1) return res.cc('获取用户信息失败')
        res.send({
            status:0,
            msg:'获取用户信息成功',
            data:results[0]
        })
        
    })
})
app.post('/my/userinfo',expressJoi(updateUserSchema),(req,res)=>{
    const sql='update login set ? where id=?;'
    db.query(sql,[req.body,req.user.id],(err,results)=>{
        if(err) return res.cc(err)
        if(results.affectedRows!==1) return res.cc('修改用户信息失败')
        res.cc('修改用户信息成功',0)
    })
})
app.post('/my/updatepwd',expressJoi(updatePasswordSchema),(req,res)=>{
    const userinfo=req.body
    const sql='select * from login where id=?'
    db.query(sql,req.user.id,(err,results)=>{
        if(err) return res.cc(err)
        const compareResult=bcrypt.compareSync(userinfo.oldpwd,results[0].password)
        if(!compareResult) return res.cc('旧密码错误')
            userinfo.newpwd=bcrypt.hashSync(userinfo.newpwd,10)
            const sql='update login set password=? where id=?'
            db.query(sql,[userinfo.newpwd,req.user.id],(err,results)=>{
                if(err) return res.cc(err)
                if(results.affectedRows!==1) return res.cc('修改密码失败')
                res.cc('修改密码成功',0)
            })
        
    })
})
app.post('/my/updateAvatar',(req,res)=>{
    const sql='update login set user_pic=? where id=?'
    db.query(sql,[req.body.user_pic,req.user.id],(err,results)=>{
        if(err) return res.cc(err)
        if(results.affectedRows!==1) return res.cc('更换头像失败')
        res.cc('更换头像成功',0)
    })
})
app.use((err,req,res,next)=>{
    if(err instanceof joi.ValidationError){
        return res.cc(err)
    }
    if(err.name==='UnauthorizeError') return res.cc('身份认证失败')
    res.send({
        status:1,
        msg:err.message
    })
})
app.listen(3000,()=>{
    console.log('服务器已登陆');
})