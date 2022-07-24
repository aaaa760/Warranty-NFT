import '../styles/globals.css'
import Navbar from '../components/Navbar'
import { useState } from "react"

const networks = {
  polygon_mainnet: {
    chainId: `0x${Number(137).toString(16)}`,
    chainName: "Polygon Mainnet",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18
    },
    rpcUrls: ["https://polygon-rpc.com/"],
    blockExplorerUrls: ["https://polygonscan.com/"]
  },
  polygon_testnet: {
    chainId: `0x${Number(80001).toString(16)}`,
    chainName: "Mumbai",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18
    },
    rpcUrls: ["https://matic-mumbai.chainstacklabs.com",
              "https://rpc-mumbai.maticvigil.com",
              "https://matic-testnet-archive-rpc.bwarelabs.com"],
    blockExplorerUrls: ["https://mumbai.polygonscan.com"]
  }
}

async function changeChain() {
  await window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        ...networks.polygon_testnet
      }
    ]
  })
}

function MyApp({ Component, pageProps }) {

  const [account, setAccount] = useState("")
  const [loginStatus, setLoginStatus] = useState(false)

  async function handleLogin() {
    if (typeof window.ethereum === 'undefined') {
      if (window.confirm("MetaMask is required. Click `ok` to proceed to their website.")) {
        window.open('https://metamask.io/', '_blank')
      }
      return
    }

    await window.ethereum.enable()
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = accounts[0]
    setAccount(account)

    window.ethereum.on('accountsChanged', function (accounts) {
      const account = accounts[0]
      if (account === undefined) {
        setLoginStatus(false)
        setAccount("")
      } else setAccount(account)
    })

    try {
      await changeChain()
    } catch (e) {
      console.log(e)
      alert("Please configure polygon on metamask to successfully login.")
      setAccount("")
      setLoginStatus(false)
      return
    }

    window.ethereum.on("chainChanged", async () => {
      const currentChainId = await window.ethereum.request({
        method: 'eth_chainId'
      })
      if (currentChainId === networks.polygon_testnet.chainId) return

      alert("You are logged out. Please login again to switch back to polygon and continue using our dApp.") 
      setAccount("")
      setLoginStatus(false)
    })

    setLoginStatus(true)
  }

  return (
    <>
    <div className="bg-gradient-to-r from-yellow-500 to-slate-500 opacity-4 bg-transparent">
      <Navbar account={account} loginStatus={loginStatus} onClick={handleLogin} />
      </div>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
