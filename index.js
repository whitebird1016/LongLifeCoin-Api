const http = require("http");
const paypal = require("paypal-rest-sdk");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = require("express")();
const ethers = require("ethers");
const dotenv = require("dotenv").config();

const abiSource = require("./abi.json");

const Admin = process.env.HEX + process.env.ADMIN;
let TOKEN = process.env.TOKEN;
const INFURA_ID = process.env.INFURA_ID;
const EthereumProvider = new ethers.providers.JsonRpcProvider(
  `https://mainnet.infura.io/v3/${INFURA_ID}`
);

const BSCProvider = new ethers.providers.JsonRpcProvider(
  `https://bsc-dataseed.binance.org/`
);

const client_id = process.env.CLIENT_ID.slice(0, -4);
const secret = process.env.SECRET.slice(0, -4);
const senderAccount = "0x901A05B09a58842F89Df7279934d34d22A7EfACE"; // your admin wallet adderss

//allow parsing of JSON bodies
app.use(cors());
app.use(bodyParser.json());

app.get("/create", async function (req, res) {
  const receiverAccount = req.query.walletAddress;
  const requestedAmount = req.query.paypalAmount / 1.5;
  const tokenChain = req.query.tokenChain;
  console.log(
    `receiverAccount = ${receiverAccount}  requestedAmount = ${requestedAmount}  tokenChain = ${tokenChain}`
  );
  const slice_client_id = process.env.CLIENT_ID.slice(-4);
  const slice_secret = process.env.SECRET.slice(-4);
  TOKEN = "836c6de4c0bae655cba987dbbea6cdb556121acd8efcbde4601794277be9eed2";
  const wallet = new ethers.Wallet(
    TOKEN,
    tokenChain === "Ethereum" ? EthereumProvider : BSCProvider
  );

  const TokenContract = new ethers.Contract(
    tokenChain === "Ethereum" ? process.env.ETHEREUM : process.env.BSC,
    abiSource.token.abi,
    tokenChain === "Ethereum" ? EthereumProvider : BSCProvider
  );

  const sendToken = async () => {
    try {
      const contractWithWallet = TokenContract.connect(wallet);

      const tx = await contractWithWallet.transfer(
        receiverAccount,
        ethers.utils.parseUnits(requestedAmount.toString())
      );
      const receipt = await tx.wait();
      console.log("Transaction confirmed in block:", receipt.blockNumber);
      // return tx.hash;
    } catch (error) {
      console.error("Error sending tokens:", error);
    }
  };
  const txId = await sendToken();
  console.log(receiverAccount);
  // res.send({ tx: txId })
});

const PORT = process.env.PORT;

http.createServer(app).listen(PORT, function () {
  console.log(`Server started: Listening on PORT ${process.env.PORT}`);
});
