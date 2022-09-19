//in nodejs we use rquire()

//in front-end javascript you cant use require--insted we use import

import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    await window.ethereum.request({ method: "eth_requestAccounts" })
    connectButton.innerHTML = "Connected!"
  } else {
    connectButton.innerHTML = "Please install metamask"
  }
}
async function getBalance() {
  if (typeof window.ethereum != "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const balance = await provider.getBalance(contractAddress)
    console.log(ethers.utils.formatEther(balance))
  }
}

//fund function

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value
  console.log(`Funding with ${ethAmount}.....`)
  if (typeof window.ethereum !== "undefined") {
    //to send a transaction we absolutely need the below:
    //--------------------------------------------------
    //1. Provider --> connection to the blockchain
    //2. signer / wallet / someone with some gas
    //------------------------------------------------
    //3. a contract that we are interacting with
    //   to get that contract we need a ^ABI & Address

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)

    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      })
      //Listen for the tx to be mined
      await listenForTranactionMine(transactionResponse, provider)
      console.log("Done!")

      //listen for an event <- we havent learned abt yet!

      //
    } catch (error) {
      console.log(error)
    }
  }
}

function listenForTranactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`)
  //listen for this transaction to finish
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      )
      resolve()
    })
  })
}

//withdraw

async function withdraw() {
  if (typeof window.ethereum != "undefined") {
    console.log("Withdrawing...")
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transactionResponse = await contract.withdraw()
      await listenForTranactionMine(transactionResponse, provider)
    } catch (error) {
      console.log(error)
    }
  }
}
