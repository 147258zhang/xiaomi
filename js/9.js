const express=require('express');
const db=require('./7')
const router=express.Router()
router.post('/userinfo',(req,res)=>{
    const sql='select uid uname email form login where uid=?'
    db.query(sql,req.user.id,(err,results)=>{
        if(err){
            return res.cc(err)
        }
        if(results.length!==1) return res.cc('获取用户信息失败')
        res.send({
            status:0,
            messaga:'获取用户信息成功',
            data:results[0]
        })
    })
})
module.exports=router