// import mongoose from "mongoose";

// async function dbConnect() {
//     try {
//         await mongoose.connect("mongodb://127.0.0.1:27017/giftcarddb");
//         console.log("DB connected");
//     } catch (err) {
//         console.log("DB error:", err.message);
//         process.exit(1); // 
//     }
// }

// export default dbConnect;


import mongoose from "mongoose";

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("DB Error:", error.message);
    process.exit(1);
  }
};

export default dbConnect;