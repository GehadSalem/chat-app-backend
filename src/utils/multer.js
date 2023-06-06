import multer from "multer";

export const fileValidation = {
    image: ['image/jpeg', 'image/gif', 'image/png'],
    pdf: ['application/pdf'],
}



export function fileUpload(customPath = "general", customValidation = fileValidation.image){

    const storage = multer.diskStorage({})

    function fileFilter(req, file, cb) {
        if (customValidation.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb('In-valid format', false)
        }
    }

    const upload = multer({dest: 'uploads',fileFilter, storage})
    return upload
}
