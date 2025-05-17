class StudentController{
    static display =async(req,res)=>{
        try {
            res.render('students/display') //folder(student) display.ejs
        } catch (error) {
            console.log(error)
        }
    }

}
module.exports =StudentController