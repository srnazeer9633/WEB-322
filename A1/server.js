const exp=require("express");
const app=exp();
const path= require("path");
app.get("/",function(req,res)
{
    console.log(__dirname);
    res.send("Subin Raj Nazeer 123044216");
    //res.sendFile(path.join(__dirname,"home.html"));
});
var port=process.env.PORT || 3000;
app.listen(port);