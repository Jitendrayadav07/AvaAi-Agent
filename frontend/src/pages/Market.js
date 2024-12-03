import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export function formatTimestamp(dateTimeString) {
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  const formattedDateTime = new Date(dateTimeString).toLocaleString(
    undefined,
    options
  );
  const [datePart, timePart] = formattedDateTime.split(", ");
  const [month, day, year] = datePart.split("/");
  const formattedDate = `${day}-${month}-${year}`;

  return `${formattedDate} | ${timePart}`;
}

export function formatHashString(str) {
  if (str.length <= 8) {
    return str;
  }
  const start = str.slice(0, 6);
  const end = str.slice(-6);
  return `${start}...${end}`;
}

const Market = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [transactionData, setTransactionData] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://api.enclave.market/v1/perps/mark_prices"
        );

        if (response.data.success) {
          const formattedData = Object.entries(response.data.result).map(
            ([key, value]) => ({
              id: value.pair.base,
              price: parseFloat(value.price),
              pair: value.pair.quote,
            })
          );
          setCryptoData(formattedData);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching crypto data:", error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);

    return () => clearInterval(interval);
  }, []);

  const fetchTransactionData = async () => {
    try {
      await axios
        .get("https://pharmaalabs.com/v2/get-all-orders")
        .then((response) => {
          console.log({ response });
          console.log("response");
          setTransactionData(response.data);
        });
    } catch (error) {
      console.error("Error fetching transaction data:", error);
    }
  };

  const handleSubmit = (value) => {
    setSubmitting(true);
    try {
      axios
        .get(`http://127.0.0.1:5000/crew/avax-agent?quantity=${value}`)
        .then((response) => {
          fetchTransactionData();
          toast.success("Transaction submitted successfully!");
        })
        .catch((err) => {
          toast.error("Error during transaction submission.");
        })
        .finally(() => {
          setSubmitting(false);
        });
    } catch (err) {
      console.log(err, "err");
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchTransactionData();
  }, []);

  return (
    <div className="px-8 py-2">
      <h2 className="text-2xl font-bold text-white mb-6">Market Trade</h2>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">
                Market Overview
              </h3>
              <div className="space-y-4 overflow-y-auto max-h-96">
                {cryptoData.slice(0, 3).map((crypto) => (
                  <div
                    key={crypto.id}
                    className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="text-white font-medium capitalize">
                          {crypto.id}
                        </div>
                        <div className="text-sm text-gray-400">
                          {crypto.pair}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">
                        $
                        {crypto.price.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Trade</h3>
              <form className="space-y-4">
                <div className="sticky top-0">
                  <label className="block text-gray-400 mb-2">
                    Select Coin
                  </label>
                  <select
                    className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue="AVAX"
                    disabled
                  >
                    {cryptoData
                      .filter((crypto) => crypto.id === "AVAX")
                      .map((crypto) => (
                        <option key={crypto.id} value={crypto.id}>
                          {crypto.id} ({crypto.pair})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">
                    Quantity (Avax)
                  </label>
                  <input
                    type="number"
                    className={`w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 ${
                      error ? "border-red-500" : "focus:ring-blue-500"
                    }`}
                    placeholder="Enter Quantity..."
                    required
                    value={quantity}
                    style={{
                      MozAppearance: "textfield",
                      WebkitAppearance: "none",
                      appearance: "none",
                    }}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value < 1 || value > 5 || isNaN(value)) {
                        setError(true);
                      } else {
                        setQuantity(e.target.value);
                        setError(false);
                      }
                    }}
                  />
                  {error && (
                    <p className="text-red-500">
                      Quantity must be a whole number between 1 and 5.
                    </p>
                  )}
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => handleSubmit(quantity)}
                    className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      </div>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          {transactionData.length > 0 && (
            <div>
              <h1 className="text-xl p-3 font-bold text-white my-4">
                Transaction History
              </h1>

              <div className="items-center w-full max-w-full ">
                <table className="bg-gray-800 w-full rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-700 text-white whitespace-nowrap">
                      <th className="py-2 px-4 sticky left-0 z-20 bg-gray-700">
                        Order ID
                      </th>
                      <th className="py-2 px-4">Side</th>
                      <th className="py-2 px-4">Size</th>
                      <th className="py-2 px-4">Market</th>
                      <th className="py-2 px-4">Filled Size</th>
                      <th className="py-2 px-4">Filled Cost</th>
                      <th className="py-2 px-4">Fee</th>
                      <th className="py-2 px-4">Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionData.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="bg-gray-800 text-white border-b border-gray-700 whitespace-nowrap"
                      >
                        <td className="py-2 px-4 sticky left-0 z-2 bg-gray-800">
                          {formatHashString(transaction.orderId)}
                        </td>
                        <td
                          className={`my-1 px-3 text-md font-semibold rounded-lg ${
                            transaction.side === "buy"
                              ? " text-green-600"
                              : " text-red-600"
                          }`}
                        >
                          {transaction.side}
                        </td>
                        <td className="py-2 px-4">{transaction.size}</td>
                        <td className="py-2 px-4">{transaction.market}</td>
                        <td className="py-2 px-4">{transaction.filledSize}</td>
                        <td className="py-2 px-4">{transaction.filledCost}</td>
                        <td className="py-2 px-4">{transaction.fee}</td>
                        <td className="py-2 px-4">
                          {formatTimestamp(transaction.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Market;
