var Mongoose = require("mongoose")
const AdminSchema = new Mongoose.Schema(
    {
        name: {type: String,
            required: true},
        emailid : String,
        password: String,
        position: String
       
    }
);

const AdminModel = Mongoose.model("admins", AdminSchema);
module.exports = AdminModel;