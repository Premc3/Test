const Mongoose = require("mongoose");

const learnerSchema = Mongoose.Schema(
    {
      learnerId: String,
      name: String,
      courseName: String,
      project: String,
      batch: String,
      courseStatus: String,
      placementStatus: {
        type: String,
        enum: ["placed", "job seeking", "not interested"],
        default: "job seeking",
      },
    }
  );
  
var learnerModel=Mongoose.model("learners",learnerSchema);

module.exports= learnerModel