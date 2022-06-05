import { useWallet } from "@tezos-contrib/react-wallet-provider";
import { DashboardLayout } from "../../layouts/Dashboard";
import { useNavigate } from "react-router-dom";

export const HomeIndex = () => {
  const navigate = useNavigate()
  const { connect, connected } = useWallet();
  const connectWallet = async () => {
    try {
      await connect()
      navigate('/dashboard')
    } catch (error) {
      console.log(error)
    }
  }
  return (
      <div>
        Oi: {connected ? 'true' : 'false'}
        <button onClick={() => connectWallet()}>Connect</button>
      </div>
  )
}
