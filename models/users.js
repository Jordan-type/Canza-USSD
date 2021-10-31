const mongoose = require('mongoose');
const  { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const userSchema = new Schema({
    id: ObjectId,
    phoneNumber: String,
    address: String,
    privateKey: String,
    pin: String
});



module.exports = mongoose.model('User', userSchema)


// const UserInfo = mongoose.model('User', userSchema);

// const addUserInfo = ({ phoneNumber, address, privateKey, pin="00000" }) => {

//     const user = new UserInfo();

//     user.phoneNumber = phoneNumber;
//     user.address = address;
//     user.pin = pin;
//     user.privateKey = privateKey;
//     user.save(function(err){
//         console.log(err);
//     })

// }

// const userAddressFromDB = async (phoneNumber) => {
//     const user = await UserInfo.find({ phoneNumber });
//     return user;
// }

// module.exports = { addUserInfo, userAddressFromDB };

