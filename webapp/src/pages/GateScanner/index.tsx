import { CheckCircleIcon, IdentificationIcon, QrcodeIcon, XIcon } from "@heroicons/react/outline";
import { useState } from "react";
import { useParams } from "react-router";
import { OnResultFunction, QrReader } from "react-qr-reader";
import { useCollection } from "../../hooks/useCollection";
import { client } from "../../client";
import { useAuth } from "../../hooks/useAuth";
import classNames from "classnames";

// const delay = (timeMs: number) => new Promise((resolve) => window.setTimeout(() => { resolve() }, timeMs))

const GlobalScannerStatus = {
  loading: false,
};

interface AuthorizationStatus {
  authorized: boolean;
  reason?: string;
  token_id: number;
}

export const GateScanner = () => {
  const { auth, headers } = useAuth()
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState<AuthorizationStatus | null>(null)
  const [isScanning, setIsScanning] = useState(true);
  const { collectionId } = useParams();
  const { collection } = useCollection({
    collectionId: collectionId ? parseInt(collectionId) : undefined,
  });
  if (!collection) {
    return null;
  }
  const start = async () => {
    await auth()
    setStarted(true);
  };

  const checkToken = async (token: string) => {
    if (!GlobalScannerStatus.loading) {
      setIsScanning(false);
      GlobalScannerStatus.loading = true;
      console.log(`Checking token=${token}`);
      const { data } = await client.post('/gate-scan-verify', {
        token,
        ticket_collection_id: parseInt(collectionId!),
      }, {
        headers,
      });
      setStatus(data)
      setTimeout(() => {
        GlobalScannerStatus.loading = false;
        setIsScanning(true);
        setStatus(null);
      }, 2000)
    }
  };

  const onScanResult: OnResultFunction = async (result) => {
    if (result && !GlobalScannerStatus.loading) {
      checkToken(result.getText());
    }
  };

  const statusBadgeClasses = classNames(
    'text-4xl flex items-center justify-center py-8 px-12 rounded-full',
    {
      'bg-green-700': status && status.authorized,
      'bg-red-700': status && !status.authorized,
    }
  )

  return (
    <div className="flex w-screen h-screen items-center justify-center bg-gray-800">
      {!started && (
        <div className="text-center w-[480px] flex-row items-center">
          <div className="flex justify-center items-center">
            <IdentificationIcon className="w-10 h-10 text-white mr-2" />
            <h1 className="text-white text-4xl">Gate Scanner</h1>
          </div>
          {/* <div className="mt-4 text-white">Collection: {collection.name}</div> */}
          <button
            type="button"
            onClick={() => start()}
            className="mt-12 inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Start
          </button>
        </div>
      )}
      {started && (
        <div>
          <div>
            <div className="w-[480px] min-h-[240px] text-white text-center flex items-center justify-center">
              {isScanning && !status && (
                <div className="text-4xl flex items-center justify-center">
                  <QrcodeIcon className="w-12 h-12 mr-2" />
                  Point the QR Code Here
                </div>
              )}
              {!isScanning && !status && (
                <>
                <div className="lds-ring">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
                </>
              )}
              {!isScanning && status && (
                <div className="animate__animated animate__flipInX">
                  <div className={statusBadgeClasses}>
                    {status.authorized ? (
                      <>
                        <CheckCircleIcon className="w-12 h-12 mr-2" />
                        AUTHORIZED
                      </>
                    ): (
                      <>
                        <XIcon className="w-12 h-12 mr-2" />
                        NOT AUTHORIZED
                      </>
                    )}
                  </div>
                  <div className="text-4xl flex items-center justify-center mt-8">
                    {status.authorized ? (
                      <>
                        Token #{status.token_id}
                      </>
                    ): (
                      <>
                        {status.reason}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <QrReader
            scanDelay={500}
            onResult={onScanResult}
            videoContainerStyle={{
              padding: "0",
            }}
            videoStyle={{
              width: "480px",
              height: "480px",
              position: "static",
            }}
            constraints={{}}
          />
        </div>
      )}
    </div>
  );
};
