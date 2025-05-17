class HodController{
    static display =async(req,res)=>{
        try {
            res.render('hod/display') //folder(student) display.ejs
        } catch (error) {
            console.log(error)
        }
    }

}
module.exports =HodController