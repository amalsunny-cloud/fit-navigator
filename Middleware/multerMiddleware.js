const multer = require('multer')

const storage = multer.diskStorage({
    destination:(req,file,callback)=>{
        callback(null,'./uploads')
    },
    filename:(req,file,callback)=>{
        const filename = `image-${Date.now()}-${file.originalname}`

        callback(null,filename)
    }
})

//for filtering - jpg,png etc.not neccessary

const fileFilter =  (req,file,callback)=>{
    if(file.mimetype == 'image/png' || file.mimetype == 'image/jpeg' || file.mimetype == 'image/jpg'){
        callback(null,true)
    }
    else{
        callback(null,false)
        return callback( new Error('Pleade upload following extensions only (png/jpeg/jpg)'))

    }
}

const multerConfig = multer({
    storage,fileFilter
})

module.exports = multerConfig
