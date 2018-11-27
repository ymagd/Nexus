const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const dbConfig      = require("../configurations/db.js");
var storage;


if(process.env.NODE_ENV === 'test' ){
     storage = require("multer-gridfs-storage")({
        url: dbConfig.testurl,
        options: { useNewUrlParser: true } ,
        file: (req, file) => {
    
            return {
                filename:  file.originalname.substring(0, file.originalname.lastIndexOf("."))+ Date.now()+file.originalname.substring(file.originalname.lastIndexOf(".")),
                metadata:  req.body,
                bucketName: "image"
            };
        }
    });
}
else{
     storage = require("multer-gridfs-storage")({
        url: dbConfig.url,
        options: { useNewUrlParser: true } ,
        file: (req, file) => {
            return {
                filename:  file.originalname.substring(0, file.originalname.lastIndexOf("."))+ Date.now()+file.originalname.substring(file.originalname.lastIndexOf(".")),
                metadata:  req.body,
                bucketName: "image"
            };
        }
    });
}



var upload = multer({ //multer settings for single upload
    storage
}).single("file");


module.exports = upload;
