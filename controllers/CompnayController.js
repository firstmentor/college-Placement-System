class CompnayController{
    static display =async(req,res)=>{
        try {
            res.render('company/display') //folder(student) display.ejs
        } catch (error) {
            console.log(error)
        }
    }

}
module.exports =CompnayController