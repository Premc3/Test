var Mongoose = require("mongoose")
const EmployeeSchema = new Mongoose.Schema(
    {
        name: {type: String,
            required: true},
        emailid :{ type: String,
        required: [true, "Please add a email"],
        unique: true,
        trim: true,
        match: [
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          "Please enter a valid emaial",
        ],
      },
        password: String,
        location: String,
        designation: String,
        salary: Number
    }
);

const EmployeeModel = Mongoose.model("employee", EmployeeSchema);
module.exports = EmployeeModel;