const User = require('../models/users')

// console.log('my model',require('../models/users'))

exports.userAddress = async (phoneNumber) => {
    try {
        const user = await User.find({phoneNumber})
        return user
    } catch(err) {
        console.log(err)
    }
}

exports.addUser = ({ phoneNumber, address, privateKey, pin="00000" }) => {
    
    const newUser = new User({ phoneNumber, address, pin, privateKey});
    
    newUser.save(function(err){
        console.log(err);
    })

}