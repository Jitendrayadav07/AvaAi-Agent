import React, { useState } from "react";
import { ethers } from "ethers";

export function checkSwapIntent(text) {
  const lowerCaseText = text.toLowerCase();
  return lowerCaseText.includes("swap");
}

const AvaAi = ({ connectedAccount, accountBalance }) => {
  const [userPrompt, setUserPrompt] = useState("");
  // eslint-disable-next-line
  const [response, setResponse] = useState("");
  // eslint-disable-next-line
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [isSwapIntent, setIsSwapIntent] = useState("");
  const [messages, setMessages] = useState([]);
  const [confirmationStates, setConfirmationStates] = useState(() =>
    Array(messages.length).fill(false)
  );

  const handleConfirmTransaction = async (index) => {
    if (!window.ethereum || !transactionData) {
      alert("MetaMask is not connected or transaction data is missing.");
      return;
    }

    try {
      if (checkSwapIntent(isSwapIntent)) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        // eslint-disable-next-line
        const { to, value, gasLimit, data } =
          transactionData[0]?.data?.steps[0];
        const gasEstimate = await provider.estimateGas({
          to,
          // eslint-disable-next-line no-undef
          value: `0x${BigInt(value).toString(16)}`,
          data,
        });
        const transactionParameters = {
          to,
          // eslint-disable-next-line no-undef
          value: `0x${BigInt(value).toString(16)}`,
          gasLimit: gasEstimate, // Use estimated gas
          data,
        };
        const tx = await signer.sendTransaction(transactionParameters);
        alert(`Transaction sent! Hash: ${tx.hash}`);
        setConfirmVisible(false);
        setResponse("Transaction confirmed and sent.");
        setConfirmationStates((prevStates) => [...prevStates, true]);
      } else {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const { to, value, gasLimit } = transactionData[0]?.data?.steps[0];
        const transactionParameters = {
          to,
          // eslint-disable-next-line no-undef
          value: `0x${BigInt(value).toString(16)}`,
          // eslint-disable-next-line no-undef
          gasLimit: `0x${BigInt(gasLimit).toString(16)}`,
        };
        const tx = await signer.sendTransaction(transactionParameters);
        alert(`Transaction sent! Hash: ${tx.hash}`);
        setConfirmVisible(false);
        setResponse("Transaction confirmed and sent.");
        setConfirmationStates((prevStates) => [...prevStates, true]);
      }
    } catch (error) {
      console.error("Transaction error:", error);
      alert("Failed to send the transaction. Please try again.");
    }
  };

  const handlePromptSubmit = async () => {
    if (userPrompt.trim()) {
      const newMessage = { text: userPrompt, sender: "user" };
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      try {
        const apiUrl = "https://api.brianknows.org/api/v0/agent/transaction";
        const requestBody = {
          prompt: userPrompt,
          address: connectedAccount,
          chainId: "43114",
        };

        const apiResponse = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-brian-api-key": "brian_plg27CNrEWyVMGuV6",
          },
          body: JSON.stringify(requestBody),
        });

        const responseData = await apiResponse.json();
        if (apiResponse.ok && responseData.result) {
          setTransactionData(responseData.result);
        }

        const responseMessage = {
          text:
            responseData.result[0]?.data.description ||
            "Unexpected response format or error.",
          sender: "system",
        };

        setMessages((prevMessages) => [...prevMessages, responseMessage]);

        setConfirmationStates((prevStates) => [...prevStates, false]);
      } catch (error) {
        console.error("API call error:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: "Failed to fetch response.", sender: "system" },
        ]);
      }
      setIsSwapIntent(userPrompt);
      setUserPrompt("");
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-900 via-gray-900 to-black text-white font-sans min-h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="flex-1">
          {messages.length === 0 && (
            <main className="flex-grow flex flex-col items-center justify-center mt-20 px-4">
              <div className="bg-gradient-to-r text-gray-900 rounded-2xl p-5 shadow-xl max-w-lg w-full">
                <h1 className="text-3xl font-extrabold text-center mb-6 from-blue-500 to-purple-500 bg-clip-text text-white">
                  Welcome to Ava-Ai!
                </h1>
                {connectedAccount ? (
                  <></>
                ) : (
                  <p className="text-center text-gray-500">
                    Please connect your wallet.
                  </p>
                )}
              </div>
            </main>
          )}
          <div className="items-center px-4 py-8 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex w-full ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-4 rounded-lg shadow-md max-w-md ${
                    message.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-800 text-gray-300"
                  }`}
                >
                  {message.text}
                  {message.sender === "system" && (
                    <button
                      onClick={() => handleConfirmTransaction(index)}
                      disabled={confirmationStates[index]}
                      className={`mt-4 mx-2 px-2 py-1 rounded-lg text-white font-semibold shadow-md ${
                        confirmationStates[index]
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      {confirmationStates[index] ? "Confirmed" : "Confirm"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 backdrop-blur-sm p-6 mb-16 border-gray-800">
        <div className="flex justify-center space-x-4 items-center">
          <input
            type="text"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Type your prompt..."
            className="w-[700px] px-5 py-2 rounded-2xl text-gray-900 focus:ring-2 focus:ring-red-500 focus:outline-none shadow-md"
          />
          <button
            onClick={handlePromptSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-2xl font-semibold shadow-lg transform transition hover:scale-105"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvaAi;
