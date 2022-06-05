import { useWallet } from "@tezos-contrib/react-wallet-provider";
import { useEffect } from "react";
import { DashboardLayout } from "../../layouts/Dashboard";
import { useNavigate } from "react-router-dom";

export const DashboardIndex = () => {
  const navigate = useNavigate()
  const { connected, activeAccount, connect, disconnect } = useWallet();
  useEffect(() => {
    if (!connected) {
      navigate('/')
    }
  }, [connected, navigate]);
  return (
    <DashboardLayout>
      <div>
        <button onClick={() => connect()}>Connect</button>
        <button onClick={() => disconnect()}>Disconnect</button>
        {activeAccount?.address}
      </div>
    </DashboardLayout>
  )
}
