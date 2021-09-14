require("dotenv").config();
const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");
const ContractKit = require("@celo/contractkit");
const {
  createWallet,
  getBalance,
  totalBalances,
} = require("../utils/generate-celo-address");
const { UserInfo, userAddressFromDB, addUserInfo } = require("../model/schema");
const crypto = require("crypto");
const tinyURL = require("tinyurl");
// const { credential } = require("firebase-admin");

const alfatores = process.env.ALFAJORES;

const kit = ContractKit.newKit(alfatores);
// console.log("celo connection", kit);

// Mongo DB
const uri = process.env.URI;

router.post("/", async (req, res) => {
  console.log(req.body, "req is");
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  let response = "CON ";
  var data = text.split('*');

  if (text == "") {
    // This is the first request. Note how we start the response with CON

    response += `Welcome to Canza Ecosystem!
        What would you like to do?
        1. Create Account
        2. Check Balance
        3. See Wallet Address
        4. Send Money
        5. Input Number
        `;
  } else if (text == "1") {
    const user = await userAddressFromDB(phoneNumber);
    if (user.length <= 0) {
      const data = await createWallet();

      console.log(data, "Wallet Created");
      response = `END Wallet Address has been created`;
      addUserInfo({
        address: data.address,
        phoneNumber,
        privateKey: data.privateKey,
      });
    } else {
      response = "END Canza Address Already Exist";
    }

    // wallet();
  } else if (text == "2") {
    // get Balance
    const phoneBalance = await userAddressFromDB(phoneNumber);
    const balance = await getBalance(phoneBalance[0].address);
    response = `END Your Canza Address Balance \n ${balance}`;
  } else if (text === "3") {
    // const checkAddress = ``

    const user = await userAddressFromDB(phoneNumber);
    response = await getAccountDetails(phoneNumber);

  // send money and transfer funds 
  } else if (data[0] == '4' && data[1] == null) {
    response = `CON Enter Recipient`;
  } else if (data[0] == '4' && data[1] !== '' && data[2] == null){
    response = `CON Enter Amount to send`;
  } else if (data[0] == '4' && data[1] !== '' && data[2] !== '' ){
    senderMSISDN = phoneNumber
    console.log('Sender:', senderMSISDN.substring(1))
    receiverMSISDN = '254' + data[1].substring(1)
    console.log('Recipient: ', receiverMSISDN)
    amount = data[2];
    console.log('Amount: ', amount)
    response = `END NGN` +amount+ ` sent to ` +receiverMSISDN+ ` Celo Account`;

    senderId = await getSenderId(senderMSISDN)
    console.log('senderId:', senderId)
    recipientId =await getRecipient(receiverMSISDN)
    console.log('recipientId:', recipientId)

    Promise.all().then()
    .then(() => transfercUSD(senderId, recipientId, amount)).catch(err => console.log(err))
    .then(hash => getTxidUrl(hash))
    .then(url => {
      console.log('PhoneNumber:', senderMSISDN)
    }).catch(err => console.log(err))

  } else if (text == "5") {
    response = `CON Input the Number \n`;
  } else if (/5*/.test(text)) {
    const number = text.split("*")[1];
    const user = await userAddressFromDB(number);
    if (user.length <= 0) {
      const data = await createWallet();

      console.log(data, "Wallet Created");
      response = `END Wallet Address has been created
      `;
      addUserInfo({
        address: data.address,
        number,
        privateKey: data.privateKey,
      });
    } else {
      response = "END Canza Address Already Exist";
    }
  }
  res.send(response);
});

async function getAccountDetails(user_phone_number) {
  console.log(user_phone_number);
  let userId = await getRecipient(user_phone_number);
  console.log(userId);
  let accountAddress = userId;
  let url = await getAddress(accountAddress);
  console.log("Address:", url);
  return `END Your Account Number is: ${user_phone_number}
  ...Account Address is: ${url}`;
}

//  account balance
async function getAccountBalance(phonebalance) {
  console.log("phone balance..", phonebalance);
}

// details
async function getReceiverDetails(recipient) {
  return new Promise((resolve) => {
    // gettting the actual address
  });
}

// shortUrl
async function getTxidUrl(txid){
  return await getSentTxidUrl(txid);
}

function getSentTxidUrl(txid){
  return new Promise(resolve => {
    const sourceURL = `https://alfajores-blockscout.celo-testnet.org/tx/${txid}/token_transfers`;
    resolve (tinyURL.shorten(sourceURL))  
  })
}

async function getAddress(userAddress) {
  return await getUserAddressUrl(userAddress);
}

function getUserAddressUrl(userAddress) {
  return new Promise((resolve) => {
    const sourceURL = `https://alfajores-blockscout.celo-testnet.org/address/${userAddress}/`;
    resolve(tinyURL.shorten(sourceURL));
  });
}

// get sender
function getSenderId(phoneNumber){
  return new Promise( resolve => {
    let senderId = crypto.createHash('sha1').update(phoneNumber.substring(1)).digest('hex');
    resolve(senderId);
  })
}

// get recipient
function getRecipient(phoneNumber) {
  return new Promise((resolve) => {
    let recipient = crypto.createHash("sha1").update(phoneNumber).digest("hex");
    resolve(recipient);
  });
}

async function transfercUSD(senderId, recipientId, amount) {
  try {
    let senderInfo = await getSenderDetails(senderId);
    console.log("sender Address:", senderInfo.address);

    
  } catch (err) {
    console.log(err);
  }
}

async function convertfromWei(value) {
  return kit.web3.utils.fromWei(value.toString(), "ether");
}

async function sendcUSD(sender, receiver, amount, privatekey) {
  const weiTransferAmount = kit.web3.utils.toWei(amount.toString(), "ether");
  const stableTokenWrapper = await kit.contracts.getStableToken();

  const senderBalance = await stableTokenWrapper.balanceOf(sender); //cUSD
  if (amount > senderBalance) {
    console.error(
      `Not enough funds in sender balance to fulfill request: ${await convertfromWei(
        amount
      )} > ${await convertfromWei(senderBalance)}`
    );
    return false;
  }

  console.info(
    `sender balance of ${await convertfromWei(
      senderBalance
    )} cUSD is sufficient to fulfill ${await convertfromWei(
      weiTransferAmount
    )} cUSD`
  );

  kit.addAccount(privatekey);
  const stableTokenContract = await kit._web3Contracts.getStableToken();
  const txo = await stableTokenContract.methods.transfer(
    receiver,
    weiTransferAmount
  );
  const tx = await kit.sendTransactionObject(txo, { from: sender });
  console.info(`Sent tx object`);
  const hash = await tx.getHash();
  console.info(`Transferred ${amount} dollars to ${receiver}. Hash: ${hash}`);
  return hash;
}

const getSenderDetails = async (senderId) => {
  const user = await UserInfo.find({ address });
  console.log("my address is:", user);
  return (senderId = user);
};


//  check if user or sender exists
async function checkIfSenderExists(SenderId, senderMSISDN){
  // await checkIf
}

module.exports = router;
