const express = require("express");
const crypto = require('crypto')
const CoinGecko = require('coingecko-api'); // coingecko-api
const tinyURL = require("tinyurl");
require('dotenv/config');

const router = express.Router();
// const CoinGeckoClient = new CoinGecko(); // initiate the CoinGecko API Client

const { CoinGeckoClient } = require('coingecko-api-v3');  // initiate the CoinGecko API Client
const client = new CoinGeckoClient({ timeout: 10000, autoRetry: true })

const ContractKit = require("@celo/contractkit");
const { createWallet, getBalance, totalBalances } = require("../utils/generate-celo-address");
// const { UserInfo, userAddressFromDB, addUserInfo } = require("../models/users");
const { userAddress, addUser } = require('./user.services')

const alfatores = process.env.ALFAJORES;
const kit = ContractKit.newKit(alfatores);
// console.log("celo connection", kit);

// variable
const iv = Buffer.from('81dFxOpX7BPG1UpZQPcS6w==', 'base64')

router.post("/", async (req, res) => {
  // console.log("my req body is", req.body);
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  let response = "CON ";
  var data = text.split('*');

  if (text == "") {
    // This is the first request. Note how we start the response with CON

    response = `CON Welcome to Canza Ecosystem!
        What would you like to do?
        1. Create Account
        2. Deposit Funds
        3. Withdraw Cash
        4. Send Money
        5. Current Market Price 
        6. My Account`;

  } else if (text == "1") {
    const user = await userAddress(phoneNumber);
    // console.log("user infomation:", user[0].address)
    if (user.length <= 0) {
      const data = await createWallet();
      
      // console.log("Wallet Created", data);

      response = `END Your wallet Address has been created`;
      addUser({ address: data.address, phoneNumber, privateKey: data.privateKey });

    } else {
       response = "END USSD Address Already Exist";
    }
  } 
  // 2. Deposit funds
  else if ( data[0] == '2' && data[1] == null) {
    response = `CON Select currency to deposit:
                1. cUSD`;
  } else if ( data[0] == '2' && data[1] == 1) {
    response = `CON Enter amount to deposit`
  } else if (data[0] == '2' && data[1] == 2 && data [2] !== '') {
    response = `END You will receive a text with a link to deposit cUSD`;

    // user datails 
    const userMSISDN = phoneNumber;
    const txamount = data[2];



  }
  
  // withdraw funds
  else if (data[0] == '3' && data[1] == null) {
    response = `CON Enter Amount to Withdraw`;
  } else if (data[0] == '3' && data[1] !== ''){
    let withdrawMSISDN = phoneNumber;
    let kshAmount =    data[1]; // amount to receive in Ksh
    let _kshAmount =  formartNumber(kshAmount, 2)// format to 2 decimals
    console.log(_kshAmount)
    let userWithdraw = await userAddress(withdrawMSISDN);


  }
  
  // send money and transfer funds 
  else if (data[0] == '4' && data[1] == null) {
    response = `CON Enter Recipient`;
  } else if (data[0] == '4' && data[1] !== '' && data[2] == null){
    response = `CON Enter Amount to send`;
  } else if (data[0] == '4' && data[1] !== '' && data[2] !== '' ){
    senderMSISDN = phoneNumber
    console.log('Sender:', senderMSISDN.substring(1))
    receiverMSISDN = '+254' + data[1].substring(1)
    console.log('Recipient: ', receiverMSISDN)
    amount = data[2];
    console.log('Amount: ', amount)
    response = `END NGN` +amount+ ` sent to ` +receiverMSISDN+ ` Celo Account`;

    // senderId = await getSenderId(senderMSISDN)
    // console.log('senderId:', senderId)
    // recipientId =await getRecipient(receiverMSISDN)
    // console.log('recipientId:', recipientId)
    transfercUSD(senderMSISDN, receiverMSISDN, amount)

    Promise.all()
    .then(result => console.log(result))
    .then(() => transfercUSD(senderMSISDN, receiverMSISDN, amount))
    .then(hash => getTxidUrl(hash))
    .then(url => {
      console.log('PhoneNumber:', senderMSISDN)
    }).catch(err => console.log(err))

  } 
  // 5. Coingecko Market Data
  else if (data[0] == '5' && data[1] == null ) {
    response = `CON select any to view current market data
                1. Bitcoin Current Price
                2. Etherum Currrent Price
                3. Celo Currrent Price
                `;
      }
    else if ( data[0] == '5' && data[1] == '1') {
      const btc_ngn_usd = await client.simplePrice({ ids: ['bitcoin', 'bitcoin'], vs_currencies: ['ngn', 'usd'] })

      console.log("==>", btc_ngn_usd.bitcoin.ngn)
      
      // bitcion market price in both Naira and USD
      let btc_price_ngn = formartNumber(btc_ngn_usd.bitcoin.ngn, 2)
      let btc_price_usd = formartNumber(btc_ngn_usd.bitcoin.usd, 2)
      
      response = `END 1 BTC is: ` +btc_price_ngn+ ` Naira and ` +btc_price_usd+ ` USD`;
    }
    else if ( data[0] == '5' && data[1] == '2') {
      const eth_ngn_usd = await client.simplePrice({ ids: ['ethereum', 'ethereum'], vs_currencies: ['ngn', 'usd'] }) 
      console.log('eth==>', eth_ngn_usd)
      
      // ethereum market price in both Naira and USD
      let eth_price_ngn = formartNumber(eth_ngn_usd.ethereum.ngn, 2)
      let eth_price_usd = formartNumber(eth_ngn_usd.ethereum.usd, 2)
      
      response = `END 1 ETH is: ` +eth_price_ngn+ ` Naira and ` +eth_price_usd+ ` USD`;
    }
    else if ( data[0] == '5' && data[1] == '3') {
      const celo_ngn_usd = await client.simplePrice({ ids: ['celo', 'celo'], vs_currencies: ['ngn', 'usd'] })
      
      // celo market price in both Naira and USD
      let celo_price_ngn = formartNumber(celo_ngn_usd.celo.ngn, 2)
      let celo_price_usd = formartNumber(celo_ngn_usd.celo.usd, 2)
      
      response = `END 1 CELO is: ` +celo_price_ngn+ ` Naira and ` +celo_price_usd+ ` USD`;
    }
  // 6. Account Details
  else if (data[0] == '6' && data[1] == null) {
    response = `CON select account information you want to view
               1. Account Details
               2. Account balance
               3. Account Backup`;
  } else if ( data[0] == '6' && data[1] == '1') {
    response = await getAccountDetails(phoneNumber)
  } else if (data[0] == '6' && data[1] == '2') {
    response = await getAccountBalance(phoneNumber)
  } else if ( data[0] == '6' && data[1] == '3') {
    response = await getSeed(phoneNumber)
  }
  res.set('Content-Type: text/plain')
  res.send(response);
});

// make calls to coin gecko
async function getMarkets() {

  const btc_ngn_usd = await CoinGeckoClient.simple.price({ ids: ['bitcoin', 'bitcoin'], vs_currencies: ['ngn', 'usd'] })
  const eth_ngn_usd = await CoinGeckoClient.simple.price({ ids: ['ethereum', 'ethereum'], vs_currencies: ['ngn', 'usd'] })
  const celo_ngn_usd = await CoinGeckoClient.simple.price({ ids: ['celo', 'celo'], vs_currencies: ['ngn', 'usd'] })

  // formarted to 2 decimals
  let btc_price_ngn = formartNumber(btc_ngn_usd.data.bitcoin.ngn, 2)
  let btc_price_usd = formartNumber(btc_ngn_usd.data.bitcoin.usd, 2)

  let eth_price_ngn = formartNumber(eth_ngn_usd.data.ethereum.ngn, 2)
  let eth_price_usd = formartNumber(eth_ngn_usd.data.ethereum.usd, 2)

  let celo_price_ngn = formartNumber(celo_ngn_usd.data.celo.ngn, 2)
  let celo_price_usd = formartNumber(celo_ngn_usd.data.celo.usd, 2)
  
  console.log('coin gecko apis', btc_price_ngn, eth_price_ngn, celo_price_ngn, btc_price_usd, eth_price_usd, celo_price_usd,)

  return `End ${btc_price_ngn} Naira`
};

// format to 2 decimal places
function formartNumber(val, decimals) {
  val = parseFloat(val)
  return val.toFixed(decimals)
}


async function getAccountDetails(userMSISDN) {
  console.log("phone number", userMSISDN);
  
  const user = await userAddress(userMSISDN);
  console.log('user data', user)
  let accountAddress = user[0].address

  console.log('account yangu', accountAddress)
  let url = await getUserAddressUrl(accountAddress);
  
  console.log("Address Url Link:", url);
  return `END Your Account Number is: ${userMSISDN}
  ...Account Address is: ${url}`;
}

// seed words
async function getSeed(userMSISDN) {
  const user = await userAddress(userMSISDN)
  let accountSeed = user[0].privateKey
  // let seed_word = await decryptcypher(accountSeed, userMSISDN, iv)

  return `END Your Recovery Phrase is:\n ${accountSeed}`

}

// function getEncryptKey(userMSISDN){    
//   // const hash_fn = functions.config().env.algo.key_hash;
//   let key = crypto.createHash('sha256').update(userMSISDN).digest('hex');
//   return key;
// }

// // decrpt seed word
// async function decryptcypher(encrypted, userMSISDN, iv) {
//   let key = await getEncryptKey(userMSISDN);
//   const decipher = crypto.createDecipheriv('aes192', key, iv);
//   let decrypted = decipher.update(encrypted, 'hex', 'utf8');
//   decrypted += decipher.final('utf8');
//   return decrypted;
// }


//  account balance
async function getAccountBalance(userMSISDN) {
  console.log("phone balance..", userMSISDN);

  const user = await userAddress(userMSISDN);
  let accountaddress = user[0].address
  console.log('my address:', accountaddress)

  const stableTokenWrapper = await kit.contracts.getStableToken()
  let cUSDBalance = await stableTokenWrapper.balanceOf(accountaddress) // In cUSD
  cUSDBalance = kit.web3.utils.fromWei(cUSDBalance.toString(), 'ether')
  console.info(`Account balance of ${cUSDBalance.toString()}`)

  const goldTokenWrapper = await kit.contracts.getGoldToken()
  let cGoldBalance = await goldTokenWrapper.balanceOf(accountaddress) // In cGLD
  cGoldBalance = kit.web3.utils.fromWei(cGoldBalance.toString(), 'ether')   
  console.info(`Account balance of ${cGoldBalance.toString()}`)

  return `END Your Account Balance is:
          Celo Dollar: ${cUSDBalance} cUSD
          Celo: ${cGoldBalance} CELO`
}

// details
async function getReceiverDetails(recipientId) {

  let user = await userAddress(recipientId)
  console.log('user info is:', user)

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
    const user = await userAddress(senderId)
    let senderInfo = user[0].address;
    let senderKey = user[0].privateKey
    console.log("sender Address:", senderInfo)

    const userDoc = await userAddress(recipientId)
    let receiverInfo =  userDoc[0].address
    console.log('Receiver Adress: ', receiverInfo)

    let cUSDAmount = amount*0.01;
    console.log('cUSD Amount: ', cUSDAmount);

    return sendcUSD(`${senderInfo}`, `${receiverInfo}`, cUSDAmount, senderKey)

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
  const user = await userAddress(senderId);
  console.log("my address is:", user[0].address);
};


async function checkIfUserExists(userId, userMSIDN){
  
}


//  check if user or sender exists
async function checkIfSenderExists(SenderId, senderMSISDN){
  // await checkIf
}

module.exports = router;
