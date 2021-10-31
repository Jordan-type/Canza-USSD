const User = require('../models/users')


const userAddressFromDB = async (req, res) => {
    try {
    const user = await User.find({ phoneNumber })
    console.log('user data',user)

    return res.status(200).json({
        data: user
    })
    // user
    } catch (err){
        err.message
    }
}


module.exports = { userAddressFromDB }